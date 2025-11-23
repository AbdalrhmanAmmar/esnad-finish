import api from './api';

// Interfaces
export interface VisitProduct {
  productId: string;
  messageId: string;
  samplesCount: number;
}

export interface CreateVisitRequest {
  visitDate: string;
  doctorId: string;
  products: VisitProduct[];
  notes?: string;
  withSupervisor: boolean;
  supervisorId?: string;
}

export interface VisitResponse {
  _id: string;
  medicalRepId: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  adminId: string;
  visitDate: string;
  doctorId: {
    _id: string;
    drName: string;
    specialization: string;
    phone: string;
    organizationName: string;
  };
  products: {
    productId: {
      _id: string;
      CODE: string;
      PRODUCT: string;
      BRAND: string;
      messages: any[];
    };
    messageId: string;
    _id: string;
  }[];
  notes: string;
  withSupervisor: boolean;
  supervisorId?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Detailed Visits Interfaces
export interface DetailedVisitProduct {
  productId: {
    _id: string;
    CODE: string;
    PRODUCT: string;
    BRAND: string;
    COMPANY: string;
  };
  samplesCount: number;
}

export interface DetailedVisitDoctor {
  _id: string;
  drName: string;
  specialty: string;
  organizationName: string;
  organizationType: string;
  telNumber: string;
  profile: string;
  district: string;
  city: string;
  area: string;
  brand: string;
  segment: string;
  targetFrequency: number;
  keyOpinionLeader: boolean;
  teamProducts: string;
  teamArea: string;
}

export interface DetailedVisitMedicalRep {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  teamArea: string;
  teamProducts: string;
}

export interface DetailedVisit {
  _id: string;
  medicalRepId: DetailedVisitMedicalRep;
  adminId: string;
  visitDate: string;
  doctorId: DetailedVisitDoctor;
  products: DetailedVisitProduct[];
  notes: string;
  withSupervisor: boolean;
  supervisorId?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitStatistics {
  totalVisits: number;
  uniqueDoctorsVisited: number;
  totalSamplesDistributed: number;
}

export interface VisitFilters {
  applied: {
    dateRange: {
      startDate: string | null;
      endDate: string | null;
    };
    doctorName: string | null;
    specialization: string | null;
    segment: string | null;
    clinic: string | null;
    brand: string | null;
    products: string | null;
  };
}

export interface VisitPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DetailedVisitsResponse {
  visits: DetailedVisit[];
  pagination: VisitPagination;
  statistics: VisitStatistics;
  filters: VisitFilters;
}

export interface DetailedVisitsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  doctorName?: string;
  specialization?: string;
  segment?: string;
  clinic?: string;
  brand?: string;
  products?: string | string[];
}

// Supervisor visits interfaces - Updated to match new API response
export interface SupervisorVisitProduct {
  productId: string;
  productName: string;
  productCode: string;
  brand: string;
  messageId: string;
  samplesCount: number;
}

export interface SupervisorVisitDoctor {
  _id: string;
  name: string;
  organizationName: string;
  city: string;
}

export interface SupervisorVisitMedicalRep {
  _id: string;
  name: string;
  username: string;
}

export interface SupervisorVisit {
  _id: string;
  visitDate: string;
  doctor: SupervisorVisitDoctor;
  medicalRep: SupervisorVisitMedicalRep;
  products: SupervisorVisitProduct[];
  notes?: string;
  withSupervisor: boolean;
  supervisorInfo?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SupervisorVisitsPagination {
  currentPage: number;
  totalPages: number;
  totalVisits: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SupervisorInfo {
  id: string;
  name: string;
  teamSize: number;
}

export interface SupervisorVisitsResponse {
  visits: SupervisorVisit[];
  pagination: SupervisorVisitsPagination;
  supervisor: SupervisorInfo;
}

export interface GetVisitsBySupervisorParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  doctorName?: string;
  medicalRepName?: string;
  withSupervisor?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Functions
// export const createVisit = async (medicalRepId: string, visitData: CreateVisitRequest): Promise<ApiResponse<VisitResponse>> => {
//   try {
//     const response = await api.post(`/visit-forms/medical-rep/${medicalRepId}/visits`, visitData);
//     return response.data;
//   } catch (error: any) {
//     throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الزيارة');
//   }
// };
export const createVisit = async (medicalRepId: string, visitData) => {
  try {
    const response = await api.post(`/visit-forms/medical-rep/${medicalRepId}/visits`, visitData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الزيارة');
  }
};

export const getVisits = async (medicalRepId: string): Promise<ApiResponse<VisitResponse[]>> => {
  try {
    const response = await api.get(`/medical-rep/${medicalRepId}/visits`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب الزيارات');
  }
};

export const getVisitById = async (medicalRepId: string, visitId: string): Promise<ApiResponse<VisitResponse>> => {
  try {
    const response = await api.get(`/medical-rep/${medicalRepId}/visits/${visitId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب الزيارة');
  }
};

export const updateVisit = async (medicalRepId: string, visitId: string, visitData: Partial<CreateVisitRequest>): Promise<ApiResponse<VisitResponse>> => {
  try {
    const response = await api.put(`/medical-rep/${medicalRepId}/visits/${visitId}`, visitData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحديث الزيارة');
  }
};

export const deleteVisit = async (medicalRepId: string, visitId: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete(`/medical-rep/${medicalRepId}/visits/${visitId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء حذف الزيارة');
  }
};

export const getDetailedVisits = async (medicalRepId: string, params?: DetailedVisitsParams): Promise<ApiResponse<DetailedVisitsResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/visit-forms/medical-rep/${medicalRepId}/detailed-visits${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب الزيارات التفصيلية');
  }
};

export const exportVisitsToExcel = async (medicalRepId: string, params?: DetailedVisitsParams): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.doctorName) queryParams.append('doctorName', params.doctorName);
  if (params?.specialization) queryParams.append('specialization', params.specialization);
  if (params?.segment) queryParams.append('segment', params.segment);
  if (params?.clinic) queryParams.append('clinic', params.clinic);
  if (params?.brand) queryParams.append('brand', params.brand);
  if (params?.products) {
    if (Array.isArray(params.products)) {
      params.products.forEach(product => queryParams.append('products', product));
    } else {
      queryParams.append('products', params.products);
    }
  }

  const response = await api.get(`/visits/${medicalRepId}/export?${queryParams.toString()}`, {
    responseType: 'blob'
  });
  
  return response.data;
};

// Get visits by supervisor
export const getVisitsBySupervisor = async (supervisorId: string, params?: GetVisitsBySupervisorParams): Promise<ApiResponse<SupervisorVisitsResponse>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.doctorName) queryParams.append('doctorName', params.doctorName);
  if (params?.medicalRepName) queryParams.append('medicalRepName', params.medicalRepName);
  if (params?.withSupervisor !== undefined) queryParams.append('withSupervisor', params.withSupervisor.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await api.get(`/visit-forms/supervisor/${supervisorId}/visits?${queryParams.toString()}`);
  return response.data;
};

// Visit Analytics Interfaces
export interface VisitAnalyticsData {
  visitsByDay: Array<{ day: string; label: string; visits: number; percentage: number }>;
  visitsByDoctor: Array<{ name: string; label: string; visits: number; specialty: string; percentage: number }>;
  visitsByArea: Array<{ name: string; label: string; visits: number; percentage: number }>;
  visitsByProduct: Array<{ name: string; label: string; visits: number; category: string; percentage: number }>;
  visitsByClinic: Array<{ name: string; label: string; visits: number; area: string; percentage: number }>;
  visitsByTime: Array<{ time: string; label: string; visits: number; percentage: number }>;
  doctorClassifications: Array<{ category: string; count: number; percentage: number; color: string }>;
  recentVisits: Array<{
    id: number;
    doctor: string;
    clinic: string;
    date: string;
    time: string;
    product: string;
    status: string;
  }>;
}

// Get visit analytics for medical rep
export const getVisitAnalytics = async (medicalRepId: string, params?: {
  startDate?: string;
  endDate?: string;
  area?: string;
  doctor?: string;
  product?: string;
  clinic?: string;
}): Promise<ApiResponse<VisitAnalyticsData>> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.area) queryParams.append('area', params.area);
    if (params?.doctor) queryParams.append('doctor', params.doctor);
    if (params?.product) queryParams.append('product', params.product);
    if (params?.clinic) queryParams.append('clinic', params.clinic);

    const queryString = queryParams.toString();
    const url = `/visit-forms/medical-rep/${medicalRepId}/analytics${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching visit analytics:', error);
    throw new Error(error.response?.data?.message || 'فشل في جلب تحليلات الزيارات');
  }
};