    // src/app/page.tsx
    import Link from 'next/link';
    import { Button } from '@/components/ui/button';
    import Image from 'next/image';

    export default function HomePage() {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8">
          {/* Header sudah di layout.tsx, dihapus dari sini */}

          {/* Hero Section */}
          <main className="flex flex-col items-center text-center mt-20 z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
              Temukan Kendaraan Impian Anda
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl animate-fade-in-up delay-200">
              Sewa mobil dengan mudah dan cepat. Pilihan kendaraan lengkap, harga terbaik, dan layanan terpercaya.
            </p>
            <Link href="/browse-vehicles">
              <Button className="bg-white text-blue-600 px-8 py-4 rounded-full text-xl font-bold shadow-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 animate-bounce-in">
                Mulai Sewa Sekarang
              </Button>
            </Link>
          </main>

          {/* Footer sudah di layout.tsx atau tidak diperlukan di sini lagi */}
          {/* <footer className="absolute bottom-0 text-white text-sm py-4">
            &copy; {new Date().getFullYear()} SewaCepat. All rights reserved.
          </footer> */}
        </div>
      );
    }
    