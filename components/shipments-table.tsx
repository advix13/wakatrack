'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { ShipmentRecord, getStatusColor } from '@/types/shipment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ShipmentsTableProps {
  shipments: ShipmentRecord[];
  userId?: string;
  isAdminView?: boolean;
}

const ShipmentsTable = ({ shipments, userId, isAdminView = false }: ShipmentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ShipmentRecord>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  // Log the shipments and filtering parameters for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') { // Only run on client side
      console.log('ShipmentsTable props:', { 
        shipmentCount: shipments.length, 
        userId, 
        isAdminView 
      });
      
      if (!isAdminView && userId) {
        const userShipments = shipments.filter(s => s.userId === userId);
        console.log(`User ${userId} has ${userShipments.length} shipments out of ${shipments.length} total`);
      }
    }
  }, [shipments, userId, isAdminView]);

  // First filter by user ID - this is the most important filter
  // Regular users should ONLY see their own shipments
  const userFilteredShipments = isAdminView 
    ? shipments // Admin sees all shipments
    : shipments.filter(shipment => shipment.userId === userId);
  
  // Then apply search term filtering
  const filteredShipments = userFilteredShipments.filter(shipment => {
    return (
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.currentLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (isAdminView && shipment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Sort shipments
  const sortedShipments = [...filteredShipments].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    return aValue < bValue ? -1 * direction : aValue > bValue ? 1 * direction : 0;
  });

  // Handle sort click
  const handleSort = (field: keyof ShipmentRecord) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Handle delete shipment
  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        const response = await fetch(`/api/${isAdminView ? 'admin' : 'shipments'}/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete shipment');
        }

        // Refresh the page to update the shipment list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting shipment:', error);
        alert('Failed to delete shipment. Please try again.');
      } finally {
        setDeleteConfirm(null);
      }
    } else {
      setDeleteConfirm(id);
      // Auto-reset after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search shipments..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="border rounded-lg">
        <Table className="text-gray-900 font-medium">
          <TableHeader>
            <TableRow>
              {isAdminView && (
                <TableHead 
                  className="cursor-pointer font-bold text-gray-900"
                  onClick={() => handleSort('userEmail')}
                >
                  User
                </TableHead>
              )}
              <TableHead 
                className="cursor-pointer font-bold text-gray-900"
                onClick={() => handleSort('trackingNumber')}
              >
                Tracking Number
              </TableHead>
              <TableHead 
                className="cursor-pointer font-bold text-gray-900"
                onClick={() => handleSort('origin')}
              >
                Origin
              </TableHead>
              <TableHead 
                className="cursor-pointer font-bold text-gray-900"
                onClick={() => handleSort('destination')}
              >
                Destination
              </TableHead>
              <TableHead 
                className="cursor-pointer font-bold text-gray-900"
                onClick={() => handleSort('currentLocation')}
              >
                Current Location
              </TableHead>
              <TableHead 
                className="cursor-pointer font-bold text-gray-900"
                onClick={() => handleSort('status')}
              >
                Status
              </TableHead>
              <TableHead 
                className="cursor-pointer font-bold text-gray-900"
                onClick={() => handleSort('lastUpdated')}
              >
                Last Updated
              </TableHead>
              <TableHead className="font-bold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedShipments.map((shipment) => (
              <TableRow key={shipment.id}>
                {isAdminView && (
                  <TableCell className="font-medium text-gray-900">
                    {shipment.userEmail || 'No user'}
                  </TableCell>
                )}
                <TableCell className="font-semibold text-gray-900">
                  {shipment.trackingNumber}
                </TableCell>
                <TableCell className="font-medium text-gray-900">{shipment.origin}</TableCell>
                <TableCell className="font-medium text-gray-900">{shipment.destination}</TableCell>
                <TableCell className="font-medium text-gray-900">{shipment.currentLocation}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-gray-900">{formatDate(shipment.lastUpdated)}</TableCell>
                <TableCell>
                  <div className="flex space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      onClick={() => router.push(`/tracking/${shipment.id}`)}
                      title="View tracking details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                      onClick={() => router.push(`/${isAdminView ? 'admin' : 'dashboard'}/shipments/${shipment.id}/edit`)}
                      title="Edit shipment"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${deleteConfirm === shipment.id ? 'text-red-600 bg-red-100' : 'text-gray-600 hover:text-red-600 hover:bg-red-100'}`}
                      onClick={() => handleDelete(shipment.id)}
                      title={deleteConfirm === shipment.id ? "Click again to confirm deletion" : "Delete shipment"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShipmentsTable;
