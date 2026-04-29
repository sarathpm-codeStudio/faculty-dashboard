

// lib/apiClient.ts

import axios from 'axios';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// ─── REQUEST interceptor ─────────────────────────────
// Attach fresh access_token to every API call
apiClient.interceptors.request.use(
  async (config) => {
    try {

      // getSession() auto refreshes access_token
      // if it's about to expire ✅
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // No session → redirect to login
        redirectToLogin();
        return Promise.reject('No session');
      }

      // Attach access_token to header
      config.headers.Authorization = `Bearer ${session.access_token}`;

      return config;

    } catch (err) {
      redirectToLogin();
      return Promise.reject(err);
    }
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE interceptor ────────────────────────────
// Handle token expired / unauthorized errors
apiClient.interceptors.response.use(

  // Success → just return response
  (response) => response,

  // Error → handle 401
  async (error) => {
    const originalRequest = error.config;

    // 401 = token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // prevent infinite loop

      try {
        // Try to refresh session
        const { data, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !data.session) {
          // Refresh failed = refresh_token expired (7 days passed)
          // → logout + redirect to login
          handleSessionExpired();
          return Promise.reject(error);
        }

        // Refresh success → update token in header
        // → retry original request
        originalRequest.headers.Authorization =
          `Bearer ${data.session.access_token}`;

        return apiClient(originalRequest);

      } catch (refreshErr) {
        handleSessionExpired();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Helpers ─────────────────────────────────────────

const redirectToLogin = () => {
  useAuthStore.getState().logout();
  window.location.href = '/login';
};

const handleSessionExpired = () => {
  useAuthStore.getState().logout();

  // Show message (optional)
  localStorage.setItem('session_expired', 'true');
  // Read this in login page to show "Session expired" toast

  // Redirect to login
  window.location.href = '/login';
};

export default apiClient;