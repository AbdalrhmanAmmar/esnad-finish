import { api } from './api';

export interface PharmacyCardProduct {
  id?: string;
  code?: string;
  name?: string;
  brand?: string;
  price?: number;
}

export interface PharmacyCardOrderDetail {
  product?: PharmacyCardProduct;
  quantity?: number;
  price?: number;
  total?: number;
}

export interface PharmacyInfo {
  id?: string;
  name?: string;
  address?: string;
  area?: string;
  city?: string;
  telNumber?: string;
}

export interface CreatedByInfo {
  id?: string;
  name?: string;
  username?: string;
  role?: string;
}

export interface PharmacyCardData {
  _id: string;
  pharmacy?: PharmacyInfo;
  orderDetails?: PharmacyCardOrderDetail[];
  totalOrderValue?: number;
  status?: string;
  finalOrderStatus?: string;
  createdBy?: CreatedByInfo;
  createdAt?: string;
}

export interface PharmacyCardResponse {
  success: boolean;
  message?: string;
  data: PharmacyCardData;
}

// جلب بطاقة الصيدلية حسب المعرف
export const getPharmacyCardById = async (cardId: string): Promise<PharmacyCardResponse> => {
  try {
    // NOTE: تأكد من أن هذا المسار يتوافق مع الـ API في الخادم لديك
    const response = await api.get(`/pharmacyCard/${cardId}`);
    return response.data as PharmacyCardResponse;
  } catch (error: any) {
    console.error('Error fetching pharmacy card:', error);
    const message = error.response?.data?.message || 'فشل في جلب بيانات بطاقة الصيدلية';
    throw new Error(message);
  }
};