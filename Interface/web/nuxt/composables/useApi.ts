export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase as string,

    onRequest({ options }) {
      // Add JWT token to headers if available
      const token = authStore.token;
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    },

    onResponseError({ response }) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        authStore.logout();
        navigateTo('/login');
      }
    },
  });

  return {
    apiFetch,
  };
};
