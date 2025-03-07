import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    console.log('Received registration request:', body);

    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password) {
      console.log('Missing required fields');
      const responseObj = { success: false, error: "Email and password are required" };
      return new Response(JSON.stringify(responseObj), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log('User already exists:', email);
        const responseObj = { success: false, error: "User already exists" };
        return new Response(JSON.stringify(responseObj), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create the user with the hashed password
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
        },
      });

      console.log('User created successfully:', user.id);

      // Return success response
      const successObj = {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      };
      
      return new Response(JSON.stringify(successObj), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      const errorObj = { 
        success: false, 
        error: "Database error", 
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      };
      
      return new Response(JSON.stringify(errorObj), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("Request error:", error);
    const errorObj = { 
      success: false, 
      error: "Invalid request", 
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return new Response(JSON.stringify(errorObj), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
  }
} 