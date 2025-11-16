import { api } from './api';

export interface SampleRequest {
  _id?: string;
  requestDate: string;
  deliveryDate: string;
  product: string;
  doctor: string;
  quantity: number;
  notes?: string;
  medicalRep?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'delivered';
  createdAt?: string;
  updatedAt?: string;
}

export interface SampleRequestResponse {
  success: boolean;
  message: string;
  data?: SampleRequest;
  error?: string;
  id?: string;
}

export interface SampleRequestsListResponse {
  success: boolean;
  message: string;
  data?: SampleRequest[];
  error?: string;
}

// Create a new sample request
export const createSampleRequest = async (requestData: Omit<SampleRequest, '_id' | 'medicalRep' | 'status' | 'createdAt' | 'updatedAt'>): Promise<SampleRequestResponse> => {
  try {
    const response = await api.post('/sample-requests', requestData);
    return {
      success: true,
      data: response.data,
      message: 'تم إرسال طلب العينة بنجاح'
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
  }
};

// Get all sample requests for the current medical rep
export const getSampleRequests = async (): Promise<SampleRequestsListResponse> => {
  try {
    const response = await api.get('/sample-requests');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في جلب طلبات العينات');
  }
};

// Get a specific sample request by ID
export const getSampleRequestById = async (id: string): Promise<SampleRequestResponse> => {
  try {
    const response = await api.get(`/sample-requests/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في جلب تفاصيل طلب العينة');
  }
};

// Update sample request status (for admins/supervisors)
export const updateSampleRequestStatus = async (id: string, status: 'approved' | 'rejected' | 'delivered'): Promise<SampleRequestResponse> => {
  try {
    const response = await api.patch(`/sample-requests/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في تحديث حالة طلب العينة');
  }
};

// Delete a sample request
export const deleteSampleRequest = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/sample-requests/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء حذف الطلب');
  }
};

// Update sample request status by supervisor
export const updateSampleRequestBySupervisor = async (
  supervisorId: string,
  requestId: string,
  status: 'approved' | 'cancelled',
  notes?: string
): Promise<SampleRequestResponse> => {
  try {
    console.log('API call - updateSampleRequestBySupervisor:', {
      supervisorId,
      requestId,
      status,
      notes,
      url: `/sample-requests/supervisor/${supervisorId}/${requestId}/status`
    });

    const response = await api.put(`/sample-requests/supervisor/${supervisorId}/${requestId}/status`, {
      status,
      notes
    });

    console.log('API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API error:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحديث حالة الطلب');
  }
};

// Supervisor Sample Requests Interfaces
export interface SupervisorSampleRequest {
  _id: string;
  requestDate: string;
  deliveryDate: string;
  product: {
    _id: string;
    PRODUCT: string;
  };
  doctor: {
    _id: string;
    drName: string;
  };
  quantity: number;
  status: 'pending' | 'approved' | 'cancelled';
  medicalRep: {
    _id: string;
    username: string;
  };
  notes?: string;
  daysUntilDelivery?: number;
  id: string;
}

export interface SupervisorSampleRequestsStats {
  pending: number;
  approved: number;
  cancelled: number;
}

export interface SupervisorSampleRequestsPagination {
  currentPage: number;
  totalPages: number;
  totalRequests: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SupervisorSampleRequestsResponse {
  success: boolean;
  data: SupervisorSampleRequest[];
  pagination: SupervisorSampleRequestsPagination;
  stats: SupervisorSampleRequestsStats;
  medicalRepsCount: number;
}

export interface GetSupervisorSampleRequestsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'cancelled';
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Get supervisor sample requests
export const getSupervisorSampleRequests = async (
  supervisorId: string,
  params?: GetSupervisorSampleRequestsParams
): Promise<SupervisorSampleRequestsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/sample-requests/supervisor/${supervisorId}/requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching supervisor sample requests:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sample requests');
  }
};

// Export sample requests to Excel
export const exportSupervisorSampleRequestsToExcel = async (
  supervisorId: string,
  params?: Omit<GetSupervisorSampleRequestsParams, 'page' | 'limit'>
): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/sample-requests/supervisor/${supervisorId}/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting supervisor sample requests:', error);
    throw new Error(error.response?.data?.message || 'Failed to export sample requests');
  }
};

