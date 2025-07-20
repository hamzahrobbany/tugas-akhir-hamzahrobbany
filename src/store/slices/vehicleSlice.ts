// src/store/slices/vehicleSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Vehicle, VehicleType, TransmissionType, FuelType } from '@prisma/client';

export interface VehicleWithOwner extends Vehicle {
  owner?: {
    id: number;
    name: string | null;
    email: string;
  };
}

// Tipe untuk data input form (sesuai VehicleFormData di VehicleForm.tsx)
interface VehicleInputData {
  id?: number;
  name: string;
  description: string;
  type: VehicleType | '';
  capacity: number;
  transmissionType: TransmissionType | '';
  fuelType: FuelType | '';
  dailyRate: string;
  lateFeePerDay: string;
  mainImageUrl: string;
  licensePlate: string;
  city: string;
  address: string;
  isAvailable?: boolean; // Opsional untuk create, wajib untuk update
  ownerId?: number | string; // Opsional, hanya untuk admin
}

interface VehicleState {
  data: VehicleWithOwner[];
  loading: boolean;
  error: string | null;
  operationStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  currentVehicle: VehicleWithOwner | null; // Untuk menyimpan detail kendaraan yang sedang diedit
}

interface FetchVehiclesParams {
  startDate?: string;
  endDate?: string;
  type?: VehicleType | 'all';
  transmission?: TransmissionType | 'all';
  fuel?: FuelType | 'all';
  search?: string;
}

const initialState: VehicleState = {
  data: [],
  loading: false,
  error: null,
  operationStatus: 'idle',
  currentVehicle: null,
};

// ===========================================
// Async Thunk untuk mengambil kendaraan (Public Browse)
// ===========================================
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (params: FetchVehiclesParams, { rejectWithValue }) => {
    try {
      let url = '/api/vehicles?';
      const searchParams = new URLSearchParams();

      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.type && params.type !== 'all') searchParams.append('type', params.type);
      if (params.transmission && params.transmission !== 'all') searchParams.append('transmission', params.transmission);
      if (params.fuel && params.fuel !== 'all') searchParams.append('fuel', params.fuel);
      if (params.search) searchParams.append('search', params.search);

      url += searchParams.toString();

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal memuat kendaraan.');
      }
      const data: Vehicle[] = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error in fetchVehicles async thunk:', error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan.');
    }
  }
);

// ===========================================
// Async Thunk untuk mengambil kendaraan (Admin/Owner)
// ===========================================
export const fetchAdminVehicles = createAsyncThunk(
  'vehicles/fetchAdminVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/vehicles');
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal memuat kendaraan admin.');
      }
      const data: VehicleWithOwner[] = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error in fetchAdminVehicles async thunk:', error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat memuat kendaraan admin.');
    }
  }
);

// ===========================================
// Async Thunk untuk mengambil detail kendaraan tunggal (Admin/Owner)
// ===========================================
export const fetchAdminVehicleById = createAsyncThunk(
  'vehicles/fetchAdminVehicleById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/vehicles/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal memuat detail kendaraan.');
      }
      const data: VehicleWithOwner = await response.json();
      return data;
    } catch (error: any) {
      console.error(`Error fetching vehicle ${id}:`, error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat memuat detail kendaraan.');
    }
  }
);

// ===========================================
// Async Thunk untuk membuat kendaraan baru (Admin/Owner)
// ===========================================
export const createVehicle = createAsyncThunk(
  'vehicles/createVehicle',
  async (vehicleData: VehicleInputData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal membuat kendaraan baru.');
      }
      const newVehicle: VehicleWithOwner = await response.json();
      return newVehicle;
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat membuat kendaraan.');
    }
  }
);

// ===========================================
// Async Thunk untuk memperbarui kendaraan (Admin/Owner)
// ===========================================
export const updateVehicle = createAsyncThunk(
  'vehicles/updateVehicle',
  async (vehicleData: VehicleInputData, { rejectWithValue }) => {
    if (!vehicleData.id) {
      return rejectWithValue('ID kendaraan tidak ditemukan untuk pembaruan.');
    }
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicleData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal memperbarui kendaraan.');
      }
      const updatedVehicle: VehicleWithOwner = await response.json();
      return updatedVehicle;
    } catch (error: any) {
      console.error(`Error updating vehicle ${vehicleData.id}:`, error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat memperbarui kendaraan.');
    }
  }
);

// ===========================================
// Async Thunk untuk menghapus kendaraan (Admin/Owner)
// ===========================================
export const deleteVehicle = createAsyncThunk(
  'vehicles/deleteVehicle',
  async (vehicleId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal menghapus kendaraan.');
      }
      return vehicleId;
    } catch (error: any) {
      console.error(`Error deleting vehicle ${vehicleId}:`, error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat menghapus kendaraan.');
    }
  }
);


// ===========================================
// Slice Kendaraan
// ===========================================
const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    resetVehiclesState: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
      state.operationStatus = 'idle';
      state.currentVehicle = null;
    },
    setOperationStatus: (state, action: PayloadAction<VehicleState['operationStatus']>) => {
      state.operationStatus = action.payload;
    },
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null;
    }
  },
  extraReducers: (builder) => {
    // fetchVehicles (Public)
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchAdminVehicles
    builder
      .addCase(fetchAdminVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationStatus = 'pending';
      })
      .addCase(fetchAdminVehicles.fulfilled, (state, action: PayloadAction<VehicleWithOwner[]>) => {
        state.loading = false;
        state.data = action.payload;
        state.operationStatus = 'succeeded';
      })
      .addCase(fetchAdminVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.operationStatus = 'failed';
      });

    // fetchAdminVehicleById
    builder
      .addCase(fetchAdminVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentVehicle = null;
      })
      .addCase(fetchAdminVehicleById.fulfilled, (state, action: PayloadAction<VehicleWithOwner>) => {
        state.loading = false;
        state.currentVehicle = action.payload;
      })
      .addCase(fetchAdminVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentVehicle = null;
      });

    // createVehicle
    builder
      .addCase(createVehicle.pending, (state) => {
        state.operationStatus = 'pending';
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action: PayloadAction<VehicleWithOwner>) => {
        state.operationStatus = 'succeeded';
        state.data.unshift(action.payload); // Tambahkan kendaraan baru ke awal daftar
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.payload as string;
      });

    // updateVehicle
    builder
      .addCase(updateVehicle.pending, (state) => {
        state.operationStatus = 'pending';
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action: PayloadAction<VehicleWithOwner>) => {
        state.operationStatus = 'succeeded';
        // Temukan dan perbarui kendaraan di daftar
        const index = state.data.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.currentVehicle = action.payload; // Perbarui juga currentVehicle jika sedang diedit
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.payload as string;
      });

    // deleteVehicle
    builder
      .addCase(deleteVehicle.pending, (state) => {
        state.operationStatus = 'pending';
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action: PayloadAction<number>) => {
        state.operationStatus = 'succeeded';
        state.data = state.data.filter(vehicle => vehicle.id !== action.payload);
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetVehiclesState, setOperationStatus, clearCurrentVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;
