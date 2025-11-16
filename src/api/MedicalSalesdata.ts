import api from './api';

// ==== Types for Medical Sales Data ====

export interface DoctorVisitProduct {
  productId?: string;
  productCode?: string;
  productName: string;
  brand?: string;
  company?: string;
  unitPrice?: number;
  messageId?: string;
  samplesCount: number;
}

export interface DoctorInfo {
  _id?: string;
  name?: string;
  specialty?: string;
  organizationName?: string;
  city?: string;
  area?: string;
}

export interface DoctorVisitSummary {
  _id: string;
  visitDate: string;
  status?: string;
  doctor: DoctorInfo;
  products: DoctorVisitProduct[];
  totalSamplesCount: number;
}

export interface ApprovedPharmacyOrderProduct {
  productId?: string;
  productCode?: string;
  productName: string;
  brand?: string;
  price?: number;
  quantity?: number;
  totalValue?: number;
}

export interface ApprovedPharmacyOrder {
  _id: string;
  orderId?: string;
  orderDate?: string;
  visitDate?: string;
  pharmacyName: string;
  salesRepName?: string;
  products: ApprovedPharmacyOrderProduct[];
  totalOrderValue: number;
}

export interface MedicalSalesGlobalStats {
  totalDoctorVisits: number;
  totalApprovedPharmacyOrders: number;
  totalSamplesDistributed: number;
  totalApprovedOrdersAmount: number;
}

export interface MedicalSalesPagination {
  currentPage: number;
  limit: number;
  totalSalesReps?: number;
  totalPages?: number;
}

export interface MedicalSalesDataResponse {
  success: boolean;
  data: {
    doctorVisits: DoctorVisitSummary[];
    approvedPharmacyOrders: ApprovedPharmacyOrder[];
    salesReps?: Array<{ _id: string; name: string; username: string }>;
    pagination?: MedicalSalesPagination;
    stats: MedicalSalesGlobalStats;
  };
  filters?: {
    startDate: string | null;
    endDate: string | null;
  };
}

export interface GetMedicalSalesDataParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ==== API Function ====
export const getMedicalSalesData = async (
  medicalRepId: string,
  params: GetMedicalSalesDataParams = {}
): Promise<MedicalSalesDataResponse> => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const url = `/medicalrep/sales-data/${medicalRepId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};