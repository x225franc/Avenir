<template>
  <NuxtLayout name="auth">
    <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Icon name="heroicons:lock-closed" class="w-8 h-8" />
          Mot de passe oublié
        </h1>
        <p class="text-gray-600">Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      <UiAlert v-if="success" variant="success" class="mb-6">
        <p class="font-medium flex items-center gap-2">
          <Icon name="heroicons:check-circle" class="w-5 h-5" />
          Email envoyé !
        </p>
        <p class="text-sm mt-1">
          Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes.
        </p>
      </UiAlert>

      <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-6">
        <UiAlert v-if="error" variant="danger" :closable="true" @close="error = ''">
          {{ error }}
        </UiAlert>

        <UiInput
          v-model="formData.email"
          label="Adresse email"
          type="email"
          placeholder="votre@email.com"
          :error="errors.email"
          required
        />

        <UiButton type="submit" variant="primary" size="lg" :loading="loading" class="w-full">
          Envoyer le lien de réinitialisation
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
import { forgotPasswordSchema, type ForgotPasswordFormData } from '~/utils/validation';

definePageMeta({
  layout: false,
});

const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

const formData = ref<ForgotPasswordFormData>({
  email: '',
});

const errors = ref<Partial<Record<keyof ForgotPasswordFormData, string>>>({});
const error = ref('');
const success = ref(false);
const loading = ref(false);

const handleSubmit = async () => {
  errors.value = {};
  error.value = '';
  success.value = false;

  // Validation avec Zod
  const result = forgotPasswordSchema.safeParse(formData.value);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errors.value[issue.path[0] as keyof ForgotPasswordFormData] = issue.message;
      }
    });
    return;
  }

  loading.value = true;

  try {
    await apiFetch('/users/forgot-password', {
      method: 'POST',
      body: {
        email: formData.value.email,
      },
    });

    success.value = true;
    notificationsStore.addNotification({
      type: 'success',
      message: 'Email de réinitialisation envoyé !',
    });
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
