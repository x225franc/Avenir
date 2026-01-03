<template>
  <NuxtLayout name="auth">
    <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Icon name="heroicons:key" class="w-8 h-8" />
          Nouveau mot de passe
        </h1>
        <p class="text-gray-600">Définissez un nouveau mot de passe pour votre compte</p>
      </div>

      <UiAlert v-if="success" variant="success" class="mb-6">
        <p class="font-medium flex items-center gap-2">
          <Icon name="heroicons:check-circle" class="w-5 h-5" />
          Mot de passe réinitialisé !
        </p>
        <p class="text-sm mt-1">Redirection vers la page de connexion...</p>
      </UiAlert>

      <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-6">
        <UiAlert v-if="error" variant="danger" :closable="true" @close="error = ''">
          {{ error }}
        </UiAlert>

        <UiInput
          v-model="formData.password"
          label="Nouveau mot de passe"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          required
        />

        <UiInput
          v-model="formData.confirmPassword"
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          :error="errors.confirmPassword"
          required
        />

        <UiButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="loading"
          :disabled="!token"
          class="w-full"
        >
          Réinitialiser le mot de passe
        </UiButton>
      </form>

      <div class="mt-6 text-center text-sm text-gray-600">
        <NuxtLink to="/login" class="text-purple-600 hover:underline">
          ← Retour à la connexion
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { resetPasswordSchema, type ResetPasswordFormData } from '~/utils/validation';

definePageMeta({
  layout: false,
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

const token = route.query.token as string | undefined;

const formData = ref<ResetPasswordFormData>({
  password: '',
  confirmPassword: '',
});

const errors = ref<Partial<Record<keyof ResetPasswordFormData, string>>>({});
const error = ref('');
const success = ref(false);
const loading = ref(false);

// Vérifier le token au montage
onMounted(() => {
  if (!token) {
    error.value = 'Token de réinitialisation manquant';
  }

  // Rediriger si déjà authentifié
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});

const handleSubmit = async () => {
  errors.value = {};
  error.value = '';

  if (!token) {
    error.value = 'Token de réinitialisation manquant';
    return;
  }

  // Validation avec Zod
  const result = resetPasswordSchema.safeParse(formData.value);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errors.value[issue.path[0] as keyof ResetPasswordFormData] = issue.message;
      }
    });
    return;
  }

  loading.value = true;

  try {
    await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        newPassword: formData.value.password,
      },
    });

    success.value = true;
    notificationsStore.addNotification({
      type: 'success',
      message: 'Mot de passe réinitialisé avec succès !',
    });

    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err: any) {
    const errorMessage =
      err.data?.message || err.message || 'Une erreur est survenue. Veuillez réessayer.';
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
