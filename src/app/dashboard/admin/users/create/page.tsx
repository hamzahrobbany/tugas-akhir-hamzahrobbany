//s

'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createUser, setOperationStatus } from '@/store/slices/userSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import UserForm from '@/components/forms/UserForm';

export default function CreateUserPage() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const { operationStatus, error } = useSelector((state: RootState) => state.users);
  const loading = operationStatus === 'pending';

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      toast.success('Pengguna Berhasil Ditambahkan', {
        description: 'Pengguna baru telah berhasil ditambahkan.',
      });
      dispatch(setOperationStatus('idle'));
      router.push('/dashboard/admin/users');
    }

    if (operationStatus === 'failed' && error) {
      toast.error('Gagal Menambahkan Pengguna', {
        description: error,
      });
      dispatch(setOperationStatus('idle'));
    }
  }, [operationStatus, error, dispatch, router]);

  const handleSubmit = (formData: any) => {
    dispatch(createUser(formData));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">Tambah Pengguna Baru</CardTitle>
          <CardDescription>Isi detail pengguna untuk ditambahkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            onSubmit={handleSubmit}
            loading={loading}
            isEditMode={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
