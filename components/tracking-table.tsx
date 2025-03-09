'use client';

import React from 'react';
import { CalendarDays, MapPin, Package, Truck, Clock } from 'lucide-react';

interface TrackingTableProps {
  shipment: {
    trackingNumber?: string;
    origin?: string;
    destination?: string;
    shipmentStatus?: string;
    currentLocation?: string;
    shipmentDate?: string;
    estimatedDeliveryDate?: string;
    statusColor?: string;
    trackingProgress?: string;
  };
}

const TrackingTable: React.FC<TrackingTableProps> = ({ shipment }) => {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Get status color with fallback
  const statusColor = shipment.statusColor || '#22c55e';
  
  // Define the exact tracking progress steps from the Create New Shipment form
  const trackingProgressSteps = ['Pickup', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
  
  // Get the current tracking progress step
  const currentTrackingProgress = shipment.trackingProgress || 'Pickup';
  
  // Find the index of the current step
  let progressIndex = 0;
  for (let i = 0; i < trackingProgressSteps.length; i++) {
    if (trackingProgressSteps[i] === currentTrackingProgress) {
      progressIndex = i;
      break;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        {/* Header with tracking number */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-black">Shipment Details</h2>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-full">
            <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
              Tracking: {shipment.trackingNumber}
            </span>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: statusColor }}
            ></div>
            <span 
              className="text-sm font-semibold"
              style={{ color: statusColor }}
            >
              {shipment.shipmentStatus || 'Pending'}
            </span>
          </div>
          <div className="text-sm text-black">
            Last Updated: {currentDate}
          </div>
        </div>
        
        {/* Modern card layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin & Destination Card */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div className="w-0.5 h-12 bg-gray-200 my-1"></div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Origin</p>
                  <p className="text-black font-medium">{shipment.origin || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Destination</p>
                  <p className="text-black font-medium">{shipment.destination || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Location Card */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Current Location</p>
                <p className="text-black font-medium">{shipment.currentLocation || 'Not available'}</p>
                <div className="mt-4">
                  <button 
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: `${statusColor}15`, 
                      color: statusColor,
                      border: `1px solid ${statusColor}30`
                    }}
                  >
                    {shipment.shipmentStatus || 'Pending'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dates Card */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Shipped</p>
                    <p className="text-black font-medium">{formatDate(shipment.shipmentDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Estimated Delivery</p>
                    <p className="text-black font-medium">{formatDate(shipment.estimatedDeliveryDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Delivery Time Card */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Delivery Timeline</p>
                <div className="mt-2 relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {shipment.shipmentStatus || 'Pending'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {currentTrackingProgress}
                      </span>
                    </div>
                  </div>
                  
                  {/* 5-stage progress bar tied directly to trackingProgress */}
                  <div className="flex h-2 mb-4 space-x-1">
                    {trackingProgressSteps.map((step, index) => (
                      <div 
                        key={step} 
                        className={`flex-1 rounded ${index <= progressIndex ? 'bg-indigo-500' : 'bg-indigo-200'}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingTable; 