import axios from 'axios';

/**
 * Single Axios instance for the app.
 * baseURL comes from VITE_API_URL (set in .env, see .env.example).
 * Default points at the local backend Dev 2 is building.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT if present. Real auth is Dev 2's; this is a forward-looking
// hook so the moment the token lands in localStorage the request goes out
// with it - no service-layer changes required.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnify.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize server errors into a single shape that matches the contract
// in docs/API.md: { success:false, error:{ code, message } }.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error?.response?.data;
    const normalized = {
      status: error?.response?.status ?? 0,
      code: payload?.error?.code || 'NETWORK_ERROR',
      message:
        payload?.error?.message ||
        error?.message ||
        'Something went wrong. Please try again.',
    };
    return Promise.reject(normalized);
  },
);

export default api;
