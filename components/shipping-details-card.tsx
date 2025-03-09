import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Calendar, MapPin, CheckCircle2, Info, Clock } from 'lucide-react';

interface ShippingDetailsCardProps {
  trackingNumber: string;
  shippingDate: string;
  deliveryDate: string;
  origin: string;
  destination: string;
  currentLocation: string;
  currentDate: string;
  currentStatus: string;
  statusColor?: string;
  statusDetails: string;
  description: string;
  contentsDescription: string;
  currentStep: number;
}

const ShippingDetailsCard = ({
  trackingNumber,
  shippingDate,
  deliveryDate,
  origin,
  destination,
  currentLocation,
  currentDate,
  currentStatus,
  statusColor = '#22c55e',
  statusDetails,
  description,
  contentsDescription,
  currentStep = 1
}: ShippingDetailsCardProps) => {
  const steps = ["Pickup", "Shipped", "In Transit", "Out for Delivery", "Delivered"];

  return (
    <Card className="w-full">
      <CardContent className="p-2.5">
        {/* Header with Tracking Number and Dates */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-sm font-bold">
            {trackingNumber}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <span className="text-gray-700 mr-1 font-medium">Shipped:</span>
              <span className="font-semibold text-gray-900">
                {new Date(shippingDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric'
                }).replace(/^[a-z]/i, c => c.toUpperCase())}
              </span>
            </div>
            <div 
              className="text-white px-2.5 py-1 rounded-md text-xs font-bold bg-[#22c55e]"
            >
              DELIVERY BY: {new Date(deliveryDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              }).replace(/^[a-z]/i, c => c.toUpperCase())}
            </div>
          </div>
        </div>

        {/* Origin and Destination */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-500 mt-1" />
            <div>
              <p className="text-xs text-gray-700 font-medium">Origin</p>
              <p className="text-sm font-semibold text-gray-900">{origin}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-500 mt-1" />
            <div>
              <p className="text-xs text-gray-700 font-medium">Destination</p>
              <p className="text-sm font-semibold text-gray-900">{destination}</p>
            </div>
          </div>
        </div>

        {/* Current Location and Description */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-start gap-2">
            <Truck className="w-4 h-4 text-blue-500 mt-1" />
            <div>
              <p className="text-xs text-gray-700 font-medium">Current Location</p>
              <p className="text-sm font-semibold text-gray-900">{currentLocation}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-500 mt-1" />
            <div>
              <p className="text-xs text-gray-700 font-medium">Current Date</p>
              <p className="text-sm font-semibold text-gray-900">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* Status Button */}
        <div className="mb-6">
          <button
            className="text-white px-4 py-2 rounded-lg text-sm font-medium w-full"
            style={{ backgroundColor: statusColor || '#22c55e' }}
          >
            {currentStatus}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-600">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingDetailsCard;
