// src/app/dashboard/admin/vehicles/create/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createVehicle, setOperationStatus } from '@/store/slices/vehicleSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import VehicleForm from '@/components/forms/VehicleForm';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { fetchUsersByRole } from '@/store/slices/userSlice'; 

export default function CreateVehiclePage() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();

  const loading = useSelector((state: RootState) => state.vehicles.operationStatus === 'pending');
  const error = useSelector((state: RootState) => state.vehicles.error);
  const operationStatus = useSelector((state: RootState) => state.vehicles.operationStatus);
  const availableOwners = useSelector((state: RootState) => state.users.data); // Ambil daftar owner

  // Fetch daftar owner jika user adalah admin
  useEffect(() => {
    if (session?.user?.role === Role.ADMIN) {
      dispatch(fetchUsersByRole(Role.OWNER)); // Ambil user dengan role OWNER
    }
  }, [dispatch, session]);


  useEffect(() => {
    if (operationStatus === 'succeeded') {
      toast.success('Kendaraan Berhasil Ditambahkan', {
        description: 'Kendaraan baru telah berhasil ditambahkan ke daftar.',
      });
      dispatch(setOperationStatus('idle')); // Reset status
      router.push('/dashboard/admin/vehicles'); // Redirect kembali ke daftar
    } else if (operationStatus === 'failed' && error) {
      toast.error('Gagal Menambahkan Kendaraan', {
        description: error,
      });
      dispatch(setOperationStatus('idle')); // Reset status
    }
  }, [operationStatus, error, router, dispatch]);

  const handleSubmit = async (formData: any) => {
    // Pastikan ownerId di-parse ke number jika ada
    const dataToSubmit = {
      ...formData,
      capacity: parseInt(formData.capacity),
      dailyRate: parseFloat(formData.dailyRate),
      lateFeePerDay: parseFloat(formData.lateFeePerDay),
      ownerId: session?.user?.role === Role.ADMIN ? parseInt(formData.ownerId) : undefined, // Hanya kirim ownerId jika admin
    };

    // Hapus ownerId jika user adalah owner (ownerId akan diambil dari sesi di API)
    if (session?.user?.role === Role.OWNER) {
      delete dataToSubmit.ownerId;
    }

    dispatch(createVehicle(dataToSubmit));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">Tambah Kendaraan Baru</CardTitle>
          <CardDescription>Isi detail kendaraan untuk ditambahkan ke daftar sewa.</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleForm
            onSubmit={handleSubmit}
            loading={loading}
            isEditMode={false}
            availableOwners={session?.user?.role === Role.ADMIN ? availableOwners : []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
