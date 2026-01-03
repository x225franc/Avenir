<template>
  <NuxtLayout name="auth">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Icon name="heroicons:building-library" class="w-8 h-8" />
          Banque AVENIR
        </h1>
        <p class="text-gray-600">Vérification de votre email</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-8">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
        <p class="text-gray-600">Vérification en cours...</p>
      </div>

      <!-- Success -->
      <div v-else-if="!loading && success && !error" class="py-8">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:check-circle" class="w-10 h-10 text-green-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Email vérifié !</h2>
        <p class="text-gray-600 mb-6">
          Votre email a été vérifié avec succès. Vous allez être redirigé vers la page de connexion...
        </p>
        <UiButton variant="primary" @click="router.push('/login')">
          Se connecter maintenant
        </UiButton>
      </div>

      <!-- Error -->
      <div v-else-if="!loading && !success && error" class="py-8">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:x-circle" class="w-10 h-10 text-red-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Erreur de vérification</h2>
        <p class="text-red-600 mb-6">{{ error }}</p>
        <div class="space-y-3">
          <UiButton variant="primary" class="w-full" @click="router.push('/register')">
            S'inscrire à nouveau
          </UiButton>
          <UiButton variant="ghost" class="w-full" @click="router.push('/login')">
            Retour à la connexion
          </UiButton>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

const token = route.query.token as string | undefined;
const loading = ref(true);
const success = ref(false);
const error = ref('');

// Rediriger si déjà authentifié
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
    return;
  }
});

// Vérifier l'email au montage
onMounted(async () => {
  if (!token) {
    error.value = 'Token de vérification manquant';
    loading.value = false;
    return;
  }

  try {
    const response = await apiFetch<{ message: string }>(`/auth/verify-email?token=${token}`);

    success.value = true;
    error.value = '';
    notificationsStore.addNotification({
      type: 'success',
      message: 'Email vérifié avec succès !',
    });

    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err: any) {
    success.value = false;
    error.value = err.data?.message || err.message || "Erreur lors de la vérification de l'email";
    notificationsStore.addNotification({
      type: 'error',
      message: error.value,
    });
  } finally {
    loading.value = false;
  }
});
</script>
