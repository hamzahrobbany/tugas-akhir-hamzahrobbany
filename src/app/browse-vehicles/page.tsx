    // src/app/browse-vehicles/page.tsx
    'use client';

    import React, { useState, useEffect, useCallback } from 'react';
    import Link from 'next/link';
    import { Vehicle, VehicleType, TransmissionType, FuelType } from '@prisma/client';
    import { Car, Users, Fuel, Gauge, MapPin, Search, CalendarDays } from 'lucide-react';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { toast } from 'sonner';

    import { useSelector, useDispatch } from 'react-redux';
    import { RootState, AppDispatch } from '@/store';
    import { fetchVehicles } from '@/store/slices/vehicleSlice';

    function useDebounce<T>(value: T, delay: number): T {
      const [debouncedValue, setDebouncedValue] = useState<T>(value);

      useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);
        return () => {
          clearTimeout(handler);
        };
      }, [value, delay]);

      return debouncedValue;
    }

    export default function BrowseVehiclesPage() {
      const vehicles = useSelector((state: RootState) => state.vehicles.data);
      const loading = useSelector((state: RootState) => state.vehicles.loading);
      const error = useSelector((state: RootState) => state.vehicles.error);
      const dispatch: AppDispatch = useDispatch();

      const [startDate, setStartDate] = useState('');
      const [endDate, setEndDate] = useState('');
      const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | 'all'>('all');
      const [selectedTransmissionType, setSelectedTransmissionType] = useState<TransmissionType | 'all'>('all');
      const [selectedFuelType, setSelectedFuelType] = useState<FuelType | 'all'>('all');
      const [searchQuery, setSearchQuery] = useState('');
      const debouncedSearchQuery = useDebounce(searchQuery, 500);

      const triggerFetchVehicles = useCallback(() => {
        dispatch(fetchVehicles({
          startDate,
          endDate,
          type: selectedVehicleType,
          transmission: selectedTransmissionType,
          fuel: selectedFuelType,
          search: debouncedSearchQuery,
        }));
      }, [dispatch, startDate, endDate, selectedVehicleType, selectedTransmissionType, selectedFuelType, debouncedSearchQuery]);

      useEffect(() => {
        triggerFetchVehicles();
      }, [triggerFetchVehicles]);

      useEffect(() => {
        if (error) {
          toast.error('Gagal Memuat Kendaraan', {
            description: error,
          });
        }
      }, [error]);

      const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedVehicleType('all');
        setSelectedTransmissionType('all');
        setSelectedFuelType('all');
        setSearchQuery('');
      };

      return (
        <div className="min-h-screen bg-gray-50 pb-10"> {/* Removed pt-20 here */}
          {/* Navbar sudah di layout.tsx, dihapus dari sini */}

          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Jelajahi Kendaraan Kami</h1>

            <Card className="mb-8 p-6 shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold mb-2 flex items-center gap-2">
                  <Search className="h-6 w-6" /> Filter Kendaraan
                </CardTitle>
                <CardDescription>Temukan kendaraan yang sempurna untuk perjalanan Anda.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="startDate" className="text-sm font-medium">Mulai Sewa</label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="endDate" className="text-sm font-medium">Akhir Sewa</label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="vehicleType" className="text-sm font-medium">Tipe Kendaraan</label>
                  <Select value={selectedVehicleType} onValueChange={(val: VehicleType | 'all') => setSelectedVehicleType(val)}>
                    <SelectTrigger id="vehicleType" className="rounded-lg">
                      <SelectValue placeholder="Pilih Tipe Kendaraan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      {Object.values(VehicleType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="transmissionType" className="text-sm font-medium">Tipe Transmisi</label>
                  <Select value={selectedTransmissionType} onValueChange={(val: TransmissionType | 'all') => setSelectedTransmissionType(val)}>
                    <SelectTrigger id="transmissionType" className="rounded-lg">
                      <SelectValue placeholder="Pilih Tipe Transmisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      {Object.values(TransmissionType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="fuelType" className="text-sm font-medium">Tipe Bahan Bakar</label>
                  <Select value={selectedFuelType} onValueChange={(val: FuelType | 'all') => setSelectedFuelType(val)}>
                    <SelectTrigger id="fuelType" className="rounded-lg">
                      <SelectValue placeholder="Pilih Tipe Bahan Bakar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      {Object.values(FuelType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="search" className="text-sm font-medium">Cari Kendaraan</label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Nama atau Plat Nomor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-lg"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end mt-4">
                  <Button onClick={handleClearFilters} variant="outline" className="rounded-lg">
                    Reset Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <p className="text-center text-lg text-gray-600">Memuat kendaraan...</p>
            ) : error ? (
              <p className="text-center text-lg text-red-500">Error: {error}</p>
            ) : vehicles.length === 0 ? (
              <p className="text-center text-lg text-gray-600">Tidak ada kendaraan yang ditemukan dengan kriteria yang dipilih.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    <img
                      src={vehicle.mainImageUrl || `https://placehold.co/600x400/4F46E5/FFFFFF/png?text=${vehicle.name.replace(/\s/g, '+')}`}
                      alt={vehicle.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/600x400/4F46E5/FFFFFF/png?text=${vehicle.name.replace(/\s/g, '+')}`; }}
                    />
                    <CardContent className="p-6">
                      <CardTitle className="text-2xl font-bold mb-2">{vehicle.name}</CardTitle>
                      <CardDescription className="text-gray-600 mb-4">
                        {vehicle.type.replace(/_/g, ' ')} {vehicle.city ? `di ${vehicle.city}` : ''}
                      </CardDescription>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{vehicle.description || 'Tidak ada deskripsi.'}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                        <span className="flex items-center"><Users className="h-4 w-4 mr-1 text-gray-500" /> {vehicle.capacity} Kursi</span>
                        <span className="flex items-center"><Fuel className="h-4 w-4 mr-1 text-gray-500" /> {vehicle.fuelType.replace(/_/g, ' ')}</span>
                        <span className="flex items-center"><Gauge className="h-4 w-4 mr-1 text-gray-500" /> {vehicle.transmissionType.replace(/_/g, ' ')}</span>
                        <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-gray-500" /> {vehicle.city || 'N/A'}</span>
                      </div>
                      <div className="text-3xl font-bold text-primary-500 mb-4">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseFloat(vehicle.dailyRate.toString()))}
                        <span className="text-lg text-gray-500">/hari</span>
                      </div>
                      <Link href={`/vehicles/${vehicle.slug}`}>
                        <Button className="w-full bg-primary-500 text-black py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md">
                          Sewa Sekarang
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    