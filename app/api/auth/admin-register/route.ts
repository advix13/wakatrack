import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// For debugging
const DEBUG = true;

export async function POST(request: Request) {
  try {
    if (DEBUG) console.log('Admin registration request received');
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      if (DEBUG) console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { name, email, password, secretKey } = requestBody;
    if (DEBUG) console.log('Request data:', { name, email, hasPassword: !!password, secretKey });
    
    // Validate required fields
    if (!name || !email || !password || !secretKey) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Check if the admin secret key is correct
    // For development, we use a simple default key
    // In production, this should be set in environment variables
    const adminSecretKey = process.env.ADMIN_SECRET_KEY || 'admin123';
    
    // Log the expected key during development (remove in production)
    if (DEBUG) console.log('Expected admin key:', adminSecretKey, 'Provided key:', secretKey);
    
    if (secretKey !== adminSecretKey) {
      if (DEBUG) console.log('Secret key mismatch');
      return NextResponse.json(
        { success: false, message: 'Invalid admin secret key' },
        { status: 403 }
      );
    }
    
    if (DEBUG) console.log('Secret key verified successfully');
    
    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        if (DEBUG) console.log('User already exists:', email);
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 400 }
        );
      }
      
      if (DEBUG) console.log('User does not exist, proceeding with creation');
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error checking user existence' },
        { status: 500 }
      );
    }
    
    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      if (DEBUG) console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      return NextResponse.json(
        { success: false, message: 'Error processing password' },
        { status: 500 }
      );
    }
    
    // Create user with admin privileges
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          isAdmin: true, // Set as admin
        },
      });
      if (DEBUG) console.log('Admin user created successfully:', user.id);
    } catch (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { success: false, message: 'Error creating user in database', error: createError instanceof Error ? createError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: userWithoutPassword,
    });
    
  } catch (error) {
    console.error('Error in admin registration:', error);
    
    // Ensure we always return a valid JSON response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create admin user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
