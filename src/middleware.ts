import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { AuthToken } from '@/types/auth';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as AuthToken;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // ADMIN ONLY: /dashboard/admin/users
    if (pathname.startsWith('/dashboard/admin/users') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url));
    }

    // ADMIN or OWNER: /dashboard/admin/vehicles
    if (pathname.startsWith('/dashboard/admin/vehicles') && !['ADMIN', 'OWNER'].includes(token.role)) {
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url));
    }

    // ADMIN or OWNER: /dashboard/admin/orders
    if (pathname.startsWith('/dashboard/admin/orders') && !['ADMIN', 'OWNER'].includes(token.role)) {
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url));
    }

    // CUSTOMER / OWNER / ADMIN: /my-orders (login required)
    if (pathname.startsWith('/my-orders') && !token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Public routes
        if (
          pathname.startsWith('/auth/login') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/vehicles/') ||
          pathname.startsWith('/browse-vehicles') ||
          pathname === '/'
        ) {
          return true;
        }

        // Other routes require login
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/login',
      error: '/auth/error',
    },
  }
);

// Only protect these routes
export const config = {
  matcher: ['/dashboard/:path*', '/my-orders/:path*'],
};
