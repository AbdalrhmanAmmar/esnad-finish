import api from './api';

export interface CreateAdminData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export interface AdminResponse {
  success: boolean;
  message: string;
  admin?: {
    id: string;
    username: string;
    role: string;
  };
}

export const createAdmin = async (adminData: CreateAdminData): Promise<AdminResponse> => {
  try {
    const response = await api.post('/setup/create-admin', adminData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// Interface for admin list item
export interface AdminListItem {
  id: string;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  status: string;
  roleDisplay: string;
}

// Interface for pagination
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

// Interface for statistics
export interface Statistics {
  total: number;
  byRole: {
    [key: string]: {
      total: number;
      active: number;
      inactive: number;
    };
  };
}

// Interface for filters
export interface Filters {
  applied: {
    role?: string;
    isActive?: string;
    search?: string;
  };
  available: {
    roles: string[];
    status: boolean[];
  };
}

// Interface for getAllAdmins response
export interface GetAllAdminsResponse {
  success: boolean;
  message: string;
  data: {
    admins: AdminListItem[];
    pagination: Pagination;
    statistics: Statistics;
    filters: Filters;
  };
}

// Interface for getAllAdmins query parameters
export interface GetAllAdminsParams {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export const getAllAdmins = async (params?: GetAllAdminsParams): Promise<GetAllAdminsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/setup/all-admins?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في جلب بيانات المديرين');
  }
};

// Interface for export params
export interface ExportAdminsParams {
  role?: string;
  isActive?: boolean;
}

// Export admins to Excel
export const exportAdminsToExcel = async (params?: ExportAdminsParams): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const response = await api.get(`/setup/export-excel?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في تصدير البيانات');
  }
};

// Interface for update admin status
export interface UpdateAdminStatusData {
  adminId: string;
  isActive: boolean;
}

export interface UpdateAdminStatusResponse {
  success: boolean;
  message: string;
  admin?: {
    id: string;
    isActive: boolean;
  };
}

// Update admin status
export const updateAdminStatus = async (data: UpdateAdminStatusData): Promise<UpdateAdminStatusResponse> => {
  try {
    const response = await api.patch(`/setup/update-admin-status/${data.adminId}`, {
      isActive: data.isActive
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('فشل في تحديث حالة المدير');
  }
};

// Interface for employee/user data
export interface Employee {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  teamArea: string;
  teamProducts: string;
  city?: string;
  district?: string;
  area: string[];
  adminId: string;
  supervisor?: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// Interface for employees pagination
export interface EmployeesPagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Interface for role statistics
export interface RoleStats {
  _id: string;
  count: number;
}

// Interface for employees response
export interface GetEmployeesByAdminResponse {
  success: boolean;
  data: {
    users: Employee[];
    pagination: EmployeesPagination;
    stats: {
      totalUsers: number;
      roleDistribution: RoleStats[];
    };
  };
}

// Interface for employees query parameters
export interface GetEmployeesByAdminParams {
  adminId: string;
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  teamProducts?: string;
  teamArea?: string;
  city?: string;
  district?: string;
}

// Get all employees by admin
export const getEmployeesByAdmin = async (params: GetEmployeesByAdminParams): Promise<GetEmployeesByAdminResponse> => {
  try {
    const { adminId, ...queryParams } = params;
    const response = await api.get(`/users/admin/${adminId}`, {
      params: queryParams
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('حدث خطأ في جلب بيانات الموظفين');
  }
};

// إنشاء موظف جديد
export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: string;
  teamProducts?: string;
  teamArea?: string;
  area?: string[];
  city?: string;
  district?: string;
  adminId: string;
  supervisor?: string;
}

export interface CreateEmployeeResponse {
  success: boolean;
  message: string;
  data?: Employee;
}

export const createEmployee = async (employeeData: CreateEmployeeData): Promise<CreateEmployeeResponse> => {
  try {
    const response = await api.post('/users', employeeData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'حدث خطأ أثناء إنشاء الموظف');
    }
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// Update Employee Interfaces
export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  teamProducts?: string;
  teamArea?: string;
  area?: string[];
  city?: string;
  district?: string;
  isActive?: boolean;
}

export interface UpdateEmployeeResponse {
  success: boolean;
  message: string;
  data?: Employee;
}

// Delete Employee Response Interface
export interface DeleteEmployeeResponse {
  success: boolean;
  message: string;
  deletedUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  subordinatesCount?: number;
}

// Update Employee Function
export const updateEmployee = async (id: string, data: UpdateEmployeeData): Promise<UpdateEmployeeResponse> => {
  try {
    console.log('Updating employee:', { id, data });
    console.log('API Base URL:', api.defaults.baseURL);
    const response = await api.put(`/users/${id}`, data);
    console.log('Employee update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating employee:', {
      id,
      data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    // Provide more specific error messages
    if (error.response?.status === 404) {
      throw new Error(`الموظف غير موجود أو تم حذفه (ID: ${id})`);
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'بيانات غير صحيحة');
    } else if (error.response?.status === 500) {
      throw new Error('خطأ في الخادم - يرجى المحاولة لاحقاً');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('خطأ في الاتصال بالخادم - تحقق من الاتصال بالإنترنت');
    }
    
    throw error;
  }
};

// Delete Employee Function
export const deleteEmployee = async (id: string): Promise<DeleteEmployeeResponse> => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Get Employee By ID Function
export const getEmployeeById = async (id: string): Promise<{ success: boolean; data: Employee; message?: string }> => {
  try {
    console.log('Fetching employee with ID:', id);
    console.log('API Base URL:', api.defaults.baseURL);
    const response = await api.get(`/users/${id}`);
    console.log('Employee fetch response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching employee:', {
      id,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    // Provide more specific error messages
    if (error.response?.status === 404) {
      throw new Error(`الموظف غير موجود أو تم حذفه (ID: ${id})`);
    } else if (error.response?.status === 500) {
      throw new Error('خطأ في الخادم - يرجى المحاولة لاحقاً');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('خطأ في الاتصال بالخادم - تحقق من الاتصال بالإنترنت');
    }
    
    throw error;
  }
};

// Export Employees to Excel
export const exportEmployeesToExcel = async (adminId?: string): Promise<Blob> => {
  try {
    const params = adminId ? { adminId } : {};
    const response = await api.get('/users/export', {
      responseType: 'blob',
      params
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في تصدير بيانات الموظفين');
  }
};