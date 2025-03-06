import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received registration request:', body);

    const { email, password, name } = body;

    if (!email || !password) {
      console.log('Missing required fields');
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Email and password are required" 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: { email }
      });

      if (existingUser) {
        console.log('User already exists:', email);
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: "User already exists" 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
        },
      });

      console.log('User created successfully:', user.id);

      return new NextResponse(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        }),
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Database error",
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: "Invalid request",
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect();
  }
} 