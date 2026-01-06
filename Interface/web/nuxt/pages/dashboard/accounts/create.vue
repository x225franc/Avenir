<template>
  <NuxtLayout name="dashboard">
    <div v-if="success" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:check" class="w-8 h-8 text-green-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Compte créé avec succès !</h2>
        <p class="text-gray-600">Redirection vers vos comptes...</p>
      </div>
    </div>

    <div v-else class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink
          to="/dashboard/accounts"
          class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-4"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          Retour à mes comptes
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900">Créer un nouveau compte</h1>
        <p class="mt-2 text-gray-600">Choisissez le type de compte qui correspond à vos besoins</p>
      </div>

      <UiAlert v-if="error" variant="danger" class="mb-6" :closable="true" @close="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Account Type Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-3">Type de compte *</label>
          <div class="grid gap-4 md:grid-cols-3">
            <label
              v-for="type in accountTypes"
              :key="type.value"
              :class="[
                'relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition',
                formData.accountType === type.value
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              <input
                type="radio"
                v-model="formData.accountType"
                :value="type.value"
                class="sr-only"
              />
              <Icon :name="type.icon" class="w-8 h-8 mb-2" />
              <div class="font-semibold text-gray-900 mb-1">{{ type.label }}</div>
              <div class="text-sm text-gray-600">{{ type.description }}</div>
              <Icon
                v-if="formData.accountType === type.value"
                name="heroicons:check-circle"
                :class="`absolute top-2 right-2 w-6 h-6 text-${type.color}-600`"
              />
            </label>
          </div>
          <p v-if="errors.accountType" class="mt-2 text-sm text-red-600">
            {{ errors.accountType }}
          </p>
        </div>

        <!-- Account Name -->
        <UiInput
          v-model="formData.accountName"
          label="Nom personnalisé du compte"
          placeholder="Ex: Mon compte principal, Épargne vacances..."
          :error="errors.accountName"
          required
        />

        <!-- Initial Deposit (Optional) -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Dépôt initial (optionnel)
          </label>
          <div class="relative">
            <input
              type="number"
              v-model="formData.initialDeposit"
              step="0.01"
              max="10000"
              placeholder="0.00"
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span class="text-gray-500">€</span>
            </div>
          </div>
          <p v-if="errors.initialDeposit" class="mt-2 text-sm text-red-600">
            {{ errors.initialDeposit }}
          </p>
          <p class="mt-2 text-sm text-gray-600">Vous pourrez alimenter votre compte plus tard</p>
        </div>

        <!-- Submit Button -->
        <div class="flex items-center gap-4">
          <UiButton type="submit" variant="primary" size="lg" :loading="loading" class="flex-1">
            Créer le compte
          </UiButton>
          <UiButton variant="ghost" size="lg" @click="router.push('/dashboard/accounts')">
            Annuler
          </UiButton>
        </div>
      </form>

      <!-- Info Box -->
      <UiAlert variant="info" class="mt-8">
        <h3 class="font-semibold mb-1">À savoir</h3>
        <ul class="text-sm space-y-1">
          <li>• Un IBAN unique sera automatiquement généré</li>
          <li>• Vous pouvez créer autant de comptes que vous le souhaitez</li>
          <li>• Les comptes épargne bénéficient d'un taux d'intérêt</li>
          <li>• Vous pourrez modifier ou supprimer vos comptes plus tard</li>
        </ul>
      </UiAlert>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { z } from 'zod';

definePageMeta({
  layout: false,
  middleware: 'auth',
});

const router = useRouter();
const authStore = useAuthStore();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

// Schéma de validation
const createAccountSchema = z.object({
  accountName: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  accountType: z.enum(['checking', 'savings', 'investment']),
  initialDeposit: z
    .number()
    .min(0, 'Le dépôt initial ne peut pas être négatif')
    .optional(),
});

const formData = ref({
  accountName: '',
  accountType: 'checking' as 'checking' | 'savings' | 'investment',
  initialDeposit: 0,
});

const errors = ref<Record<string, string>>({});
const loading = ref(false);
const error = ref('');
const success = ref(false);

const accountTypes = [
  {
    value: 'checking',
    label: 'Compte Courant',
    description: 'Pour vos dépenses quotidiennes et virements',
    icon: 'heroicons:credit-card',
    color: 'blue',
  },
  {
    value: 'savings',
    label: 'Compte Épargne',
    description: 'Pour faire fructifier votre argent avec intérêts',
    icon: 'heroicons:banknotes',
    color: 'green',
  },
  {
    value: 'investment',
    label: 'Compte Titres',
    description: 'Pour investir dans des actions',
    icon: 'heroicons:chart-bar',
    color: 'purple',
  },
];

const validateForm = () => {
  errors.value = {};

  const result = createAccountSchema.safeParse(formData.value);
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
  if (!authStore.isAuthenticated) {
    error.value = 'Vous devez être connecté pour créer un compte';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await apiFetch<{ success: boolean; message?: string; data?: any }>('/accounts', {
      method: 'POST',
      body: {
        accountName: formData.value.accountName,
        accountType: formData.value.accountType,
        initialDeposit: formData.value.initialDeposit || 0,
      },
    });

    if (response.success) {
      success.value = true;
      notificationsStore.addNotification({
        type: 'success',
        message: response.message || 'Compte créé avec succès !',
      });

      setTimeout(() => {
        router.push('/dashboard/accounts');
      }, 1500);
    }
  } catch (err: any) {
    const errorMessage =
      err.data?.message || err.message || 'Impossible de créer le compte';
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
