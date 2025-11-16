import { api } from './api';

export interface DoctorSearchResponse {
  success: boolean;
  message: string;
  data: {
    searchQuery: string;
    foundDoctors: number;
    statistics: {
      totalVisits: number;
      totalSamplesDistributed: number;
      uniqueMedicalReps: number;
      uniqueProducts: number;
      lastVisitDate: string | null;
      firstVisitDate: string | null;
    };
    visits: {
      visitId: string;
      doctorInfo: {
        name: string;
        specialty: string;
        brand: string;
        city: string;
        area: string;
      };
      medicalRepInfo: {
        name: string;
        email: string;
        phone: string;
      };
      visitDetails: {
        visitDate: string;
        visitTime: string;
        visitType: string;
        visitStatus: string;
      };
      samplesInfo: {
        totalSamples: number;
        samplesDetails: {
          productName: string;
          category: string;
          samplesCount: number;
          notes: string;
        }[];
        totalProducts: number;
      };
      additionalInfo: {
        notes: string;
        feedback: string;
        nextVisitPlanned: string | null;
      };
    }[];
  };
}

export const getDoctorDetails = async (doctorName: string): Promise<DoctorSearchResponse> => {
  try {
    const response = await api.get(`/automation/doctor-details?doctorName=${encodeURIComponent(doctorName)}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ في البحث عن الدكتور');
  }
};

export const searchDoctorsByName = async (query: string): Promise<string[]> => {
  try {
    const response = await api.get(`/automation/doctors/search?q=${encodeURIComponent(query)}`);
    return response.data.doctors || [];
  } catch (error) {
    return [];
  }
};