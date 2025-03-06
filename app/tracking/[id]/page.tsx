'use client';

import { useState, useEffect } from 'react';
import ShipmentsTable from '@/components/shipments-table';
import AddressCard from '@/components/address-card';
import PackageDetailsCard from '@/components/package-details-card';
import ShippingDetailsCard from '@/components/shipping-details-card';
import DescriptionCard from '@/components/description-card';
import TrackingHistory from '@/components/tracking-history';
import MapCard from '@/components/map-card';
import { geocodeLocation } from '@/utils/geocoding';

export default function TrackingPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/shipments/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch shipment');
        }

        console.log('Shipment data:', data);
        console.log('Shipping date:', data.shippingDate);
        setShipment(data);
      } catch (error: any) {
        console.error('Error fetching tracking data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Shipment Not Found</h2>
          <p>The requested shipment could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-2.5">
        {/* First Section */}
        <div className="flex flex-col lg:flex-row gap-2.5">
          {/* Shipping Details Card (3/4 width) */}
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-lg p-2.5">
            <ShippingDetailsCard
              trackingNumber={shipment.trackingNumber}
              shippingDate={shipment.shipmentDate}
              deliveryDate={shipment.estimatedDeliveryDate}
              origin={shipment.origin}
              destination={shipment.destination}
              currentLocation={shipment.currentLocation}
              currentDate={new Date().toLocaleDateString()}
              currentStatus={shipment.shipmentStatus || 'Pending'}
              statusColor={shipment.statusColor}
              statusDetails={shipment.statusDetails}
              description={shipment.description}
              contentsDescription={shipment.contentsDescription}
              currentStep={shipment.trackingProgress ? ['Pickup', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'].indexOf(shipment.trackingProgress) : 0}
            />
          </div>

          {/* Right Stack (1/4 width) */}
          <div className="w-full lg:w-1/4 flex flex-col gap-2.5">
            {/* Destination Address Card */}
            <div className="w-full bg-white rounded-xl shadow-lg p-2.5">
              <AddressCard
              type="destination"
              name={shipment.receiverName}
              streetAddress={shipment.destinationStreetAddress}
              city={shipment.destinationCity}
              stateProvince={shipment.destinationState}
              postalCode={shipment.destinationPostalCode}
              country={shipment.destinationCountry}
            />
            </div>

            {/* Origin Address Card */}
            <div className="bg-white rounded-xl shadow-lg p-2.5">
              <AddressCard
              type="origin"
              name={shipment.senderName}
              streetAddress={shipment.originStreetAddress}
              city={shipment.originCity}
              stateProvince={shipment.originState}
              postalCode={shipment.originPostalCode}
              country={shipment.originCountry}
            />
            </div>
          </div>
        </div>

        {/* Second Section */}
        <div className="flex flex-col lg:flex-row gap-2.5">
          {/* Left Side (3/4 width) */}
          <div className="w-full lg:w-3/4 flex flex-col md:flex-row gap-2.5">
            {/* Tracking History Card */}
            <div className="w-full md:w-[37.5%] bg-white rounded-xl shadow-lg p-2.5">
              <TrackingHistory
                trackingNumber={shipment.trackingNumber}
                status={shipment.shipmentStatus}
                statusDetails={shipment.statusDetails || 'No status details available'}
                events={shipment.events?.map(event => ({
                  type: event.status,
                  location: event.location || 'Unknown location',
                  datetime: new Date(event.timestamp).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                })) || []}
              />
            </div>

            {/* Map Card */}
            <div className="w-full md:w-[62.5%]">
              <MapCard
                origin={shipment.origin || 'Unknown Origin'}
                destination={shipment.destination || 'Unknown Destination'}
                currentLocation={shipment.currentLocation || 'Unknown Location'}
              />
            </div>
          </div>

          {/* Package Details Card (1/4 width) */}
          <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-lg p-2.5">
            <PackageDetailsCard
              weight={shipment.weight || '0.00'}
              dimensions={{
                length: parseFloat(shipment.length || '0'),
                width: parseFloat(shipment.width || '0'),
                height: parseFloat(shipment.height || '0')
              }}
              packageType={shipment.packageType || 'Package Type'}
              contentsDescription={shipment.contentsDescription || 'No description provided'}
            />
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-xl shadow-lg p-2.5">
          <DescriptionCard
            description={shipment.description || 'No description available'}
          />
        </div>

        {/* Third Section - Tracking History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <ShipmentsTable
            shipments={[
              {
                id: shipment.id,
                trackingNumber: shipment.trackingNumber,
                origin: shipment.origin,
                destination: shipment.destination,
                currentLocation: shipment.currentLocation || 'Unknown',
                status: shipment.shipmentStatus,
                lastUpdated: shipment.updatedAt || new Date().toISOString()
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
