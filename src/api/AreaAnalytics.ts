import api from './api';

export interface AreaSummary {
  totalAreas: number;
  totalDoctorVisits: number;
  totalPharmacyVisits: number;
  totalActivities: number;
  totalUniqueDoctors: number;
  totalUniquePharmacies: number;
  totalSamplesDistributed: number;
  totalOrderValue: number;
}

export interface DoctorVisitsData {
  totalVisits: number;
  uniqueDoctors: number;
  visitsBySpecialty: Record<string, number>;
  visitsByBrand: Record<string, number>;
  productsDistributed: Record<string, number>;
  samplesDistributed: number;
  medicalReps: number;
}

export interface PharmacyVisitsData {
  totalVisits: number;
  uniquePharmacies: number;
  ordersPlaced: number;
  productsOrdered: Record<string, number>;
  totalOrderValue: number;
  salesReps: number;
}

export interface CombinedStats {
  totalActivities: number;
  uniqueProducts: number;
  totalTeamMembers: number;
}

export interface PerformanceMetrics {
  doctorVisitFrequency: string;
  pharmacyOrderRate: string;
  averageOrderValue: string;
  samplesPerVisit: string;
}

export interface AreaAnalytic {
  areaName: string;
  city: string;
  doctorVisits: DoctorVisitsData;
  pharmacyVisits: PharmacyVisitsData;
  combinedStats: CombinedStats;
  performanceMetrics: PerformanceMetrics;
}

export interface AreaAnalyticsData {
  summary: AreaSummary;
  areaAnalytics: AreaAnalytic[];
  topPerformingAreas: AreaAnalytic[];
  insights: string[];
}

export interface AreaAnalyticsResponse {
  success: boolean;
  message: string;
  data: AreaAnalyticsData;
  metadata: {
    area: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    detailLevel: string;
    generatedAt: string;
  };
}

export interface AreaAnalyticsFilters {
  area?: string;
  startDate?: string;
  endDate?: string;
  includeSubAreas?: boolean;
  detailLevel?: 'summary' | 'detailed' | 'full';
}



export const getAreaAnalytics = async (
  adminId: string,
  filters: AreaAnalyticsFilters = {}
): Promise<AreaAnalyticsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.area) params.append('area', filters.area);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.includeSubAreas !== undefined) {
      params.append('includeSubAreas', filters.includeSubAreas.toString());
    }
    if (filters.detailLevel) params.append('detailLevel', filters.detailLevel);

    const response = await api.get(`/area-analytics/${adminId}?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching area analytics:', error);
    throw new Error(error.response?.data?.message || 'فشل في جلب تحليلات المناطق');
  }
};

// Keep mock data for fallback if needed
/* 
const mockAreaAnalyticsData: AreaAnalyticsResponse = {
  // ... mock data here
};
*/