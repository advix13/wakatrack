import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  console.log('[API] Starting POST request');
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    
    console.log('[API] User session:', userId, userEmail);
    
    // Connect to database
    await prisma.$connect();
    console.log('[API] Database connection successful');
    
    let requestData;
    try {
      const text = await request.text();
      console.log('[API] Received raw data:', text);
      
      if (!text) {
        throw new Error('Request body is empty');
      }
      
      requestData = JSON.parse(text);
      console.log('[API] Parsed request data:', requestData);
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

      // Create shipment in a transaction
      const shipment = await prisma.$transaction(async (prisma) => {
        // Create the initial event
        const initialEvent = {
          status: requestData.trackingProgress || 'Pickup',
          description: requestData.description || '',
          location: requestData.currentLocation || '',
          timestamp: now
        };

        // Create shipment with properly formatted data
        const newShipment = await prisma.shipment.create({
          data: {
            // Associate with current user if available
            userId: userId || null,
            userEmail: userEmail || null,
            
            // Basic Information
            trackingNumber: requestData.trackingNumber,
            orderReferenceNumber: requestData.orderReferenceNumber || null,
            customerName: requestData.customerName || null,
            email: requestData.email || null,
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
            createdAt: now,
            updatedAt: now,
            
            // Additional Information
            insuranceDetails: requestData.insuranceDetails || null,
            specialInstructions: requestData.specialInstructions || null,
            returnInstructions: requestData.returnInstructions || null,
            customerNotes: requestData.customerNotes || null,

            // Create initial tracking event
            events: {
              create: [initialEvent]
            }
          },
          include: {
            events: true
          }
        });

        return newShipment;
      });

      // Type the shipment response
      type Event = {
        id: string;
        status: string;
        description: string;
        location: string;
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
          events: (shipment as ShipmentWithEvents).events.map((event: Event) => ({
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

      console.log('[API] Shipment created successfully:', response);
      
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
    console.error('[API] Error creating shipment:', error);
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
    try {
      await prisma.$disconnect();
      console.log('[API] Database disconnected successfully');
    } catch (disconnectError) {
      console.error('[API] Error disconnecting from database:', disconnectError);
    }
  }
}

export async function GET() {
  console.log('[API] GET /api/admin/shipments - Start');
  try {
    await prisma.$connect();
    console.log('[API] Database connection successful');

    const shipments = await prisma.shipment.findMany({
      include: {
        events: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('[API] Found shipments:', JSON.stringify(shipments, null, 2));
    
    return new NextResponse(JSON.stringify({
      success: true,
      data: shipments || []
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('[API] Error fetching shipments:', error);
    return new NextResponse(JSON.stringify({
      success: false,
      message: 'Failed to fetch shipments',
      error: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    try {
      await prisma.$disconnect();
      console.log('[API] Database disconnected successfully');
    } catch (disconnectError) {
      console.error('[API] Error disconnecting from database:', disconnectError);
    }
  }
}