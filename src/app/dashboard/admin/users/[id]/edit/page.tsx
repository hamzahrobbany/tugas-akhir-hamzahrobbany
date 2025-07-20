// src/app/dashboard/admin/users/[id]/edit/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUserById, updateUser, setOperationStatus, clearCurrentUser } from '@/store/slices/userSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import UserForm from '@/components/forms/UserForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EditUserPageProps {
  params: {
    id: string; // ID pengguna dari URL
  };
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const userId = parseInt(params.id);
  const currentUser = useSelector((state: RootState) => state.users.currentUser);
  const loading = useSelector((state: RootState) => state.users.loading);
  const error = useSelector((state: RootState) => state.users.error);
  const operationStatus = useSelector((state: RootState) => state.users.operationStatus);

  // Fetch detail pengguna saat komponen dimuat
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
    // Bersihkan currentUser saat komponen unmount
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, userId]);

  // Tangani status operasi update
  useEffect(() => {
    if (operationStatus === 'succeeded') {
      toast.success('Pengguna Berhasil Diperbarui', {
        description: 'Detail pengguna telah berhasil diperbarui.',
      });
      dispatch(setOperationStatus('idle'));
      router.push('/dashboard/admin/users'); // Redirect kembali ke daftar
    } else if (operationStatus === 'failed' && error) {
      toast.error('Gagal Memperbarui Pengguna', {
        description: error,
      });
      dispatch(setOperationStatus('idle'));
    }
  }, [operationStatus, error, router, dispatch]);

  // Tampilkan toast error jika ada error saat fetch detail pengguna
  useEffect(() => {
    if (error && !loading && !currentUser) {
      toast.error('Gagal Memuat Detail Pengguna', {
        description: error,
      });
      router.push('/dashboard/admin/users'); // Redirect jika pengguna tidak ditemukan/error
    }
  }, [error, loading, currentUser, router]);

  const handleSubmit = async (formData: any) => {
    dispatch(updateUser({ ...formData, id: userId }));
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Memuat Detail Pengguna...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Mohon tunggu, sedang memuat data pengguna.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Pengguna Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Pengguna dengan ID {params.id} tidak ditemukan.</p>
            <Link href="/dashboard/admin/users">
              <Button className="mt-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
                Kembali ke Daftar Pengguna
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
          <CardTitle className="text-3xl font-bold mb-2">Edit Pengguna</CardTitle>
          <CardDescription>Perbarui detail pengguna ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentUser && (
            <UserForm
              initialData={currentUser}
              onSubmit={handleSubmit}
              loading={loading}
              isEditMode={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
