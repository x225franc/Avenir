<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-4xl mx-auto">
      <NuxtLink
        to="/admin/investments"
        class="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mb-6"
      >
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        Retour aux actions
      </NuxtLink>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-purple-600" />
      </div>

      <div v-else-if="stock" class="space-y-6">
        <!-- Stock Header -->
        <UiCard padding="lg">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ stock.symbol }}</h1>
              <p class="text-xl text-gray-600">{{ stock.name }}</p>
              <div class="flex items-center gap-3 mt-4">
                <p class="text-4xl font-bold text-gray-900">{{ stock.currentPrice.toFixed(2) }} €</p>
                <UiBadge :variant="stock.change >= 0 ? 'success' : 'danger'" size="lg">
                  {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
                </UiBadge>
              </div>
            </div>
            <div class="flex gap-2">
              <UiButton variant="primary" size="sm" @click="showEditModal = true">
                Modifier
              </UiButton>
              <UiButton variant="danger" size="sm" @click="showDeleteModal = true">
                Supprimer
              </UiButton>
            </div>
          </div>
        </UiCard>

        <!-- Stock Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UiCard padding="lg">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Informations</h2>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">Symbole</p>
                <p class="font-semibold text-lg">{{ stock.symbol }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Nom complet</p>
                <p class="font-semibold">{{ stock.name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Prix actuel</p>
                <p class="font-semibold text-lg">{{ stock.currentPrice.toFixed(2) }} €</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Variation</p>
                <p :class="['font-semibold text-lg', stock.change >= 0 ? 'text-green-600' : 'text-red-600']">
                  {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
                </p>
              </div>
            </div>
          </UiCard>

          <UiCard padding="lg">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Statistiques</h2>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">Nombre d'investisseurs</p>
                <p class="font-semibold text-lg">{{ stock.investorsCount || 0 }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Volume total détenu</p>
                <p class="font-semibold text-lg">{{ stock.totalVolume || 0 }} actions</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Valeur totale du marché</p>
                <p class="font-semibold text-lg">
                  {{ formatCurrency((stock.totalVolume || 0) * stock.currentPrice) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Créée le</p>
                <p class="font-semibold">{{ stock.createdAt ? formatDate(stock.createdAt) : 'N/A' }}</p>
              </div>
            </div>
          </UiCard>
        </div>

        <!-- Recent Orders -->
        <UiCard padding="lg">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Ordres récents</h2>

          <div v-if="orders.length === 0" class="text-center py-8 text-gray-600">
            Aucun ordre pour cette action
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="order in orders" :key="order.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(order.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-gray-900">
                      {{ order.user?.firstName }} {{ order.user?.lastName }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UiBadge :variant="order.orderType === 'BUY' ? 'primary' : 'danger'">
                      {{ order.orderType === 'BUY' ? 'Achat' : 'Vente' }}
                    </UiBadge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ order.quantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ order.price.toFixed(2) }} €
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {{ order.totalAmount.toFixed(2) }} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Edit Modal -->
    <UiModal v-model="showEditModal" title="Modifier l'action">
      <div v-if="stock" class="space-y-4">
        <UiInput v-model="editForm.symbol" label="Symbole" required />
        <UiInput v-model="editForm.name" label="Nom" required />
        <UiInput
          v-model="editForm.currentPrice"
          label="Prix actuel (€)"
          type="number"
          step="0.01"
          required
        />
        <UiInput
          v-model="editForm.change"
          label="Variation (%)"
          type="number"
          step="0.01"
        />
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="showEditModal = false">Annuler</UiButton>
        <UiButton variant="primary" :loading="updating" @click="updateStock">
          Enregistrer
        </UiButton>
      </template>
    </UiModal>

    <!-- Delete Modal -->
    <UiModal v-model="showDeleteModal" title="Confirmer la suppression">
      <p class="text-gray-700">
        Êtes-vous sûr de vouloir supprimer l'action <strong>{{ stock?.symbol }}</strong> ?
      </p>
      <p class="text-sm text-red-600 mt-2">
        Cette action supprimera également toutes les positions et ordres associés. Cette action est irréversible.
      </p>

      <template #footer>
        <UiButton variant="ghost" @click="showDeleteModal = false">Annuler</UiButton>
        <UiButton variant="danger" :loading="deleting" @click="deleteStock">
          Supprimer
        </UiButton>
      </template>
    </UiModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['auth', 'role'],
  role: 'director',
});

const route = useRoute();
const router = useRouter();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

const stockId = route.params.id as string;

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Order {
  id: string;
  orderType: string;
  quantity: number;
  price: number;
  totalAmount: number;
  createdAt: string;
  user?: User;
}

interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  investorsCount?: number;
  totalVolume?: number;
  createdAt?: string;
}

const stock = ref<Stock | null>(null);
const orders = ref<Order[]>([]);
const loading = ref(true);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const updating = ref(false);
const deleting = ref(false);

const editForm = ref({
  symbol: '',
  name: '',
  currentPrice: 0,
  change: 0,
});

const loadStock = async () => {
  try {
    loading.value = true;

    const [stockData, ordersData] = await Promise.all([
      apiFetch<Stock>(`/admin/stocks/${stockId}`),
      apiFetch<Order[]>(`/admin/stocks/${stockId}/orders?limit=10`),
    ]);

    stock.value = stockData;
    orders.value = ordersData;

    editForm.value = {
      symbol: stockData.symbol,
      name: stockData.name,
      currentPrice: stockData.currentPrice,
      change: stockData.change,
    };
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
    router.push('/admin/investments');
  } finally {
    loading.value = false;
  }
};

const updateStock = async () => {
  try {
    updating.value = true;
    await apiFetch(`/admin/stocks/${stockId}`, {
      method: 'PATCH',
      body: {
        symbol: editForm.value.symbol,
        name: editForm.value.name,
        currentPrice: Number(editForm.value.currentPrice),
        change: Number(editForm.value.change),
      },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Action modifiée avec succès',
    });

    showEditModal.value = false;
    await loadStock();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la modification',
    });
  } finally {
    updating.value = false;
  }
};

const deleteStock = async () => {
  try {
    deleting.value = true;
    await apiFetch(`/admin/stocks/${stockId}`, { method: 'DELETE' });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Action supprimée avec succès',
    });

    router.push('/admin/investments');
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la suppression',
    });
  } finally {
    deleting.value = false;
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
  loadStock();
});
</script>
