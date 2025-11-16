import api from './api';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Change user password using authenticated request
export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  try {
    const response = await api.post('/auth/change-password', payload);
    return response.data;
  } catch (error: any) {
    // Return server-provided message if available
    if (error?.response?.data) {
      return error.response.data as ChangePasswordResponse;
    }
    throw new Error(error?.message || 'فشل تغيير كلمة المرور');
  }
};

// Admin: change another user's password
export interface AdminChangeUserPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    targetUserId: string;
    changedBy: string;
    changedByRole: string;
  };
}

export const adminChangeUserPassword = async (
  userId: string,
  newPassword: string
): Promise<AdminChangeUserPasswordResponse> => {
  try {
    const response = await api.patch(`/Auth/admin/change-user-password/${userId}`, { newPassword });
    return response.data as AdminChangeUserPasswordResponse;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data as AdminChangeUserPasswordResponse;
    }
    throw new Error(error?.message || 'فشل تغيير كلمة مرور المستخدم');
  }
};

export default {
  changePassword,
  adminChangeUserPassword,
};