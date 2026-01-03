export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Initialize auth from localStorage
  if (process.client && !authStore.token) {
    authStore.initializeAuth();
  }

  // Check if route requires specific role
  const requiredRole = to.meta.role as string | string[] | undefined;

  if (!requiredRole) {
    return; // No role required
  }

  const userRole = authStore.user?.role;

  if (!userRole) {
    return navigateTo('/login');
  }

  // Check if user has required role
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!allowedRoles.includes(userRole)) {
    // Redirect based on user role
    if (userRole === 'client') {
      return navigateTo('/dashboard');
    } else if (userRole === 'advisor') {
      return navigateTo('/advisor/dashboard');
    } else if (userRole === 'director') {
      return navigateTo('/admin/dashboard');
    }
  }
});
