// stores/medicalRepStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MedicalRepDoctor {
  _id: string;
  name: string;
  specialty: string;
  phone: string;
  organizationName: string;
  city: string;
  area: string;
  teamArea: string;
}

interface MedicalRepProduct {
  _id: string;
  name: string;
  code: string;
  type: string;
  price: number;
  brand: string;
  company: string;
  teamProducts: string;
  messages?: any[];
}

interface MedicalRepStore {
  doctors: MedicalRepDoctor[];
  products: MedicalRepProduct[];
  isLoading: boolean;
  lastFetched: Date | null;
  setData: (doctors: MedicalRepDoctor[], products: MedicalRepProduct[]) => void;
  setLoading: (loading: boolean) => void;
  clearData: () => void;
}

export const useMedicalRepStore = create<MedicalRepStore>()(
  persist(
    (set) => ({
      doctors: [],
      products: [],
      isLoading: false,
      lastFetched: null,
      setData: (doctors, products) => set({ 
        doctors, 
        products, 
        isLoading: false,
        lastFetched: new Date()
      }),
      setLoading: (isLoading) => set({ isLoading }),
      clearData: () => set({ doctors: [], products: [], lastFetched: null }),
    }),
    {
      name: 'medical-rep-store',
    }
  )
);