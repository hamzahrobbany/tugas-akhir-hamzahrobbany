// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client'; // Import Role enum dari Prisma

export default withAuth(
  // `withAuth` akan memanggil fungsi ini jika pengguna sudah terautentikasi
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth; // Token berisi data sesi pengguna

    // Logika otorisasi berdasarkan peran
    // Contoh: Hanya ADMIN yang bisa mengakses /dashboard/admin/users
    if (pathname.startsWith('/dashboard/admin/users') && token?.role !== Role.ADMIN) {
      console.warn(`Access Denied: User ${token?.email} (Role: ${token?.role}) attempted to access /dashboard/admin/users`);
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url));
    }

    // Contoh: Hanya ADMIN atau OWNER yang bisa mengakses /dashboard/admin/vehicles
    if (pathname.startsWith('/dashboard/admin/vehicles') && ![Role.ADMIN, Role.OWNER].includes(token?.role as Role)) {
      console.warn(`Access Denied: User ${token?.email} (Role: ${token?.role}) attempted to access /dashboard/admin/vehicles`);
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url));
    }

    // Contoh: Hanya ADMIN atau OWNER yang bisa mengakses /dashboard/admin/orders
    if (pathname.startsWith('/dashboard/admin/orders') && ![Role.ADMIN, Role.OWNER].includes(token?.role as Role)) {
      console.warn(`Access Denied: User ${token?.email} (Role: ${token?.role}) attempted to access /dashboard/admin/orders`);
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url));
    }

    // Contoh: Halaman /my-orders hanya bisa diakses oleh CUSTOMER, ADMIN, atau OWNER
    // (pada dasarnya, siapa pun yang login)
    if (pathname.startsWith('/my-orders') && !token) {
        console.warn(`Access Denied: Unauthenticated user attempted to access /my-orders`);
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Jika tidak ada aturan yang cocok, lanjutkan ke route yang diminta
    return NextResponse.next();
  },
  {
    // Konfigurasi `withAuth`
    callbacks: {
      // Callback ini dipanggil saat middleware berjalan
      // Jika `authorized` mengembalikan `false`, pengguna akan diarahkan ke `pages.signIn`
      async authorized({ token, req }) {
        // Jika token ada, berarti pengguna sudah login
        // Semua route yang cocok dengan `matcher` di bawah akan memerlukan autentikasi
        // Kecuali jika ada logika otorisasi spesifik di fungsi middleware di atas
        const { pathname } = req.nextUrl;

        // Izinkan akses ke halaman login, API auth, dan halaman publik
        if (
          pathname.startsWith('/auth/login') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/vehicles/') || // Halaman detail kendaraan publik
          pathname.startsWith('/browse-vehicles') || // Halaman browse kendaraan publik
          pathname === '/' // Halaman beranda
        ) {
          return true; // Izinkan akses tanpa autentikasi
        }

        // Untuk semua route lain yang cocok dengan matcher, periksa token
        return !!token; // Mengembalikan true jika token ada (pengguna login), false jika tidak
      },
    },
    // Halaman yang akan diarahkan jika `authorized` mengembalikan `false`
    pages: {
      signIn: '/auth/login',
      error: '/auth/error', // Anda bisa membuat halaman error kustom untuk pesan akses ditolak
    },
  }
);

// Konfigurasi matcher untuk menentukan route mana yang akan melewati middleware ini
// Ini adalah regex yang cocok dengan route yang ingin Anda lindungi
export const config = {
  matcher: [
    '/dashboard/:path*', // Melindungi semua route di bawah /dashboard
    '/my-orders/:path*', // Melindungi semua route di bawah /my-orders
    // Tambahkan route lain yang perlu dilindungi di sini
  ],
};
