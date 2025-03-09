import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Get the ID from params safely
  const shipmentId = params?.id;
  console.log('[API] Starting shipment GET request for ID:', shipmentId);
  
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
    
    // Validate shipment ID
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
    
    // Get the shipment with its events
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { events: true }
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
    
    // Check if the user is authorized to view this shipment
    // Only the shipment owner or an admin can view it
    if (shipment.userId !== userId && !isAdmin) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Unauthorized - You do not have permission to view this shipment'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('[API] Shipment retrieved successfully:', shipmentId);
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        shipment,
        message: 'Shipment retrieved successfully'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('[API] Error retrieving shipment:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to retrieve shipment',
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