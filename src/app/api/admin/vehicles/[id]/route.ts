// src/app/api/admin/vehicles/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { Role, VehicleType, TransmissionType, FuelType } from '@prisma/client';

// ===========================================
// GET: Mengambil detail kendaraan tunggal (Admin/Owner)
// ===========================================
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params; // Pastikan params di-await
  const session = await getServerSession(authOptions);

  if (!session || !session.user || ![Role.ADMIN, Role.OWNER].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  const vehicleId = parseInt(id);
  if (isNaN(vehicleId)) {
    return NextResponse.json({ message: 'ID kendaraan tidak valid.' }, { status: 400 });
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ message: 'Kendaraan tidak ditemukan.' }, { status: 404 });
    }

    // Otorisasi: Admin bisa melihat semua, Owner hanya bisa melihat miliknya
    if (session.user.role === Role.OWNER && vehicle.ownerId !== parseInt(session.user.id)) {
      return NextResponse.json({ message: 'Forbidden: Anda tidak memiliki izin untuk melihat kendaraan ini.' }, { status: 403 });
    }

    return NextResponse.json(vehicle, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching vehicle with ID ${id}:`, error);
    return NextResponse.json({ message: 'Gagal memuat detail kendaraan.' }, { status: 500 });
  }
}

// ===========================================
// PUT: Memperbarui detail kendaraan (Admin/Owner)
// ===========================================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || ![Role.ADMIN, Role.OWNER].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  const vehicleId = parseInt(id);
  if (isNaN(vehicleId)) {
    return NextResponse.json({ message: 'ID kendaraan tidak valid.' }, { status: 400 });
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
      isAvailable,
      ownerId, // Admin bisa mengubah ownerId
    } = body;

    // Ambil kendaraan yang ada untuk otorisasi
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existingVehicle) {
      return NextResponse.json({ message: 'Kendaraan tidak ditemukan.' }, { status: 404 });
    }

    // Otorisasi: Owner hanya bisa mengedit kendaraannya sendiri
    if (session.user.role === Role.OWNER && existingVehicle.ownerId !== parseInt(session.user.id)) {
      return NextResponse.json({ message: 'Forbidden: Anda tidak memiliki izin untuk mengedit kendaraan ini.' }, { status: 403 });
    }

    // Validasi dan konversi tipe data
    const updateData: { [key: string]: any } = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = type as VehicleType;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (transmissionType) updateData.transmissionType = transmissionType as TransmissionType;
    if (fuelType) updateData.fuelType = fuelType as FuelType;
    if (dailyRate !== undefined) updateData.dailyRate = parseFloat(dailyRate);
    if (lateFeePerDay !== undefined) updateData.lateFeePerDay = parseFloat(lateFeePerDay);
    if (mainImageUrl !== undefined) updateData.mainImageUrl = mainImageUrl;
    if (licensePlate) updateData.licensePlate = licensePlate;
    if (city) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    // Admin bisa mengubah ownerId
    if (session.user.role === Role.ADMIN && ownerId !== undefined) {
      const parsedOwnerId = parseInt(ownerId);
      if (isNaN(parsedOwnerId)) {
        return NextResponse.json({ message: 'Owner ID tidak valid.' }, { status: 400 });
      }
      // Opsional: verifikasi ownerId benar-benar OWNER di database
      const ownerExists = await prisma.user.findUnique({
        where: { id: parsedOwnerId, role: Role.OWNER },
      });
      if (!ownerExists) {
        return NextResponse.json({ message: 'Owner ID tidak ditemukan atau bukan peran OWNER.' }, { status: 400 });
      }
      updateData.ownerId = parsedOwnerId;
    }


    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
    });

    return NextResponse.json(updatedVehicle, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating vehicle with ID ${id}:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('licensePlate')) {
      return NextResponse.json({ message: 'Plat nomor sudah terdaftar.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Gagal memperbarui kendaraan.' }, { status: 500 });
  }
}

// ===========================================
// DELETE: Menghapus kendaraan (Admin/Owner)
// ===========================================
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || ![Role.ADMIN, Role.OWNER].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  const vehicleId = parseInt(id);
  if (isNaN(vehicleId)) {
    return NextResponse.json({ message: 'ID kendaraan tidak valid.' }, { status: 400 });
  }

  try {
    // Ambil kendaraan yang ada untuk otorisasi
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existingVehicle) {
      return NextResponse.json({ message: 'Kendaraan tidak ditemukan.' }, { status: 404 });
    }

    // Otorisasi: Owner hanya bisa menghapus kendaraannya sendiri
    if (session.user.role === Role.OWNER && existingVehicle.ownerId !== parseInt(session.user.id)) {
      return NextResponse.json({ message: 'Forbidden: Anda tidak memiliki izin untuk menghapus kendaraan ini.' }, { status: 403 });
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({ message: 'Kendaraan berhasil dihapus.' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting vehicle with ID ${id}:`, error);
    return NextResponse.json({ message: 'Gagal menghapus kendaraan.' }, { status: 500 });
  }
}
