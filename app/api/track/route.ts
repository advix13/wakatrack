import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, trackingNumber } = await request.json();

    if (!email || !trackingNumber) {
      return NextResponse.json(
        { message: 'Email and tracking number are required' },
        { status: 400 }
      );
    }

    // Find shipment with all related data
    const shipment = await prisma.shipment.findUnique({
      where: { 
        trackingNumber 
      },
      include: {
        events: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!shipment) {
      return NextResponse.json(
        { message: `No shipment found with tracking number: ${trackingNumber}` },
        { status: 404 }
      );
    }

    // Format the response data to match our tracking page requirements
    const formattedResponse = {
      trackingNumber: shipment.trackingNumber,
      referenceNumber: shipment.id,
      status: shipment.events[0]?.status || 'Unknown',
      eta: shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString() : 'N/A',
      serviceType: 'Standard',
      
      // Origin Address (using the origin field from shipment)
      originName: shipment.name || 'N/A',
      originEmail: shipment.email,
      originPhone: 'N/A',
      originAddress: shipment.origin || 'N/A',
      originCity: 'N/A',
      originState: 'N/A',
      originZip: 'N/A',
      originCountry: 'N/A',

      // Destination Address
      destinationName: 'N/A',
      destinationEmail: 'N/A',
      destinationPhone: 'N/A',
      destinationAddress: shipment.destination || 'N/A',
      destinationCity: 'N/A',
      destinationState: 'N/A',
      destinationZip: 'N/A',
      destinationCountry: 'N/A',

      // Package Details (these would come from additional fields in your schema)
      weight: 'N/A',
      dimensions: 'N/A',
      packageType: 'N/A',
      description: 'N/A',
      declaredValue: 'N/A',

      // Shipping Details
      shippingMethod: 'Standard',
      carrier: 'Default Carrier',
      specialInstructions: 'N/A',

      // Current Location
      currentLocation: shipment.location || 'N/A',
      
      // Events
      events: shipment.events.map(event => ({
        date: event.timestamp.toISOString(),
        location: event.location || 'N/A',
        status: event.status,
        details: event.description
      }))
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}