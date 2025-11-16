import api from './api';

// Interface for User data
export interface MedicalRepUser {
  _id: string;
  name: string;
  username: string;
  role: string;
  teamProducts: string;
  teamArea: string;
  adminId: string;
}

// Interface for Product data
export interface MedicalRepProduct {
  _id: string;
  code: string;
  name: string;
  type: string;
  price: number;
  brand: string;
  company: string;
  teamProducts: string;
  messages: any[];
}

// Interface for Doctor data
export interface MedicalRepDoctor {
  _id: string;
  name: string;
  specialty: string;
  phone: string;
  organizationName: string;
  city: string;
  area: string;
  teamArea: string;
}

// Interface for Stats
export interface MedicalRepStats {
  totalProducts: number;
  totalDoctors: number;
  isAllProducts: boolean;
}

// Interface for the complete response
export interface MedicalRepResponse {
  success: boolean;
  data: {
    user: MedicalRepUser;
    products: MedicalRepProduct[];
    doctors: MedicalRepDoctor[];
    stats: MedicalRepStats;
    adminId: string;
  };
}

// Function to get medical rep data
export const getMedicalRepData = async (userId: string): Promise<MedicalRepResponse> => {
  try {
    const response = await api.get(`/medicalrep/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medical rep data:', error);
    throw error;
  }
};

// Function to get medical rep doctors
export const getMedicalRepDoctors = async (userId: string): Promise<{ success: boolean; data: MedicalRepDoctor[] }> => {
  try {
    const response = await api.get(`/medicalrep/${userId}/doctors`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medical rep doctors:', error);
    throw error;
  }
};

// Function to get medical rep products with messages
export const getMedicalRepProducts = async (userId: string): Promise<{ success: boolean; data: MedicalRepProduct[] }> => {
  try {
    const response = await api.get(`/medicalrep/${userId}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medical rep products:', error);
    throw error;
  }
};

// Function to get product messages
export const getProductMessages = async (productId: string): Promise<{ success: boolean; data: any[] }> => {
  try {
    const response = await api.get(`/products/${productId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product messages:', error);
    throw error;
  }
};

// Function to get supervisors for medical rep
export const getSupervisors = async (medicalRepId: string): Promise<{ success: boolean; data: any[] }> => {
  try {
    const response = await api.get(`/medicalrep/${medicalRepId}/supervisor`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supervisors:', error);
    throw error;
  }
};