import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('mswater_auth');
    if (stored) {
      const auth = JSON.parse(stored);
      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 + token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const stored = localStorage.getItem('mswater_auth');
        if (stored) {
          const auth = JSON.parse(stored);
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken: auth.refreshToken,
          });

          if (response.data.success) {
            const newAuth = { ...auth, ...response.data.data };
            localStorage.setItem('mswater_auth', JSON.stringify(newAuth));
            originalRequest.headers.Authorization = `Bearer ${newAuth.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('mswater_auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
