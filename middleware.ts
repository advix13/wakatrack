import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(request: NextRequestWithAuth) {
  // Get token with improved error handling
  let token;
  try {
    token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // Log token status (but not the token itself for security)
    console.log('[Middleware] Token exists:', !!token);
  } catch (error) {
    console.error('[Middleware] Error getting token:', error);
    // Redirect to login on token error
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'SessionError');
    return NextResponse.redirect(loginUrl);
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // Handle authentication pages
  if (isAuthPage) {
    if (token) {
      // If user is already logged in and tries to access auth pages,
      // redirect to appropriate dashboard based on user role
      const isAdmin = token.isAdmin === true;
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url));
    }
    // Allow access to auth pages if not logged in
    return NextResponse.next();
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user has admin role
    if (token.isAdmin !== true) {
      // Redirect non-admin users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Protect API routes except auth endpoints
  if (isApiRoute && !request.nextUrl.pathname.startsWith('/api/auth')) {
    // For API routes, we'll let the API handlers handle authentication
    // This is just an additional layer of protection
    if (!token && !request.nextUrl.pathname.startsWith('/api/public')) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized - Authentication required' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/auth/:path*',
    '/dashboard/:path*',
    '/api/:path*'
  ]
}; 