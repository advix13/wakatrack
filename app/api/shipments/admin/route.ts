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
    
    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Fetch all shipments for admin view
    const shipments = await prisma.shipment.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        events: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    // Format the shipments to match the expected format in the ShipmentsTable
    const formattedShipments = shipments.map(shipment => ({
      ...shipment,
      status: shipment.shipmentStatus || 'Unknown',
      lastUpdated: shipment.updatedAt,
      currentStatus: shipment.events[0]?.status || 'No updates',
      userEmail: shipment.user?.email || 'No user'
    }));
    
    return NextResponse.json({
      success: true,
      shipments: formattedShipments
    });
    
  } catch (error) {
    console.error('Error fetching admin shipments:', error);
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
