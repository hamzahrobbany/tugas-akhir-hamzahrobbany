// src/app/api/admin/vehicles/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { Role, VehicleType, TransmissionType, FuelType } from '@prisma/client';

// ===========================================
// GET: Mengambil daftar semua kendaraan (Admin/Owner)
// ===========================================
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  // Pastikan pengguna sudah login dan memiliki peran ADMIN atau OWNER
  if (!session || !session.user || ![Role.ADMIN, Role.OWNER].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  try {
    let vehicles;
    if (session.user.role === Role.ADMIN) {
      // Admin bisa melihat semua kendaraan
      vehicles = await prisma.vehicle.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else { // OWNER
      // Owner hanya bisa melihat kendaraan yang mereka miliki
      vehicles = await prisma.vehicle.findMany({
        where: {
          ownerId: parseInt(session.user.id),
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(vehicles, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching admin vehicles:', error);
    return NextResponse.json({ message: 'Gagal memuat daftar kendaraan.' }, { status: 500 });
  }
}

// ===========================================
// POST: Membuat kendaraan baru (Admin/Owner)
// ===========================================
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Pastikan pengguna sudah login dan memiliki peran ADMIN atau OWNER
  if (!session || !session.user || ![Role.ADMIN, Role.OWNER].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      type,
      capacity,
      transmissionType,
      fuelType,
      dailyRate,
      lateFeePerDay,
      mainImageUrl,
      licensePlate,
      city,
      address,
      ownerId, // ownerId bisa disediakan oleh Admin, atau diambil dari sesi Owner
    } = body;

    // Validasi input dasar
    if (!name || !type || !capacity || !transmissionType || !fuelType || !dailyRate || !lateFeePerDay || !licensePlate || !city) {
      return NextResponse.json({ message: 'Data kendaraan tidak lengkap.' }, { status: 400 });
    }

    // Pastikan ownerId valid
    let actualOwnerId: number;
    if (session.user.role === Role.ADMIN) {
      // Admin harus menyediakan ownerId
      if (!ownerId) {
        return NextResponse.json({ message: 'Admin harus menyediakan Owner ID.' }, { status: 400 });
      }
      actualOwnerId = parseInt(ownerId);
      if (isNaN(actualOwnerId)) {
        return NextResponse.json({ message: 'Owner ID tidak valid.' }, { status: 400 });
      }
      // Opsional: verifikasi ownerId benar-benar OWNER di database
      const ownerExists = await prisma.user.findUnique({
        where: { id: actualOwnerId, role: Role.OWNER },
      });
      if (!ownerExists) {
        return NextResponse.json({ message: 'Owner ID tidak ditemukan atau bukan peran OWNER.' }, { status: 400 });
      }
    } else { // OWNER
      // Owner otomatis menjadi owner dari kendaraan yang dibuat
      actualOwnerId = parseInt(session.user.id);
    }

    // Konversi tipe data yang sesuai
    const parsedDailyRate = parseFloat(dailyRate);
    const parsedLateFeePerDay = parseFloat(lateFeePerDay);
    const parsedCapacity = parseInt(capacity);

    if (isNaN(parsedDailyRate) || isNaN(parsedLateFeePerDay) || isNaN(parsedCapacity)) {
      return NextResponse.json({ message: 'Format angka tidak valid untuk tarif atau kapasitas.' }, { status: 400 });
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        ownerId: actualOwnerId,
        name,
        description,
        type: type as VehicleType,
        capacity: parsedCapacity,
        transmissionType: transmissionType as TransmissionType,
        fuelType: fuelType as FuelType,
        dailyRate: parsedDailyRate,
        lateFeePerDay: parsedLateFeePerDay,
        mainImageUrl,
        licensePlate,
        city,
        address,
        isAvailable: true, // Default saat dibuat
      },
    });

    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('licensePlate')) {
      return NextResponse.json({ message: 'Plat nomor sudah terdaftar.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Gagal membuat kendaraan baru.' }, { status: 500 });
  }
}
