import { authApi, type LoginCredentials, type RegisterData } from '@/api/auth.api';

export const authService = {
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