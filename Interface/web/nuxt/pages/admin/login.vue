<template>
  <NuxtLayout name="auth">
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-12">
      <div class="max-w-md w-full">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
            <Icon name="heroicons:briefcase" class="w-8 h-8 text-gray-300" />
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Administration AVENIR</h1>
          <p class="text-gray-400">Espace réservé aux directeurs</p>
        </div>

        <!-- Login Form -->
        <UiCard padding="lg" class="backdrop-blur-sm bg-white/95">
          <UiAlert v-if="error" variant="danger" class="mb-6" :closable="true" @close="error = ''">
            {{ error }}
          </UiAlert>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <UiInput
              v-model="formData.email"
              label="Email"
              type="email"
              placeholder="directeur@avenir.fr"
              :error="errors.email"
              required
            >
              <template #icon>
                <Icon name="heroicons:envelope" class="w-5 h-5 text-gray-400" />
              </template>
            </UiInput>

            <UiInput
              v-model="formData.password"
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              :error="errors.password"
              required
            >
              <template #icon>
                <Icon name="heroicons:lock-closed" class="w-5 h-5 text-gray-400" />
              </template>
            </UiInput>

            <UiButton type="submit" variant="primary" size="lg" :loading="loading" class="w-full">
              Se connecter
            </UiButton>
          </form>

          <div class="mt-6 text-center">
            <NuxtLink to="/admin/forgot-password" class="text-sm text-gray-600 hover:text-gray-900">
              Mot de passe oublié ?
            </NuxtLink>
          </div>
        </UiCard>

        <!-- Back to main site -->
        <div class="mt-6 text-center">
          <NuxtLink to="/login" class="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            Retour à l'espace client
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { loginSchema } from '~/utils/validation';

definePageMeta({
  layout: false,
  middleware: 'guest',
});

const router = useRouter();
const authStore = useAuthStore();
const { login } = useAuth();
const notificationsStore = useNotificationsStore();

const formData = ref({
  email: '',
  password: '',
});

const errors = ref<Record<string, string>>({});
const loading = ref(false);
const error = ref('');

const validateForm = () => {
  errors.value = {};
  const result = loginSchema.safeParse(formData.value);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errors.value[issue.path[0] as string] = issue.message;
      }
    });
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';

  try {
    await login(formData.value.email, formData.value.password);

    const user = authStore.user;
    if (user?.role !== 'director') {
      error.value = 'Accès réservé aux directeurs uniquement';
      authStore.logout();
      return;
    }

    notificationsStore.addNotification({
      type: 'success',
      message: 'Connexion réussie',
    });

    router.push('/admin/dashboard');
  } catch (err: any) {
    const errorMessage = err.data?.message || err.message || 'Identifiants invalides';
    error.value = errorMessage;
    notificationsStore.addNotification({
      type: 'error',
      message: errorMessage,
    });
  } finally {
    loading.value = false;
  }
};
</script>
