import { api } from './api';

export interface FinancialData {
  id: string;
  visitDate: string;
  createdAt: string;
  repName: string;
  repEmail: string;
  pharmacyName: string;
  pharmacyArea: string;
  pharmacyCity: string;
  amount: number;
  receiptNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptImage: string;
}

export interface FinancialStatistics {
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  totalRecords: number;
}

export interface FinancialResponse {
  success: boolean;
  message: string;
  data: FinancialData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
  statistics: FinancialStatistics;
}

export interface FinancialFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  pharmacyName?: string;
  pharmacyArea?: string;
  repName?: string;
}

export const getFinancialPharmacyData = async (adminId: string, filters: FinancialFilters = {}): Promise<FinancialResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.pharmacyName) params.append('pharmacyName', filters.pharmacyName);
    if (filters.pharmacyArea) params.append('pharmacyArea', filters.pharmacyArea);
    if (filters.repName) params.append('repName', filters.repName);

    const response = await api.get(`/financial-pharmacy/admin/${adminId}?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching financial data:', error);
    throw new Error(error.response?.data?.message || 'فشل في جلب البيانات المالية');
  }
};

export const updateCollectionStatus = async (adminId: string, requestId: string, status: string, notes?: string) => {
  try {
    const requestBody: any = {
      status: status,
    };
    
    if (notes) {
      requestBody.notes = notes;
    }
    
    const response = await api.put(`/financial-pharmacy/collection-status/${requestId}`, requestBody);
    return response.data;
  } catch (error: any) {
    console.error('Error updating collection status:', error);
    throw new Error(error.response?.data?.message || 'فشل في تحديث حالة التحصيل');
  }
};

// تحديث حالة الطلب النهائية
export const updateOrderStatus = async (adminId: string, requestId: string, status: string, notes?: string) => {
  try {
    const response = await api.put(`/financial-pharmacy/order-status/${adminId}/${requestId}`, {
      status,
      ...(notes && { notes })
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating order status:', error);
    throw new Error(error.response?.data?.message || 'فشل في تحديث حالة الطلب');
  }
};

export const getSalesRepFinalOrders = async (AdminId: string, page: number = 1, limit: number = 10) => {
  const response = await api.get(`/pharmacy-requests/admin/all-final-orders`, {
    params: { page, limit }
  });
  return response.data;
};
export const getSalesRepOneFinalOrders = async ( salesRepId: string, page: number = 1, limit: number = 10) => {
  const response = await api.get(`/pharmacy-requests/sales-rep/${salesRepId}/final-orders`, {
    params: { page, limit }
  });
  return response.data;
};

// تصدير البيانات المالية إلى ملف Excel
export const exportFinancialData = async (adminId: string, filters?: FinancialFilters): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    
    // إضافة معرف الإدارة
    queryParams.append('adminId', adminId);
    
    // إضافة الفلاتر المتاحة
    if (filters?.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters?.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      queryParams.append('endDate', filters.endDate);
    }

    const response = await api.get(`/financial-pharmacy/export?${queryParams.toString()}`, {
      responseType: 'blob',
      timeout: 30000, // 30 ثانية timeout للتصدير
    });
    
    // التحقق من نوع المحتوى
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      // إذا كان الرد JSON، فهذا يعني وجود خطأ
      const text = await new Response(response.data).text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || 'فشل في تصدير البيانات المالية');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error exporting financial data:', error);
    
    // معالجة أنواع مختلفة من الأخطاء
    if (error.code === 'ECONNABORTED') {
      throw new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('لا توجد بيانات مالية للتصدير');
    }
    
    if (error.response?.status === 500) {
      throw new Error('خطأ في الخادم. يرجى المحاولة لاحقاً');
    }
    
    throw new Error(error.message || error.response?.data?.message || 'فشل في تصدير البيانات المالية');
  }
};