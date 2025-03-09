import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API] Starting shipment DELETE request for ID:', params.id);
  
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
    const isAdmin = session?.user?.isAdmin === true;
    
    console.log('[API] User ID:', userId);
    console.log('[API] Is Admin:', isAdmin);
    
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
    
    // Connect to database
    await prisma.$connect();
    dbConnected = true;
    console.log('[API] Database connection successful');
    
    // Get the shipment ID from the URL parameter
    const shipmentId = params.id;
    
    if (!shipmentId) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Shipment ID is required'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // First check if the shipment exists
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId }
    });
    
    if (!shipment) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Shipment not found'
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if the user is authorized to delete this shipment
    // Only the shipment owner or an admin can delete it
    if (shipment.userId !== userId && !isAdmin) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Unauthorized - You do not have permission to delete this shipment'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Delete the shipment's tracking events first (to avoid foreign key constraint errors)
    await prisma.trackingEvent.deleteMany({
      where: { shipmentId }
    });
    
    // Delete the shipment
    await prisma.shipment.delete({
      where: { id: shipmentId }
    });
    
    console.log('[API] Shipment deleted successfully:', shipmentId);
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Shipment deleted successfully'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('[API] Error deleting shipment:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to delete shipment',
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