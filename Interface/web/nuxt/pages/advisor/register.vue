<template>
  <NuxtLayout name="auth">
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-green-700 px-4 py-12">
      <div class="max-w-2xl w-full">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Icon name="heroicons:user-group" class="w-8 h-8 text-green-100" />
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Rejoindre l'équipe</h1>
          <p class="text-green-100">Créer un compte conseiller AVENIR</p>
        </div>

        <!-- Registration Form -->
        <UiCard padding="lg" class="backdrop-blur-sm bg-white/95">
          <UiAlert v-if="error" variant="danger" class="mb-6" :closable="true" @close="error = ''">
            {{ error }}
          </UiAlert>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UiInput
                v-model="formData.firstName"
                label="Prénom"
                type="text"
                placeholder="Jean"
                :error="errors.firstName"
                required
              />

              <UiInput
                v-model="formData.lastName"
                label="Nom"
                type="text"
                placeholder="Dupont"
                :error="errors.lastName"
                required
              />
            </div>

            <UiInput
              v-model="formData.email"
              label="Email professionnel"
              type="email"
              placeholder="conseiller@avenir.fr"
              :error="errors.email"
              required
            />

            <UiInput
              v-model="formData.password"
              label="Mot de passe"
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

            <UiButton type="submit" variant="primary" size="lg" :loading="loading" class="w-full">
              Créer mon compte
            </UiButton>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Vous avez déjà un compte ?
              <NuxtLink to="/advisor/login" class="text-green-600 font-semibold hover:underline">
                Se connecter
              </NuxtLink>
            </p>
          </div>
        </UiCard>

        <!-- Back to main site -->
        <div class="mt-6 text-center">
          <NuxtLink to="/login" class="text-sm text-green-100 hover:text-white flex items-center justify-center gap-2">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            Retour à l'espace client
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { registerSchema } from '~/utils/validation';

definePageMeta({
  layout: false,
  middleware: 'guest',
});

const router = useRouter();
const { register } = useAuth();
const notificationsStore = useNotificationsStore();

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const errors = ref<Record<string, string>>({});
const loading = ref(false);
const error = ref('');

const validateForm = () => {
  errors.value = {};
  const result = registerSchema.safeParse(formData.value);

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
    await register({
      email: formData.value.email,
      password: formData.value.password,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      role: 'advisor',
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Compte créé avec succès ! Veuillez vérifier votre email.',
    });

    router.push('/advisor/login');
  } catch (err: any) {
    const errorMessage = err.data?.message || err.message || 'Erreur lors de la création du compte';
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
