// src/app/auth/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      let errorMessage = 'Terjadi kesalahan saat login.';
      if (error === 'OAuthCallback') {
        errorMessage = 'Gagal login dengan OAuth. Coba lagi atau periksa konfigurasi Anda.';
      } else if (error === 'Callback') {
        errorMessage = 'Terjadi kesalahan saat callback otentikasi. Coba lagi.';
      } else if (error === 'AccessDenied') {
        errorMessage = 'Akses ditolak. Anda tidak memiliki izin.';
      } else if (error === 'Verification') {
        errorMessage = 'Token verifikasi tidak valid atau sudah kedaluwarsa.';
      } else if (error === 'OAuthAccountNotLinked') {
        errorMessage = 'Akun sudah terdaftar dengan penyedia lain. Silakan login dengan metode yang Anda gunakan sebelumnya.';
      } else if (error === 'CredentialsSignin') {
        errorMessage = 'Email atau password salah. Silakan coba lagi.';
      }
      toast.error('Login Gagal', {
        description: errorMessage,
      });
    }
  }, [error]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleCredentialsSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      toast.error('Login Gagal', {
        description: result.error,
      });
    } else {
      toast.success('Login Berhasil!', {
        description: 'Anda berhasil masuk ke SewaCepat.',
      });
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm rounded-xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Selamat Datang!</CardTitle>
          <CardDescription>Masuk untuk melanjutkan ke SewaCepat.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulir Login Email/Password */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-black rounded-lg shadow-md" disabled={loading}> {/* Changed text-black to text-white */}
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" /> {/* Changed border-black-300 to border-gray-300 */}
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Atau</span> {/* Changed text-black-500 to text-gray-500 */}
            </div>
          </div>

          {/* Tombol Login Google */}
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 transition-colors"
          >
            <FcGoogle className="h-6 w-6" />
            Masuk dengan Google
          </Button>

          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-primary-500 hover:underline">
              Daftar di sini
            </Link>
          </p>
          <div className="text-center text-sm text-gray-500">
            <Link href="/" className="hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
