<template>
  <NuxtLayout name="dashboard">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Mes Comptes</h1>
        <p class="mt-2 text-gray-600">Gérez tous vos comptes bancaires</p>
      </div>
      <UiButton variant="primary" size="lg" @click="router.push('/dashboard/accounts/create')">
        <Icon name="heroicons:plus" class="w-5 h-5" />
        Nouveau compte
      </UiButton>
    </div>

    <!-- Error Message -->
    <UiAlert v-if="error" variant="danger" class="mb-6" :closable="true" @close="error = ''">
      {{ error }}
    </UiAlert>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
      <p class="text-gray-600">Chargement...</p>
    </div>

    <!-- Accounts List -->
    <div v-else-if="accounts.length === 0">
      <UiCard padding="lg" class="text-center">
        <Icon name="heroicons:wallet" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun compte</h3>
        <p class="text-gray-600 mb-6">Vous n'avez pas encore de compte bancaire.</p>
        <UiButton variant="primary" @click="router.push('/dashboard/accounts/create')">
          Créer mon premier compte
        </UiButton>
      </UiCard>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="account in accounts"
        :key="account.id"
        :to="`/dashboard/accounts/${account.id}`"
        class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-blue-300"
      >
        <!-- Account Type Badge -->
        <div class="flex items-center justify-between mb-4">
          <UiBadge :variant="getAccountTypeBadgeVariant(account.type)" size="md">
            {{ getAccountTypeLabel(account.type) }}
          </UiBadge>
          <span
            :class="[
              'w-3 h-3 rounded-full',
              account.isActive ? 'bg-green-500' : 'bg-red-500',
            ]"
          ></span>
        </div>

        <!-- Account Name -->
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ account.name }}</h3>

        <!-- IBAN -->
        <p class="text-sm text-gray-500 mb-4 font-mono">{{ account.iban }}</p>

        <!-- Balance -->
        <div class="pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600 mb-1">Solde actuel</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(account.balance) }}</p>
        </div>

        <!-- Interest Rate for Savings -->
        <div
          v-if="account.type === 'savings' && account.interestRate"
          class="mt-3 flex items-center text-sm text-green-600"
        >
          <Icon name="heroicons:arrow-trending-up" class="w-4 h-4 mr-1" />
          <span>{{ (account.interestRate * 100).toFixed(2) }}% / an</span>
        </div>
      </NuxtLink>
    </div>

    <!-- Back to Dashboard -->
    <div class="mt-8">
      <NuxtLink
        to="/dashboard"
        class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
      >
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        Retour au tableau de bord
      </NuxtLink>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
});

const router = useRouter();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface Account {
  id: string;
  name: string;
  type: string;
  iban: string;
  balance: number;
  isActive: boolean;
  interestRate?: number;
}

const accounts = ref<Account[]>([]);
const loading = ref(true);
const error = ref('');

const loadAccounts = async () => {
  try {
    loading.value = true;
    error.value = '';
    const data = await apiFetch<Account[]>('/accounts');
    accounts.value = data;
  } catch (err: any) {
    const errorMessage = err.data?.message || err.message || 'Erreur lors du chargement des comptes';
    error.value = errorMessage;
    notificationsStore.addNotification({
      type: 'error',
      message: errorMessage,
    });
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const getAccountTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    checking: 'Compte Courant',
    savings: 'Compte Épargne',
    investment: 'Compte Titres',
  };
  return labels[type] || type;
};

const getAccountTypeBadgeVariant = (type: string): 'primary' | 'success' | 'info' => {
  const variants: Record<string, 'primary' | 'success' | 'info'> = {
    checking: 'primary',
    savings: 'success',
    investment: 'info',
  };
  return variants[type] || 'primary';
};

onMounted(() => {
  loadAccounts();
});
</script>
