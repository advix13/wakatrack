import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log('[API] GET /api/admin/shipments/[id] - Start');
  
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
    
    // Validate admin status
    if (!isAdmin) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized - Admin access required'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    await prisma.$connect();
    dbConnected = true;
    console.log('[API] Database connection successful');
    
    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
      include: { events: true }
    });
    
    if (!shipment) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Shipment not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ success: true, data: shipment }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[API] Error fetching shipment:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to fetch shipment',
        error: error instanceof Error ? error.message : 'Unknown error'
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  console.log('[API] PUT /api/admin/shipments/[id] - Start', { id: params?.id });
  
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
    
    // Validate admin status
    if (!isAdmin) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized - Admin access required'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate ID
    if (!params?.id) {
      console.log('[API] Error: No shipment ID provided');
      return new NextResponse(
        JSON.stringify({ success: false, message: 'No shipment ID provided' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Connect to database
    await prisma.$connect();
    dbConnected = true;
    console.log('[API] Database connection successful');
    
    // Parse request body
    let requestData;
    try {
      const text = await request.text();
      console.log('[API] Received raw data:', text);
      
      if (!text) {
        throw new Error('Request body is empty');
      }
      
      requestData = JSON.parse(text);
      console.log('[API] Parsed request data:', requestData);
      
      if (!requestData || typeof requestData !== 'object') {
        throw new Error('Invalid request data format - expected an object');
      }
    } catch (error) {
      console.error('[API] Error parsing request data:', error);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid request data',
          error: error instanceof Error ? error.message : 'Unknown parsing error'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if shipment exists
    const existingShipment = await prisma.shipment.findUnique({
      where: { id: params.id }
    });

    if (!existingShipment) {
      console.log('[API] Shipment not found:', params.id);
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Shipment not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract events and prepare shipment data
    const { events, ...shipmentData } = requestData;
    
    // Validate shipment data
    if (!shipmentData || Object.keys(shipmentData).length === 0) {
      console.error('[API] Error: Empty shipment data');
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid shipment data - no data provided'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Start a transaction to ensure data consistency
      const result = await prisma.$transaction(async (prisma) => {
        console.log('[API] Starting transaction for shipment update');
        console.log('[API] Shipment data to update:', shipmentData);
        
        // Update the shipment
        const updatedShipment = await prisma.shipment.update({
          where: { id: params.id },
          data: {
            ...shipmentData,
            updatedAt: new Date(),
          },
        });
        console.log('[API] Shipment updated successfully');

        // Handle events if provided
        if (events && Array.isArray(events)) {
          // Delete existing events
          await prisma.trackingEvent.deleteMany({
            where: { shipmentId: params.id }
          });
          console.log('[API] Existing events deleted');
          
          // Create new events
          if (events.length > 0) {
            await prisma.trackingEvent.createMany({
              data: events.map(event => ({
                ...event,
                shipmentId: params.id,
                timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
              }))
            });
            console.log('[API] New events created');
          }
        }

        // Fetch the updated shipment with events
        const shipmentWithEvents = await prisma.shipment.findUnique({
          where: { id: params.id },
          include: {
            events: {
              orderBy: {
                timestamp: 'desc'
              }
            }
          }
        });

        if (!shipmentWithEvents) {
          throw new Error('Failed to fetch updated shipment');
        }

        console.log('[API] Transaction completed successfully');
        return shipmentWithEvents;
      });

      // Return success response
      return new NextResponse(
        JSON.stringify({
          success: true,
          data: result,
          message: 'Shipment updated successfully'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('[API] Transaction error:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }

  } catch (error) {
    console.error('[API] Error updating shipment:', error);
    
    // Create a detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorResponse = {
      success: false,
      message: 'Failed to update shipment',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    };
    
    return new NextResponse(
      JSON.stringify(errorResponse),
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log('[API] DELETE /api/admin/shipments/[id] - Start', { id: params?.id });
  
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
    
    // Validate admin status
    if (!isAdmin) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized - Admin access required'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate ID
    if (!params?.id) {
      console.log('[API] Error: No shipment ID provided');
      return new NextResponse(
        JSON.stringify({ success: false, message: 'No shipment ID provided' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Connect to database
    await prisma.$connect();
    dbConnected = true;
    console.log('[API] Database connection successful');
    
    // Check if shipment exists
    const existingShipment = await prisma.shipment.findUnique({
      where: { id: params.id }
    });
    
    if (!existingShipment) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Shipment not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Delete tracking events first to avoid foreign key constraints
    await prisma.trackingEvent.deleteMany({
      where: { shipmentId: params.id }
    });
    
    // Delete the shipment
    await prisma.shipment.delete({
      where: { id: params.id }
    });
    
    return new NextResponse(
      JSON.stringify({ success: true, message: 'Shipment deleted successfully' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[API] Error deleting shipment:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to delete shipment',
        error: error instanceof Error ? error.message : 'Unknown error'
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