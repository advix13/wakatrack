import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Fetch shipments for the current user
    // Make sure we're strictly filtering by the current user's ID
    console.log('Fetching shipments for user ID:', userId);
    
    const shipments = await prisma.shipment.findMany({
      where: { 
        userId: {
          equals: userId
        }
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        events: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      }
    });
    
    console.log(`Found ${shipments.length} shipments for user ID: ${userId}`);
    
    // Format the shipments to match the expected format in the ShipmentsTable
    const formattedShipments = shipments.map(shipment => ({
      ...shipment,
      status: shipment.shipmentStatus || 'Unknown',
      lastUpdated: shipment.updatedAt,
      currentStatus: shipment.events[0]?.status || 'No updates'
    }));
    
    return NextResponse.json({
      success: true,
      shipments: formattedShipments
    });
    
  } catch (error) {
    console.error('Error fetching user shipments:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch shipments',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
