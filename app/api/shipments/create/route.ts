import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  console.log('[API] Starting User Shipment POST request');
  
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
    const userEmail = session?.user?.email;
    
    console.log('[API] User ID:', userId);
    console.log('[API] User Email:', userEmail);
    
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
    
    // Verify user exists in database
    try {
      // Connect to database
      await prisma.$connect();
      dbConnected = true;
      console.log('[API] Database connection successful');
      
      // Verify user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!userExists) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            message: 'Unauthorized - User not found in database'
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (dbConnectionError) {
      console.error('[API] Database connection error:', dbConnectionError);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Database connection error',
          error: dbConnectionError instanceof Error ? dbConnectionError.message : 'Unknown database error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse request data with improved error handling
    let requestData;
    try {
      requestData = await request.json();
      console.log('[API] Parsed request data:', JSON.stringify(requestData, null, 2));
      if (!requestData || typeof requestData !== 'object') {
        return new NextResponse(JSON.stringify({ 
          success: false, 
          message: 'Invalid payload. Expected an object.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (parseError) {
      console.error('[API] JSON parse error:', parseError);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid JSON in request body',
          error: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!requestData.trackingNumber) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Tracking number is required'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if tracking number exists
    const existingShipment = await prisma.shipment.findUnique({
      where: { trackingNumber: requestData.trackingNumber }
    });

    if (existingShipment) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Tracking number already exists'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Prepare dates
      const now = new Date();
      const shipmentDate = requestData.shipmentDate ? new Date(requestData.shipmentDate) : 
                          requestData.shippingDate ? new Date(requestData.shippingDate) : 
                          now;
      
      const estimatedDeliveryDate = requestData.estimatedDeliveryDate ? 
                                   new Date(requestData.estimatedDeliveryDate) : null;

      console.log('[API] Creating shipment with data:', JSON.stringify({
        trackingNumber: requestData.trackingNumber,
        userId: userId,
        shipmentStatus: requestData.shipmentStatus || 'Pending',
        description: requestData.description || ''
      }));
      
      // First create the shipment without events
      const shipmentData = {
        // Always associate with current user
        userId: userId,
        
        // Basic Information
        trackingNumber: requestData.trackingNumber,
        orderReferenceNumber: requestData.orderReferenceNumber || null,
        customerName: requestData.customerName || null,
        email: requestData.email || userEmail || null,
        phoneNumber: requestData.phoneNumber || null,
        statusDetails: requestData.statusDetails || null,
        
        // Origin Address
        senderName: requestData.senderName || null,
        originStreetAddress: requestData.originStreetAddress || null,
        originCity: requestData.originCity || null,
        originState: requestData.originState || null,
        originCountry: requestData.originCountry || null,
        originPostalCode: requestData.originPostalCode || null,
        origin: requestData.origin || null,
        
        // Destination Address
        receiverName: requestData.receiverName || null,
        destinationStreetAddress: requestData.destinationStreetAddress || null,
        destinationCity: requestData.destinationCity || null,
        destinationState: requestData.destinationState || null,
        destinationCountry: requestData.destinationCountry || null,
        destinationPostalCode: requestData.destinationPostalCode || null,
        destination: requestData.destination || null,
        
        // Package Details - Convert numbers to strings
        weight: requestData.weight ? String(requestData.weight) : null,
        length: requestData.length ? String(requestData.length) : null,
        width: requestData.width ? String(requestData.width) : null,
        height: requestData.height ? String(requestData.height) : null,
        packageType: requestData.packageType || null,
        contentsDescription: requestData.contentsDescription || null,
        declaredValue: requestData.declaredValue ? String(requestData.declaredValue) : null,
        
        // Shipping Details
        shippingMethod: requestData.shippingMethod || null,
        trackingProgress: requestData.trackingProgress || 'Pickup',
        shipmentStatus: requestData.shipmentStatus || 'Pending',
        statusColor: requestData.statusColor || '#22c55e',
        currentLocation: requestData.currentLocation || null,
        description: requestData.description || null,
        
        // Dates
        estimatedDeliveryDate,
        shipmentDate,
      };
      
      // Create shipment without using transaction
      const newShipment = await prisma.shipment.create({
        data: shipmentData
      });
      
      console.log('[API] Shipment created successfully:', newShipment.id);
      
      // Now create the initial event separately
      const initialEvent = {
        status: requestData.trackingProgress || 'Pickup',
        description: requestData.description || '',
        location: requestData.currentLocation || '',
        timestamp: now,
        shipmentId: newShipment.id // Link to the shipment
      };
      
      const event = await prisma.trackingEvent.create({
        data: initialEvent
      });
      
      console.log('[API] Initial tracking event created:', event.id);
      
      // Get the complete shipment with events
      const shipment = await prisma.shipment.findUnique({
        where: { id: newShipment.id },
        include: { events: true }
      });
      
      if (!shipment) {
        throw new Error('Failed to retrieve created shipment');
      }

      // Type the shipment response
      type Event = {
        id: string;
        status: string;
        description: string;
        location: string | null;
        timestamp: Date;
        shipmentId: string;
      };

      type ShipmentWithEvents = {
        id: string;
        trackingNumber: string;
        events: Event[];
        createdAt: Date;
        updatedAt: Date;
        shipmentDate: Date | null;
        estimatedDeliveryDate: Date | null;
        [key: string]: any;
      };

      // Ensure the response is properly formatted
      const response = {
        success: true as const,
        data: {
          ...shipment,
          events: shipment.events.map((event: Event) => ({
            ...event,
            timestamp: event.timestamp.toISOString()
          })),
          createdAt: shipment.createdAt.toISOString(),
          updatedAt: shipment.updatedAt.toISOString(),
          shipmentDate: shipment.shipmentDate?.toISOString() || null,
          estimatedDeliveryDate: shipment.estimatedDeliveryDate?.toISOString() || null
        },
        message: 'Shipment created successfully'
      };

      console.log('[API] User shipment created successfully:', response);
      
      return new NextResponse(
        JSON.stringify(response),
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      console.error('[API] Database error:', dbError);
      throw dbError; // Re-throw to be caught by outer try-catch
    }
  } catch (error: any) {
    console.error('[API] Error creating user shipment:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to create shipment',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      }),
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
