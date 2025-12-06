import api from "./api";

// إنشاء نشاط تسويقي جديد
export const createMarketingActivity = async (english: string, arabic: string) => {
  try {
    const response = await api.post("/marketing-activities", {
      english,
      arabic,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء إنشاء النشاط التسويقي");
  }
};

// جلب جميع الأنشطة التسويقية مع التصفح والبحث
export const getAllMarketingActivities = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  isActive?: boolean
) => {
  try {
    const params: any = {
      page,
      limit,
    };

    if (search) {
      params.search = search;
    }

    if (isActive !== undefined) {
      params.isActive = isActive;
    }

    const response = await api.get("/marketing-activities", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء جلب الأنشطة التسويقية");
  }
};

// رفع ملف Excel للأنشطة التسويقية
export const importMarketingActivitiesFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/marketing-activities/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء رفع الملف");
  }
};

// تصدير الأنشطة التسويقية إلى Excel
export const exportMarketingActivitiesToExcel = async (isActive?: boolean) => {
  try {
    const params: any = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }

    const response = await api.get("/marketing-activities/export-excel", {
      params,
      responseType: "blob",
    });

    // إنشاء رابط التحميل
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const filename = `marketing-activities-${new Date().toISOString().split("T")[0]}.xlsx`;
    link.setAttribute("download", filename);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: "تم تصدير البيانات بنجاح",
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء تصدير البيانات");
  }
};

