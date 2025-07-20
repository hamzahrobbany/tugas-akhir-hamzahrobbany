// src/app/not-found.tsx
import Link from 'next/link'; // Import Link dari Next.js untuk navigasi yang lebih baik

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-10 text-center">
      <h1 className="text-6xl font-extrabold text-primary-600 sm:text-7xl lg:text-8xl">
        404
      </h1>
      <p className="mt-4 text-xl font-medium text-gray-700 sm:text-2xl">
        Halaman tidak ditemukan 😢
      </p>
      <p className="mt-2 text-base text-gray-500 sm:text-lg">
        Maaf, kami tidak dapat menemukan halaman yang Anda cari.
      </p>
      <Link href="/">
        <button className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
          Kembali ke Beranda
        </button>
      </Link>
    </main>
  );
}
