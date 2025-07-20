// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white px-6 py-12">
      <main className="flex flex-col items-center text-center gap-6 mt-10 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Temukan Kendaraan Impian Anda
        </h1>
        <p className="text-lg md:text-2xl max-w-2xl">
          Sewa mobil dengan mudah dan cepat. Pilihan kendaraan lengkap, harga terbaik, dan layanan terpercaya.
        </p>
        <Link href="/browse-vehicles">
          <Button
            className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-100 transition-transform hover:scale-105"
          >
            Mulai Sewa Sekarang
          </Button>
        </Link>
      </main>
    </div>
  );
}
