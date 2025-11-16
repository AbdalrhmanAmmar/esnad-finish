import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  teamProducts?: string;
  teamArea?: string;
  area?: string;
  city?: string;
  district?: string;
  supervisor?: {
    _id: string;
    adminId: string;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (userData: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (userData: User, token: string) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
          error: null,
          isLoading: false
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isLoading: false
        });
        // Clear token from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('auth-token');
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Helper function to get token for API calls
export const getAuthToken = () => {
  const state = useAuthStore.getState();
  return state.token;
};

// Helper function to check if user has specific role
export const hasRole = (requiredRole: string) => {
  const state = useAuthStore.getState();
  return state.user?.role === requiredRole;
};

// Helper function to check if user has any of the specified roles
export const hasAnyRole = (roles: string[]) => {
  const state = useAuthStore.getState();
  return state.user ? roles.includes(state.user.role) : false;
};