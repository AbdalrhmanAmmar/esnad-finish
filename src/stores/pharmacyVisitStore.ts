import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
}

export interface OrderProduct extends Product {
  quantity: number;
  selected: boolean;
}

export interface CollectionProduct extends Product {
  quantity: number;
  selected: boolean;
  totalPrice: number;
}

export interface PharmacyInfo {
  _id: string;
  customerSystemDescription: string;
  area: string;
  city: string;
  district: string;
}

export interface VisitFormData {
  visitDate: string;
  pharmacyId: string;
  pharmacyName: string;
  draftDistribution: string;
  introductoryVisit: string;
  order: string;
  collection: string;
  notes: string;
  introVisitData: string;
  introVisitNotes: string;
  introVisitImage: File | null;
  collectedAmount: number;
  receiptNumber: string;
  amount: number;
  receiptImage: File | null;
  orderProducts: OrderProduct[];
  collectionProducts: CollectionProduct[];
}

interface PharmacyVisitState {
  // Data
  pharmacies: PharmacyInfo[];
  products: Product[];
  currentVisit: VisitFormData;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPharmacies: (pharmacies: PharmacyInfo[]) => void;
  setProducts: (products: Product[]) => void;
  updateVisitData: (data: Partial<VisitFormData>) => void;
  updateOrderProduct: (productId: string, quantity: number, selected: boolean) => void;
  updateCollectionProduct: (productId: string, quantity: number, selected: boolean) => void;
  calculateCollectionTotal: () => number;
  resetVisitForm: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialVisitData: VisitFormData = {
  visitDate: '',
  pharmacyId: '',
  pharmacyName: '',
  draftDistribution: '',
  introductoryVisit: '',
  order: '',
  collection: '',
  notes: '',
  introVisitData: '',
  introVisitNotes: '',
  introVisitImage: null,
  collectedAmount: 0,
  receiptNumber: '',
  receiptImage: null,
  orderProducts: [],
  collectionProducts: [],
  amount: 0
};

export const usePharmacyVisitStore = create<PharmacyVisitState>()(persist(
  (set, get) => ({
    // Initial state
    pharmacies: [],
    products: [],
    currentVisit: initialVisitData,
    isLoading: false,
    error: null,

    // Actions
    setPharmacies: (pharmacies) => {
      set({ pharmacies });
    },

    setProducts: (products) => {
      const state = get();
      const orderProducts: OrderProduct[] = products.map(product => ({
        ...product,
        quantity: 0,
        selected: false
      }));
      
      const collectionProducts: CollectionProduct[] = products.map(product => ({
        ...product,
        quantity: 0,
        selected: false,
        totalPrice: 0
      }));

      set({ 
        products,
        currentVisit: {
          ...state.currentVisit,
          orderProducts,
          collectionProducts
        }
      });
    },

    updateVisitData: (data) => {
      const state = get();
      set({
        currentVisit: {
          ...state.currentVisit,
          ...data
        }
      });
    },

    updateOrderProduct: (productId, quantity, selected) => {
      const state = get();
      const updatedOrderProducts = state.currentVisit.orderProducts.map(product => 
        product._id === productId 
          ? { ...product, quantity, selected }
          : product
      );
      
      set({
        currentVisit: {
          ...state.currentVisit,
          orderProducts: updatedOrderProducts
        }
      });
    },

    updateCollectionProduct: (productId, quantity, selected) => {
      const state = get();
      const updatedCollectionProducts = state.currentVisit.collectionProducts.map(product => {
        if (product._id === productId) {
          const totalPrice = quantity * product.price;
          return { ...product, quantity, selected, totalPrice };
        }
        return product;
      });
      
      // Calculate total amount
      const totalAmount = updatedCollectionProducts
        .filter(p => p.selected)
        .reduce((sum, p) => sum + p.totalPrice, 0);
      
      set({
        currentVisit: {
          ...state.currentVisit,
          collectionProducts: updatedCollectionProducts,
          collectedAmount: totalAmount
        }
      });
    },

    calculateCollectionTotal: () => {
      const state = get();
      return state.currentVisit.collectionProducts
        .filter(p => p.selected)
        .reduce((sum, p) => sum + p.totalPrice, 0);
    },

    resetVisitForm: () => {
      const state = get();
      const resetOrderProducts = state.products.map(product => ({
        ...product,
        quantity: 0,
        selected: false
      }));
      
      const resetCollectionProducts = state.products.map(product => ({
        ...product,
        quantity: 0,
        selected: false,
        totalPrice: 0
      }));

      set({
        currentVisit: {
          ...initialVisitData,
          orderProducts: resetOrderProducts,
          collectionProducts: resetCollectionProducts
        }
      });
    },

    setLoading: (loading) => {
      set({ isLoading: loading });
    },

    setError: (error) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    }
  }),
  {
    name: 'pharmacy-visit-storage',
    partialize: (state) => ({
      pharmacies: state.pharmacies,
      products: state.products
    })
  }
));