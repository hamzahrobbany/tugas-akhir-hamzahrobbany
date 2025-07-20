// src/components/layout/Header.tsx
'use client'; // This component uses client-side hooks

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react'; // Import signOut
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // Import useRouter for explicit logout redirect

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Function to handle logout
  const handleLogout = async () => {
    // You can add a confirmation dialog here if desired
    await signOut({ redirect: false }); // Prevent automatic redirect
    router.push('/auth/login'); // Manually redirect to login page
    // Or simply: await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 fixed w-full z-20 top-0">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-500 hover:text-primary-600 transition-colors">
          SewaCepat
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/browse-vehicles" className="text-gray-600 hover:text-primary-500 transition-colors">
            Jelajahi Kendaraan
          </Link>

          {status === 'loading' ? (
            <p className="text-gray-500">Memuat...</p>
          ) : session?.user ? (
            // If user is logged in
            <>
              <span className="text-gray-700 font-medium hidden md:block">
                Halo, {session.user.name || session.user.email}!
              </span>
              {session.user.role === 'CUSTOMER' ? (
                <Link href="/my-orders" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Pesanan Saya
                </Link>
              ) : (
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Dashboard
                </Link>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-lg border-primary-500 text-primary-500 hover:bg-primary-50 hover:text-primary-600"
              >
                Logout
              </Button>
            </>
          ) : (
            // If user is not logged in
            <Link href="/auth/login">
              <Button className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
