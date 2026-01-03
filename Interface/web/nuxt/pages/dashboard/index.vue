<template>
  <NuxtLayout name="dashboard">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg p-8 text-white mb-8">
      <h2 class="text-3xl font-bold mb-2">Bienvenue, {{ authStore.user?.firstName }} !</h2>
      <p class="text-blue-100">Votre espace client pour gérer vos comptes et finances</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Solde total -->
      <UiCard padding="md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Solde total</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatCurrency(totalBalance) }}
            </p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <Icon name="heroicons:wallet" class="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </UiCard>

      <!-- Nombre de comptes -->
      <UiCard padding="md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Mes comptes</p>
            <p class="text-3xl font-bold text-gray-900">{{ accounts.length }}</p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <Icon name="heroicons:credit-card" class="w-8 h-8 text-green-600" />
          </div>
        </div>
      </UiCard>

      <!-- Email vérifié -->
      <UiCard padding="md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Statut du compte</p>
            <p
              :class="[
                'text-lg font-bold flex items-center gap-2',
                authStore.user?.emailVerified ? 'text-green-600' : 'text-yellow-600',
              ]"
            >
              <Icon
                :name="
                  authStore.user?.emailVerified
                    ? 'heroicons:check-circle'
                    : 'heroicons:exclamation-triangle'
                "
                class="w-5 h-5"
              />
              {{ authStore.user?.emailVerified ? 'Vérifié' : 'Non vérifié' }}
            </p>
          </div>
          <div class="bg-purple-100 rounded-full p-3">
            <Icon name="heroicons:shield-check" class="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </UiCard>

      <!-- Messages -->
      <UiCard padding="md" :hoverable="true" @click="router.push('/messages')">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Messagerie</p>
            <p class="text-lg font-bold text-blue-600">Contacter un conseiller</p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <Icon name="heroicons:chat-bubble-left-right" class="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Section des comptes -->
    <UiCard padding="lg">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Mes comptes bancaires</h2>
        <UiButton variant="primary" @click="router.push('/dashboard/accounts/create')">
          <Icon name="heroicons:plus" class="w-5 h-5" />
          Créer un compte
        </UiButton>
      </div>

      <!-- Message d'erreur -->
      <UiAlert v-if="error" variant="danger" class="mb-4" :closable="true" @close="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Loader -->
      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
        <p class="text-gray-600">Chargement de vos comptes...</p>
      </div>

      <!-- Aucun compte -->
      <div v-else-if="accounts.length === 0" class="text-center py-12">
        <Icon name="heroicons:wallet" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p class="text-gray-600 mb-4">Aucun compte bancaire pour le moment</p>
        <UiButton variant="primary" @click="router.push('/dashboard/accounts/create')">
          Créer votre premier compte
        </UiButton>
      </div>

      <!-- Liste des comptes -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="account in accounts"
          :key="account.id"
          class="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer"
          @click="router.push(`/dashboard/accounts/${account.id}`)"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900 mb-1">{{ account.name }}</h3>
              <p class="text-sm text-gray-500">{{ getAccountTypeLabel(account.type) }}</p>
            </div>
            <UiBadge :variant="getAccountTypeBadgeVariant(account.type)">
              <Icon :name="getAccountTypeIcon(account.type)" class="w-4 h-4" />
            </UiBadge>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-500 mb-1">IBAN</p>
            <p class="text-sm font-mono text-gray-700">{{ account.iban }}</p>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <span class="text-sm text-gray-500">Solde</span>
            <span class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(account.balance) }}
            </span>
          </div>

          <div v-if="account.type === 'savings' && account.interestRate" class="mt-2 text-sm text-green-600">
            Taux d'intérêt : {{ account.interestRate }}%
          </div>
        </div>
      </div>
    </UiCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
});

const router = useRouter();
const authStore = useAuthStore();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface Account {
  id: string;
  name: string;
  type: string;
  iban: string;
  balance: number;
  interestRate?: number;
}

const accounts = ref<Account[]>([]);
const loading = ref(true);
const error = ref('');

const totalBalance = computed(() => {
  return accounts.value.reduce((sum, account) => sum + account.balance, 0);
});

const loadAccounts = async () => {
  try {
    loading.value = true;
    error.value = '';
    const data = await apiFetch<Account[]>('/accounts');
    accounts.value = data;
  } catch (err: any) {
    const errorMessage = err.data?.message || err.message || 'Impossible de charger vos comptes';
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
    investment: 'Compte Investissement',
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

const getAccountTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    checking: 'heroicons:credit-card',
    savings: 'heroicons:banknotes',
    investment: 'heroicons:chart-bar',
  };
  return icons[type] || 'heroicons:credit-card';
};

onMounted(() => {
  loadAccounts();
});
</script>
