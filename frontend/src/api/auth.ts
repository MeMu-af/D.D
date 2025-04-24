import api from './axios';
import { AxiosError } from 'axios';
import { LoginCredentials, RegisterData, User, AuthResponse, AuthError, ApiError } from './types';

// API calls
const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new AuthError(
        axiosError.response?.data?.message || 'Login failed',
        axiosError.response?.status || 500,
        axiosError.response?.data?.code,
        axiosError.response?.data?.details
      );
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new AuthError(
        axiosError.response?.data?.message || 'Registration failed',
        axiosError.response?.status || 500,
        axiosError.response?.data?.code,
        axiosError.response?.data?.details
      );
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new AuthError(
        axiosError.response?.data?.message || 'Logout failed',
        axiosError.response?.status || 500,
        axiosError.response?.data?.code,
        axiosError.response?.data?.details
      );
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new AuthError(
        axiosError.response?.data?.message || 'Failed to get user',
        axiosError.response?.status || 500,
        axiosError.response?.data?.code,
        axiosError.response?.data?.details
      );
    }
  },
};

// Auth service with localStorage handling
export const auth = {
  login: async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('token', response.token);
    return response.user;
  },

  register: async (data: RegisterData) => {
    const response = await authApi.register(data);
    localStorage.setItem('token', response.token);
    return response.user;
  },

  logout: async () => {
    await authApi.logout();
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    return authApi.getCurrentUser();
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
}; 