export const useAuth = () => {
  const { apiFetch } = useApi();
  const authStore = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      const response = await apiFetch<{ success: boolean; data: { token: string; userId: string; email: string; role: string } }>('/users/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response.success && response.data) {
        authStore.setToken(response.data.token);
        // Récupérer les infos complètes de l'utilisateur via /users/me
        await fetchCurrentUser();
      }

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
      const response = await apiFetch('/users/register', {
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
      const response = await apiFetch<{ success: boolean; data: any }>('/users/me');
      if (response.success && response.data) {
        authStore.setUser(response.data);
        return response.data;
      }
      throw new Error('Failed to fetch user');
    } catch (error) {
      authStore.logout();
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    return await apiFetch('/users/forgot-password', {
      method: 'POST',
      body: { email },
    });
  };

  const resetPassword = async (token: string, password: string) => {
    return await apiFetch('/users/reset-password', {
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
