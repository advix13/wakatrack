'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ShipmentForm from '@/app/admin/shipments/new/client';

export default function EditShipmentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Fetch shipment data
    if (status === 'authenticated' && params.id) {
      fetchShipment();
    }
  }, [status, params.id, router]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shipments/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch shipment');
      }

      // Verify that the user owns this shipment
      if (data.shipment.userId !== session?.user?.id && !session?.user?.isAdmin) {
        router.push('/dashboard');
        throw new Error('You do not have permission to edit this shipment');
      }

      setShipment(data.shipment);
    } catch (err: any) {
      console.error('Error fetching shipment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading shipment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <ShipmentForm initialData={shipment} isEditMode={true} />;
} 