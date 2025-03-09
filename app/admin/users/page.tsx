'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, UserCog, Users } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin and fetch users
    if (status === 'authenticated') {
      checkAdminStatus();
    }
  }, [status, router]);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (response.status === 403) {
        setIsAdmin(false);
        setError('You do not have admin privileges');
        router.push('/dashboard'); // Redirect to user dashboard
        return;
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setIsAdmin(true);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      const response = await fetch('/api/admin/users/toggle-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isAdmin: !currentStatus,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update user');
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: !currentStatus } 
          : user
      ));
      
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading users...</p>
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
            You do not have permission to access the admin panel.
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
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">
              Manage users and admin privileges
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push('/admin/dashboard')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserCog size={16} />
              Admin Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 bg-black hover:bg-orange-500"
            >
              <Users size={16} />
              My Dashboard
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-6">There are no users in the system yet.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-gray-900">Name</TableHead>
                  <TableHead className="font-bold text-gray-900">Email</TableHead>
                  <TableHead className="font-bold text-gray-900">Role</TableHead>
                  <TableHead className="font-bold text-gray-900">Created</TableHead>
                  <TableHead className="font-bold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">
                      {user.name || 'No name'}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isAdmin 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${
                          user.isAdmin 
                            ? 'text-red-600 hover:text-red-800' 
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                        onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                        disabled={actionLoading === user.id || user.id === session?.user?.id}
                      >
                        {actionLoading === user.id 
                          ? 'Updating...' 
                          : user.isAdmin 
                            ? 'Remove Admin' 
                            : 'Make Admin'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </main>
  );
}
