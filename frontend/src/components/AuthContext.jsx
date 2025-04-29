import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authService } from '../api/services';

const AuthContext = createContext();

// Configure axios instance
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize axios with token from localStorage and fetch user if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      // Format the profile picture URL if it exists
      if (userData.profilePicture) {
        // Ensure the URL starts with /uploads
        userData.profilePicture = userData.profilePicture.replace('/api/v1', '');
      }
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Error fetching user:', err);
      handleAuthError();
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError('Session expired. Please log in again.');
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { token, user } = await authService.login(email, password);
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Format the profile picture URL if it exists
      if (user.profilePicture) {
        user.profilePicture = user.profilePicture.replace('/api/v1', '');
      }
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const { token, user } = await authService.register(userData);
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
    setLoading(false);
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      // Format the profile picture URL if it exists
      if (updatedUser.profilePicture) {
        updatedUser.profilePicture = updatedUser.profilePicture.replace('/api/v1', '');
      }
      setUser(updatedUser);
      setError(null);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
      throw err;
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await api.post(`/users/${user.id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Update the user state with the new profile picture
      const updatedUser = { ...user, profilePicture: response.data.profilePicture.replace('/api/v1', '') };
      setUser(updatedUser);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    uploadProfileImage,
    fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 