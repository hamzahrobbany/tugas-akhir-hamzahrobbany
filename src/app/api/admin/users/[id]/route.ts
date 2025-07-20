// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// ===========================================
// GET: Mengambil detail pengguna tunggal (Admin)
// ===========================================
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID pengguna tidak valid.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return NextResponse.json({ message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching user with ID ${id}:`, error);
    return NextResponse.json({ message: 'Gagal memuat detail pengguna.' }, { status: 500 });
  }
}

// ===========================================
// PUT: Memperbarui detail pengguna (Admin)
// ===========================================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID pengguna tidak valid.' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, email, password, role, phoneNumber, address, isVerifiedByAdmin } = body;

    const updateData: { [key: string]: any } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      // Periksa apakah email sudah digunakan oleh user lain
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: email },
      });
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        return NextResponse.json({ message: 'Email sudah digunakan oleh pengguna lain.' }, { status: 409 });
      }
      updateData.email = email;
    }
    if (password !== undefined && password !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (role !== undefined) {
      if (!Object.values(Role).includes(role as Role)) {
        return NextResponse.json({ message: 'Peran tidak valid.' }, { status: 400 });
      }
      updateData.role = role as Role;
    }
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (isVerifiedByAdmin !== undefined) updateData.isVerifiedByAdmin = isVerifiedByAdmin;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating user with ID ${id}:`, error);
    return NextResponse.json({ message: 'Gagal memperbarui pengguna.' }, { status: 500 });
  }
}

// ===========================================
// DELETE: Menghapus pengguna (Admin)
// ===========================================
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID pengguna tidak valid.' }, { status: 400 });
  }

  try {
    // Pastikan admin tidak menghapus dirinya sendiri
    if (session.user.id === id) {
      return NextResponse.json({ message: 'Forbidden: Anda tidak dapat menghapus akun Anda sendiri.' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Pengguna berhasil dihapus.' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting user with ID ${id}:`, error);
    return NextResponse.json({ message: 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}
