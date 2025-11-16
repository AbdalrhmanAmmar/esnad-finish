import { api } from './api';

// Interface for marketing activity request
export interface MarketingActivityRequest {
  _id: string;
  activityType: {
    _id: string;
    name: string;
    nameAr: string;
    description?: string;
    descriptionAr?: string;
  };
  doctor: {
    _id: string;
    drName: string;
    specialty: string;
    organizationName: string;
    telNumber?: string;
    city: string;
    area: string;
    district?: string;
  };
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  statusAr: string;
  notes?: string;
  cost?: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
  };
  adminId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface for request parameters
export interface MarketingActivityRequestParams {
  page?: number;
  limit?: number;
  status?: string;
  activityType?: string;
  doctor?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Interface for response
export interface MarketingActivityRequestResponse {
  success: boolean;
  data: {
    requests: MarketingActivityRequest[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      limit: number;
    };
    stats: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
      totalCost: number;
      medicalRepsCount?: number;
    };
  };
  message?: string;
}

// Interfaces for User Marketing Activity Requests Report
export interface UserMarketingActivityRequest {
  _id: string;
  activityDate: string;
  activityType: {
    _id: string;
  };
  doctor: {
    _id: string;
    city: string;
    drName: string;
    organizationName: string;
    area: string;
    district: string;
    specialty: string;
    telNumber: string;
  };
  cost: number;
  notes: string;
  adminId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdBy: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  statusAr: string;
  formattedRequestDate: string;
  formattedActivityDate: string;
}

export interface UserMarketingActivityRequestsPagination {
  currentPage: number;
  totalPages: number;
  totalRequests: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserMarketingActivityRequestsStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  totalCost: number;
}

export interface UserMarketingActivityRequestsUserInfo {
  id: string;
  name: string;
  username: string;
  role: string;
}

export interface UserMarketingActivityRequestsResponse {
  success: boolean;
  message: string;
  userInfo: UserMarketingActivityRequestsUserInfo;
  data: UserMarketingActivityRequest[];
  pagination: UserMarketingActivityRequestsPagination;
  stats: UserMarketingActivityRequestsStats;
}

export interface GetUserMarketingActivityRequestsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
  doctor?: string;
  activityType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Get marketing activity requests by user ID
export const getMarketingActivityRequestsByUserId = async (
  userId: string,
  params?: GetUserMarketingActivityRequestsParams
): Promise<UserMarketingActivityRequestsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.doctor) queryParams.append('doctor', params.doctor);
  if (params?.activityType) queryParams.append('activityType', params.activityType);

  const response = await api.get(`/marketing-activity-requests/user/${userId}?${queryParams.toString()}`);
  return response.data;
};

// Create new marketing activity request
export const createMarketingActivityRequest = async (requestData: {
  activityType: string;
  doctor: string;
  requestDate: string;
  notes?: string;
  cost?: number;
}): Promise<{ success: boolean; data: MarketingActivityRequest; message: string }> => {
  try {
    const response = await api.post('/marketing/medical-rep', requestData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء طلب النشاط التسويقي');
  }
};

// Update marketing activity request status
export const updateMarketingActivityRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<{ success: boolean; data: MarketingActivityRequest; message: string }> => {
  try {
    const response = await api.patch(`/marketing/medical-rep/${requestId}/status`, {
      status,
      notes
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحديث حالة الطلب');
  }
};

// Delete marketing activity request
export const deleteMarketingActivityRequest = async (requestId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/marketing/medical-rep/${requestId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء حذف الطلب');
  }
};

// Get marketing activity request by ID
export const getMarketingActivityRequestById = async (requestId: string): Promise<{ success: boolean; data: MarketingActivityRequest }> => {
  try {
    const response = await api.get(`/marketing/medical-rep/${requestId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب تفاصيل الطلب');
  }
};

// Export marketing activity requests to Excel
export const exportMarketingActivityRequestsToExcel = async (
  userId: string,
  params?: GetUserMarketingActivityRequestsParams
): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.doctor) queryParams.append('doctor', params.doctor);
  if (params?.activityType) queryParams.append('activityType', params.activityType);

  const response = await api.get(`/marketing-activity-requests/user/${userId}/export?${queryParams.toString()}`, {
    responseType: 'blob',
  });
  
  return response.data;
};