'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback: 'Gagal login dengan penyedia OAuth. Pastikan Anda mengizinkan akses dan coba lagi.',
  Callback: 'Terjadi kesalahan saat callback otentikasi. Coba lagi.',
  AccessDenied: 'Akses Ditolak. Anda tidak memiliki izin untuk melihat halaman ini.',
  Configuration: 'Kesalahan konfigurasi NextAuth. Hubungi administrator.',
  Verification: 'Token verifikasi tidak valid atau sudah kedaluwarsa.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const errorMessage = ERROR_MESSAGES[errorParam || ''] || 'Terjadi kesalahan saat proses login. Silakan coba lagi.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md rounded-xl shadow-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-red-600">Terjadi Kesalahan!</CardTitle>
          <CardDescription className="text-gray-600">
            Ada masalah dengan proses otentikasi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-red-800">{errorMessage}</p>
          <div className="flex flex-col gap-3">
            <Link href="/auth/login">
              <Button className="w-full bg-primary-500 hover:bg-primary-600 text-black rounded-lg shadow-md">
                Coba Login Lagi
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full rounded-lg">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
