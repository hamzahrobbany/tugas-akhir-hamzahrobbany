'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createVehicle } from '@/store/slices/vehicleSlice';
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

  const { operationStatus, error } = useSelector((state: RootState) => state.vehicles);
  const availableOwners = useSelector((state: RootState) => state.users.data);

  const isAdmin = session?.user?.role === Role.ADMIN;
  const isOwner = session?.user?.role === Role.OWNER;
  const loading = operationStatus === 'pending';

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsersByRole(Role.OWNER));
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      toast.success('Kendaraan berhasil ditambahkan', {
        description: 'Kendaraan baru telah berhasil ditambahkan ke daftar.',
      });
      router.push('/dashboard/admin/vehicles');
    } else if (operationStatus === 'failed' && error) {
      toast.error('Gagal Menambahkan Kendaraan', {
        description: error,
      });
    }
  }, [operationStatus, error, router]);

  const handleSubmit = (formData: any) => {
    const dataToSubmit = {
      ...formData,
      capacity: parseInt(formData.capacity),
      dailyRate: parseFloat(formData.dailyRate),
      lateFeePerDay: parseFloat(formData.lateFeePerDay),
      ownerId: isAdmin ? parseInt(formData.ownerId) : undefined,
    };

    if (isOwner) {
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
            availableOwners={isAdmin ? availableOwners : []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
