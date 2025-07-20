'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchAdminUsers, deleteUser, setOperationStatus } from '@/store/slices/userSlice';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

export default function AdminUsersPage() {
  const dispatch: AppDispatch = useDispatch();
  const { data: session } = useSession();
  const { data: users, loading, error, operationStatus } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === 'succeeded' || operationStatus === 'failed') {
      dispatch(fetchAdminUsers());
      dispatch(setOperationStatus('idle'));
    }
  }, [operationStatus, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error('Gagal Memuat Pengguna', {
        description: error,
      });
    }
  }, [error]);

  const handleDelete = async (userId: number) => {
    if (session?.user?.id === userId.toString()) {
      toast.error('Tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success('Berhasil dihapus.');
    } catch (err: any) {
      toast.error('Gagal menghapus pengguna', { description: err.message });
    }
  };

  if (loading && users.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kelola Pengguna</h1>
        <Link href="/dashboard/admin/users/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> Tambah Pengguna Baru
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id ?? 'user-${index}'}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="flex gap-2">
                    <Link href={`/dashboard/admin/users/${user.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Yakin hapus?</AlertDialogTitle>
                          <AlertDialogDescription>Ini tidak bisa dibatalkan.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
