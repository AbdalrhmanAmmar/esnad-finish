import axios from "axios";
import { useAuthStore } from "../stores/authStore";

// إعداد Axios
const api = axios.create({
  baseURL: "http://localhost:4000/api",
  // baseURL:"https://api.menareps.com/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token from both localStorage and auth store
      localStorage.removeItem("token");
      useAuthStore.getState().logout();
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Login API function
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Verify token API function

// Add your other API functions here
export const fetchData = async () => {
  // Implementation here
};

export { api };
export default api;
