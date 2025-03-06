'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, trackingNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error tracking shipment');
      }

      // Redirect to tracking page
      router.push(`/tracking/${data.trackingNumber}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-indigo-900 tracking-tight">Shipment Tracker</h1>
          <p className="text-lg text-indigo-700">Track your package with ease</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-indigo-100">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-base font-semibold text-indigo-900">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 block w-full px-4 py-3 text-base rounded-xl border border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/90 transition duration-200 ease-in-out"
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tracking" className="block text-base font-semibold text-indigo-900">Tracking Number</label>
            <input
              type="text"
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="mt-2 block w-full px-4 py-3 text-base rounded-xl border border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/90 transition duration-200 ease-in-out"
              required
              placeholder="Enter tracking number"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-lg transform transition duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                <span>Tracking...</span>
              </div>
            ) : 'Track Shipment'}
          </button>

          {error && (
            <div className="p-4 text-red-700 bg-red-100/80 backdrop-blur-sm rounded-xl border border-red-200 shadow-sm">
              {error}
            </div>
          )}
        </form>

        {shipment && (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-indigo-100 space-y-6">
            <h2 className="text-3xl font-bold text-indigo-900">Tracking Details</h2>
            <div className="space-y-6">
              {shipment.events?.map((event: any, index: number) => (
                <div key={event.id} className="flex items-start space-x-4 p-4 bg-white/90 rounded-xl border border-indigo-50 hover:border-indigo-200 transition duration-200 ease-in-out">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-medium">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="text-lg font-semibold text-indigo-900">{event.status}</div>
                    <div className="text-base text-gray-700">{event.description}</div>
                    {event.location && (
                      <div className="text-base text-indigo-600 flex items-center space-x-1">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
