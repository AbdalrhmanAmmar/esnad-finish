import { api } from './api';

export interface CoachingTotals {
  TotalPlanning: number;
  TotalPersonalSkills: number;
  TotalKnowledge: number;
  TotalSellingSkills: number;
  TotalScore: number;
}

export interface CoachingDoctorInfo {
  id: string;
  name: string;
  specialty?: string;
}

export interface CoachingUserInfo {
  id: string;
  username?: string;
  name?: string;
}

export interface CoachingVisitInfo {
  id: string;
  visitDate: string;
  doctor: CoachingDoctorInfo | null;
  medicalRep: CoachingUserInfo | null;
  supervisor: CoachingUserInfo | null;
  notes: string;
}

export interface CoachingEntry {
  coachingId: string;
  isCompleted: boolean;
  title: string;
  Recommendations: string;
  note: string;
  totals: CoachingTotals;
  visit: CoachingVisitInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface CoachingResponse {
  success: boolean;
  count: number;
  data: CoachingEntry[];
  message?: string;
}

export interface CoachingDetailResponse {
  success: boolean;
  data: CoachingEntry;
  message?: string;
}

// Fetch coaching entries for the authenticated supervisor
export const getCoachingBySupervisor = async (): Promise<CoachingResponse> => {
  try {
    const response = await api.get('/coach/supervisor');
    return response.data as CoachingResponse;
  } catch (error: any) {
    const message = error?.response?.data?.message || 'فشل في جلب بيانات الكوتشينغ';
    throw new Error(message);
  }
};

// الحقول المسموح تعديلها في التقييم (مطابقة للباك إند)
export interface UpdateCoachingPayload {
  title?: string;
  Recommendations?: string;
  note?: string;
  // التخطيط
  previousCalls?: number;
  callOrganization?: number;
  TargetingCustomer?: number;
  // المهارات الشخصية
  Appearance?: number;
  Confidence?: number;
  AdherenceToReporting?: number;
  TotalVisits?: number;
  // المعرفة
  CustomerDistribution?: number;
  ProductKnowledge?: number;
  // مهارات البيع
  ClearAndDirect?: number;
  ProductRelated?: number;
  CustomerAcceptance?: number;
  InquiryApproach?: number;
  ListeningSkills?: number;
  SupportingCustomer?: number;
  UsingPresentationTools?: number;
  SolicitationAtClosing?: number;
  GettingPositiveFeedback?: number;
  HandlingObjections?: number;
  // قفل التقييم
  isCompleted?: boolean;
}

export interface UpdateCoachingResponse {
  success: boolean;
  message?: string;
  data?: CoachingEntry;
}

// تحديث تقييم الكوتشينغ حسب المعرّف
export const updateCoaching = async (
  id: string,
  payload: UpdateCoachingPayload
): Promise<UpdateCoachingResponse> => {
  if (!id) {
    throw new Error('معرّف التقييم مفقود');
  }
  try {
    // هذه الدالة تتواصل مع الباك إند الذي يُطبق جميع شروط التحقق والصلاحيات
    const response = await api.patch(`/coach/${id}`, payload);
    return response.data as UpdateCoachingResponse;
  } catch (error: any) {
    const message = error?.response?.data?.message || 'فشل في تعديل التقييم';
    throw new Error(message);
  }
};

// جلب تقييم كوتشينغ محدد بواسطة المعرّف
export const getCoachingById = async (id: string): Promise<CoachingDetailResponse> => {
  if (!id) {
    throw new Error('معرّف التقييم مفقود');
  }
  try {
    const response = await api.get(`/coach/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || 'فشل في جلب بيانات التقييم';
    throw new Error(message);
  }
};

export default {
  getCoachingBySupervisor,
  updateCoaching,
  getCoachingById,
};