import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

interface ParamsProps {
  params: { id: string };
}

// ===========================================
// GET: Ambil detail user by ID (Admin Only)
// ===========================================
export async function GET(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json(
      { message: 'Unauthorized: Akses ditolak.' },
      { status: 401 }
    );
  }

  const { id } = context.params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return NextResponse.json(
      { message: 'ID pengguna tidak valid.' },
      { status: 400 }
    );
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
      return NextResponse.json(
        { message: 'Pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(`GET user ID ${id} error:`, error);
    return NextResponse.json(
      { message: 'Gagal memuat detail pengguna.' },
      { status: 500 }
    );
  }
}

// ===========================================
// PUT: Update User (Admin Only)
// ===========================================
export async function PUT(req: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const userId = parseInt(id, 10);
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID pengguna tidak valid.' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, email, password, role, phoneNumber, address, isVerifiedByAdmin } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;

    if (email !== undefined) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { message: 'Email sudah digunakan oleh pengguna lain.' },
          { status: 409 }
        );
      }
      updateData.email = email;
    }

    if (password && password !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (role && Object.values(Role).includes(role)) {
      updateData.role = role;
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
  } catch (error) {
    console.error(`PUT user ID ${id} error:`, error);
    return NextResponse.json(
      { message: 'Gagal memperbarui pengguna.' },
      { status: 500 }
    );
  }
}

// ===========================================
// DELETE: Hapus User (Admin Only)
// ===========================================
export async function DELETE(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json(
      { message: 'Unauthorized: Akses ditolak.' },
      { status: 401 }
    );
  }

  const { id } = context.params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return NextResponse.json(
      { message: 'ID pengguna tidak valid.' },
      { status: 400 }
    );
  }

  // Tidak boleh hapus akun sendiri
  if (Number(session.user.id) === userId) {
    return NextResponse.json(
      { message: 'Forbidden: Anda tidak dapat menghapus akun Anda sendiri.' },
      { status: 403 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: 'Pengguna berhasil dihapus.' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`DELETE user ID ${id} error:`, error);
    return NextResponse.json(
      { message: 'Gagal menghapus pengguna.' },
      { status: 500 }
    );
  }
}
