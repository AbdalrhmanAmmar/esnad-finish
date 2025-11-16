import { api } from './api';

export interface SalesRepUser {
  _id: string;
  name: string;
  username: string;
  role: string;
  area: string;
  adminId: string;
}

export interface SalesRepProduct {
  _id: string;
  code: string;
  name: string;
  type?: string;
  price: number;
  brand?: string;
  company?: string;
  teamProducts?: string[];
  messages: any[];
}

export interface SalesRepPharmacy {
  _id: string;
  name: string;
  area: string;
  city: string;
  district: string;
}

export interface SalesRepStats {
  totalProducts: number;
  totalPharmacies: number;
}

export interface SalesRepResourcesResponse {
  success: boolean;
  data: {
    user: SalesRepUser;
    products: SalesRepProduct[];
    pharmacies: SalesRepPharmacy[];
    stats: SalesRepStats;
  };
}

export const getSalesRepResources = async (userId: string): Promise<SalesRepResourcesResponse> => {
  try {
    const response = await api.get(`/sales-rep/resources/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales rep resources:', error);
    throw new Error(error.response?.data?.message || 'فشل في جلب بيانات عملاء المبيعات');
  }
};