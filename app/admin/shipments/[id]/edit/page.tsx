'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShipmentForm from '../../new/client';

export default function EditShipmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState('');
  const shipmentId = params?.id; // Store ID in a variable to avoid repeated access

  useEffect(() => {
    const fetchShipment = async () => {
      if (!shipmentId) {
        setError('No shipment ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/shipments/${shipmentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch shipment');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch shipment');
        }

        setShipment(result.data);
      } catch (err: any) {
        console.error('Error fetching shipment:', err);
        setError(err.message || 'Failed to fetch shipment');
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [shipmentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Shipment Not Found</h2>
          <p>The requested shipment could not be found.</p>
          <button 
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return <ShipmentForm initialData={shipment} isEditMode={true} />;
}