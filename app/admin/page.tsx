'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShipmentEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  receiverName: string;
  receiverEmail: string;
  currentLocation?: string;
  status: string;
  events: ShipmentEvent[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/shipments');
      let result;
      
      try {
        const text = await response.text(); // First get the raw text
        console.log('[Client] Raw response:', text); // Log the raw response
        result = text ? JSON.parse(text) : null; // Then parse it if it's not empty
      } catch (parseError) {
        console.error('[Client] JSON parse error:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(result?.message || `Failed to fetch shipments: ${response.status}`);
      }
      
      if (!result || !result.success || !Array.isArray(result.data)) {
        console.warn('[Client] Invalid response format:', result);
        setShipments([]);
        throw new Error('Invalid response format from server');
      }
      
      setShipments(result.data);
    } catch (error) {
      console.error('[Client] Error fetching shipments:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch shipments');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/admin/shipments/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      const response = await fetch(`/api/admin/shipments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete shipment');
      }

      setShipments(shipments.filter((s: any) => s.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shipment Dashboard</h1>
          <button
            onClick={() => router.push('/admin/shipments/new')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add New Shipment
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">{error}</div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shipments.map((shipment: any, index: number) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.trackingNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.events?.[shipment.events.length - 1]?.location || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shipment.events?.length ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {shipment.events?.[shipment.events.length - 1]?.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => router.push(`/tracking/${shipment.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/admin/shipments/${shipment.id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(shipment.id)}
                      className={`${deleteConfirm === shipment.id ? 'text-red-600 font-semibold' : 'text-gray-600'} hover:text-red-900`}
                    >
                      {deleteConfirm === shipment.id ? 'Confirm?' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}