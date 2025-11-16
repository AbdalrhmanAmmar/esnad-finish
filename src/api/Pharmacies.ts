// lib/api/pharmacies.ts
import api from './api';
import { useAuthStore } from '@/stores/authStore';

const PHARMACIES_IMPORT_PATH = "/pharmacies/import";

export type GetPharmaciesParams = {
  page?: number;
  limit?: number;
  city?: string;
  area?: string;
  district?: string;
  search?: string;
};

// Import pharmacies file using axios
export const importPharmaciesFile = async (file: File) => {
  try {
    // الحصول على معرف المستخدم المسجل
    const { user } = useAuthStore.getState();
    
    const formData = new FormData();
    formData.append('file', file);
    if (user?._id) {
      formData.append('adminId', user._id);
    }

    const response = await api.post(PHARMACIES_IMPORT_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = response.data;
    console.log('Import pharmacies response:', result);

    if (result.success) {
      return {
        success: true,
        message: `تم رفع ملف الصيدليات بنجاح. تم إدراج/تحديث ${result.insertedOrUpserted || 0} صيدلية، وتحديث ${result.updated || 0} صيدلية، وتجاهل ${result.skipped || 0} سجل.`
      };
    } else {
      return { success: false, message: result.message || 'فشل في رفع ملف الصيدليات' };
    }
  } catch (error: any) {
    console.error('Error importing pharmacies file:', error);
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء رفع ملف الصيدليات';
    return { success: false, message: errorMessage };
  }
};

export async function getPharmacies(params: GetPharmaciesParams = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/pharmacies?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    throw error;
  }
}

export interface AddPharmacyData {
  customerSystemDescription: string;
  area: string;
  city: string;
  district: string;
  adminId?: string;
}

export async function createPharmacy(pharmacyData: AddPharmacyData) {
  try {
    const response = await api.post('/pharmacies', pharmacyData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating pharmacy:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'حدث خطأ أثناء إنشاء الصيدلية'
    );
  }
}

export const updatePharmacy = async (pharmacyId: string, pharmacyData: Partial<AddPharmacyData>) => {
  try {
    const response = await api.put(`/pharmacies/${pharmacyId}`, pharmacyData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating pharmacy:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'حدث خطأ أثناء تحديث الصيدلية'
    );
  }
};

export const getPharmacyById = async (pharmacyId: string) => {
  try {
    const response = await api.get(`/pharmacies/${pharmacyId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pharmacy:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'حدث خطأ أثناء جلب بيانات الصيدلية'
    );
  }
};

export const exportPharmacies = async (params: GetPharmaciesParams = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/pharmacies/export/excel?${queryParams.toString()}`, {
      responseType: 'blob',
    });

    // إنشاء رابط التحميل
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmacies_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'تم تصدير ملف الصيدليات بنجاح' };
  } catch (error: any) {
    console.error('Error exporting pharmacies:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'حدث خطأ أثناء تصدير ملف الصيدليات'
    );
  }
};