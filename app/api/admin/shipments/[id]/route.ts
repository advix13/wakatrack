import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
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
        { message: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, email, trackingNumber } = await request.json();

    if (!email || !trackingNumber) {
      return NextResponse.json(
        { message: 'Email and tracking number are required' },
        { status: 400 }
      );
    }

    const existingShipment = await prisma.shipment.findUnique({
      where: { trackingNumber, NOT: { id: params.id } }
    });

    if (existingShipment) {
      return NextResponse.json(
        { message: 'Tracking number already exists' },
        { status: 400 }
      );
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: params.id },
      data: {
        name,
        email,
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

    return NextResponse.json(updatedShipment);
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.shipment.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}