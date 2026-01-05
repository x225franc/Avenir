<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Actions disponibles</h1>

      <UiAlert v-if="!hasInvestmentAccount" variant="warning" class="mb-6">
        <h3 class="font-semibold mb-2">Compte d'investissement requis</h3>
        <p class="mb-4">Vous devez créer un compte d'investissement pour acheter des actions.</p>
        <UiButton variant="primary" @click="router.push('/dashboard/accounts/create')">
          Créer un compte d'investissement
        </UiButton>
      </UiAlert>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-blue-600" />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UiCard v-for="stock in stocks" :key="stock.id" padding="lg" :hoverable="true">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ stock.symbol }}</h3>
              <p class="text-sm text-gray-600">{{ stock.name }}</p>
            </div>
            <UiBadge :variant="stock.change >= 0 ? 'success' : 'danger'">
              {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
            </UiBadge>
          </div>

          <div class="mb-4">
            <p class="text-3xl font-bold text-gray-900">
              {{ stock.currentPrice.toFixed(2) }} €
            </p>
          </div>

          <div class="mb-4 text-sm text-gray-600">
            <p>Quantité détenue: {{ userPositions.get(stock.id) || 0 }}</p>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <UiButton
              variant="primary"
              size="sm"
              @click="openOrderModal(stock, 'buy')"
              :disabled="!hasInvestmentAccount"
            >
              Acheter
            </UiButton>
            <UiButton
              variant="danger"
              size="sm"
              @click="openOrderModal(stock, 'sell')"
              :disabled="!userPositions.get(stock.id)"
            >
              Vendre
            </UiButton>
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Order Modal -->
    <UiModal v-model="showOrderModal" :title="`${orderType === 'buy' ? 'Acheter' : 'Vendre'} ${selectedStock?.symbol}`">
      <div v-if="selectedStock" class="space-y-4">
        <div>
          <p class="text-sm text-gray-600">Prix unitaire</p>
          <p class="text-2xl font-bold">{{ selectedStock.currentPrice.toFixed(2) }} €</p>
        </div>

        <div v-if="orderType === 'sell'">
          <p class="text-sm text-gray-600">Quantité détenue</p>
          <p class="text-lg font-semibold">{{ userPositions.get(selectedStock.id) || 0 }}</p>
        </div>

        <UiInput
          v-model="accountId"
          label="Compte d'investissement"
          type="select"
        >
          <select v-model="accountId" class="w-full px-4 py-2 border rounded-lg">
            <option value="">Sélectionnez un compte</option>
            <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
              {{ acc.name }} - {{ acc.balance.toFixed(2) }} €
            </option>
          </select>
        </UiInput>

        <UiInput
          v-model="quantity"
          label="Quantité"
          type="number"
          min="1"
          :max="orderType === 'sell' ? userPositions.get(selectedStock.id) : undefined"
        />

        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between mb-2">
            <span>Sous-total</span>
            <span>{{ (selectedStock.currentPrice * Number(quantity)).toFixed(2) }} €</span>
          </div>
          <div class="flex justify-between mb-2">
            <span>Frais</span>
            <span>{{ transactionFee.toFixed(2) }} €</span>
          </div>
          <div class="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{{ ((selectedStock.currentPrice * Number(quantity)) + transactionFee).toFixed(2) }} €</span>
          </div>
        </div>
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="showOrderModal = false">Annuler</UiButton>
        <UiButton
          :variant="orderType === 'buy' ? 'primary' : 'danger'"
          :loading="orderLoading"
          @click="placeOrder"
        >
          Confirmer {{ orderType === 'buy' ? "l'achat" : 'la vente' }}
        </UiButton>
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
  currentPrice: number;
  change: number;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

const stocks = ref<Stock[]>([]);
const accounts = ref<Account[]>([]);
const loading = ref(true);
const hasInvestmentAccount = ref(false);
const userPositions = ref(new Map<string, number>());

const showOrderModal = ref(false);
const selectedStock = ref<Stock | null>(null);
const orderType = ref<'buy' | 'sell'>('buy');
const accountId = ref('');
const quantity = ref(1);
const orderLoading = ref(false);
const transactionFee = ref(1);

const loadData = async () => {
  try {
    loading.value = true;

    const [stocksData, accountsData, portfolioData] = await Promise.all([
      apiFetch<Stock[]>('/investment/stocks'),
      apiFetch<Account[]>('/accounts'),
      apiFetch<{ positions: Array<{ stockId: string; quantity: number }> }>('/investment/portfolio'),
    ]);

    stocks.value = stocksData;

    const investmentAccounts = accountsData.filter((a) => a.type === 'investment');
    accounts.value = investmentAccounts;
    hasInvestmentAccount.value = investmentAccounts.length > 0;

    const positionsMap = new Map<string, number>();
    portfolioData.positions.forEach((p) => {
      positionsMap.set(p.stockId, p.quantity);
    });
    userPositions.value = positionsMap;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
  } finally {
    loading.value = false;
  }
};

const openOrderModal = (stock: Stock, type: 'buy' | 'sell') => {
  selectedStock.value = stock;
  orderType.value = type;
  quantity.value = 1;
  showOrderModal.value = true;
};

const placeOrder = async () => {
  if (!accountId.value || !selectedStock.value) return;

  try {
    orderLoading.value = true;
    await apiFetch('/investment/orders', {
      method: 'POST',
      body: {
        accountId: accountId.value,
        stockId: selectedStock.value.id,
        orderType: orderType.value.toUpperCase(),
        quantity: Number(quantity.value),
      },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: `Ordre ${orderType.value === 'buy' ? "d'achat" : 'de vente'} passé avec succès !`,
    });

    showOrderModal.value = false;
    await loadData();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la commande',
    });
  } finally {
    orderLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
