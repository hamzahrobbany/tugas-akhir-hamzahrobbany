// src/app/dashboard/admin/vehicles/[id]/edit/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchAdminVehicleById, updateVehicle, setOperationStatus, clearCurrentVehicle } from '@/store/slices/vehicleSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import VehicleForm from '@/components/forms/VehicleForm';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { fetchUsersByRole } from '@/store/slices/userSlice'; // Akan kita buat di langkah berikutnya

interface EditVehiclePageProps {
  params: {
    id: string; // ID kendaraan dari URL
  };
}

export default function EditVehiclePage({ params }: EditVehiclePageProps) {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();

  const vehicleId = parseInt(params.id);
  const currentVehicle = useSelector((state: RootState) => state.vehicles.currentVehicle);
  const loading = useSelector((state: RootState) => state.vehicles.loading);
  const error = useSelector((state: RootState) => state.vehicles.error);
  const operationStatus = useSelector((state: RootState) => state.vehicles.operationStatus);
  const availableOwners = useSelector((state: RootState) => state.users.data); // Ambil daftar owner

  // Fetch detail kendaraan saat komponen dimuat
  useEffect(() => {
    if (vehicleId) {
      dispatch(fetchAdminVehicleById(vehicleId));
    }
    // Bersihkan currentVehicle saat komponen unmount
    return () => {
      dispatch(clearCurrentVehicle());
    };
  }, [dispatch, vehicleId]);

  // Fetch daftar owner jika user adalah admin
  useEffect(() => {
    if (session?.user?.role === Role.ADMIN) {
      dispatch(fetchUsersByRole(Role.OWNER));
    }
  }, [dispatch, session]);

  // Tangani status operasi update
  useEffect(() => {
    if (operationStatus === 'succeeded') {
      toast.success('Kendaraan Berhasil Diperbarui', {
        description: 'Detail kendaraan telah berhasil diperbarui.',
      });
      dispatch(setOperationStatus('idle'));
      router.push('/dashboard/admin/vehicles'); // Redirect kembali ke daftar
    } else if (operationStatus === 'failed' && error) {
      toast.error('Gagal Memperbarui Kendaraan', {
        description: error,
      });
      dispatch(setOperationStatus('idle'));
    }
  }, [operationStatus, error, router, dispatch]);

  // Tampilkan toast error jika ada error saat fetch detail kendaraan
  useEffect(() => {
    if (error && !loading && !currentVehicle) {
      toast.error('Gagal Memuat Detail Kendaraan', {
        description: error,
      });
      router.push('/dashboard/admin/vehicles'); // Redirect jika kendaraan tidak ditemukan/error
    }
  }, [error, loading, currentVehicle, router]);

  const handleSubmit = async (formData: any) => {
    // Pastikan ownerId di-parse ke number jika ada
    const dataToSubmit = {
      ...formData,
      id: vehicleId, // Pastikan ID kendaraan disertakan
      capacity: parseInt(formData.capacity),
      dailyRate: parseFloat(formData.dailyRate),
      lateFeePerDay: parseFloat(formData.lateFeePerDay),
      ownerId: session?.user?.role === Role.ADMIN ? parseInt(formData.ownerId) : undefined, // Hanya kirim ownerId jika admin
    };

    // Hapus ownerId jika user adalah owner (ownerId akan diambil dari sesi di API)
    if (session?.user?.role === Role.OWNER) {
      delete dataToSubmit.ownerId;
    }

    dispatch(updateVehicle(dataToSubmit));
  };

  if (loading && !currentVehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Memuat Detail Kendaraan...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Mohon tunggu, sedang memuat data kendaraan.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentVehicle && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Kendaraan Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Kendaraan dengan ID {params.id} tidak ditemukan.</p>
            <Link href="/dashboard/admin/vehicles">
              <Button className="mt-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
                Kembali ke Daftar Kendaraan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">Edit Kendaraan</CardTitle>
          <CardDescription>Perbarui detail kendaraan ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentVehicle && (
            <VehicleForm
              initialData={currentVehicle}
              onSubmit={handleSubmit}
              loading={loading}
              isEditMode={true}
              availableOwners={session?.user?.role === Role.ADMIN ? availableOwners : []}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
