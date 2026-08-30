import { create } from 'zustand';
import api from '../services/api';

const DEFAULT_DEMO_USER = {
  id: 'demo_operator_default',
  name: 'Lead Operator',
  email: 'operator@intellimail.io',
  role: 'user',
};

export const useAuthStore = create((set, get) => ({
  user: DEFAULT_DEMO_USER,
  token: 'demo_operator_token',
  isAuthenticated: true,
  isLoading: false,
  error: null,

  initAuth: () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('intellimail_auth');
        if (stored) {
          const { user, token } = JSON.parse(stored);
          if (token && user) {
            set({ user, token, isAuthenticated: true });
            return;
          }
        }
        // If not stored, set default demo user
        localStorage.setItem(
          'intellimail_auth',
          JSON.stringify({ user: DEFAULT_DEMO_USER, token: 'demo_operator_token' })
        );
        set({ user: DEFAULT_DEMO_USER, token: 'demo_operator_token', isAuthenticated: true });
      } catch (err) {
        console.error('Auth store initialization error:', err);
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('intellimail_auth', JSON.stringify({ user, token }));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please check your credentials.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user, token } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('intellimail_auth', JSON.stringify({ user, token }));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('intellimail_auth');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
