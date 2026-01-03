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

      <!-- Message d'erreur -->
      <UiAlert v-if="error" variant="danger" class="mb-4" :closable="true" @close="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Email -->
        <UiInput
          v-model="formData.email"
          label="Email"
          type="email"
          placeholder="votre@email.com"
          :error="errors.email"
          required
        />

        <!-- Mot de passe -->
        <UiInput
          v-model="formData.password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          required
        />

        <!-- Lien mot de passe oublié -->
        <div class="text-right">
          <NuxtLink to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-700">
            Mot de passe oublié ?
          </NuxtLink>
        </div>

        <!-- Bouton -->
        <UiButton
          type="submit"
          :variant="theme.variant"
          size="lg"
          :loading="loading"
          class="w-full"
        >
          Se connecter
        </UiButton>
      </form>

      <!-- Lien vers inscription -->
      <p class="mt-6 text-center text-sm text-gray-600">
        Pas encore de compte ?
        <NuxtLink :to="registerLink" :class="`${theme.linkColor} font-semibold`">
          S'inscrire
        </NuxtLink>
      </p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { loginSchema, type LoginFormData } from '~/utils/validation';

definePageMeta({
  layout: false,
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { login } = useAuth();
const notificationsStore = useNotificationsStore();

const formData = ref<LoginFormData>({
  email: '',
  password: '',
});

const errors = ref<Partial<Record<keyof LoginFormData, string>>>({});
const error = ref('');
const loading = ref(false);

// Détecter le type d'utilisateur basé sur l'URL
const getUserTypeFromPath = () => {
  const path = route.path;
  if (path.includes('/admin')) return 'director';
  if (path.includes('/advisor')) return 'advisor';
  return 'client';
};

const userType = getUserTypeFromPath();

// Configuration des thèmes selon le type d'utilisateur
const theme = computed(() => {
  switch (userType) {
    case 'director':
      return {
        title: 'Administration AVENIR',
        subtitle: 'Connexion directeur',
        variant: 'primary' as const,
        linkColor: 'text-purple-600 hover:text-purple-700',
        icon: 'heroicons:briefcase',
        iconColor: 'text-purple-600',
      };
    case 'advisor':
      return {
        title: 'Conseillers AVENIR',
        subtitle: 'Connexion conseiller',
        variant: 'primary' as const,
        linkColor: 'text-green-600 hover:text-green-700',
        icon: 'heroicons:user-group',
        iconColor: 'text-green-600',
      };
    default:
      return {
        title: 'Banque AVENIR',
        subtitle: 'Connectez-vous à votre compte',
        variant: 'primary' as const,
        linkColor: 'text-blue-600 hover:text-blue-700',
        icon: 'heroicons:user',
        iconColor: 'text-blue-600',
      };
  }
});

const registerLink = computed(() => {
  if (userType === 'client') return '/register';
  return `/${userType === 'director' ? 'admin' : userType}/register`;
});

// Rediriger si déjà authentifié
onMounted(() => {
  if (authStore.isAuthenticated && authStore.user) {
    const user = authStore.user;
    if (user.role === 'director') {
      router.push('/admin/dashboard');
    } else if (user.role === 'advisor') {
      router.push('/advisor/dashboard');
    } else {
      router.push('/dashboard');
    }
  }
});

const handleSubmit = async () => {
  errors.value = {};
  error.value = '';

  // Validation avec Zod
  const result = loginSchema.safeParse(formData.value);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errors.value[issue.path[0] as keyof LoginFormData] = issue.message;
      }
    });
    return;
  }

  loading.value = true;

  try {
    await login(formData.value.email, formData.value.password);

    // Redirection selon le rôle réel de l'utilisateur (depuis authStore après login)
    const user = authStore.user;
    if (user?.role === 'director') {
      router.push('/admin/dashboard');
    } else if (user?.role === 'advisor') {
      router.push('/advisor/dashboard');
    } else {
      router.push('/dashboard');
    }
  } catch (err: any) {
    const errorMessage = err.data?.message || err.message || 'Email ou mot de passe incorrect';
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