// تحديث نشاط تسويقي
export const updateMarketingActivity = async (
  id: string,
  english: string,
  arabic: string,
  isActive: boolean
) => {
  try {
    const response = await api.put(`/marketing-activities/${id}`, {
      english,
      arabic,
      isActive,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء تحديث النشاط التسويقي");
  }
};

// حذف نشاط تسويقي
export const deleteMarketingActivity = async (id: string) => {
  try {
    const response = await api.delete(`/marketing-activities/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء حذف النشاط التسويقي");
  }
};

//form

// جلب نشاط تسويقي واحد
export const getMarketingActivityById = async (id: string) => {
  try {
    const response = await api.get(`/marketing-activities/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء جلب النشاط التسويقي");
  }
};

// ===== طلبات الأنشطة التسويقية =====

// واجهة بيانات طلب النشاط التسويقي
export interface MarketingActivityRequest {
  activityDate: string;
  activityType: string;
  doctor: string;
  cost: number;
  notes?: string;
}

// إنشاء طلب نشاط تسويقي جديد
export const createMarketingActivityRequest = async (requestData: MarketingActivityRequest) => {
  try {
    const response = await api.post("/marketing-activity-requests", {
      activityDate: requestData.activityDate,
      activityType: requestData.activityType,
      doctor: requestData.doctor,
      cost: requestData.cost,
      notes: requestData.notes || "",
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء إنشاء طلب النشاط التسويقي");
  }
};

// جلب جميع طلبات الأنشطة التسويقية
export const getAllMarketingActivityRequests = async (
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  try {
    const params: any = {
      page,
      limit,
    };

    if (status) {
      params.status = status;
    }

    const response = await api.get("/marketing-activity-requests", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء جلب طلبات الأنشطة التسويقية");
  }
};

// جلب طلب نشاط تسويقي واحد
export const getMarketingActivityRequestById = async (id: string) => {
  try {
    const response = await api.get(`/marketing-activity-requests/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء جلب طلب النشاط التسويقي");
  }
};

// تحديث حالة طلب النشاط التسويقي (للمشرف/الأدمن)
export const updateMarketingActivityRequestStatus = async (
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  notes?: string
) => {
  try {
    const response = await api.put(`/marketing-activity-requests//${id}/status`, {
      status,
      notes,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء تحديث حالة الطلب");
  }
};

// حذف طلب نشاط تسويقي
export const deleteMarketingActivityRequest = async (id: string) => {
  try {
    const response = await api.delete(`/marketing-activity-requests/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء حذف طلب النشاط التسويقي");
  }
};

// Supervisor Marketing Activity Requests Types
export interface SupervisorMarketingActivityRequest {
  _id: string;
  activityDate: string;
  activityType: {
    _id: string;
    name?: string;
    description?: string;
  };
  doctor: {
    _id: string;
    drName: string;
    organizationName: string;
    specialty: string;
  };
  cost: number;
  notes: string;
  adminId: string;
  createdBy: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupervisorMarketingActivityRequestsStats {
  pending: number;
  approved: number;
  rejected: number;
}

export interface SupervisorMarketingActivityRequestsPagination {
  currentPage: number;
  totalPages: number;
  totalRequests: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SupervisorMarketingActivityRequestsResponse {
  success: boolean;
  data: SupervisorMarketingActivityRequest[];
  pagination: SupervisorMarketingActivityRequestsPagination;
  stats: SupervisorMarketingActivityRequestsStats;
  medicalRepsCount: number;
  medicalReps: Array<{
    _id: string;
    name: string;
    username: string;
  }>;
}

export interface GetSupervisorMarketingActivityRequestsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Get supervisor marketing activity requests
export const getSupervisorMarketingActivityRequests = async (
  supervisorId: string,
  params?: GetSupervisorMarketingActivityRequestsParams
): Promise<SupervisorMarketingActivityRequestsResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.search) queryParams.append("search", params.search);

    const url = `/marketing-activity-requests/supervisor/${supervisorId}/requests${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching supervisor marketing activity requests:", error);
    throw new Error(error.response?.data?.message || "فشل في جلب طلبات الأنشطة التسويقية");
  }
};

// تحديث حالة طلب النشاط التسويقي (للمشرف)
export const updateSupervisorMarketingActivityRequestStatus = async (
  requestId: string,
  status: "pending" | "approved" | "rejected"
): Promise<{ success: boolean; message: string; data: SupervisorMarketingActivityRequest }> => {
  try {
    const response = await api.patch(
      `/marketing-activity-requests/supervisor/status/${requestId}`,
      {
        status,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء تحديث حالة الطلب");
  }
};

// تصدير طلبات الأنشطة التسويقية إلى Excel
export const exportMarketingActivityRequests = async (
  userId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    status?: "pending" | "approved" | "rejected" | "all";
  }
): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.startDate) {
      queryParams.append("startDate", params.startDate);
    }
    if (params?.endDate) {
      queryParams.append("endDate", params.endDate);
    }
    if (params?.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }

    const response = await api.get(`/marketing-activity-requests/export/${userId}`, {
      responseType: "blob",
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء تصدير البيانات");
  }
};

// ===== طلبات الأنشطة التسويقية حسب UserId =====

export interface UserMarketingActivityRequest {
  _id: string;
  activityDate: string;
  activityType: {
    _id: string;
    name?: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    displayName?: string;
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
  cost: number;
  notes?: string;
  adminId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdBy?: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  createdAt?: string;
  updatedAt?: string;
  statusAr?: string;
  formattedRequestDate?: string;
  formattedActivityDate?: string;
}

export interface UserMarketingActivityRequestsStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  totalCost: number;
  medicalRepsCount?: number;
}

export interface UserMarketingActivityRequestsPagination {
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

export interface UserMarketingActivityRequestsResponse {
  success: boolean;
  message: string;
  data: UserMarketingActivityRequest[];
  userInfo: UserInfo;
  pagination: UserMarketingActivityRequestsPagination;
  stats: UserMarketingActivityRequestsStats;
}

export interface GetUserMarketingActivityRequestsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected" | "all";
  activityType?: string;
  doctor?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Get marketing activity requests by user ID
export const getMarketingActivityRequestsByUserId = async (
  userId: string,
  params?: GetUserMarketingActivityRequestsParams
): Promise<UserMarketingActivityRequestsResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    if (params?.activityType) queryParams.append("activityType", params.activityType);
    if (params?.doctor) queryParams.append("doctor", params.doctor);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.search) queryParams.append("search", params.search);

    const url = `/marketing-activity-requests/user/${userId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user marketing activity requests:", error);
    throw new Error(error.response?.data?.message || "فشل في جلب طلبات الأنشطة التسويقية للمستخدم");
  }
};

// Export user marketing activity requests to Excel
export const exportUserMarketingActivityRequestsToExcel = async (
  userId: string,
  params?: Omit<GetUserMarketingActivityRequestsParams, "page" | "limit">
): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    if (params?.activityType) queryParams.append("activityType", params.activityType);
    if (params?.doctor) queryParams.append("doctor", params.doctor);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.search) queryParams.append("search", params.search);

    const url = `/marketing-activity-requests/user/${userId}/export${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  } catch (error: any) {
    console.error("Error exporting user marketing activity requests:", error);
    throw new Error(error.response?.data?.message || "فشل في تصدير طلبات الأنشطة التسويقية");
  }
};

// Update marketing activity request status for user
export const updateUserMarketingActivityRequestStatus = async (
  requestId: string,
  status: "pending" | "approved" | "rejected",
  notes?: string
): Promise<{ success: boolean; message: string; data: UserMarketingActivityRequest }> => {
  try {
    const response = await api.put(`/marketing-activity-requests/${requestId}`, {
      status,
      notes,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء تحديث حالة الطلب");
  }
};

// Create marketing activity request for user
export const createUserMarketingActivityRequest = async (
  requestData: Omit<MarketingActivityRequest, "status">
): Promise<{ success: boolean; message: string; data: UserMarketingActivityRequest }> => {
  try {
    const response = await api.post("/marketing-activity-requests", requestData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء إنشاء طلب النشاط التسويقي");
  }
};

// Delete marketing activity request for user
export const deleteUserMarketingActivityRequest = async (
  requestId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/marketing-activity-requests/${requestId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء حذف طلب النشاط التسويقي");
  }
};

// Get marketing activity request by ID for user
export const getUserMarketingActivityRequestById = async (
  requestId: string
): Promise<{ success: boolean; data: UserMarketingActivityRequest }> => {
  try {
    const response = await api.get(`/marketing-activity-requests/${requestId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في جلب تفاصيل طلب النشاط التسويقي");
  }
};
