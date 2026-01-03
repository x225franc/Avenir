<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Historique des ordres</h1>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-blue-600" />
      </div>

      <div v-else>
        <!-- Filters -->
        <UiCard padding="lg" class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UiInput v-model="filters.orderType" label="Type d'ordre" type="select">
              <select v-model="filters.orderType" class="w-full px-4 py-2 border rounded-lg">
                <option value="">Tous les types</option>
                <option value="BUY">Achat</option>
                <option value="SELL">Vente</option>
              </select>
            </UiInput>

            <UiInput v-model="filters.status" label="Statut" type="select">
              <select v-model="filters.status" class="w-full px-4 py-2 border rounded-lg">
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="EXECUTED">Exécuté</option>
                <option value="CANCELLED">Annulé</option>
                <option value="FAILED">Échoué</option>
              </select>
            </UiInput>

            <div class="flex items-end">
              <UiButton variant="ghost" @click="resetFilters" class="w-full">
                Réinitialiser les filtres
              </UiButton>
            </div>
          </div>
        </UiCard>

        <!-- Orders Table -->
        <UiCard padding="lg">
          <div v-if="filteredOrders.length === 0" class="text-center py-12">
            <Icon name="heroicons:document-text" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p class="text-gray-600 mb-4">Aucun ordre trouvé</p>
            <UiButton variant="primary" @click="router.push('/investments/stocks')">
              Passer un ordre
            </UiButton>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="order in filteredOrders" :key="order.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(order.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-semibold text-gray-900">{{ order.stock.symbol }}</div>
                    <div class="text-sm text-gray-600">{{ order.stock.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UiBadge :variant="order.orderType === 'BUY' ? 'primary' : 'danger'">
                      {{ order.orderType === 'BUY' ? 'Achat' : 'Vente' }}
                    </UiBadge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                    {{ order.quantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                    {{ order.price.toFixed(2) }} €
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    {{ order.totalAmount.toFixed(2) }} €
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UiBadge :variant="getStatusVariant(order.status)">
                      {{ getStatusLabel(order.status) }}
                    </UiBadge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UiButton
                      variant="ghost"
                      size="sm"
                      @click="viewOrderDetails(order)"
                    >
                      Détails
                    </UiButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Order Details Modal -->
    <UiModal
      v-model="showDetailsModal"
      :title="`Détails de l'ordre #${selectedOrder?.id.slice(0, 8)}`"
    >
      <div v-if="selectedOrder" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Date</p>
            <p class="font-semibold">{{ formatDate(selectedOrder.createdAt) }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-600">Statut</p>
            <UiBadge :variant="getStatusVariant(selectedOrder.status)">
              {{ getStatusLabel(selectedOrder.status) }}
            </UiBadge>
          </div>

          <div>
            <p class="text-sm text-gray-600">Action</p>
            <p class="font-semibold">{{ selectedOrder.stock.symbol }}</p>
            <p class="text-sm text-gray-600">{{ selectedOrder.stock.name }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-600">Type</p>
            <UiBadge :variant="selectedOrder.orderType === 'BUY' ? 'primary' : 'danger'">
              {{ selectedOrder.orderType === 'BUY' ? 'Achat' : 'Vente' }}
            </UiBadge>
          </div>

          <div>
            <p class="text-sm text-gray-600">Quantité</p>
            <p class="font-semibold">{{ selectedOrder.quantity }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-600">Prix unitaire</p>
            <p class="font-semibold">{{ selectedOrder.price.toFixed(2) }} €</p>
          </div>

          <div>
            <p class="text-sm text-gray-600">Compte</p>
            <p class="font-semibold">{{ selectedOrder.account?.name || 'N/A' }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-600">Montant total</p>
            <p class="font-semibold text-lg">{{ selectedOrder.totalAmount.toFixed(2) }} €</p>
          </div>
        </div>

        <div v-if="selectedOrder.executedAt" class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Date d'exécution</p>
          <p class="font-semibold">{{ formatDate(selectedOrder.executedAt) }}</p>
        </div>
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="showDetailsModal = false">Fermer</UiButton>
      </template>
    </UiModal>
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

interface Stock {
  id: string;
  symbol: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
}

interface Order {
  id: string;
  stockId: string;
  accountId: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'FAILED';
  createdAt: string;
  executedAt?: string;
  stock: Stock;
  account?: Account;
}

const loading = ref(true);
const orders = ref<Order[]>([]);
const filters = ref({
  orderType: '',
  status: '',
});

const showDetailsModal = ref(false);
const selectedOrder = ref<Order | null>(null);

const filteredOrders = computed(() => {
  let result = orders.value;

  if (filters.value.orderType) {
    result = result.filter((o) => o.orderType === filters.value.orderType);
  }

  if (filters.value.status) {
    result = result.filter((o) => o.status === filters.value.status);
  }

  return result;
});

const loadOrders = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<Order[]>('/investments/orders');
    orders.value = data;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement des ordres',
    });
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    orderType: '',
    status: '',
  };
};

const viewOrderDetails = (order: Order) => {
  selectedOrder.value = order;
  showDetailsModal.value = true;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'EXECUTED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
      return 'secondary';
    case 'FAILED':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'EXECUTED':
      return 'Exécuté';
    case 'PENDING':
      return 'En attente';
    case 'CANCELLED':
      return 'Annulé';
    case 'FAILED':
      return 'Échoué';
    default:
      return status;
  }
};

onMounted(() => {
  loadOrders();
});
</script>
