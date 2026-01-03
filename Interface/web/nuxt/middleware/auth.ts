export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Initialize auth from localStorage
  if (process.client && !authStore.token) {
    authStore.initializeAuth();
  }

  // If not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }
});
