<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Transactions Clients</h1>

      <!-- Filters -->
      <UiCard padding="lg" class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <UiInput v-model="filters.clientId" label="Client" type="select">
            <select v-model="filters.clientId" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Tous les clients</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.firstName }} {{ client.lastName }}
              </option>
            </select>
          </UiInput>

          <UiInput v-model="filters.type" label="Type" type="select">
            <select v-model="filters.type" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Tous les types</option>
              <option value="transfer">Virement</option>
              <option value="deposit">Dépôt</option>
              <option value="withdrawal">Retrait</option>
            </select>
          </UiInput>

          <UiInput v-model="filters.minAmount" label="Montant min (€)" type="number" step="100" />

          <div class="flex items-end">
            <UiButton variant="ghost" @click="resetFilters" class="w-full">
              Réinitialiser
            </UiButton>
          </div>
        </div>
      </UiCard>

      <!-- Transactions Table -->
      <UiCard padding="lg">
        <div v-if="loading" class="text-center py-12">
          <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-green-600" />
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="text-center py-12">
          <Icon name="heroicons:document-text" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600">Aucune transaction trouvée</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="tx in filteredTransactions" :key="tx.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(tx.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-semibold text-gray-900">
                    {{ tx.client.firstName }} {{ tx.client.lastName }}
                  </div>
                  <div class="text-sm text-gray-600">{{ tx.client.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UiBadge variant="secondary">{{ getTypeLabel(tx.type) }}</UiBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                  {{ formatCurrency(tx.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UiBadge :variant="tx.status === 'completed' ? 'success' : 'warning'">
                    {{ tx.status === 'completed' ? 'Complétée' : 'En attente' }}
                  </UiBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['auth', 'role'],
});

const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  client: Client;
}

const transactions = ref<Transaction[]>([]);
const clients = ref<Client[]>([]);
const loading = ref(true);
const filters = ref({
  clientId: '',
  type: '',
  minAmount: '',
});

const filteredTransactions = computed(() => {
  let result = transactions.value;

  if (filters.value.clientId) {
    result = result.filter((t) => t.client.id === filters.value.clientId);
  }

  if (filters.value.type) {
    result = result.filter((t) => t.type === filters.value.type);
  }

  if (filters.value.minAmount) {
    const min = Number(filters.value.minAmount);
    result = result.filter((t) => t.amount >= min);
  }

  return result;
});

const loadData = async () => {
  try {
    loading.value = true;

    const [txData, clientsData] = await Promise.all([
      apiFetch<Transaction[]>('/advisor/transactions'),
      apiFetch<Client[]>('/advisor/clients'),
    ]);

    transactions.value = txData;
    clients.value = clientsData;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    clientId: '',
    type: '',
    minAmount: '',
  };
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'transfer': return 'Virement';
    case 'deposit': return 'Dépôt';
    case 'withdrawal': return 'Retrait';
    default: return type;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

onMounted(() => {
  loadData();
});
</script>
