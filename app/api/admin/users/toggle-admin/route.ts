import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(request: Request) {
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
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });
    
    if (!currentUser?.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { userId, isAdmin } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Prevent users from changing their own admin status
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, message: 'You cannot change your own admin status' },
        { status: 400 }
      );
    }
    
    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user's admin status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: isAdmin === true },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.isAdmin ? 'promoted to admin' : 'demoted from admin'}`,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user admin status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update user admin status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
