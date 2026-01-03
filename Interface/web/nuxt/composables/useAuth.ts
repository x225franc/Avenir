export const useAuth = () => {
  const { apiFetch } = useApi();
  const authStore = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      const response = await apiFetch<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      authStore.setToken(response.access_token);
      authStore.setUser(response.user);

      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: data,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authStore.logout();
    navigateTo('/login');
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await apiFetch('/auth/me');
      authStore.setUser(user);
      return user;
    } catch (error) {
      authStore.logout();
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    return await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  };

  const resetPassword = async (token: string, password: string) => {
    return await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    });
  };

  return {
    login,
    register,
    logout,
    fetchCurrentUser,
    forgotPassword,
    resetPassword,
  };
};
