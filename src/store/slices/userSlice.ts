// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Role } from '@prisma/client';

export interface UserFormData extends Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'password'> {
  id?: number;
  password?: string;
  email: string;
}

interface UserState {
  data: User[];
  loading: boolean;
  error: string | null;
  operationStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  currentUser: User | null;
}

const initialState: UserState = {
  data: [],
  loading: false,
  error: null,
  operationStatus: 'idle',
  currentUser: null,
};

// Async Thunk untuk mengambil semua pengguna (Admin)
export const fetchAdminUsers = createAsyncThunk(
  'users/fetchAdminUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal memuat daftar pengguna.');
      }
      const data: User[] = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error in fetchAdminUsers async thunk:', error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat memuat pengguna.');
    }
  }
);

// Async Thunk untuk mengambil pengguna berdasarkan peran (misal: OWNER untuk VehicleForm)
export const fetchUsersByRole = createAsyncThunk(
  'users/fetchUsersByRole',
  async (role: Role, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users?role=${role}`);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || `Gagal memuat pengguna dengan peran ${role}.`);
      }
      const data: User[] = await response.json();
      return data;
    } catch (error: any) {
      console.error(`Error fetching users by role ${role}:`, error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat memuat pengguna.');
    }
  }
);

// Async Thunk untuk mengambil detail pengguna tunggal (Admin)
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal memuat detail pengguna.');
      }
      const data: User = await response.json();
      return data;
    } catch (error: any) {
      console.error(`Error fetching user ${id}:`, error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat memuat detail pengguna.');
    }
  }
);

// Async Thunk untuk membuat pengguna baru (Admin)
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: UserFormData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal membuat pengguna baru.');
      }
      const newUser: User = await response.json();
      return newUser;
    } catch (error: any) {
      console.error('Error creating user:', error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat membuat pengguna.');
    }
  }
);

// Async Thunk untuk memperbarui pengguna (Admin)
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (userData: UserFormData, { rejectWithValue }) => {
    if (!userData.id) {
      return rejectWithValue('ID pengguna tidak ditemukan untuk pembaruan.');
    }
    try {
      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal memperbarui pengguna.');
      }
      const updatedUser: User = await response.json();
      return updatedUser;
    } catch (error: any) {
      console.error(`Error updating user ${userData.id}:`, error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat memperbarui pengguna.');
    }
  }
);

// Async Thunk untuk menghapus pengguna (Admin)
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Gagal menghapus pengguna.');
      }
      return userId;
    } catch (error: any) {
      console.error(`Error deleting user ${userId}:`, error);
      return rejectWithValue(error.message || 'Terjadi kesalahan jaringan saat menghapus pengguna.');
    }
  }
);


const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsersState: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
      state.operationStatus = 'idle';
      state.currentUser = null;
    },
    setOperationStatus: (state, action: PayloadAction<UserState['operationStatus']>) => {
      state.operationStatus = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    }
  },
  extraReducers: (builder) => {
    // fetchAdminUsers
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationStatus = 'pending';
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.data = action.payload;
        state.operationStatus = 'idle'; // <--- UBAH INI: Set ke idle di sini, bukan 'succeeded'
                                        // Agar tidak memicu useEffect berulang
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.operationStatus = 'idle'; // <--- UBAH INI: Set ke idle di sini, bukan 'failed'
      });

    // fetchUsersByRole (untuk VehicleForm)
    builder
      .addCase(fetchUsersByRole.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.data = action.payload;
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // fetchUserById
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentUser = null;
      });

    // createUser
    builder
      .addCase(createUser.pending, (state) => {
        state.operationStatus = 'pending';
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.operationStatus = 'succeeded'; // Tetap 'succeeded' agar page.tsx bisa mendeteksi dan redirect
        state.data.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.operationStatus = 'failed'; // Tetap 'failed'
        state.error = action.payload as string;
      });

    // updateUser
    builder
      .addCase(updateUser.pending, (state) => {
        state.operationStatus = 'pending';
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.operationStatus = 'succeeded';
        const index = state.data.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.currentUser = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.payload as string;
      });

    // deleteUser
    builder
      .addCase(deleteUser.pending, (state) => {
        state.operationStatus = 'pending';
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.operationStatus = 'succeeded';
        state.data = state.data.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetUsersState, setOperationStatus, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;