// Admin Sample Requests Types and Functions
export interface AdminSampleRequest {
  _id: string;
  requestDate: string;
  deliveryDate: string;
  product: {
    _id: string;
    PRODUCT: string;
  };
  doctor: {
    _id: string;
    drName: string;
  };
  quantity: number;
  status: 'pending' | 'approved' | 'cancelled';
  medicalRep: {
    _id: string;
    username: string;
  };
  notes?: string;
  id: string;
}

export interface AdminSampleRequestsStats {
  pending: number;
  approved: number;
  cancelled: number;
}

export interface AdminSampleRequestsPagination {
  currentPage: number;
  totalPages: number;
  totalRequests: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminSampleRequestsResponse {
  success: boolean;
  data: AdminSampleRequest[];
  pagination: AdminSampleRequestsPagination;
  stats: AdminSampleRequestsStats;
}

export interface GetAdminSampleRequestsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'cancelled';
  medicalRep?: string;
  doctor?: string;
  product?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const getAdminSampleRequests = async (
  adminId: string,
  params?: GetAdminSampleRequestsParams
): Promise<AdminSampleRequestsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.medicalRep) queryParams.append('medicalRep', params.medicalRep);
    if (params?.doctor) queryParams.append('doctor', params.doctor);
    if (params?.product) queryParams.append('product', params.product);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/sample-requests/admin/${adminId}/requests/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching admin sample requests:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sample requests');
  }
};

export const exportAdminSampleRequestsToExcel = async (
  adminId: string,
  params?: Omit<GetAdminSampleRequestsParams, 'page' | 'limit'>
): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.medicalRep) queryParams.append('medicalRep', params.medicalRep);
    if (params?.doctor) queryParams.append('doctor', params.doctor);
    if (params?.product) queryParams.append('product', params.product);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/admin/${adminId}/sample-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting admin sample requests:', error);
    throw new Error(error.response?.data?.message || 'Failed to export sample requests');
  }
};



// User Sample Requests Types and Functions
export interface UserSampleRequest {
  _id: string;
  requestDate: string;
  deliveryDate: string;
  product: {
    _id: string;
    PRODUCT: string;
    CODE?: string;
    BRAND?: string;
    PRICE?: number;
    COMPANY?: string;
  };
  doctor: {
    _id: string;
    drName: string;
    organizationName?: string;
    specialty?: string;
    telNumber?: string;
    city?: string;
    area?: string;
    district?: string;
  };
  quantity: number;
  status: 'pending' | 'approved' | 'cancelled';
  medicalRep?: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  adminId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  id: string;
}

export interface UserSampleRequestsStats {
  pending: number;
  approved: number;
  cancelled: number;
  total: number;
}

export interface UserSampleRequestsPagination {
  currentPage: number;
  totalPages: number;
  totalRequests: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserInfo {
  id: string;
  name: string;
  username: string;
  role: string;
}

export interface UserSampleRequestsResponse {
  success: boolean;
  message: string;
  data: UserSampleRequest[];
  userInfo: UserInfo;
  pagination: UserSampleRequestsPagination;
  stats: UserSampleRequestsStats & {
    medicalRepsCount?: number;
  };
}

export interface GetUserSampleRequestsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'cancelled';
  doctor?: string;
  product?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Get sample requests by user ID
export const getSampleRequestsByUserId = async (
  userId: string,
  params?: GetUserSampleRequestsParams
): Promise<UserSampleRequestsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.doctor) queryParams.append('doctor', params.doctor);
    if (params?.product) queryParams.append('product', params.product);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/sample-requests/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user sample requests:', error);
    throw new Error(error.response?.data?.message || 'فشل في جلب طلبات العينات للمستخدم');
  }
};

// Export user sample requests to Excel
export const exportUserSampleRequestsToExcel = async (
  userId: string,
  params?: Omit<GetUserSampleRequestsParams, 'page' | 'limit'>
): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.doctor) queryParams.append('doctor', params.doctor);
    if (params?.product) queryParams.append('product', params.product);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/sample-requests/user/${userId}/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting user sample requests:', error);
    throw new Error(error.response?.data?.message || 'فشل في تصدير طلبات العينات');
  }
};