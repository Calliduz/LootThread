import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
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

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip global 401 logout if it's the password update endpoint
    const isUpdatePassword = error.config?.url?.includes('/auth/update-password');
    
    if (error.response && error.response.status === 401 && !isUpdatePassword) {
      localStorage.removeItem('token');
      // Redirect to login if necessary or handle globally
      window.dispatchEvent(new Event('auth-error'));
    }

    // Global Error Toasts for server failures (500s, 502s, etc)
    if (error.response && error.response.status >= 500) {
      toast.error('System Link Failure: The server encountered a critical error.');
    } else if (error.code === 'ECONNABORTED' || !error.response) {
      toast.error('Connection Lost: Unable to reach the LootThread core.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
