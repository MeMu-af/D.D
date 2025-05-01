import axios from 'axios';
// import.meta.env.VITE_API_URL;???

// Determine the base URL based on the environment
const baseURL = import.meta.env.VITE_API_URL || '/api/v1'; // Use env variable, fallback for safety/other setups
console.log(`API Base URL: ${baseURL}`); // Log the base URL being used

// Create axios instance with default config
const api = axios.create({
  baseURL: baseURL, // Use the determined baseURL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies and auth
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // Optionally redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 