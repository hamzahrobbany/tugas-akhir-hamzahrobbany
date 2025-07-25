'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Role } from '@prisma/client';
import Link from 'next/link';

// Perluas tipe User untuk form
interface UserFormData {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: Role | '';
  phoneNumber: string;
  address: string;
  isVerifiedByAdmin: boolean;
}

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => void;
  loading: boolean;
  isEditMode?: boolean;
  backUrl?: string;
}

export default function UserForm({
  initialData,
  onSubmit,
  loading,
  isEditMode = false,
  backUrl,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    phoneNumber: '',
    address: '',
    isVerifiedByAdmin: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        email: initialData.email,
        password: '',
        role: initialData.role,
        phoneNumber: initialData.phoneNumber || '',
        address: initialData.address || '',
        isVerifiedByAdmin: initialData.isVerifiedByAdmin,
      });
    }
  }, [initialData]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { id, value, type } = e.target;
  let newValue: string | boolean = value;

  if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
    newValue = e.target.checked;
  }

  setFormData((prev) => ({
    ...prev,
    [id]: newValue,
  }));
};
  const handleSelectChange = (id: keyof UserFormData, value: string) => {
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
      {/* Nama Lengkap */}
      <div>
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input id="name" type="text" value={formData.name} onChange={handleChange} required className="mt-1 rounded-lg" />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1 rounded-lg" />
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password">Password {isEditMode ? '(Kosongkan jika tidak ingin mengubah)' : ''}</Label>
        <Input
          id="password"
          type="password"
          placeholder={isEditMode ? '********' : 'Minimal 6 karakter'}
          value={formData.password}
          onChange={handleChange}
          required={!isEditMode}
          className="mt-1 rounded-lg"
        />
      </div>

      {/* Peran */}
      <div>
        <Label htmlFor="role">Peran (Role)</Label>
        <Select value={formData.role} onValueChange={(val: Role) => handleSelectChange('role', val)} required>
          <SelectTrigger id="role" className="mt-1 rounded-lg">
            <SelectValue placeholder="Pilih Peran" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Role).map((role) => (
              <SelectItem key={role} value={role}>
                {role.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nomor Telepon */}
      <div>
        <Label htmlFor="phoneNumber">Nomor Telepon</Label>
        <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className="mt-1 rounded-lg" />
      </div>

      {/* Alamat */}
      <div>
        <Label htmlFor="address">Alamat Lengkap</Label>
        <Textarea id="address" value={formData.address} onChange={handleChange} className="mt-1 rounded-lg" rows={3} />
      </div>

      {/* Status Verifikasi Admin */}
      <div className="flex items-center space-x-2">
        <Input
          id="isVerifiedByAdmin"
          type="checkbox"
          checked={formData.isVerifiedByAdmin}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <Label htmlFor="isVerifiedByAdmin">Terverifikasi oleh Admin</Label>
      </div>

      <div className="flex gap-4">
        {backUrl && (
          <Link href={backUrl} className="w-full">
            <Button type="button" variant="outline" className="w-full rounded-lg">
              Kembali
            </Button>
          </Link>
        )}
        <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-black rounded-lg shadow-md" disabled={loading}>
          {loading ? (isEditMode ? 'Memperbarui...' : 'Menambah...') : (isEditMode ? 'Perbarui Pengguna' : 'Tambah Pengguna')}
        </Button>
      </div>
    </form>
  );
}
