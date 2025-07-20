// src/app/dashboard/admin/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchAdminUsers, deleteUser, setOperationStatus } from '@/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import Link from 'next/link';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';

export default function AdminUsersPage() {
  const dispatch: AppDispatch = useDispatch();
  const { data: session } = useSession();

  const users = useSelector((state: RootState) => state.users.data);
  const loading = useSelector((state: RootState) => state.users.loading);
  const error = useSelector((state: RootState) => state.users.error);
  const operationStatus = useSelector((state: RootState) => state.users.operationStatus);

  useEffect(() => {
    if (operationStatus === 'idle') {
      dispatch(fetchAdminUsers());
    }
  }, [dispatch, operationStatus]);

  useEffect(() => {
    if (operationStatus === 'succeeded' || operationStatus === 'failed') {
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
    try {
      // Pastikan session?.user?.id ada dan user.id ada sebelum membandingkan
      if (session?.user?.id && user.id && session.user.id === userId.toString()) {
        toast.error('Gagal Menghapus Pengguna', {
          description: 'Anda tidak dapat menghapus akun Anda sendiri.',
        });
        return;
      }
      await dispatch(deleteUser(userId)).unwrap();
      toast.success('Pengguna Berhasil Dihapus', {
        description: `Pengguna dengan ID ${userId} telah dihapus.`,
      });
    } catch (err: any) {
      toast.error('Gagal Menghapus Pengguna', {
        description: err.message || 'Terjadi kesalahan saat menghapus pengguna.',
      });
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Memuat Pengguna...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Mohon tunggu, sedang memuat daftar pengguna.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
          <Link href="/dashboard/admin/users/create">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-md flex items-center gap-2">
              <PlusCircle className="h-5 w-5" /> Tambah Pengguna Baru
            </Button>
          </Link>
        </div>
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center text-gray-600">
            <p>Belum ada pengguna yang terdaftar.</p>
            {error && <p className="text-red-500 mt-2">Error: {error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
          <Link href="/dashboard/admin/users/create">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-md flex items-center gap-2">
              <PlusCircle className="h-5 w-5" /> Tambah Pengguna Baru
            </Button>
          </Link>
        </div>
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center text-red-500">
            <p>Terjadi kesalahan saat memuat pengguna:</p>
            <p className="font-semibold">{error}</p>
            <Button onClick={() => dispatch(fetchAdminUsers())} className="mt-4">Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
        <Link href="/dashboard/admin/users/create">
          <Button className="bg-primary-500 hover:bg-primary-600 text-black rounded-lg shadow-md flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> Tambah Pengguna Baru
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Terverifikasi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role?.replace(/_/g, ' ') || 'N/A'}</TableCell>
                    <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.isVerifiedByAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isVerifiedByAdmin ? 'Ya' : 'Tidak'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end space-x-2">
                      <Link href={`/dashboard/admin/users/${user.id}/edit`}>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg"
                            disabled={!user.id || (session?.user?.id === user.id.toString())} // <--- PERBAIKAN DI SINI
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Anda yakin ingin menghapus ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pengguna "{user.name || user.email}" secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-lg">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
