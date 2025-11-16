// lib/api/products.ts
import api from './api';
import { useAuthStore } from '@/stores/authStore';

export type GetProductsParams = {
  page?: number;
  limit?: number;
  sortField?: string;   // مثال: "CODE" أو "createdAt"
  sortOrder?: "asc" | "desc";
  brand?: string;
  company?: string;
  type?: string;        // PRODUCT_TYPE
  q?: string;           // للبحث النصّي لو ضفته لاحقًا
};

export async function getProducts(params: GetProductsParams = {}) {
  try {
    const response = await api.get('/products', {
      params: {
        page: params.page,
        limit: params.limit,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
        brand: params.brand,
        company: params.company,
        type: params.type,
        q: params.q,
      }
    });

    return response.data as {
      success: boolean;
      meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean; };
      data: any[];
    };
  } catch (error: any) {
    console.error('Error fetching products:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب بيانات المنتجات';
    throw new Error(errorMessage);
  }
}

export interface AddProductData {

  _id?:string

  CODE: string;
  PRODUCT: string;
  PRODUCT_TYPE: string;
  BRAND: string;
  TEAM: string;
  teamProducts: string;
  COMPANY: string;
  messages?: Array<{text: string; lang?: string}>; // الرسائل الثلاث للمنتج
}

export async function addProduct(productData: AddProductData) {
  try {
    // الحصول على معرف المستخدم المسجل
    const { user } = useAuthStore.getState();
    
    const dataWithAdminId = {
      ...productData,
      adminId: user?._id
    };
    
    console.log('Final data with adminId:', dataWithAdminId);
    console.log('User from auth store:', user);
    
    const response = await api.post('/products', dataWithAdminId);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم إضافة المنتج بنجاح'
    };
  } catch (error: any) {
    console.error('Error adding product:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    const errorMessage = error.response?.data?.message || 'فشل في إضافة المنتج';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

export async function updateProduct(code: string, productData: AddProductData) {
  try {
    // الحصول على معرف المستخدم المسجل
    const { user } = useAuthStore.getState();
    
    const dataWithAdminId = {
      ...productData,
      adminId: user?._id
    };
    
    const response = await api.put(`/products/code/${code}`, dataWithAdminId);

    return {
      success: true,
      message: response.data.message || 'تم تحديث المنتج بنجاح',
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Error updating product:', error);
    const errorMessage = error.response?.data?.message || 'فشل في تحديث المنتج';
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const deleteProduct = async (code: string) => {
  try {
    const response = await api.delete(`/products/code/${encodeURIComponent(code)}`);

    return {
      success: true,
      message: response.data.message || 'تم حذف المنتج بنجاح',
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    const errorMessage = error.response?.data?.message || 'فشل في حذف المنتج';
    return {
      success: false,
      error: errorMessage
    };
  }
};

export async function deleteProductById(id: string) {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting product:", error);
    throw new Error(error.response?.data?.message || "Failed to delete product");
  }
}




const IMPORT_PATH = "/products/import"; // change if your route is '/produt/import'
const MESSAGES_IMPORT_PATH = "/products/messages/import"; // مسار رفع ملفات رسائل المنتجات


export async function importProductMessages(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(MESSAGES_IMPORT_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;

    if (data.success) {
      return {
        success: true,
        message: data.message || 'تم رفع ملف رسائل المنتجات بنجاح',
        data: {
          groups: data.groups,
          updated: data.updated,
          notFoundCount: data.notFoundCount
        }
      };
    } else {
      return {
        success: false,
        error: data.message || 'فشل في رفع ملف رسائل المنتجات'
      };
    }
  } catch (error: any) {
    console.error('Error importing product messages:', error);
    const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ غير معروف';
    return {
      success: false,
      error: errorMessage
    };
  }
}



// Import users file
export async function importUsersFile(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = response.data;
    console.log('Import users response:', result);

    if (result.success) {
      return {
        success: true,
        message: `تم رفع ملف المستخدمين بنجاح. تم إدراج/تحديث ${result.insertedOrUpserted || 0} مستخدم، وتحديث ${result.updated || 0} مستخدم، وتجاهل ${result.skipped || 0} سجل.`
      };
    } else {
      return { success: false, message: result.message || 'فشل في رفع ملف المستخدمين' };
    }
  } catch (error: any) {
    console.error('Error importing users file:', error);
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء رفع ملف المستخدمين';
    return { success: false, message: errorMessage };
  }
}

// تصدير المنتجات كملف Excel
export async function exportProducts(params: GetProductsParams = {}) {
  try {
    const response = await api.get('/products/export', {
      params: {
        brand: params.brand,
        company: params.company,
        type: params.type,
      },
      responseType: 'blob', // مهم لتحميل الملفات
    });

    // إنشاء URL للملف وتحميله
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // تحديد اسم الملف
    const filename = `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.setAttribute('download', filename);
    
    // تحميل الملف
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'تم تصدير المنتجات بنجاح'
    };
  } catch (error: any) {
    console.error('Error exporting products:', error);
    throw new Error(error.response?.data?.message || 'Failed to export products');
  }
}

export async function importProductsFile(file) {
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    return { success: false, error: "Only .xlsx, .xls, or .csv files are allowed." };
    }

  const form = new FormData();
  form.append("file", file);

  try {
    const response = await api.post(IMPORT_PATH, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error importing products file:', error);
    const errorMessage = error.response?.data?.message || error.message || "Network error";
    return { success: false, error: errorMessage };
  }
}