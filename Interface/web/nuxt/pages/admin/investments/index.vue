<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Actions</h1>
        <UiButton variant="primary" @click="showCreateModal = true">
          Ajouter une action
        </UiButton>
      </div>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-purple-600" />
      </div>

      <UiCard v-else padding="lg">
        <div v-if="stocks.length === 0" class="text-center py-12">
          <Icon name="heroicons:chart-bar" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600">Aucune action disponible</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbole</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix actuel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variation</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="stock in stocks" :key="stock.id">
                <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                  {{ stock.symbol }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900">{{ stock.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-semibold">
                  {{ stock.currentPrice.toFixed(2) }} €
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UiBadge :variant="stock.change >= 0 ? 'success' : 'danger'">
                    {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
                  </UiBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex gap-2">
                    <UiButton variant="ghost" size="sm" @click="editStock(stock)">
                      Modifier
                    </UiButton>
                    <UiButton variant="danger" size="sm" @click="openDeleteModal(stock)">
                      Supprimer
                    </UiButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>

    <!-- Create/Edit Modal -->
    <UiModal v-model="showCreateModal" :title="editingStock ? 'Modifier l\'action' : 'Ajouter une action'">
      <div class="space-y-4">
        <UiInput v-model="stockForm.symbol" label="Symbole" placeholder="AAPL" required />
        <UiInput v-model="stockForm.name" label="Nom de l'entreprise" placeholder="Apple Inc." required />
        <UiInput
          v-model="stockForm.currentPrice"
          label="Prix actuel (€)"
          type="number"
          step="0.01"
          min="0.01"
          required
        />
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="showCreateModal = false">Annuler</UiButton>
        <UiButton variant="primary" :loading="saving" @click="saveStock">
          {{ editingStock ? 'Modifier' : 'Créer' }}
        </UiButton>
      </template>
    </UiModal>

    <!-- Delete Modal -->
    <UiModal v-model="showDeleteModal" title="Confirmer la suppression">
      <p>Êtes-vous sûr de vouloir supprimer l'action <strong>{{ selectedStock?.symbol }}</strong> ?</p>
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

const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
}

const stocks = ref<Stock[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const editingStock = ref<Stock | null>(null);
const selectedStock = ref<Stock | null>(null);
const saving = ref(false);
const deleting = ref(false);

const stockForm = ref({
  symbol: '',
  name: '',
  currentPrice: 0,
  change: 0,
});

const loadStocks = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<Stock[]>('/admin/stocks');
    stocks.value = data;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
  } finally {
    loading.value = false;
  }
};

const editStock = (stock: Stock) => {
  editingStock.value = stock;
  stockForm.value = { ...stock };
  showCreateModal.value = true;
};

const saveStock = async () => {
  try {
    saving.value = true;

    if (editingStock.value) {
      await apiFetch(`/admin/stocks/${editingStock.value.id}`, {
        method: 'PATCH',
        body: {
          symbol: stockForm.value.symbol,
          companyName: stockForm.value.name,
          currentPrice: Number(stockForm.value.currentPrice),
        },
      });
      notificationsStore.addNotification({
        type: 'success',
        message: 'Action modifiée avec succès',
      });
    } else {
      await apiFetch('/admin/stocks', {
        method: 'POST',
        body: {
          symbol: stockForm.value.symbol,
          companyName: stockForm.value.name,
          currentPrice: Number(stockForm.value.currentPrice),
        },
      });
      notificationsStore.addNotification({
        type: 'success',
        message: 'Action créée avec succès',
      });
    }

    showCreateModal.value = false;
    editingStock.value = null;
    stockForm.value = { symbol: '', name: '', currentPrice: 0, change: 0 };
    await loadStocks();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la sauvegarde',
    });
  } finally {
    saving.value = false;
  }
};

const openDeleteModal = (stock: Stock) => {
  selectedStock.value = stock;
  showDeleteModal.value = true;
};

const deleteStock = async () => {
  if (!selectedStock.value) return;

  try {
    deleting.value = true;
    await apiFetch(`/admin/stocks/${selectedStock.value.id}`, { method: 'DELETE' });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Action supprimée avec succès',
    });

    stocks.value = stocks.value.filter((s) => s.id !== selectedStock.value!.id);
    showDeleteModal.value = false;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la suppression',
    });
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  loadStocks();
});
</script>
