'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShipmentDetails({ params }: { params: { id: string } }) {
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchShipmentDetails();
  }, []);

  const fetchShipmentDetails = async () => {
    try {
      const response = await fetch(`/api/admin/shipments/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch shipment details');
      }

      setShipment(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    router.push(`/admin/shipments/${params.id}/events/new`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="text-red-600">Shipment not found</div>
        </div>
      </div>
    );
  }

  const inputClassName = 'block w-full p-2 pl-10 text-sm text-gray-700 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handleAddEvent}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add New Event
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Shipment</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Shipment Type</label>
              <input type="text" value={shipment.shipmentType} onChange={(e) => setShipment({...shipment, shipmentType: e.target.value})} className={inputClassName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Package Type</label>
              <input type="text" value={shipment.packageType} onChange={(e) => setShipment({...shipment, packageType: e.target.value})} className={inputClassName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Weight (lbs)</label>
              <input type="text" value={shipment.weight} onChange={(e) => setShipment({...shipment, weight: e.target.value})} className={inputClassName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Length (in)</label>
              <input type="text" value={shipment.length} onChange={(e) => setShipment({...shipment, length: e.target.value})} className={inputClassName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Width (in)</label>
              <input type="text" value={shipment.width} onChange={(e) => setShipment({...shipment, width: e.target.value})} className={inputClassName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Height (in)</label>
              <input type="text" value={shipment.height} onChange={(e) => setShipment({...shipment, height: e.target.value})} className={inputClassName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Special Instructions</label>
              <input type="text" value={shipment.specialInstructions} onChange={(e) => setShipment({...shipment, specialInstructions: e.target.value})} className={inputClassName} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracking Events</h2>
          <div className="space-y-6">
            {shipment.events?.map((event: any, index: number) => (
              <div key={event.id} className="relative pl-8 pb-6 last:pb-0">
                <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500"></div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">{event.status}</div>
                  <div className="text-gray-600">{event.description}</div>
                  {event.location && (
                    <div className="text-gray-500">
                      📍 {event.location}
                    </div>
                  )}
                  <div className="text-sm text-gray-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}