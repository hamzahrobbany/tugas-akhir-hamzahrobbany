// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import NextAuthSessionProvider from '@/components/providers/NextAuthSessionProvider';
import ReduxProvider from '@/components/providers/ReduxProvider';
import Header from '@/components/layout/Header'; // <--- Import Header yang baru

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SewaCepat - Aplikasi Rental Kendaraan',
  description: 'Solusi rental kendaraan cepat dan mudah.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <NextAuthSessionProvider>
            <Header /> {/* <--- Tambahkan Header di sini */}
            <main className="pt-[72px]"> {/* Tambahkan padding-top agar konten tidak tertutup header */}
              {children}
            </main>
          </NextAuthSessionProvider>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}
