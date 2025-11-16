import api from './api';
import { useAuthStore } from '@/stores/authStore';

// Types
export interface ReceiptBook {
  _id: string;
  bookName: string;
  startNumber: number;
  endNumber: number;
  currentNumber: number;
  salesRep: {
    _id: string;
    name: string;
    username: string;
    email: string;
    role: string;
  };
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalesRep {
  _id: string;
  name?: string;
  username: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export interface SalesRepsResponse {
  success: boolean;
  message: string;
  data: SalesRep[];
  count: number;
}

export interface CreateReceiptBookData {
  bookName: string;
  startNumber: number;
  endNumber: number;
  salesRep: string;
  notes?: string;
}

export interface UpdateReceiptBookData {
  bookName?: string;
  startNumber?: number;
  endNumber?: number;
  salesRep?: string;
  notes?: string;
}

export interface GetReceiptBooksParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  salesRep?: string;
}

export interface ReceiptBooksResponse {
  success: boolean;
  data: ReceiptBook[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SingleReceiptBookResponse {
  success: boolean;
  data: ReceiptBook;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// إنشاء دفتر وصولات جديد
export async function createReceiptBook(data: CreateReceiptBookData) {
  try {
    const { user } = useAuthStore.getState();
    
    const dataWithAdminId = {
      ...data,
      adminId: user?._id
    };
    
    const response = await api.post('/receipt-books', dataWithAdminId);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم إنشاء دفتر الوصولات بنجاح'
    };
  } catch (error: any) {
    console.error('Error creating receipt book:', error);
    const errorMessage = error.response?.data?.message || 'فشل في إنشاء دفتر الوصولات';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// الحصول على جميع دفاتر الوصولات
export async function getAllReceiptBooks(params: GetReceiptBooksParams = {}) {
  try {
    const response = await api.get('/receipt-books', {
      params: {
        page: params.page,
        limit: params.limit,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
        search: params.search,
        isActive: params.isActive,
        salesRep: params.salesRep,
      }
    });

    return response.data as {
      success: boolean;
      meta: { 
        total: number; 
        page: number; 
        limit: number; 
        totalPages: number; 
        hasNextPage: boolean; 
        hasPrevPage: boolean; 
      };
      data: ReceiptBook[];
    };
  } catch (error: any) {
    console.error('Error fetching receipt books:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب بيانات دفاتر الوصولات';
    throw new Error(errorMessage);
  }
}

// الحصول على دفتر وصولات واحد
export async function getReceiptBookById(id: string) {
  try {
    const response = await api.get(`/receipt-books/${id}`);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم جلب بيانات دفتر الوصولات بنجاح'
    };
  } catch (error: any) {
    console.error('Error fetching receipt book:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب بيانات دفتر الوصولات';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// تحديث دفتر وصولات
export async function updateReceiptBook(id: string, data: UpdateReceiptBookData) {
  try {
    const { user } = useAuthStore.getState();
    
    const dataWithAdminId = {
      ...data,
      adminId: user?._id
    };
    
    const response = await api.put(`/receipt-books/${id}`, dataWithAdminId);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم تحديث دفتر الوصولات بنجاح'
    };
  } catch (error: any) {
    console.error('Error updating receipt book:', error);
    const errorMessage = error.response?.data?.message || 'فشل في تحديث دفتر الوصولات';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// حذف دفتر وصولات
export async function deleteReceiptBook(id: string) {
  try {
    const response = await api.delete(`/receipt-books/${id}`);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم حذف دفتر الوصولات بنجاح'
    };
  } catch (error: any) {
    console.error('Error deleting receipt book:', error);
    const errorMessage = error.response?.data?.message || 'فشل في حذف دفتر الوصولات';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// تغيير حالة دفتر الوصولات (تفعيل/إلغاء تفعيل)
export async function toggleReceiptBookStatus(id: string) {
  try {
    const response = await api.patch(`/receipt-books/${id}/toggle-status`);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم تغيير حالة دفتر الوصولات بنجاح'
    };
  } catch (error: any) {
    console.error('Error toggling receipt book status:', error);
    const errorMessage = error.response?.data?.message || 'فشل في تغيير حالة دفتر الوصولات';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// الحصول على دفاتر الوصولات لمندوب معين
export async function getReceiptBooksBySalesRep(salesRepId: string, params: GetReceiptBooksParams = {}) {
  try {
    const response = await api.get(`/receipt-books/sales-rep/${salesRepId}`, {
      params: {
        page: params.page,
        limit: params.limit,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
        search: params.search,
        isActive: params.isActive,
      }
    });

    return response.data as {
      success: boolean;
      meta: { 
        total: number; 
        page: number; 
        limit: number; 
        totalPages: number; 
        hasNextPage: boolean; 
        hasPrevPage: boolean; 
      };
      data: ReceiptBook[];
    };
  } catch (error: any) {
    console.error('Error fetching receipt books by sales rep:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب دفاتر الوصولات للمندوب';
    throw new Error(errorMessage);
  }
}

// الحصول على الرقم التالي المتاح في دفتر الوصولات
export const getNextReceiptNumber = async (bookId: string): Promise<{ success: boolean; nextNumber: number }> => {
  try {
    const response = await api.get(`/receipt-books/${bookId}/next-number`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// تحديث الرقم الحالي في دفتر الوصولات
export async function updateCurrentNumber(id: string, currentNumber: number) {
  try {
    const response = await api.patch(`/receipt-books/${id}/current-number`, { currentNumber });
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم تحديث الرقم الحالي بنجاح'
    };
  } catch (error: any) {
    console.error('Error updating current number:', error);
    const errorMessage = error.response?.data?.message || 'فشل في تحديث الرقم الحالي';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// إحصائيات دفاتر الوصولات
export async function getReceiptBooksStats() {
  try {
    const response = await api.get('/receipt-books/stats');
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم جلب الإحصائيات بنجاح'
    };
  } catch (error: any) {
    console.error('Error fetching receipt books stats:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب الإحصائيات';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// التحقق من توفر نطاق أرقام الوصولات
export async function checkNumberRangeAvailability(
  startNumber: number, 
  endNumber: number, 
  salesRepId: string, 
  excludeBookId?: string
) {
  try {
    const response = await api.post('/receipt-books/check-range', { 
      startNumber, 
      endNumber, 
      salesRep: salesRepId,
      excludeBookId 
    });
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم التحقق من توفر النطاق بنجاح'
    };
  } catch (error: any) {
    console.error('Error checking number range availability:', error);
    const errorMessage = error.response?.data?.message || 'فشل في التحقق من توفر النطاق';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// الحصول على الرقم التالي المتاح لمندوب معين
export async function getNextAvailableNumber(salesRepId: string) {
  try {
    const response = await api.get(`/receipt-books/next-number/${salesRepId}`);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم جلب الرقم التالي المتاح بنجاح'
    };
  } catch (error: any) {
    console.error('Error getting next available number:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب الرقم التالي المتاح';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// الحصول على جميع مندوبي المبيعات
export async function getAllSalesReps(): Promise<SalesRepsResponse> {
  try {
    const response = await api.get('/receipt-books/sales-reps/all');
    
    return {
      success: true,
      message: response.data.message || 'تم جلب مندوبي المبيعات بنجاح',
      data: response.data.data,
      count: response.data.count
    };
  } catch (error: any) {
    console.error('Error getting sales reps:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب مندوبي المبيعات';
    throw new Error(errorMessage);
  }
}

export default api;