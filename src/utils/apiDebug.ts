import api from '@/api/api';

// API Debug Utilities
export const testApiConnection = async (): Promise<{
  isConnected: boolean;
  baseURL: string;
  error?: string;
  responseTime?: number;
}> => {
  const startTime = Date.now();
  
  try {
    // Test basic connection with a simple endpoint
    const response = await api.get('/health', { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    return {
      isConnected: true,
      baseURL: api.defaults.baseURL || 'Unknown',
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      isConnected: false,
      baseURL: api.defaults.baseURL || 'Unknown',
      responseTime,
      error: error.message || 'Unknown error'
    };
  }
};

export const checkEmployeeEndpoint = async (id: string): Promise<{
  exists: boolean;
  error?: string;
  statusCode?: number;
  url: string;
}> => {
  const url = `${api.defaults.baseURL}/users/${id}`;
  
  try {
    const response = await api.get(`/users/${id}`);
    return {
      exists: true,
      url
    };
  } catch (error: any) {
    return {
      exists: false,
      url,
      statusCode: error.response?.status,
      error: error.response?.data?.message || error.message
    };
  }
};

export const logApiDebugInfo = () => {
  console.group('🔍 API Debug Information');
  console.log('Base URL:', api.defaults.baseURL);
  console.log('Timeout:', api.defaults.timeout);
  console.log('Headers:', api.defaults.headers);
  console.log('With Credentials:', api.defaults.withCredentials);
  
  // Check if token exists
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);
  if (token) {
    console.log('Token preview:', token.substring(0, 20) + '...');
  }
  
  console.groupEnd();
};

// Test all user-related endpoints
export const testUserEndpoints = async () => {
  console.group('🧪 Testing User Endpoints');
  
  const endpoints = [
    { method: 'GET', path: '/users', description: 'Get all users' },
    { method: 'GET', path: '/users/test-id', description: 'Get user by ID' },
    { method: 'POST', path: '/users', description: 'Create user' },
    { method: 'PUT', path: '/users/test-id', description: 'Update user' },
    { method: 'DELETE', path: '/users/test-id', description: 'Delete user' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${api.defaults.baseURL}${endpoint.path}`;
      console.log(`Testing ${endpoint.method} ${url}`);
      
      // We won't actually make the request, just log the URL
      console.log(`✅ ${endpoint.description}: ${url}`);
    } catch (error) {
      console.log(`❌ ${endpoint.description}: Error`);
    }
  }
  
  console.groupEnd();
};