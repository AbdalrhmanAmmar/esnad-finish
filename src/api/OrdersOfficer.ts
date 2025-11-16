import { api } from './api';

// Interface for Final Order Data
export interface FinalOrderData {
  orderId: string;
  visitDate: string;
  salesRepName: string;
  pharmacyName: string;
  orderDetails: {
    product: string;
    productName: string;
    productCode: string;
    price: number;
    quantity: number;
    _id: string;
    id: string;
  }[];
  orderStatus: 'pending' | 'approved' | 'rejected';
  FinalOrderStatus: boolean;
  FinalOrderStatusValue: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for API Response
export interface FinalOrdersResponse {
  success: boolean;
  message: string;
  data: FinalOrderData[];
  count: number;
}

// Get orders with final status
export const getFinalOrders = async (): Promise<FinalOrdersResponse> => {
  try {
    const response = await api.get('/order-collector/final-orders');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب الطلبات النهائية:', error);
    throw error;
  }
};