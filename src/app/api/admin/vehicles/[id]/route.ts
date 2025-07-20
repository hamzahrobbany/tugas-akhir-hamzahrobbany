// src/app/api/admin/vehicles/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { Role, VehicleType, TransmissionType, FuelType } from '@prisma/client';

type Params = { params: { id: string } };

async function getVehicleId(params: Params['params']) {
  const vehicleId = parseInt(params.id);
  if (isNaN(vehicleId)) {
    return { error: NextResponse.json({ message: 'ID kendaraan tidak valid.' }, { status: 400 }) };
  }
  return { vehicleId };
}

// =========================================
// GET: Detail kendaraan tunggal
// =========================================
export async function GET(req: Request, { params }: Params) {
  const { vehicleId, error } = await getVehicleId(params);
  if (error) return error;

  const session = await getServerSession(authOptions);
  if (!session || !session.user || ![Role.ADMIN, Role.OWNER].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    if (!vehicle) {
      return NextResponse.json({ message: 'Kendaraan tidak ditemukan.' }, { status: 404 });
    }

    if (session.user.role === Role.OWNER && vehicle.ownerId !== parseInt(session.user.id)) {
      return NextResponse.json({ message: 'Forbidden: Anda tidak memiliki izin.' }, { status: 403 });
    }

    return NextResponse.json(vehicle, { status: 200 });
  } catch (err) {
    console.error('Error fetching vehicle:', err);
    return NextResponse.json({ message: 'Gagal memuat detail kendaraan.' }, { status: 500 });
  }
}

// =========================================
// PUT: Update kendaraan
// =========================================
export async function PUT(req: Request, { params }: Params) {
  const { vehicleId, error } = await getVehicleId(params);
  if (error) return error;

  const session = await getServerSession(authOptions);
  if (!session || !session.user || ![Role.ADMIN, Role.OWNER].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  try {
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!existingVehicle) {
      return NextResponse.json({ message: 'Kendaraan tidak ditemukan.' }, { status: 404 });
    }
    if (session.user.role === Role.OWNER && existingVehicle.ownerId !== parseInt(session.user.id)) {
      return NextResponse.json({ message: 'Forbidden: Anda tidak memiliki izin.' }, { status: 403 });
    }

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
      ownerId,
    } = body;

    const updateData: any = {};
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

    if (session.user.role === Role.ADMIN && ownerId !== undefined) {
      const parsedOwnerId = parseInt(ownerId);
      if (isNaN(parsedOwnerId)) {
        return NextResponse.json({ message: 'Owner ID tidak valid.' }, { status: 400 });
      }
      const ownerExists = await prisma.user.findUnique({ where: { id: parsedOwnerId, role: Role.OWNER } });
      if (!ownerExists) {
        return NextResponse.json({ message: 'Owner ID tidak ditemukan / bukan OWNER.' }, { status: 400 });
      }
      updateData.ownerId = parsedOwnerId;
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
    });

    return NextResponse.json(updatedVehicle, { status: 200 });
  } catch (err: any) {
    console.error('Error updating vehicle:', err);
    if (err.code === 'P2002' && err.meta?.target?.includes('licensePlate')) {
      return NextResponse.json({ message: 'Plat nomor sudah terdaftar.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Gagal memperbarui kendaraan.' }, { status: 500 });
  }
}

// =========================================
// DELETE: Hapus kendaraan
// =========================================
export async function DELETE(req: Request, { params }: Params) {
  const { vehicleId, error } = await getVehicleId(params);
  if (error) return error;

  const session = await getServerSession(authOptions);
  if (!session || !session.user || ![Role.ADMIN, Role.OWNER].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized: Akses ditolak.' }, { status: 401 });
  }

  try {
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!existingVehicle) {
      return NextResponse.json({ message: 'Kendaraan tidak ditemukan.' }, { status: 404 });
    }
    if (session.user.role === Role.OWNER && existingVehicle.ownerId !== parseInt(session.user.id)) {
      return NextResponse.json({ message: 'Forbidden: Anda tidak memiliki izin.' }, { status: 403 });
    }

    await prisma.vehicle.delete({ where: { id: vehicleId } });
    return NextResponse.json({ message: 'Kendaraan berhasil dihapus.' }, { status: 200 });
  } catch (err) {
    console.error('Error deleting vehicle:', err);
    return NextResponse.json({ message: 'Gagal menghapus kendaraan.' }, { status: 500 });
  }
}
