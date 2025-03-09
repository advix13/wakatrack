import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Get the ID from params safely
  const shipmentId = params?.id;
  console.log('[API] Starting user shipment update request for ID:', shipmentId);
  
  // Initialize database connection variable to ensure proper cleanup
  let dbConnected = false;
  
  try {
    // Get the current user session with improved error handling
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log('[API] User session:', session ? JSON.stringify(session, null, 2) : 'No session found');
      
      if (!session) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            message: 'Unauthorized - No valid session found. Please log in again.'
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (sessionError) {
      console.error('[API] Error retrieving session:', sessionError);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Authentication error - Unable to validate your session',
          error: sessionError instanceof Error ? sessionError.message : 'Unknown session error'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const userId = session?.user?.id;
    
    console.log('[API] User ID:', userId);
    
    // Validate user data from session
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized - User ID not found in session. Please log in again.'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate ID
    if (!shipmentId) {
      console.log('[API] Error: No shipment ID provided');
      return new NextResponse(
        JSON.stringify({ success: false, message: 'No shipment ID provided' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Connect to database
    await prisma.$connect();
    dbConnected = true;
    console.log('[API] Database connection successful');
    
    // Check if the shipment exists and belongs to the user
    const existingShipment = await prisma.shipment.findUnique({
      where: { id: shipmentId }
    });
    
    if (!existingShipment) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Shipment not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Verify ownership - only the owner can update their shipment
    if (existingShipment.userId !== userId) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized - You do not have permission to update this shipment'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse request body
    let requestData;
    try {
      const text = await request.text();
      console.log('[API] Received raw data:', text);
      
      if (!text) {
        throw new Error('Request body is empty');
      }
      
      requestData = JSON.parse(text);
      console.log('[API] Parsed request data:', requestData);
      
      if (!requestData || typeof requestData !== 'object') {
        throw new Error('Invalid request data format - expected an object');
      }
    } catch (error) {
      console.error('[API] Error parsing request data:', error);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid request data',
          error: error instanceof Error ? error.message : 'Unknown parsing error'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Prepare dates
    const now = new Date();
    const shipmentDate = requestData.shipmentDate ? new Date(requestData.shipmentDate) : null;
    const estimatedDeliveryDate = requestData.estimatedDeliveryDate ? new Date(requestData.estimatedDeliveryDate) : null;
    
    // Update the shipment directly without using transaction
    try {
      // Update the shipment
      const updatedShipment = await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          // Basic Information
          trackingNumber: requestData.trackingNumber,
          orderReferenceNumber: requestData.orderReferenceNumber || null,
          customerName: requestData.customerName || null,
          email: requestData.email || null,
          phoneNumber: requestData.phoneNumber || null,
          statusDetails: requestData.statusDetails || null,
          statusColor: requestData.statusColor || null,
          
          // Origin Address
          senderName: requestData.senderName || null,
          originStreetAddress: requestData.originStreetAddress || null,
          originCity: requestData.originCity || null,
          originState: requestData.originState || null,
          originCountry: requestData.originCountry || null,
          originPostalCode: requestData.originPostalCode || null,
          origin: requestData.origin || null,
          originLatitude: requestData.originLatitude ? parseFloat(String(requestData.originLatitude)) : null,
          originLongitude: requestData.originLongitude ? parseFloat(String(requestData.originLongitude)) : null,
          
          // Destination Address
          receiverName: requestData.receiverName || null,
          destinationStreetAddress: requestData.destinationStreetAddress || null,
          destinationCity: requestData.destinationCity || null,
          destinationState: requestData.destinationState || null,
          destinationCountry: requestData.destinationCountry || null,
          destinationPostalCode: requestData.destinationPostalCode || null,
          destination: requestData.destination || null,
          destinationLatitude: requestData.destinationLatitude ? parseFloat(String(requestData.destinationLatitude)) : null,
          destinationLongitude: requestData.destinationLongitude ? parseFloat(String(requestData.destinationLongitude)) : null,
          
          // Package Details
          weight: requestData.weight ? String(requestData.weight) : null,
          length: requestData.length ? String(requestData.length) : null,
          width: requestData.width ? String(requestData.width) : null,
          height: requestData.height ? String(requestData.height) : null,
          packageType: requestData.packageType || null,
          contentsDescription: requestData.contentsDescription || null,
          declaredValue: requestData.declaredValue ? String(requestData.declaredValue) : null,
          
          // Shipping Details
          shippingMethod: requestData.shippingMethod || null,
          trackingProgress: requestData.trackingProgress || null,
          shipmentStatus: requestData.shipmentStatus || null,
          currentLocation: requestData.currentLocation || null,
          currentLatitude: requestData.currentLatitude ? parseFloat(String(requestData.currentLatitude)) : null,
          currentLongitude: requestData.currentLongitude ? parseFloat(String(requestData.currentLongitude)) : null,
          description: requestData.description || null,
          
          // Dates
          estimatedDeliveryDate,
          shipmentDate,
          
          // Additional Information
          insuranceDetails: requestData.insuranceDetails || null,
          specialInstructions: requestData.specialInstructions || null,
          returnInstructions: requestData.returnInstructions || null,
          customerNotes: requestData.customerNotes || null,
          
          // Update timestamp
          updatedAt: now
        }
      });
      
      // Handle events if provided
      if (requestData.events && Array.isArray(requestData.events)) {
        // Delete existing events
        await prisma.trackingEvent.deleteMany({
          where: { shipmentId }
        });
        
        // Create new events
        for (const event of requestData.events) {
          await prisma.trackingEvent.create({
            data: {
              shipmentId,
              status: event.status || 'Update',
              description: event.description || '',
              location: event.location || '',
              timestamp: event.timestamp ? new Date(event.timestamp) : now
            }
          });
        }
      }
      
      // Get the updated shipment with events
      const result = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        include: { events: true }
      });
      
      console.log('[API] Shipment updated successfully:', result?.id);
      
      return new NextResponse(
        JSON.stringify({
          success: true,
          data: result,
          message: 'Shipment updated successfully'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('[API] Update error:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('[API] Error updating shipment:', error);
    
    // Create a detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorResponse = {
      success: false,
      message: 'Failed to update shipment',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    };
    
    return new NextResponse(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    // Ensure database connection is closed properly
    if (dbConnected) {
      try {
        await prisma.$disconnect();
        console.log('[API] Database disconnected successfully');
      } catch (disconnectError) {
        console.error('[API] Error disconnecting from database:', disconnectError);
      }
    }
  }
} 