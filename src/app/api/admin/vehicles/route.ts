// src/app/api/admin/vehicles/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { Role, VehicleType, TransmissionType, FuelType } from '@prisma/client';

// ===========================================
// GET: Semua kendaraan (Admin/Owner)
// ===========================================
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || ![Role.ADMIN, Role.OWNER].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: session.user.role === Role.OWNER ? { ownerId: parseInt(session.user.id) } : undefined,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vehicles, { status: 200 });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ message: 'Gagal memuat daftar kendaraan.' }, { status: 500 });
  }
}

// ===========================================
// POST: Membuat kendaraan baru (Admin/Owner)
// ===========================================
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

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
      ownerId,
    } = body;

    // Validasi wajib isi
    if (!name || !type || !capacity || !transmissionType || !fuelType || !dailyRate || !lateFeePerDay || !licensePlate || !city) {
      return NextResponse.json({ message: 'Data kendaraan tidak lengkap.' }, { status: 400 });
    }

    // Tentukan ownerId berdasarkan role
    let actualOwnerId: number;
    if (session.user.role === Role.ADMIN) {
      if (!ownerId) {
        return NextResponse.json({ message: 'Admin harus menyediakan Owner ID.' }, { status: 400 });
      }
      actualOwnerId = parseInt(ownerId);
      if (isNaN(actualOwnerId)) {
        return NextResponse.json({ message: 'Owner ID tidak valid.' }, { status: 400 });
      }
      const ownerExists = await prisma.user.findUnique({
        where: { id: actualOwnerId, role: Role.OWNER },
      });
      if (!ownerExists) {
        return NextResponse.json({ message: 'Owner ID tidak ditemukan atau bukan OWNER.' }, { status: 400 });
      }
    } else {
      actualOwnerId = parseInt(session.user.id);
    }

    // Parse angka
    const parsedDailyRate = parseFloat(dailyRate);
    const parsedLateFeePerDay = parseFloat(lateFeePerDay);
    const parsedCapacity = parseInt(capacity);

    if ([parsedDailyRate, parsedLateFeePerDay, parsedCapacity].some(isNaN)) {
      return NextResponse.json({ message: 'Format angka tidak valid untuk tarif atau kapasitas.' }, { status: 400 });
    }

    const slug = name ? name.trim().toLowerCase().replace(/\s+/g, '-') : '';
    const newVehicle = await prisma.vehicle.create({
  data: {
    ownerId: actualOwnerId,
    name: name.trim(),
    description: description?.trim() || null,
    type: type as VehicleType,
    capacity: parsedCapacity,
    transmissionType: transmissionType as TransmissionType,
    fuelType: fuelType as FuelType,
    dailyRate: parsedDailyRate,
    lateFeePerDay: parsedLateFeePerDay,
    mainImageUrl: mainImageUrl?.trim() || null,
    licensePlate: licensePlate.trim(),
    city: city.trim(),
    address: address?.trim() || null,
    isAvailable: true,
    slug,
  },
});
    if (!newVehicle) {
      return NextResponse.json({ message: 'Gagal membuat kendaraan baru.' }, { status: 500 });
    }

    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('licensePlate')) {
      return NextResponse.json({ message: 'Plat nomor sudah terdaftar.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Gagal membuat kendaraan baru.' }, { status: 500 });
  }
}
