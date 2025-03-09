'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shipment } from '@prisma/client';
import ShipmentsTable from '@/components/shipments-table';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin and fetch shipments
    if (status === 'authenticated') {
      checkAdminStatus();
    }
  }, [status, router]);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shipments/admin');
      
      if (response.status === 403) {
        setIsAdmin(false);
        setError('You do not have admin privileges');
        router.push('/dashboard'); // Redirect to user dashboard
        return;
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch shipments');
      }
      
      const data = await response.json();
      setShipments(data.shipments);
      setIsAdmin(true);
    } catch (err: any) {
      console.error('Error fetching shipments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access the admin dashboard.
          </p>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="bg-black hover:bg-orange-500"
          >
            Go to My Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">
              Viewing all shipments in the system
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users size={16} />
              My Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 bg-black hover:bg-orange-500"
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

        {shipments.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
            <p className="text-gray-600 mb-6">There are no shipments in the system yet.</p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-black hover:bg-orange-500"
            >
              Track Your First Package
            </Button>
          </div>
        ) : (
          <ShipmentsTable shipments={shipments} isAdminView={true} />
        )}
      </div>
    </main>
  );
}
