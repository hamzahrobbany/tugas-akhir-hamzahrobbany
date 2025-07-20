// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

// ===========================================
// POST: Mendaftarkan pengguna baru dengan email dan password
// ===========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validasi Input
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Nama, email, dan password wajib diisi.' }, { status: 400 });
    }

    // 2. Periksa apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 409 });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds 10

    // 4. Buat pengguna baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.CUSTOMER, // Default role untuk pengguna baru
        isVerifiedByAdmin: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ message: 'Registrasi berhasil!', user: newUser }, { status: 201 });

  } catch (error: any) {
    console.error('Error during registration:', error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ message: 'Permintaan body bukan JSON yang valid.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan internal server.' }, { status: 500 });
  }
}
