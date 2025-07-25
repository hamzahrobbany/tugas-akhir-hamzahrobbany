'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchAdminVehicles, deleteVehicle } from '@/store/slices/vehicleSlice';
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

export default function AdminVehiclesPage() {
  const dispatch: AppDispatch = useDispatch();
  const { data: vehicles, loading, error } = useSelector((state: RootState) => state.vehicles);

  useEffect(() => {
    dispatch(fetchAdminVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error('Gagal Memuat Kendaraan', { description: error });
    }
  }, [error]);

  const handleDelete = async (vehicleId: number) => {
    try {
      await dispatch(deleteVehicle(vehicleId)).unwrap();
      toast.success('Kendaraan Berhasil Dihapus', {
        description: `Kendaraan dengan ID ${vehicleId} telah dihapus.`,
      });
    } catch (err: any) {
      toast.error('Gagal Menghapus Kendaraan', {
        description: err.message || 'Terjadi kesalahan saat menghapus kendaraan.',
      });
    }
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Kelola Kendaraan</h1>
      <Link href="/dashboard/admin/vehicles/create">
        <Button className="bg-primary-500 hover:bg-primary-600 text-black rounded-lg shadow-md flex items-center gap-2">
          <PlusCircle className="h-5 w-5" /> Tambah Kendaraan Baru
        </Button>
      </Link>
    </div>
  );

  if (loading && vehicles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Memuat Kendaraan...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Mohon tunggu, sedang memuat daftar kendaraan.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!loading && vehicles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderHeader()}
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center text-gray-600">
            <p>Belum ada kendaraan yang terdaftar.</p>
            {error && <p className="text-red-500 mt-2">Error: {error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderHeader()}
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center text-red-500">
            <p>Terjadi kesalahan saat memuat kendaraan:</p>
            <p className="font-semibold">{error}</p>
            <Button onClick={() => dispatch(fetchAdminVehicles())} className="mt-4">
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {renderHeader()}

      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Kendaraan</TableHead>
                  <TableHead>Plat Nomor</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Rate Harian</TableHead>
                  <TableHead>Pemilik</TableHead>
                  <TableHead>Tersedia</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.id}</TableCell>
                    <TableCell>{vehicle.name}</TableCell>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell>{vehicle.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(parseFloat(vehicle.dailyRate.toString()))}
                    </TableCell>
                    <TableCell>{vehicle.owner?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          vehicle.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.isAvailable ? 'Ya' : 'Tidak'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end space-x-2">
                      <Link href={`/dashboard/admin/vehicles/${vehicle.id}/edit`}>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-lg">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kendaraan "{vehicle.name}" secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-lg">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(vehicle.id)}
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
