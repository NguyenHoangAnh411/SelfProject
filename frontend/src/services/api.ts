import axios from 'axios';
import { ApiResponse, AuthResponse, Contract, Document, User } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to login'
      };
    }
  },
  register: async (email: string, password: string, fullName: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/auth/register', { email, password, fullName });
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register'
      };
    }
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
  resendVerification: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile'
      };
    }
  },
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await api.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  },
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },
};

// Add axios interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await authService.refreshToken();
        const token = response.data?.token;
        if (response.success && token) {
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Contract services
export const contractService = {
  getAll: async (): Promise<ApiResponse<Contract[]>> => {
    try {
      const response = await api.get('/contracts');
      return response.data;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contracts'
      };
    }
  },
  getById: async (id: string): Promise<ApiResponse<Contract>> => {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Contract ID is required'
        };
      }
      const response = await api.get(`/contracts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contract'
      };
    }
  },
  create: async (data: { name: string; type: string; sourceCode: string }): Promise<ApiResponse<Contract>> => {
    try {
      const response = await api.post('/contracts', data);
      return response.data;
    } catch (error) {
      console.error('Error creating contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contract'
      };
    }
  },
  update: async (id: string, contract: Partial<Contract>): Promise<ApiResponse<Contract>> => {
    const response = await api.put(`/contracts/${id}`, contract);
    return response.data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/contracts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete contract'
      };
    }
  },
};

// Document services
export const documentService = {
  getAll: async (): Promise<ApiResponse<Document[]>> => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documents'
      };
    }
  },
  getById: async (id: string): Promise<ApiResponse<Document>> => {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Document ID is required'
        };
      }
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch document'
      };
    }
  },
  create: async (data: { title: string; content: string }): Promise<ApiResponse<Document>> => {
    try {
      const response = await api.post('/documents', data);
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create document'
      };
    }
  },
  update: async (id: string, data: { title: string; content: string }): Promise<ApiResponse<Document>> => {
    try {
      const response = await api.put(`/documents/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update document'
      };
    }
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete document'
      };
    }
  },
}; 