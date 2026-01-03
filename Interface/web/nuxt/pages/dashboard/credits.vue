<template>
  <NuxtLayout name="dashboard">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Mes Crédits</h1>
      <p class="text-xl text-gray-600">Consultez l'état de vos crédits en cours</p>
    </div>

    <UiAlert v-if="error" variant="danger" class="mb-8" :closable="true" @close="error = ''">
      {{ error }}
    </UiAlert>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="svg-spinners:ring-resize" class="w-32 h-32 mx-auto mb-4 text-blue-600 animate-spin" />
      <p class="text-gray-600">Chargement des crédits...</p>
    </div>

    <!-- Aucun crédit -->
    <UiCard v-else-if="credits.length === 0" padding="lg" class="text-center">
      <Icon name="heroicons:document-text" class="w-16 h-16 mx-auto mb-3 text-gray-400" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun crédit</h3>
      <p class="text-sm text-gray-500 mb-6">Vous n'avez actuellement aucun crédit actif.</p>
      <UiButton variant="primary" @click="router.push('/dashboard')">
        Retour au dashboard
      </UiButton>
    </UiCard>

    <!-- Liste des crédits -->
    <div v-else class="space-y-6">
      <UiCard v-for="credit in credits" :key="credit.id" padding="lg">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">Crédit #{{ credit.id }}</h3>
            <p class="text-sm text-gray-500 mt-1">
              Créé le {{ formatDate(credit.createdAt) }}
            </p>
          </div>
          <UiBadge :variant="getStatusBadgeVariant(credit.status)" size="md">
            {{ getStatusLabel(credit.status) }}
          </UiBadge>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500 mb-1">Capital initial</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(credit.principalAmount) }}
            </p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500 mb-1">Capital restant</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(credit.remainingBalance) }}
            </p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500 mb-1">Mensualité</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ formatCurrency(credit.monthlyPayment) }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
          <div>
            <p class="text-gray-500">Durée totale</p>
            <p class="font-semibold text-gray-900">{{ credit.durationMonths }} mois</p>
          </div>
          <div>
            <p class="text-gray-500">Mois restants</p>
            <p class="font-semibold text-gray-900">{{ credit.remainingMonths }} mois</p>
          </div>
          <div>
            <p class="text-gray-500">Taux annuel</p>
            <p class="font-semibold text-gray-900">
              {{ (credit.annualInterestRate * 100).toFixed(2) }}%
            </p>
          </div>
          <div>
            <p class="text-gray-500">Taux assurance</p>
            <p class="font-semibold text-gray-900">
              {{ (credit.insuranceRate * 100).toFixed(2) }}%
            </p>
          </div>
        </div>

        <UiAlert v-if="credit.status === 'active'" variant="info">
          <Icon name="heroicons:light-bulb" class="w-5 h-5" />
          Les mensualités sont prélevées automatiquement chaque mois sur votre compte.
        </UiAlert>

        <UiAlert v-if="credit.status === 'paid_off'" variant="success">
          <Icon name="heroicons:check-circle" class="w-5 h-5" />
          Félicitations ! Ce crédit a été entièrement remboursé.
        </UiAlert>
      </UiCard>
    </div>
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

interface Credit {
  id: number;
  principalAmount: number;
  remainingBalance: number;
  monthlyPayment: number;
  durationMonths: number;
  remainingMonths: number;
  annualInterestRate: number;
  insuranceRate: number;
  status: string;
  createdAt: string;
}

const credits = ref<Credit[]>([]);
const loading = ref(true);
const error = ref('');

const loadCredits = async () => {
  if (!authStore.user?.id) return;

  try {
    loading.value = true;
    error.value = '';
    const userId = authStore.user.id;
    const data = await apiFetch<Credit[]>(`/credits/user/${userId}`);
    credits.value = data;
  } catch (err: any) {
    // Ne pas afficher d'erreur si c'est une 401 (l'utilisateur sera redirigé)
    if (err.statusCode !== 401) {
      const errorMessage =
        err.data?.message || err.message || 'Erreur lors du chargement des crédits';
      error.value = errorMessage;
      notificationsStore.addNotification({
        type: 'error',
        message: errorMessage,
      });
    }
  } finally {
    loading.value = false;
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: 'Actif',
    paid_off: 'Remboursé',
    defaulted: 'En défaut',
  };
  return labels[status] || status;
};

const getStatusBadgeVariant = (status: string): 'success' | 'primary' | 'danger' => {
  const variants: Record<string, 'success' | 'primary' | 'danger'> = {
    active: 'success',
    paid_off: 'primary',
    defaulted: 'danger',
  };
  return variants[status] || 'primary';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

onMounted(() => {
  loadCredits();
});
</script>
