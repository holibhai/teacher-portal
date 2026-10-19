import axios, { AxiosInstance } from 'axios';

/**
 * Shared authenticated Axios instance.
 * Automatically injects Keycloak JWT token from localStorage or session.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mentify_access_token') || 'demo_keycloak_bearer_token';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error envelope handling
    return Promise.reject(error);
  }
);
