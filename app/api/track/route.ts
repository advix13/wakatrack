import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { trackingNumber } = await request.json();

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, message: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Find shipment with all related data
    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
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
        { 
          success: false, 
          message: `No shipment found with tracking number: ${trackingNumber}` 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      trackingNumber: shipment.trackingNumber,
      shipmentId: shipment.id
    });
    
  } catch (error) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to track shipment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}