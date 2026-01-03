export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Initialize auth from localStorage
  if (process.client && !authStore.token) {
    authStore.initializeAuth();
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (authStore.isAuthenticated && authStore.user) {
    const userRole = authStore.user.role;

    // Redirect based on role
    if (userRole === 'director') {
      return navigateTo('/admin/dashboard');
    } else if (userRole === 'advisor') {
      return navigateTo('/advisor/dashboard');
    } else {
      return navigateTo('/dashboard');
    }
  }
});
