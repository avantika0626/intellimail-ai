import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach JWT token from localStorage on requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('intellimail_auth') || localStorage.getItem('agentflow_auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed?.state?.token) {
            config.headers.Authorization = `Bearer ${parsed.state.token}`;
          }
        } catch {
          // ignore
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
