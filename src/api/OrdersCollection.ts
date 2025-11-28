import { api } from './api';

export interface ProductData {
  productId: string;
  productName: string;
  productCode: string;
  productBrand: string;
  productPrice: number;
  quantity: number;
  totalValue: number;
}

export interface OrderData {
  id: string;
  orderId: string;
  visitDate: string;
  createdAt: string;
  salesRepName: string;
  salesRepEmail: string;
  pharmacyName: string;
  pharmacyArea: string;
  pharmacyCity: string;
  products: ProductData[];
  totalOrderValue: number;
  orderStatus: string;
  finalOrderStatus: boolean;
  finalOrderStatusValue: string;
}

export interface OrderStatistics {
  summary: {
    totalQuantity: number;
    totalValue: number;
    totalOrders: number;
    uniqueProductsCount: number;
    averageOrderValue: number;
  };
  statusBreakdown: {
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    rejectedAmount: number;
    totalRecords: number;
  };
  productBreakdown: Array<{
    productName: string;
    totalQuantity: number;
    totalValue: number;
    orderCount: number;
  }>;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  productId?: string;
  salesRepId?: string;
  salesRepName?: string;
  pharmacyName?: string;
  startDate?: string;
  endDate?: string;
  orderStatus?: string;
  status?: string;
  search?: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: OrderData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
  statistics: OrderStatistics;
}

export const getSalesRepProductsData = async (
  adminId: string,
  filters: OrderFilters = {}
): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.productId) params.append('productId', filters.productId);
  if (filters.salesRepId) params.append('salesRepId', filters.salesRepId);
  if (filters.salesRepName) params.append('SalesRepName', filters.salesRepName);
  if (filters.pharmacyName) params.append('pharmacy', filters.pharmacyName);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.orderStatus) params.append('orderStatus', filters.orderStatus);
  if (filters.status) params.append('orderStatus', filters.status);
  if (filters.search) params.append('search', filters.search);

  const response = await api.get(`/financial-pharmacy/${adminId}/sales-products?${params.toString()}`);
  return response.data;
};

export const exportOrdersData = async (
  adminId: string,
  filters: OrderFilters = {}
): Promise<Blob> => {
  const params = new URLSearchParams();
  
  if (filters.productId) params.append('productId', filters.productId);
  if (filters.salesRepId) params.append('salesRepId', filters.salesRepId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await api.get(`/financial-pharmacy/export/sales/${adminId}?${params.toString()}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const updateOrderStatus = async (adminId: string, requestId: string, status: string, notes?: string) => {
  try {
    const response = await api.put(`/financial-pharmacy/order-status/${adminId}/${requestId}`, {
      status,
      notes
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في تحديث حالة الطلب');
  }
};

export interface FinalOrderData {
  orderId: string;
  visitDate: string;
  salesRepName: string;
  pharmacyName: string;
  orderDetails: Array<{
    product: string;
    productName: string;
    productCode: string;
    price: number;
    quantity: number;
    _id: string;
    id: string;
  }>;
  orderStatus: string;
  FinalOrderStatus: boolean;
  FinalOrderStatusValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinalOrdersResponse {
  success: boolean;
  message: string;
  data: FinalOrderData[];
  count: number;
}

export const getFinalOrders = async (): Promise<FinalOrdersResponse> => {
  try {
    const response = await api.get('/order-collector/final-orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching final orders:', error);
    throw error;
  }
};

export interface UpdateFinalOrderData {
  FinalOrderStatusValue?: 'pending' | 'approved' | 'rejected';
  orderDetails?: Array<{
    product: string;
    quantity: number;
  }>;
}

export const updateFinalOrder = async (orderId: string, updateData: UpdateFinalOrderData): Promise<{ success: boolean; message: string; data: FinalOrderData }> => {
  try {
    const response = await api.put(`/order-collector/final-orders/${orderId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating final order:', error);
    throw error;
  }
};

// Interfaces for filtered orders
export interface FilteredOrdersParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
  salesRep?: string;
  pharmacy?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface FilteredOrdersResponse {
  success: boolean;
  message: string;
  count: number;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: FinalOrderData[];
}

export const getOrdersWithFinalStatus = async (params: FilteredOrdersParams = {}): Promise<FilteredOrdersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/pharmacy-requests/sales-rep/admin/final-orders?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered orders:', error);
    throw error;
  }
};

// Final orders list with filters (OrdersCollector)
export const getFinalOrdersFiltered = async (params: FilteredOrdersParams = {}): Promise<FilteredOrdersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    const response = await api.get(`/order-collector/final-orders?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching final orders with filters:', error);
    throw error;
  }
};

// Get sales representatives for filter
export const getSalesReps = async (): Promise<{ success: boolean; data: Array<{ _id: string; firstName: string; lastName: string }> }> => {
  try {
    const response = await api.get('/users/sales-reps');
    return response.data;
  } catch (error) {
    console.error('Error fetching sales reps:', error);
    throw error;
  }
};

// Get pharmacies for filter
export const getPharmacies = async (): Promise<{ success: boolean; data: Array<{ _id: string; customerSystemDescription: string }> }> => {
  try {
    const response = await api.get('/pharmacies/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    throw error;
  }
};

// تصدير الطلبيات النهائية إلى Excel
export const exportFinalOrdersToExcel = async (params: FilteredOrdersParams = {}): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.salesRep && params.salesRep !== 'all') queryParams.append('salesRep', params.salesRep);
    if (params.pharmacy && params.pharmacy !== 'all') queryParams.append('pharmacy', params.pharmacy);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.search) queryParams.append('search', params.search);

    const response = await api.get(`/order-collector/final-orders/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
   } catch (error) {
     console.error('Error exporting final orders:', error);
     throw error;
   }
 };
