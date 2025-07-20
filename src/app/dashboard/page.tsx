// src/app/dashboard/page.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Role } from '@prisma/client'; // Import Role

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Memuat Dashboard...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Mohon tunggu, sedang memuat data sesi Anda.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="w-full shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">
              Selamat Datang, {session?.user?.name || 'Pengguna'}!
            </CardTitle>
            <CardDescription className="text-lg">
              Anda masuk sebagai {session?.user?.role || 'CUSTOMER'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {session?.user?.role === Role.ADMIN || session?.user?.role === Role.OWNER ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/dashboard/admin/vehicles">
                  <Button className="w-full h-24 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md">
                    Kelola Kendaraan
                  </Button>
                </Link>
                <Link href="/dashboard/admin/orders">
                  <Button className="w-full h-24 text-lg bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md">
                    Kelola Pesanan
                  </Button>
                </Link>
                {session?.user?.role === Role.ADMIN && ( // <--- Pastikan ini
                  <Link href="/dashboard/admin/users"> {/* <--- PASTIKAN LINK INI BENAR */}
                    <Button className="w-full h-24 text-lg bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-md">
                      Kelola Pengguna
                    </Button>
                  </Link>
                )}
                <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Ringkasan Statistik (Segera Hadir)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Bagian ini akan menampilkan ringkasan data seperti jumlah kendaraan, pesanan aktif, dll.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-gray-700 mb-4">
                  Selamat datang di SewaCepat! Jelajahi berbagai pilihan kendaraan kami.
                </p>
                <Link href="/browse-vehicles">
                  <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-md">
                    Jelajahi Kendaraan Sekarang
                  </Button>
                </Link>
                <Link href="/my-orders" className="ml-4">
                  <Button variant="outline" className="rounded-lg">
                    Lihat Pesanan Saya
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
