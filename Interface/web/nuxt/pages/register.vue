<template>
  <NuxtLayout name="auth">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ theme.title }}
        </h1>
        <p class="text-gray-600 flex items-center justify-center gap-2">
          <Icon :name="theme.icon" class="w-6 h-6" :class="theme.iconColor" />
          {{ theme.subtitle }}
        </p>
      </div>

      <!-- Messages -->
      <UiAlert v-if="error" variant="danger" class="mb-4" :closable="true" @close="error = ''">
        {{ error }}
      </UiAlert>
      <UiAlert v-if="success" variant="success" class="mb-4">
        {{ success }}
      </UiAlert>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email -->
        <UiInput
          v-model="formData.email"
          label="Email"
          type="email"
          placeholder="votre@email.com"
          :error="errors.email"
          required
        />

        <!-- Prénom & Nom -->
        <div class="grid grid-cols-2 gap-4">
          <UiInput
            v-model="formData.firstName"
            label="Prénom"
            placeholder="Jean"
            :error="errors.firstName"
            required
          />
          <UiInput
            v-model="formData.lastName"
            label="Nom"
            placeholder="Dupont"
            :error="errors.lastName"
            required
          />
        </div>

        <!-- Mot de passe -->
        <UiInput
          v-model="formData.password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          required
        />

        <!-- Confirmation mot de passe -->
        <UiInput
          v-model="formData.confirmPassword"
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          :error="errors.confirmPassword"
          required
        />

        <!-- Téléphone (optionnel) -->
        <UiInput
          v-model="formData.phoneNumber"
          label="Téléphone"
          type="tel"
          placeholder="06 12 34 56 78"
          :error="errors.phoneNumber"
        />

        <!-- Adresse (optionnel) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <textarea
            v-model="formData.address"
            rows="2"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="123 Rue de Paris, 75001 Paris"
          />
          <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
        </div>

        <!-- Bouton -->
        <UiButton type="submit" variant="primary" size="lg" :loading="loading" class="w-full">
          S'inscrire
        </UiButton>
      </form>

      <!-- Lien vers connexion -->
      <p class="mt-6 text-center text-sm text-gray-600">
        Déjà inscrit ?
        <NuxtLink :to="loginLink" :class="`${theme.linkColor} font-semibold`">
          Se connecter
        </NuxtLink>
      </p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { registerSchema, type RegisterFormData } from '~/utils/validation';

definePageMeta({
  layout: false,
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

const formData = ref<RegisterFormData>({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  address: '',
});

const errors = ref<Partial<Record<keyof RegisterFormData, string>>>({});
const error = ref('');
const success = ref('');
const loading = ref(false);

// Détecter le type d'utilisateur basé sur l'URL
const getUserTypeFromPath = () => {
  const path = route.path;
  if (path.includes('/admin')) return 'director';
  if (path.includes('/advisor')) return 'advisor';
  return 'client';
};

const userType = getUserTypeFromPath();

// Configuration des thèmes
const theme = computed(() => {
  switch (userType) {
    case 'director':
      return {
        title: 'Administration AVENIR',
        subtitle: 'Créer un compte directeur',
        linkColor: 'text-purple-600 hover:text-purple-700',
        icon: 'heroicons:briefcase',
        iconColor: 'text-purple-600',
      };
    case 'advisor':
      return {
        title: 'Conseillers AVENIR',
        subtitle: 'Créer un compte conseiller',
        linkColor: 'text-green-600 hover:text-green-700',
        icon: 'heroicons:user-group',
        iconColor: 'text-green-600',
      };
    default:
      return {
        title: 'Banque AVENIR',
        subtitle: 'Créer votre compte',
        linkColor: 'text-blue-600 hover:text-blue-700',
        icon: 'heroicons:user',
        iconColor: 'text-blue-600',
      };
  }
});

const loginLink = computed(() => {
  if (userType === 'client') return '/login';
  return `/${userType === 'director' ? 'admin' : userType}/login`;
});

// Rediriger si déjà authentifié
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});

const handleSubmit = async () => {
  errors.value = {};
  error.value = '';
  success.value = '';

  // Validation avec Zod
  const result = registerSchema.safeParse(formData.value);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errors.value[issue.path[0] as keyof RegisterFormData] = issue.message;
      }
    });
    return;
  }

  loading.value = true;

  try {
    const response = await apiFetch<{ message: string }>('/auth/register', {
      method: 'POST',
      body: {
        email: formData.value.email,
        password: formData.value.password,
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        phoneNumber: formData.value.phoneNumber || undefined,
        address: formData.value.address || undefined,
        role: userType,
      },
    });

    const roleMessage =
      userType === 'director' ? 'directeur' : userType === 'advisor' ? 'conseiller' : 'client';
    success.value = `Inscription ${roleMessage} réussie ! Vérifiez votre email pour activer votre compte.`;

    notificationsStore.addNotification({
      type: 'success',
      message: success.value,
    });

    setTimeout(() => {
      router.push(loginLink.value);
    }, 2000);
  } catch (err: any) {
    const errorMessage = err.data?.message || err.message || "Erreur lors de l'inscription";
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
