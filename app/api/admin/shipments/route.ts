import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  console.log('[API] Starting POST request');
  try {
    await prisma.$connect();
    
    let requestData;
    try {
      requestData = await request.json();
      console.log('[API] Received data:', requestData);
    } catch (parseError) {
      console.error('[API] JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    if (!requestData.trackingNumber) {
      return NextResponse.json(
        { success: false, message: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Check if tracking number exists
    const existingShipment = await prisma.shipment.findUnique({
      where: { trackingNumber: requestData.trackingNumber }
    });

    if (existingShipment) {
      return NextResponse.json(
        { success: false, message: 'Tracking number already exists' },
        { status: 400 }
      );
    }

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
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
        
        // Package Details
        weight: requestData.weight || null,
        length: requestData.length || null,
        width: requestData.width || null,
        height: requestData.height || null,
        packageType: requestData.packageType || null,
        contentsDescription: requestData.contentsDescription || null,
        declaredValue: requestData.declaredValue || null,
        
        // Shipping Details
        shippingMethod: requestData.shippingMethod || null,
        trackingProgress: requestData.trackingProgress || 'Pickup',
        shipmentStatus: requestData.shipmentStatus || 'Pending',
        statusColor: requestData.statusColor || '#22c55e',  // Save the status color
        currentLocation: requestData.currentLocation || null,
        description: requestData.description || null,
        estimatedDeliveryDate: requestData.estimatedDeliveryDate ? new Date(requestData.estimatedDeliveryDate) : null,
        shipmentDate: requestData.shipmentDate ? new Date(requestData.shipmentDate) : null,
        insuranceDetails: requestData.insuranceDetails || null,
        
        // Additional Information
        specialInstructions: requestData.specialInstructions || null,
        returnInstructions: requestData.returnInstructions || null,
        customerNotes: requestData.customerNotes || null,

        events: {
          create: Array.isArray(requestData.trackingHistory) && requestData.trackingHistory.length > 0 ? 
            requestData.trackingHistory.map((event: any) => ({
              status: event.status,
              description: event.description || '',
              location: event.location,
              timestamp: new Date(event.timestamp || new Date())
            })) : 
            [{
              status: requestData.trackingProgress || 'Pickup',
              description: requestData.description || '',
              location: requestData.currentLocation || '',
              timestamp: new Date()
            }]
        }
      },
      include: {
        events: true
      }
    });

    console.log('Shipment created successfully:', shipment);
    return NextResponse.json({ success: true, shipment });
  } catch (error: any) {
    console.error('[API] Error creating shipment:', error);
    return NextResponse.json({
      success: false,
      message: error?.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
    }, { status: 500 });
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