// lib/api/doctors.ts
import api from './api';
import { useAuthStore } from '@/stores/authStore';

const DOCTORS_IMPORT_PATH = "/doctors/import";

export type GetDoctorsParams = {
  page?: number;
  limit?: number;
  city?: string;
  specialty?: string;
  brand?: string;
  search?: string;
};

// Import doctors file using axios
export const importDoctorsFile = async (file: File) => {
  try {
    // الحصول على معرف المستخدم المسجل
    const { user } = useAuthStore.getState();
    
    const formData = new FormData();
    formData.append('file', file);
    if (user?._id) {
      formData.append('adminId', user._id);
    }

    const response = await api.post(DOCTORS_IMPORT_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = response.data;
    console.log('Import doctors response:', result);

    if (result.success) {
      return {
        success: true,
        message: `تم رفع ملف الأطباء بنجاح. تم إدراج/تحديث ${result.insertedOrUpserted || 0} طبيب، وتحديث ${result.updated || 0} طبيب، وتجاهل ${result.skipped || 0} سجل.`
      };
    } else {
      return { success: false, message: result.message || 'فشل في رفع ملف الأطباء' };
    }
  } catch (error: any) {
    console.error('Error importing doctors file:', error);
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء رفع ملف الأطباء';
    return { success: false, message: errorMessage };
  }
};

// Get doctors using axios
export async function getDoctors(params: GetDoctorsParams = {}) {
  try {
    const response = await api.get('/doctors', {
      params: {
        page: params.page,
        limit: params.limit,
        city: params.city,
        specialty: params.specialty,
        brand: params.brand,
        search: params.search,
      }
    });

    return response.data as {
      success: boolean;
      data: any[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب بيانات الأطباء';
    throw new Error(errorMessage);
  }
}

// إضافة طبيب جديد
export interface AddDoctorData {
  drName: string;
  organizationType?: string;
  organizationName?: string;
  specialty?: string;
  subSpecialty?: string;
  classification?: string;
  potential?: string;
  decileSegment?: string;
  brickCode?: string;
  brickName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  workingDays?: string;
  workingHours?: string;
  notes?: string;
  telNumber?: string;
  profile?: string;
  district?: string;
  city: string;
  area?: string;
  brand: string;
  segment?: string;
  targetFrequency?: number;
  keyOpinionLeader?: boolean;
  teamProducts?: string;
  teamArea?: string;
}

export async function createDoctor(doctorData: AddDoctorData) {
  try {
    // الحصول على معرف المستخدم المسجل
    const { user } = useAuthStore.getState();
    
    const dataWithAdminId = {
      ...doctorData,
      adminId: user?._id
    };
    
    const response = await api.post('/doctors', dataWithAdminId);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم إضافة الطبيب بنجاح'
    };
  } catch (error: any) {
    console.error('Error adding doctor:', error);
    const errorMessage = error.response?.data?.message || 'فشل في إضافة الطبيب';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// تحديث طبيب موجود
export const updateDoctor = async (doctorId: string, doctorData: Partial<AddDoctorData>) => {
  try {
    const { user } = useAuthStore.getState();
    if (!user) {
      return {
        success: false,
        error: 'المستخدم غير مسجل الدخول'
      };
    }

    const response = await api.put(`/doctors/${doctorId}`, doctorData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'تم تحديث الطبيب بنجاح'
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'فشل في تحديث الطبيب'
      };
    }
  } catch (error: any) {
    console.error('Error updating doctor:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'حدث خطأ أثناء تحديث الطبيب'
    };
  }
};

// الحصول على بيانات طبيب واحد
export const getDoctorById = async (doctorId: string) => {
  try {
    console.log('Fetching doctor with ID:', doctorId);
    const response = await api.get(`/doctors/${doctorId}`);
    console.log('Doctor API response:', response.data);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'فشل في جلب بيانات الطبيب');
    }
  } catch (error: any) {
    console.error('Error fetching doctor:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// حذف طبيب
export const deleteDoctor = async (doctorId: string) => {
  try {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }

    const response = await api.delete(`/doctors/${doctorId}`);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'تم حذف الطبيب بنجاح'
      };
    } else {
      throw new Error(response.data.message || 'فشل في حذف الطبيب');
    }
  } catch (error: any) {
    console.error('Error deleting doctor:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'فشل في حذف الطبيب'
    };
  }
};

export const exportDoctors = async (params: GetDoctorsParams = {}) => {
  try {
    const response = await api.get('/doctors/export', {
      params: {
        city: params.city,
        specialty: params.specialty,
        brand: params.brand,
        search: params.search,
      },
      responseType: 'blob',
    });

    // إنشاء رابط تحميل الملف
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // تحديد اسم الملف
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'doctors.xlsx';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/); 
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'تم تصدير بيانات الأطباء بنجاح' };
  } catch (error: any) {
    console.error('Error exporting doctors:', error);
    const errorMessage = error.response?.data?.message || 'فشل في تصدير بيانات الأطباء';
    throw new Error(errorMessage);
  }
};

// جلب البيانات الشاملة للطبيب
export const getDoctorComprehensiveData = async (doctorId: string) => {
  try {
    const response = await api.get(`/doctor-card/${doctorId}/comprehensive-data`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching doctor comprehensive data:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب البيانات الشاملة للطبيب';
    throw new Error(errorMessage);
  }
};