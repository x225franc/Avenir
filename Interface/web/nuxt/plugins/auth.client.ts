export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  // Initialize auth from localStorage on client side
  authStore.initializeAuth();
});
