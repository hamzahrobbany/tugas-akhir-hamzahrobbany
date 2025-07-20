// src/components/forms/VehicleForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicle, VehicleType, TransmissionType, FuelType, User } from '@prisma/client';

// Perluas tipe Vehicle untuk form, termasuk ownerId untuk admin
interface VehicleFormData {
  id?: number; // Hanya ada saat edit
  name: string;
  description: string;
  type: VehicleType | '';
  capacity: number;
  transmissionType: TransmissionType | '';
  fuelType: FuelType | '';
  dailyRate: string; // String untuk input, akan di-parse
  lateFeePerDay: string; // String untuk input, akan di-parse
  mainImageUrl: string;
  licensePlate: string;
  city: string;
  address: string;
  isAvailable: boolean;
  ownerId?: number | string; // Bisa string dari input, akan di-parse
}

interface VehicleFormProps {
  initialData?: Vehicle; // Data awal saat mode edit
  onSubmit: (data: VehicleFormData) => void;
  loading: boolean;
  isEditMode?: boolean;
  availableOwners?: User[]; // Daftar owner yang tersedia (hanya jika peran admin)
}

export default function VehicleForm({
  initialData,
  onSubmit,
  loading,
  isEditMode = false,
  availableOwners = [],
}: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    description: '',
    type: '',
    capacity: 0,
    transmissionType: '',
    fuelType: '',
    dailyRate: '',
    lateFeePerDay: '',
    mainImageUrl: '',
    licensePlate: '',
    city: '',
    address: '',
    isAvailable: true,
    ownerId: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        description: initialData.description || '',
        type: initialData.type,
        capacity: initialData.capacity,
        transmissionType: initialData.transmissionType,
        fuelType: initialData.fuelType,
        dailyRate: initialData.dailyRate.toString(),
        lateFeePerDay: initialData.lateFeePerDay.toString(),
        mainImageUrl: initialData.mainImageUrl || '',
        licensePlate: initialData.licensePlate,
        city: initialData.city,
        address: initialData.address || '',
        isAvailable: initialData.isAvailable,
        ownerId: initialData.ownerId, // Set ownerId jika ada
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (id: keyof VehicleFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nama Kendaraan */}
      <div>
        <Label htmlFor="name">Nama Kendaraan</Label>
        <Input id="name" type="text" value={formData.name} onChange={handleChange} required className="mt-1 rounded-lg" />
      </div>

      {/* Deskripsi */}
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" value={formData.description} onChange={handleChange} className="mt-1 rounded-lg" rows={4} />
      </div>

      {/* Tipe Kendaraan */}
      <div>
        <Label htmlFor="type">Tipe Kendaraan</Label>
        <Select value={formData.type} onValueChange={(val: VehicleType) => handleSelectChange('type', val)} required>
          <SelectTrigger id="type" className="mt-1 rounded-lg">
            <SelectValue placeholder="Pilih Tipe Kendaraan" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(VehicleType).map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kapasitas */}
      <div>
        <Label htmlFor="capacity">Kapasitas (Jumlah Kursi)</Label>
        <Input id="capacity" type="number" value={formData.capacity} onChange={handleChange} required min={1} className="mt-1 rounded-lg" />
      </div>

      {/* Tipe Transmisi */}
      <div>
        <Label htmlFor="transmissionType">Tipe Transmisi</Label>
        <Select value={formData.transmissionType} onValueChange={(val: TransmissionType) => handleSelectChange('transmissionType', val)} required>
          <SelectTrigger id="transmissionType" className="mt-1 rounded-lg">
            <SelectValue placeholder="Pilih Tipe Transmisi" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(TransmissionType).map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipe Bahan Bakar */}
      <div>
        <Label htmlFor="fuelType">Tipe Bahan Bakar</Label>
        <Select value={formData.fuelType} onValueChange={(val: FuelType) => handleSelectChange('fuelType', val)} required>
          <SelectTrigger id="fuelType" className="mt-1 rounded-lg">
            <SelectValue placeholder="Pilih Tipe Bahan Bakar" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(FuelType).map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tarif Harian */}
      <div>
        <Label htmlFor="dailyRate">Tarif Harian (IDR)</Label>
        <Input id="dailyRate" type="number" step="0.01" value={formData.dailyRate} onChange={handleChange} required className="mt-1 rounded-lg" />
      </div>

      {/* Biaya Keterlambatan Per Hari */}
      <div>
        <Label htmlFor="lateFeePerDay">Biaya Keterlambatan Per Hari (IDR)</Label>
        <Input id="lateFeePerDay" type="number" step="0.01" value={formData.lateFeePerDay} onChange={handleChange} required className="mt-1 rounded-lg" />
      </div>

      {/* URL Gambar Utama */}
      <div>
        <Label htmlFor="mainImageUrl">URL Gambar Utama</Label>
        <Input id="mainImageUrl" type="url" value={formData.mainImageUrl} onChange={handleChange} className="mt-1 rounded-lg" />
      </div>

      {/* Plat Nomor */}
      <div>
        <Label htmlFor="licensePlate">Plat Nomor</Label>
        <Input id="licensePlate" type="text" value={formData.licensePlate} onChange={handleChange} required className="mt-1 rounded-lg" />
      </div>

      {/* Kota */}
      <div>
        <Label htmlFor="city">Kota</Label>
        <Input id="city" type="text" value={formData.city} onChange={handleChange} required className="mt-1 rounded-lg" />
      </div>

      {/* Alamat */}
      <div>
        <Label htmlFor="address">Alamat Lengkap</Label>
        <Textarea id="address" value={formData.address} onChange={handleChange} className="mt-1 rounded-lg" rows={3} />
      </div>

      {/* Status Ketersediaan (hanya saat edit) */}
      {isEditMode && (
        <div className="flex items-center space-x-2">
          <Input
            id="isAvailable"
            type="checkbox"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <Label htmlFor="isAvailable">Tersedia untuk Disewa</Label>
        </div>
      )}

      {/* Pilih Owner (hanya untuk Admin) */}
      {availableOwners && availableOwners.length > 0 && (
        <div>
          <Label htmlFor="ownerId">Pilih Pemilik (Owner)</Label>
          <Select
            value={formData.ownerId?.toString() || ''}
            onValueChange={(val: string) => handleSelectChange('ownerId', val)}
            required // Wajib dipilih oleh Admin
          >
            <SelectTrigger id="ownerId" className="mt-1 rounded-lg">
              <SelectValue placeholder="Pilih Pemilik Kendaraan" />
            </SelectTrigger>
            <SelectContent>
              {availableOwners.map((owner) => (
                <SelectItem key={owner.id} value={owner.id.toString()}>
                  {owner.name} ({owner.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-md" disabled={loading}>
        {loading ? (isEditMode ? 'Memperbarui...' : 'Menambah...') : (isEditMode ? 'Perbarui Kendaraan' : 'Tambah Kendaraan')}
      </Button>
    </form>
  );
}
