'use client';

import React, { useState } from 'react';
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
import { Printer } from 'lucide-react';
import { ShipmentRecord, getStatusColor } from '@/types/shipment';
import Link from 'next/link';

interface ShipmentsTableProps {
  shipments: ShipmentRecord[];
}

const ShipmentsTable = ({ shipments }: ShipmentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ShipmentRecord>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter shipments based on search term
  const filteredShipments = shipments.filter(shipment => 
    shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.currentLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort shipments
  const sortedShipments = [...filteredShipments].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search shipments..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('trackingNumber')}
              >
                Tracking Number
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('origin')}
              >
                Origin
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('destination')}
              >
                Destination
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('currentLocation')}
              >
                Current Location
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('lastUpdated')}
              >
                Last Updated
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedShipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="font-medium">
                  {shipment.trackingNumber}
                </TableCell>
                <TableCell>{shipment.origin}</TableCell>
                <TableCell>{shipment.destination}</TableCell>
                <TableCell>{shipment.currentLocation}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(shipment.lastUpdated)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-blue-600 flex gap-2 items-center"
                    onClick={() => {
                      // Open print dialog with tracking page
                      const printWindow = window.open(`/tracking/${shipment.trackingNumber}`, '_blank');
                      printWindow?.addEventListener('load', () => {
                        printWindow?.print();
                      });
                    }}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
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
