import { api } from './api';

export interface ProductSearchResponse {
  success: boolean;
  message: string;
  data: {
    productInfo: {
      id: string;
      name: string;
      code: string;
      category: string;
    };
    visitDoctorForms: {
      visitId: string;
      visitDate: string;
      medicalRep: {
        name: string;
      };
      doctor: {
        name: string;
        specialty: string;
        brand: string;
        city: string;
        area: string;
      };
      product: {
        name: string;
        samplesCount: number;
        messageId: string;
      };
      notes: string;
      status: string;
    }[];
    simpleFormRequests: {
      requestId: string;
      requestDate: string;
      deliveryDate: string;
      medicalRep: {
        name: string;
      };
      doctor: {
        name: string;
        specialty: string;
        city: string;
        area: string;
      };
      product: {
        name: string;
        quantity: number;
      };
      status: string;
      notes: string;
    }[];
    pharmacyVisitRequests: {
      requestId: string;
      visitDate: string;
      medicalRep: {
        name: string;
      };
      pharmacy: {
        name: string;
        city: string;
        area: string;
      };
      product: {
        name: string;
        quantity: number;
      };
      orderStatus: string;
      finalOrderStatus: string;
      hasCollection: boolean;
      collectionAmount: number;
      notes: string;
    }[];
    summary: {
      totalDoctorVisits: number;
      totalSimpleRequests: number;
      totalPharmacyRequests: number;
      totalSamples: number;
      totalQuantityRequested: number;
    };
  };
}

/**
 * البحث عن منتج بالكود وإرجاع جميع البيانات المرتبطة به
 * @param productCode - كود المنتج للبحث عنه
 * @returns Promise<ProductSearchResponse> - بيانات المنتج والأنشطة المرتبطة به
 */
export const searchByProductCode = async (productCode: string): Promise<ProductSearchResponse> => {
  try {
    if (!productCode?.trim()) {
      throw new Error('كود المنتج مطلوب');
    }

    const response = await api.get(`/automation/product-search?productCode=${encodeURIComponent(productCode)}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ في البحث عن المنتج');
  }
};

/**
 * البحث عن أسماء المنتجات للاقتراحات التلقائية
 * @param query - النص المراد البحث عنه
 * @returns Promise<string[]> - قائمة بأسماء المنتجات المطابقة
 */
export const searchProductsByName = async (query: string): Promise<string[]> => {
  try {
    if (!query?.trim()) {
      return [];
    }

    const response = await api.get(`/product-automation/products/search?q=${encodeURIComponent(query)}`);
    return response.data.products || [];
  } catch (error) {
    return [];
  }
};