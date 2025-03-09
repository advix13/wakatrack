'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shipment } from '@prisma/client';
import ShipmentsTable from '@/components/shipments-table';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Fetch user's shipments
    if (status === 'authenticated') {
      fetchUserShipments();
    }
  }, [status, router]);

  const fetchUserShipments = async () => {
    try {
      setLoading(true);
      console.log('Fetching shipments for user:', session?.user?.id);
      
      const response = await fetch('/api/shipments/user');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch shipments');
      }
      
      console.log(`Received ${data.shipments.length} shipments from API`);
      setShipments(data.shipments);
    } catch (err: any) {
      console.error('Error fetching shipments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Shipments</h1>
            <p className="text-gray-600">
              Welcome back, {session?.user?.name || session?.user?.email}
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push('/dashboard/shipments/new')}
              className="flex items-center gap-2 bg-black hover:bg-orange-500 text-white"
            >
              <Package size={16} />
              Create New Shipment
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 bg-black hover:bg-orange-500 text-white"
            >
              <Plus size={16} />
              Track New Package
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading your shipments...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {shipments.length === 0 ? (
              <div className="text-center py-8 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
                <p className="text-gray-600">Create a new shipment to get started.</p>
              </div>
            ) : null}
            <ShipmentsTable 
              shipments={shipments} 
              userId={session?.user?.id} 
              isAdminView={false} // Explicitly set to false for user dashboard
            />
          </div>
        )}
      </div>
    </main>
  );
}
