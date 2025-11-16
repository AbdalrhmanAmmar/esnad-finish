import { api } from './api';

export interface DoctorInfo {
  name: string;
  specialty: string;
  brand: string;
  city: string;
  area: string;
}

export interface MedicalRepInfo {
  name: string;
  email: string;
  phone: string;
}

export interface VisitDetails {
  visitDate: string;
  visitTime: string;
  visitType: string;
  visitStatus: string;
}

export interface SampleDetail {
  productName: string;
  category: string;
  samplesCount: number;
  notes: string;
}

export interface SamplesInfo {
  totalSamples: number;
  samplesDetails: SampleDetail[];
  totalProducts: number;
}

export interface AdditionalInfo {
  notes: string;
  feedback: string;
  nextVisitPlanned: string | null;
}

export interface Visit {
  visitId: string;
  doctorInfo: DoctorInfo;
  medicalRepInfo: MedicalRepInfo;
  visitDetails: VisitDetails;
  samplesInfo: SamplesInfo;
  additionalInfo: AdditionalInfo;
}

export interface Statistics {
  totalVisits: number;
  totalSamplesDistributed: number;
  uniqueMedicalReps: number;
  uniqueProducts: number;
  lastVisitDate: string | null;
  firstVisitDate: string | null;
}

export interface DoctorDetailsResponse {
  success: boolean;
  message: string;
  data: {
    searchQuery: string;
    foundDoctors: number;
    statistics: Statistics;
    visits: Visit[];
  };
}

// واجهات البيانات الشاملة للطبيب
export interface ComprehensiveDoctorInfo {
  id: string;
  name: string;
  organizationType?: string;
  organizationName?: string;
  specialty?: string;
  telNumber?: string;
  profile?: string;
  location?: {
    district?: string;
    city: string;
    area?: string;
  };
  brand: string;
  segment?: string;
  targetFrequency?: number;
  keyOpinionLeader?: boolean;
  teamProducts?: string;
  teamArea?: string;
}

export interface ComprehensiveVisit {
  _id: string;
  visitDate: string;
  visitTime?: string;
  visitType: string;
  visitStatus: string;
  medicalRep: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  products: Array<{
    _id: string;
    productName: string;
    category?: string;
    samplesCount: number;
    notes?: string;
  }>;
  notes?: string;
  feedback?: string;
  nextVisitPlanned?: string;
}

export interface ProductRequest {
  requestId: string;
  requestDate: string;
  deliveryDate?: string;
  product: {
    id: string;
    code: string;
    name: string;
    brand: string;
    price: number;
  };
  quantity: number;
  medicalRep: {
    id: string;
    name: string;
    username: string;
  };
  notes?: string;
  status: string;
  createdAt: string;
}

export interface MarketingActivity {
  activityId: string;
  requestDate: string;
  activityDate: string;
  activityType: {
    id: string;
  };
  cost: number;
  notes?: string;
  createdBy: {
    id: string;
    name: string;
    username: string;
  };
  status: string;
  createdAt: string;
}

export interface ComprehensiveStatistics {
  totalVisits: number;
  totalSamples: number;
  uniqueProducts: number;
  recentVisits: number;
  approvedProductRequests: number;
  approvedMarketingActivities: number;
  lastVisitDate?: string;
  firstVisitDate?: string;
}

export interface DoctorComprehensiveData {
  success: boolean;
  data: {
    doctor: ComprehensiveDoctorInfo;
    visits: ComprehensiveVisit[];
    approvedProductRequests: ProductRequest[];
    approvedMarketingActivities: MarketingActivity[];
    statistics: ComprehensiveStatistics;
  };
}

export const getDoctorDetails = async (doctorName: string): Promise<DoctorDetailsResponse> => {
  try {
    const response = await api.get(`/doctors/details?name=${encodeURIComponent(doctorName)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    throw error;
  }
};