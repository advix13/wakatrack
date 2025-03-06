'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditShipment({ params }: { params: { id: string } }) {
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingSteps, setTrackingSteps] = useState<Array<{
    currentLocation: string;
    locationName: string;
    dateTime: string;
  }>>([]);

  const [currentStep, setCurrentStep] = useState({
    currentLocation: '',
    locationName: '',
    dateTime: ''
  });

  const handleStepChange = (field: string, value: string) => {
    setCurrentStep(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveStep = () => {
    if (currentStep.currentLocation && currentStep.locationName && currentStep.dateTime) {
      setTrackingSteps(prev => [...prev, { ...currentStep }]);
      setCurrentStep({
        currentLocation: '',
        locationName: '',
        dateTime: ''
      });
    }
  };

  const deleteStep = (index: number) => {
    setTrackingSteps(prev => prev.filter((_, i) => i !== index));
  };

  const [formData, setFormData] = useState({
    // Basic Information
    trackingNumber: '',
    orderReferenceNumber: '',
    customerName: '',
    email: '',
    phoneNumber: '',
    statusDetails: '',
    
    // Shipping Details
    origin: '',
    destination: '',
    trackingProgress: 'Pickup',
    shipmentStatus: 'Pending',
    currentLocation: '',
    description: '',
    currentDate: new Date().toISOString().split('T')[0],
    shippingDate: '',
    estimatedDeliveryDate: ''
  });

  const trackingProgressOptions = ['Pickup', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];

  const shippingMethods = ['Standard', 'Express', 'Overnight'];
  const [editHistory, setEditHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchShipmentDetails();
  }, []);

  const fetchShipmentDetails = async () => {
    try {
      const response = await fetch(`/api/admin/shipments/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch shipment details');
      }

      setShipment(data);
      setTrackingSteps(data.trackingHistory || []);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        trackingNumber: data.trackingNumber || '',
        origin: data.origin || '',
        destination: data.destination || '',
        location: data.location || '',
        shippingDate: data.shippingDate ? new Date(data.shippingDate).toISOString().split('T')[0] : '',
        estimatedDeliveryDate: data.estimatedDeliveryDate ? new Date(data.estimatedDeliveryDate).toISOString().split('T')[0] : ''
      });
      setEditHistory(data.editHistory || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/shipments/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          trackingHistory: trackingSteps
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shipment');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="text-red-600">Shipment not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Shipment</h1>
          
          {error && (
            <div className="p-4 text-red-700 bg-red-100 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-50">
            <h2 className="text-xl font-semibold text-indigo-900">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order Reference Number</label>
                <input
                  type="text"
                  value={formData.orderReferenceNumber}
                  onChange={(e) => setFormData({ ...formData, orderReferenceNumber: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status Details</label>
                <input
                  type="text"
                  value={formData.statusDetails}
                  onChange={(e) => setFormData({ ...formData, statusDetails: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter status details"
                />
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-50">
            <h2 className="text-xl font-semibold text-indigo-900">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Origin</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tracking Progress</label>
                <select
                  value={formData.trackingProgress}
                  onChange={(e) => setFormData({ ...formData, trackingProgress: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {trackingProgressOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shipment Status</label>
                <input
                  type="text"
                  value={formData.shipmentStatus}
                  onChange={(e) => setFormData({ ...formData, shipmentStatus: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter shipment status"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Location</label>
                <input
                  type="text"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Date</label>
                <input
                  type="date"
                  value={formData.currentDate}
                  onChange={(e) => setFormData({ ...formData, currentDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shipping Date</label>
                <input
                  type="date"
                  value={formData.shippingDate}
                  onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={formData.estimatedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Tracking History */}
          <div className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-50">
            <h2 className="text-xl font-semibold text-indigo-900">Tracking History</h2>
            
            {/* Saved Steps */}
            {trackingSteps.length > 0 && (
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Saved Steps</h3>
                {trackingSteps.map((step, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                    <div className="space-y-2">
                      <p><span className="font-medium">Step 1:</span> {step.currentLocation}</p>
                      <p><span className="font-medium">Step 2:</span> {step.locationName}</p>
                      <p><span className="font-medium">Date/Time:</span> {step.dateTime}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteStep(index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Step Input */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Step 1</label>
                <input
                  type="text"
                  value={currentStep.currentLocation}
                  onChange={(e) => handleStepChange('currentLocation', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter step 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Step 2</label>
                <input
                  type="text"
                  value={currentStep.locationName}
                  onChange={(e) => handleStepChange('locationName', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter step 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date/Time</label>
                <input
                  type="text"
                  value={currentStep.dateTime}
                  onChange={(e) => handleStepChange('dateTime', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter date and time"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveStep}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={!currentStep.currentLocation || !currentStep.locationName || !currentStep.dateTime}
              >
                Save Step
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {editHistory && editHistory.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Edit History</h2>
            <div className="space-y-4">
              {editHistory.map((edit: any) => (
                <div key={edit.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <div className="text-sm text-gray-600">
                    Changed {edit.fieldName} from {edit.oldValue || 'empty'} to {edit.newValue}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(edit.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}