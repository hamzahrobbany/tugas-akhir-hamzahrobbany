    // src/app/auth/error/page.tsx
    'use client';

    import { useRouter, useSearchParams } from 'next/navigation';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import Link from 'next/link';
    import { useEffect, useState } from 'react';

    export default function AuthErrorPage() {
      const searchParams = useSearchParams();
      const error = searchParams.get('error');
      const [errorMessage, setErrorMessage] = useState('Terjadi kesalahan yang tidak diketahui.');

      useEffect(() => {
        switch (error) {
          case 'OAuthCallback':
            setErrorMessage('Gagal login dengan penyedia OAuth. Pastikan Anda mengizinkan akses dan coba lagi.');
            break;
          case 'Callback':
            setErrorMessage('Terjadi kesalahan saat callback otentikasi. Coba lagi.');
            break;
          case 'AccessDenied':
            setErrorMessage('Akses Ditolak. Anda tidak memiliki izin untuk melihat halaman ini.');
            break;
          case 'Configuration':
            setErrorMessage('Kesalahan konfigurasi NextAuth. Hubungi administrator.');
            break;
          case 'Verification':
            setErrorMessage('Token verifikasi tidak valid atau sudah kedaluwarsa.');
            break;
          default:
            setErrorMessage('Terjadi kesalahan saat otentikasi. Silakan coba lagi.');
            break;
        }
      }, [error]);

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
                  <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-md">
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
    