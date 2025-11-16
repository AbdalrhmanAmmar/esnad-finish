import { api } from './api';

export interface PharmacyRequestData {
  visitDate: string;
  pharmacy: string;
  draftDistribution: boolean;
  introductoryVisit: boolean;
  visitDetails?: {
    notes: string;
    visitImage?: File | string;
  };
  hasOrder: boolean;
  orderDetails?: Array<{
    product: string;
    quantity: number;
  }>;
  hasCollection: boolean;
  collectionDetails?: {
    amount: number;
    receiptNumber: string;
    receiptImage?: File | string;
  };
  additionalNotes?: string;
}

export interface PharmacyRequestResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const createPharmacyRequest = async (requestData: PharmacyRequestData): Promise<PharmacyRequestResponse> => {
  try {
    const formData = new FormData();
    
    // إضافة البيانات الأساسية
    formData.append('visitDate', requestData.visitDate);
    formData.append('pharmacy', requestData.pharmacy);
    formData.append('draftDistribution', requestData.draftDistribution.toString());
    formData.append('introductoryVisit', requestData.introductoryVisit.toString());
    formData.append('hasOrder', requestData.hasOrder.toString());
    formData.append('hasCollection', requestData.hasCollection.toString());
    
    if (requestData.additionalNotes) {
      formData.append('additionalNotes', requestData.additionalNotes);
    }
    
    // إضافة تفاصيل الزيارة التعريفية
    if (requestData.introductoryVisit && requestData.visitDetails) {
      formData.append('visitDetails[notes]', requestData.visitDetails.notes);
      if (requestData.visitDetails.visitImage instanceof File) {
        formData.append('visitImage', requestData.visitDetails.visitImage);
      }
    }
    
    // إضافة تفاصيل الطلبية
    if (requestData.hasOrder && requestData.orderDetails) {
      requestData.orderDetails.forEach((item, index) => {
        formData.append(`orderDetails[${index}][product]`, item.product);
        formData.append(`orderDetails[${index}][quantity]`, item.quantity.toString());
      });
    }
    
    // إضافة تفاصيل التحصيل
    if (requestData.hasCollection && requestData.collectionDetails) {
      formData.append('collectionDetails[amount]', requestData.collectionDetails.amount.toString());
      formData.append('collectionDetails[receiptNumber]', requestData.collectionDetails.receiptNumber);
      if (requestData.collectionDetails.receiptImage instanceof File) {
        formData.append('receiptImage', requestData.collectionDetails.receiptImage);
      }
    }
    
    const response = await api.post('/pharmacy-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating pharmacy request:', error);
    throw new Error(error.response?.data?.message || 'فشل في إنشاء طلب الصيدلية');
  }
};