import { defineStore } from 'pinia';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'advisor' | 'director';
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isClient: (state) => state.user?.role === 'client',
    isAdvisor: (state) => state.user?.role === 'advisor',
    isDirector: (state) => state.user?.role === 'director',
    isStaff: (state) => state.user?.role === 'advisor' || state.user?.role === 'director',
  },

  actions: {
    setToken(token: string) {
      this.token = token;
      if (process.client) {
        localStorage.setItem('token', token);
      }
    },

    setUser(user: User) {
      this.user = user;
      if (process.client) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      if (process.client) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },

    initializeAuth() {
      if (process.client) {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token) {
          this.token = token;
        }

        if (userStr) {
          try {
            this.user = JSON.parse(userStr);
          } catch (e) {
            console.error('Failed to parse user from localStorage', e);
          }
        }
      }
    },
  },
});
