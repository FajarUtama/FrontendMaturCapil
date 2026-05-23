import React, { createContext, useContext } from 'react';
import { isMockApi } from '../config/env';
import { MockDataProvider, useMockData } from './MockDataContext';

const AppDataContext = createContext(null);

/**
 * Provider data aplikasi.
 * - VITE_USE_MOCK_API=true (default): MockDataContext + localStorage
 * - VITE_USE_MOCK_API=false: nanti ApiDataProvider (panggil src/services/*)
 *
 * Saat ini mode API belum mengganti mock — set flag hanya setelah ApiDataProvider siap.
 */
export const AppDataProvider = ({ children }) => {
  if (!isMockApi()) {
    if (import.meta.env.DEV) {
      console.warn(
        '[MaturCapil] VITE_USE_MOCK_API=false tetapi ApiDataProvider belum diimplementasi. Memakai mock.'
      );
    }
  }

  return (
    <MockDataProvider>
      <AppDataBridge>{children}</AppDataBridge>
    </MockDataProvider>
  );
};

/** Menyalurkan nilai mock ke AppDataContext agar hook useAppData bisa dipakai di halaman baru. */
const AppDataBridge = ({ children }) => {
  const value = useMockData();
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

/**
 * Hook data aplikasi — ganti import `useMockData` → `useAppData` secara bertahap.
 * @returns {ReturnType<typeof useMockData>}
 */
export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData harus dipakai di dalam <AppDataProvider>');
  }
  return ctx;
};

/** @deprecated Pakai useAppData */
export { useMockData };
