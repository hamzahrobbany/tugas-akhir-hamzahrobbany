// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from './slices/vehicleSlice';
import userReducer from './slices/userSlice'; // Import userReducer

export const store = configureStore({
  reducer: {
    vehicles: vehicleReducer,
    users: userReducer, // Tambahkan userReducer
  },
  // devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
