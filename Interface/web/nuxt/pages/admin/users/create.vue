<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-3xl mx-auto">
      <div class="mb-8">
        <NuxtLink
          to="/admin/users"
          class="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mb-4"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          Retour aux utilisateurs
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900">Créer un utilisateur</h1>
      </div>

      <UiAlert v-if="error" variant="danger" class="mb-6" :closable="true" @close="error = ''">
        {{ error }}
      </UiAlert>

      <UiCard padding="lg">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Role Selection -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-3">Rôle *</label>
            <div class="grid gap-4 md:grid-cols-3">
              <label
                v-for="role in roles"
                :key="role.value"
                :class="[
                  'relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition',
                  formData.role === role.value
                    ? `border-${role.color}-500 bg-${role.color}-50`
                    : 'border-gray-200 hover:border-gray-300',
                ]"
              >
                <input
                  type="radio"
                  v-model="formData.role"
                  :value="role.value"
                  class="sr-only"
                />
                <Icon :name="role.icon" class="w-8 h-8 mb-2" :class="`text-${role.color}-600`" />
                <div class="font-semibold text-gray-900 mb-1">{{ role.label }}</div>
                <div class="text-sm text-gray-600">{{ role.description }}</div>
                <Icon
                  v-if="formData.role === role.value"
                  name="heroicons:check-circle"
                  :class="`absolute top-2 right-2 w-6 h-6 text-${role.color}-600`"
                />
              </label>
            </div>
            <p v-if="errors.role" class="mt-2 text-sm text-red-600">{{ errors.role }}</p>
          </div>

          <!-- Personal Information -->
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
            label="Email"
            type="email"
            placeholder="utilisateur@avenir.fr"
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

          <!-- Submit -->
          <div class="flex items-center gap-4">
            <UiButton type="submit" variant="primary" size="lg" :loading="loading" class="flex-1">
              Créer l'utilisateur
            </UiButton>
            <UiButton variant="ghost" size="lg" @click="router.push('/admin/users')">
              Annuler
            </UiButton>
          </div>
        </form>
      </UiCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { z } from 'zod';

definePageMeta({
  layout: false,
  middleware: ['auth', 'role'],
  role: 'director',
});

const router = useRouter();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

const createUserSchema = z
  .object({
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
    role: z.enum(['client', 'advisor', 'director']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'client' as 'client' | 'advisor' | 'director',
});

const errors = ref<Record<string, string>>({});
const loading = ref(false);
const error = ref('');

const roles = [
  {
    value: 'client',
    label: 'Client',
    description: 'Utilisateur standard avec accès aux services bancaires',
    icon: 'heroicons:user',
    color: 'blue',
  },
  {
    value: 'advisor',
    label: 'Conseiller',
    description: 'Conseiller bancaire avec accès aux outils de gestion client',
    icon: 'heroicons:user-group',
    color: 'green',
  },
  {
    value: 'director',
    label: 'Directeur',
    description: 'Accès administrateur complet',
    icon: 'heroicons:briefcase',
    color: 'purple',
  },
];

const validateForm = () => {
  errors.value = {};
  const result = createUserSchema.safeParse(formData.value);

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
    await apiFetch('/admin/users', {
      method: 'POST',
      body: {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        email: formData.value.email,
        password: formData.value.password,
        role: formData.value.role,
      },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Utilisateur créé avec succès',
    });

    router.push('/admin/users');
  } catch (err: any) {
    const errorMessage = err.data?.message || err.message || 'Erreur lors de la création';
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
