'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchUserById,
  updateUser,
  setOperationStatus,
  clearCurrentUser,
} from '@/store/slices/userSlice';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import UserForm from '@/components/forms/UserForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const userId = parseInt(params.id);

  const { currentUser, loading, error, operationStatus } = useSelector(
    (state: RootState) => state.users
  );

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      toast.success('Pengguna Berhasil Diperbarui', {
        description: 'Detail pengguna telah berhasil diperbarui.',
      });
      dispatch(setOperationStatus('idle'));
      router.push('/dashboard/admin/users');
    }

    if (operationStatus === 'failed' && error) {
      toast.error('Gagal Memperbarui Pengguna', {
        description: error,
      });
      dispatch(setOperationStatus('idle'));
    }
  }, [operationStatus, error, dispatch, router]);

  useEffect(() => {
    if (error && !loading && !currentUser) {
      toast.error('Gagal Memuat Detail Pengguna', {
        description: error,
      });
      router.push('/dashboard/admin/users');
    }
  }, [error, loading, currentUser, router]);

  const handleSubmit = (formData: any) => {
    dispatch(updateUser({ ...formData, id: userId }));
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Memuat Data Pengguna...</CardTitle>
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
              <Button className="mt-4 bg-primary-500 hover:bg-primary-600 text-black rounded-lg">
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
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Edit Pengguna</h1>
      <Link href="/dashboard/admin/users">
        <Button variant="outline" className="rounded-lg">
          Kembali
        </Button>
      </Link>
    </div>

    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Form Edit Pengguna</CardTitle>
        <CardDescription>Perbarui detail informasi akun pengguna di sini.</CardDescription>
      </CardHeader>
      <CardContent>
        <UserForm
          initialData={currentUser ?? undefined}
          onSubmit={handleSubmit}
          loading={loading}
          isEditMode
        />
      </CardContent>
    </Card>
  </div>
);
}
