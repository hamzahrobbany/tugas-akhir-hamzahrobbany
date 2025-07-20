'use client';

import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchAdminVehicleById,
  updateVehicle,
  setOperationStatus,
  clearCurrentVehicle,
} from '@/store/slices/vehicleSlice';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import VehicleForm from '@/components/forms/VehicleForm';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { fetchUsersByRole } from '@/store/slices/userSlice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EditVehiclePageProps {
  params: {
    id: string;
  };
}

export default function EditVehiclePage({ params }: EditVehiclePageProps) {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();

  const vehicleId = Number(params.id);
  const { currentVehicle, loading, error, operationStatus } = useSelector(
    (state: RootState) => state.vehicles
  );
  const availableOwners = useSelector((state: RootState) => state.users.data);

  const isAdmin = session?.user?.role === Role.ADMIN;
  const isOwner = session?.user?.role === Role.OWNER;

  useEffect(() => {
    if (vehicleId) dispatch(fetchAdminVehicleById(vehicleId));
    return () => dispatch(clearCurrentVehicle());
  }, [dispatch, vehicleId]);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsersByRole(Role.OWNER));
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      toast.success('Kendaraan berhasil diperbarui.');
      dispatch(setOperationStatus('idle'));
      router.push('/dashboard/admin/vehicles');
    }
    if (operationStatus === 'failed' && error) {
      toast.error('Gagal memperbarui kendaraan.', { description: error });
      dispatch(setOperationStatus('idle'));
    }
  }, [operationStatus, error, dispatch, router]);

  useEffect(() => {
    if (error && !loading && !currentVehicle) {
      toast.error('Gagal memuat kendaraan.', { description: error });
      router.push('/dashboard/admin/vehicles');
    }
  }, [error, loading, currentVehicle, router]);

  const handleSubmit = useCallback(
    (formData: any) => {
      const dataToSubmit = {
        ...formData,
        id: vehicleId,
        capacity: Number(formData.capacity),
        dailyRate: parseFloat(formData.dailyRate),
        lateFeePerDay: parseFloat(formData.lateFeePerDay),
        ownerId: isAdmin ? Number(formData.ownerId) : undefined,
      };
      if (isOwner) delete dataToSubmit.ownerId;

      dispatch(updateVehicle(dataToSubmit));
    },
    [dispatch, vehicleId, isAdmin, isOwner]
  );

  if (loading && !currentVehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Memuat Kendaraan...</CardTitle>
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
              <Button className="mt-4">Kembali ke Daftar Kendaraan</Button>
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
          <CardDescription>Perbarui data kendaraan ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleForm
            initialData={currentVehicle}
            onSubmit={handleSubmit}
            loading={loading}
            isEditMode
            availableOwners={isAdmin ? availableOwners : []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
