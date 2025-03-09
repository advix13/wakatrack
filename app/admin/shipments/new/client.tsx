'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function ShipmentForm({ 
  initialData = null, 
  isEditMode = false 
}: { 
  initialData?: any; 
  isEditMode?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    orderReferenceNumber: '',
    customerName: '',
    email: '',
    phoneNumber: '',
    statusDetails: '',
    statusColor: '#22c55e', // Default green color
    
    // Origin Address
    senderName: '',
    originStreetAddress: '',
    originCity: '',
    originState: '',
    originCountry: '',
    originPostalCode: '',
    origin: '',
    originLatitude: '',
    originLongitude: '',
    
    // Destination Address
    receiverName: '',
    destinationStreetAddress: '',
    destinationCity: '',
    destinationState: '',
    destinationCountry: '',
    destinationPostalCode: '',
    destination: '',
    destinationLatitude: '',
    destinationLongitude: '',
    
    // Package Details
    weight: '',
    length: '',
    width: '',
    height: '',
    packageType: '',
    contentsDescription: '',
    declaredValue: '',
    shippingMethod: '',
    
    // Tracking Details
    trackingProgress: 'Pickup', // Default to first step
    shipmentStatus: '',
    currentLocation: '',
    currentLatitude: '',
    currentLongitude: '',
    description: '',
    estimatedDeliveryDate: '',
    shipmentDate: '',
    
    // Additional Information
    insuranceDetails: '',
    specialInstructions: '',
    returnInstructions: '',
    customerNotes: '',
    
    // Additional fields for current location
    currentCity: '',
    currentState: '',
    shippingDate: ''
  });
  
  // Initialize events state
  const [events, setEvents] = useState<any[]>([]);
  
  // Initialize form with data if in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      // Format dates for form inputs
      const formattedData = {
        ...initialData,
        estimatedDeliveryDate: initialData.estimatedDeliveryDate ? 
          new Date(initialData.estimatedDeliveryDate).toISOString().split('T')[0] : '',
        shipmentDate: initialData.shipmentDate ? 
          new Date(initialData.shipmentDate).toISOString().split('T')[0] : '',
      };
      
      setFormData(formattedData);
      
      // Set events if available
      if (initialData.events && Array.isArray(initialData.events)) {
        setEvents(initialData.events.map((event: any) => ({
          ...event,
          timestamp: event.timestamp ? 
            new Date(event.timestamp).toISOString().split('T')[0] : ''
        })));
      }
    }
  }, [isEditMode, initialData]);

  // Helper functions to update addresses
  const updateOriginAddress = (data: any) => {
    const address = [
      data.originStreetAddress,
      data.originCity,
      data.originState,
      data.originCountry,
      data.originPostalCode
    ].filter(Boolean).join(', ');
    
    setFormData(prev => ({
      ...prev,
      origin: address
    }));
  };

  const updateDestinationAddress = (data: any) => {
    const address = [
      data.destinationStreetAddress,
      data.destinationCity,
      data.destinationState,
      data.destinationCountry,
      data.destinationPostalCode
    ].filter(Boolean).join(', ');
    
    setFormData(prev => ({
      ...prev,
      destination: address
    }));
  };

  const updateCurrentLocation = (data: any) => {
    const location = [
      data.currentCity,
      data.currentState
    ].filter(Boolean).join(', ');
    
    setFormData(prev => ({
      ...prev,
      currentLocation: location
    }));
  };

  const [currentSteps, setCurrentSteps] = useState({
    step1: '',
    step2: '',
    step3: ''
  });

  const [savedSteps, setSavedSteps] = useState<Array<{
    step1: string;
    step2: string;
    step3: string;
  }>>([]);

  const handleStepChange = (field: string, value: string) => {
    setCurrentSteps(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update shipment status when Step 1 changes
    if (field === 'step1') {
      setFormData(prev => ({
        ...prev,
        shipmentStatus: value,
        currentStatus: value  // Update both status fields
      }));
    }
  };

  const saveSteps = () => {
    if (currentSteps.step1 || currentSteps.step2 || currentSteps.step3) {
      setSavedSteps(prev => [...prev, { ...currentSteps }]);
      setCurrentSteps({
        step1: '',
        step2: '',
        step3: ''
      });
    }
  };

  const deleteSteps = (index: number) => {
    setSavedSteps(prev => prev.filter((_, i) => i !== index));
  };

  const packageTypes = ['Box', 'Envelope', 'Pallet', 'Other'];
  const shippingMethods = ['Standard', 'Express', 'Overnight'];
  const paymentStatuses = ['Paid', 'Unpaid'];
  const trackingProgressOptions = ['Pickup', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];


  const formatDateForSubmission = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Check if session exists and is valid
      if (!session || !session.user || !session.user.id) {
        throw new Error('You must be logged in to create a shipment. Please log in and try again.');
      }
      
      // Validate required fields
      if (!formData.trackingNumber) {
        throw new Error('Tracking number is required');
      }
      
      // Prepare data for API
      const shipmentData = {
        ...formData,
        // Convert string values to numbers where needed
        originLatitude: formData.originLatitude ? parseFloat(formData.originLatitude) : null,
        originLongitude: formData.originLongitude ? parseFloat(formData.originLongitude) : null,
        destinationLatitude: formData.destinationLatitude ? parseFloat(formData.destinationLatitude) : null,
        destinationLongitude: formData.destinationLongitude ? parseFloat(formData.destinationLongitude) : null,
        currentLatitude: formData.currentLatitude ? parseFloat(formData.currentLatitude) : null,
        currentLongitude: formData.currentLongitude ? parseFloat(formData.currentLongitude) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        declaredValue: formData.declaredValue ? parseFloat(formData.declaredValue) : null,
        
        // Format dates
        shipmentDate: formData.shipmentDate || null,
        estimatedDeliveryDate: formData.estimatedDeliveryDate || null,
        
        // Include events with proper timestamps
        events: events.map(event => ({
          ...event,
          timestamp: event.timestamp || new Date().toISOString()
        })),
        
        // Explicitly include user ID from session for additional security
        userId: session.user.id
      };
      
      // Determine API endpoint and method based on mode and user role
      const isAdmin = session?.user?.isAdmin === true;
      console.log('[Client] User session:', session?.user);
      console.log('[Client] Is admin:', isAdmin);
      
      let url;
      if (isEditMode) {
        // Use different endpoints for admin and regular users when editing
        url = isAdmin 
          ? `/api/admin/shipments/${initialData.id}` 
          : `/api/shipments/update/${initialData.id}`;
      } else {
        // Use different endpoints for admin and regular users when creating
        url = isAdmin ? '/api/admin/shipments' : '/api/shipments/create';
      }
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      console.log(`[Client] Sending ${method} request to ${url}`);
      console.log('[Client] Request data:', JSON.stringify(shipmentData, null, 2));

      // Send data to API with improved error handling
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipmentData),
        credentials: 'include' // Ensure cookies are sent with the request
      });

      // Handle response status codes
      if (response.status === 401) {
        // Handle authentication errors
        const result = await response.json();
        console.error('[Client] Authentication error:', result);
        throw new Error(result?.message || 'Authentication failed. Please log in again.');
      }
      
      // Get response data
      const result = await response.json();
      console.log('[Client] API Response:', result);

      if (!response.ok) {
        const errorMessage = result?.message || result?.error || `Failed to ${isEditMode ? 'update' : 'create'} shipment`;
        console.error('[Client] Request failed:', errorMessage, 'Full result:', result);
        throw new Error(errorMessage);
      }
      
      setSuccess(true);
      console.log(`[Client] Shipment ${isEditMode ? 'updated' : 'created'} successfully:`, result.data);
      
      // Show success message and redirect
      setTimeout(() => {
        // Check if user is admin or regular user and redirect accordingly
        const isAdmin = session?.user?.isAdmin === true;
        router.push(isAdmin ? '/admin' : '/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error(`[Client] Error ${isEditMode ? 'updating' : 'creating'} shipment:`, err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} shipment`);
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = "mt-2 block w-full px-4 py-3 text-base rounded-xl border border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/90 transition duration-200 ease-in-out";
  const textareaClassName = "mt-2 block w-full px-4 py-3 text-base rounded-xl border border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/90 transition duration-200 ease-in-out";

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              const isAdmin = session?.user?.isAdmin === true;
              router.push(isAdmin ? '/admin' : '/dashboard');
            }}
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-indigo-100">
          <h1 className="text-3xl font-bold text-indigo-900 mb-8">
            {isEditMode ? 'Edit Shipment' : 'Create New Shipment'}
          </h1>
          
          {error && (
            <div className="mb-6 p-4 text-red-700 bg-red-100/80 backdrop-blur-sm rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form title */}
            <div className="border-b pb-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Shipment' : 'Create New Shipment'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isEditMode 
                  ? 'Update the shipment information below' 
                  : 'Fill out the information below to create a new shipment'}
              </p>
            </div>

            {/* Tracking History Steps */}
            <div className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-50">
              <h2 className="text-xl font-semibold text-indigo-900">Tracking History Step</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status/Type</label>
                  <input
                    type="text"
                    value={currentSteps.step1}
                    onChange={(e) => handleStepChange('step1', e.target.value)}
                    className={inputClassName}
                    placeholder="e.g., Package Picked Up"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={currentSteps.step2}
                    onChange={(e) => handleStepChange('step2', e.target.value)}
                    className={inputClassName}
                    placeholder="e.g., Dallas, Texas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp (MMM DD)</label>
                  <input
                    type="text"
                    value={currentSteps.step3}
                    onChange={(e) => handleStepChange('step3', e.target.value)}
                    className={inputClassName}
                    placeholder="e.g., Jan 10, Feb 10, Mar 10"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={saveSteps}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Step
                </button>
              </div>

              {/* Display saved steps */}
              {savedSteps.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Steps</h3>
                  <div className="space-y-4">
                    {savedSteps.map((step, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 flex-1">
                          <div>
                            <span className="text-sm text-gray-500">Status:</span>
                            <p className="text-gray-900">{step.step1}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Location:</span>
                            <p className="text-gray-900">{step.step2}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Timestamp:</span>
                            <p className="text-gray-900">{step.step3}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteSteps(index)}
                          className="ml-4 text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Reference Number</label>
                  <input
                    type="text"
                    value={formData.orderReferenceNumber}
                    onChange={(e) => setFormData({ ...formData, orderReferenceNumber: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Status Details</label>
                  <input
                    type="text"
                    value={formData.statusDetails}
                    onChange={(e) => setFormData({ ...formData, statusDetails: e.target.value })}
                    className={inputClassName}
                    placeholder="Enter status details"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Status Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.statusColor || '#22c55e'}
                      onChange={(e) => setFormData({ ...formData, statusColor: e.target.value })}
                      className="h-10 w-20 p-1 rounded border border-gray-300"
                    />
                    <div 
                      className="px-4 py-2 rounded text-white text-sm"
                      style={{ backgroundColor: formData.statusColor || '#22c55e' }}
                    >
                      Preview Status
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Origin Address */}
            <div className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-50">
              <h2 className="text-xl font-semibold text-indigo-900">Origin Address (Where it leaves from)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sender Name</label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => {
                      setFormData({ ...formData, senderName: e.target.value });
                      updateOriginAddress({ ...formData, senderName: e.target.value });
                    }}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    value={formData.originStreetAddress}
                    onChange={(e) => {
                      setFormData({ ...formData, originStreetAddress: e.target.value });
                      updateOriginAddress({ ...formData, originStreetAddress: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={formData.originCity}
                    onChange={(e) => {
                      setFormData({ ...formData, originCity: e.target.value });
                      updateOriginAddress({ ...formData, originCity: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State/Province</label>
                  <input
                    type="text"
                    value={formData.originState}
                    onChange={(e) => {
                      setFormData({ ...formData, originState: e.target.value });
                      updateOriginAddress({ ...formData, originState: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter state/province"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={formData.originCountry}
                    onChange={(e) => {
                      setFormData({ ...formData, originCountry: e.target.value });
                      updateOriginAddress({ ...formData, originCountry: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    value={formData.originPostalCode}
                    onChange={(e) => {
                      setFormData({ ...formData, originPostalCode: e.target.value });
                      updateOriginAddress({ ...formData, originPostalCode: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            {/* Destination Address */}
            <div className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-50">
              <h2 className="text-xl font-semibold text-indigo-900">Destination Address (Where it's going)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receiver Name</label>
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => {
                      setFormData({ ...formData, receiverName: e.target.value });
                      updateDestinationAddress({ ...formData, receiverName: e.target.value });
                    }}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    value={formData.destinationStreetAddress}
                    onChange={(e) => {
                      setFormData({ ...formData, destinationStreetAddress: e.target.value });
                      updateDestinationAddress({ ...formData, destinationStreetAddress: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={formData.destinationCity}
                    onChange={(e) => {
                      setFormData({ ...formData, destinationCity: e.target.value });
                      updateDestinationAddress({ ...formData, destinationCity: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State/Province</label>
                  <input
                    type="text"
                    value={formData.destinationState}
                    onChange={(e) => {
                      setFormData({ ...formData, destinationState: e.target.value });
                      updateDestinationAddress({ ...formData, destinationState: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter state/province"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={formData.destinationCountry}
                    onChange={(e) => {
                      setFormData({ ...formData, destinationCountry: e.target.value });
                      updateDestinationAddress({ ...formData, destinationCountry: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    value={formData.destinationPostalCode}
                    onChange={(e) => {
                      setFormData({ ...formData, destinationPostalCode: e.target.value });
                      updateDestinationAddress({ ...formData, destinationPostalCode: e.target.value });
                    }}
                    className={inputClassName}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            {/* Current Location */}
            <div className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-50">
              <h2 className="text-xl font-semibold text-indigo-900">Current Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={formData.currentCity || ''}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        currentCity: newCity,
                        currentLocation: `${newCity}${prev.currentState ? `, ${prev.currentState}` : ''}`
                      }));
                      updateCurrentLocation({
                        ...formData,
                        currentCity: newCity
                      });
                    }}
                    className={inputClassName}
                    placeholder="Enter current city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State/Province</label>
                  <input
                    type="text"
                    value={formData.currentState || ''}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        currentState: newState,
                        currentLocation: `${prev.currentCity ? `${prev.currentCity}, ` : ''}${newState}`
                      }));
                      updateCurrentLocation({
                        ...formData,
                        currentState: newState
                      });
                    }}
                    className={inputClassName}
                    placeholder="Enter current state/province"
                  />
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-50">
              <h2 className="text-xl font-semibold text-indigo-900">Package Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Length (cm)</label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width (cm)</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Package Type</label>
                  <input
                    type="text"
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contents Description</label>
                  <textarea
                    value={formData.contentsDescription}
                    onChange={(e) => setFormData({ ...formData, contentsDescription: e.target.value })}
                    className={textareaClassName}
                    rows={3}
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
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tracking Progress</label>
                  <select
                    value={formData.trackingProgress}
                    onChange={(e) => setFormData({ ...formData, trackingProgress: e.target.value })}
                    className={inputClassName}
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
                    className={inputClassName}
                    placeholder="Enter shipment status"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Location</label>
                  <input
                    type="text"
                    value={formData.currentLocation}
                    onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={textareaClassName}
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Date</label>
                  <input
                    type="text"
                    value={new Date().toISOString().split('T')[0]}
                    readOnly
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shipping Date</label>
                  <input
                    type="date"
                    value={formData.shippingDate || ''}
                    onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={formData.estimatedDeliveryDate || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => router.push('/admin')}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : isEditMode ? 'Update Shipment' : 'Create Shipment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
