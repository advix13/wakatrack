import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log('[API] GET /api/tracking/[id] - Start');
  try {
    await prisma.$connect();
    console.log('[API] Database connection successful');
    
    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
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
        { success: false, message: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: shipment },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API] Error fetching shipment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch shipment', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log('[API] Database disconnected successfully');
  }
} 