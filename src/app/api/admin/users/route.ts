// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// ===========================================
// GET: Mengambil daftar pengguna (Admin)
// Dapat memfilter berdasarkan peran
// ===========================================
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  // Hanya ADMIN yang bisa mengakses route ini
  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role');

    let users;
    if (roleFilter && Object.values(Role).includes(roleFilter as Role)) {
      users = await prisma.user.findMany({
        where: {
          role: roleFilter as Role,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      users = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Jangan kirim password hash ke frontend
    const sanitizedUsers = users.map(({ password, ...rest }) => rest);

    return NextResponse.json(sanitizedUsers, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ message: 'Gagal memuat daftar pengguna.' }, { status: 500 });
  }
}

// ===========================================
// POST: Membuat pengguna baru (Admin)
// Admin dapat membuat pengguna dengan peran apapun
// ===========================================
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Hanya ADMIN yang bisa mengakses route ini
  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, password, role, phoneNumber, address } = body;

    // 1. Validasi Input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Nama, email, password, dan peran wajib diisi.' }, { status: 400 });
    }
    if (!Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ message: 'Peran tidak valid.' }, { status: 400 });
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
        role: role as Role,
        phoneNumber,
        address,
        isVerifiedByAdmin: (role === Role.OWNER || role === Role.ADMIN) ? true : false, // Owner/Admin otomatis terverifikasi
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        address: true,
        isVerifiedByAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ message: 'Pengguna berhasil dibuat!', user: newUser }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ message: 'Permintaan body bukan JSON yang valid.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan internal server.' }, { status: 500 });
  }
}
