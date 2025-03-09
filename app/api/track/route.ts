import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const { trackingNumber } = await request.json();
    
    // Get the user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

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
    
    // If the shipment exists, associate it with the current user
    // This ensures that each shipment is properly linked to the user who tracked it
    if (shipment && userId) {
      console.log(`Associating shipment ${trackingNumber} with user ${userId}`);
      
      // Update the shipment to belong to this user
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: { userId }
      });
    }

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