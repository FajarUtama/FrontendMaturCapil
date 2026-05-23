import React, { createContext, useContext } from 'react';
import { isMockApi } from '../config/env';
import { MockDataProvider, useMockData as useMockDataInternal } from './MockDataContext';
import { ApiDataProvider, useApiData } from './ApiDataProvider';

const AppDataContext = createContext(null);

/**
 * Provider data aplikasi.
 * - VITE_USE_MOCK_API=true: MockDataContext + localStorage
 * - VITE_USE_MOCK_API=false: ApiDataProvider → backend FastAPI
 */
export const AppDataProvider = ({ children }) => {
  if (isMockApi()) {
    return (
      <MockDataProvider>
        <MockBridge>{children}</MockBridge>
      </MockDataProvider>
    );
  }

  return (
    <ApiDataProvider>
      <ApiBridge>{children}</ApiBridge>
    </ApiDataProvider>
  );
};

const MockBridge = ({ children }) => {
  const value = {
    ...useMockDataInternal(),
    isApiMode: false,
    loading: false,
    loadComplaintExtras: async () => {},
  };
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

const ApiBridge = ({ children }) => {
  const value = useApiData();
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData harus dipakai di dalam <AppDataProvider>');
  return ctx;
};

/** @deprecated Gunakan useAppData */
export const useMockData = useAppData;
