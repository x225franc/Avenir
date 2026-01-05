<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Mon Portefeuille</h1>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-blue-600" />
      </div>

      <div v-else>
        <!-- Portfolio Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Valeur totale</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ portfolioSummary.totalValue.toFixed(2) }} €
            </p>
          </UiCard>

          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Investissement total</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ portfolioSummary.totalInvested.toFixed(2) }} €
            </p>
          </UiCard>

          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Gain/Perte total</p>
            <p
              :class="[
                'text-3xl font-bold',
                portfolioSummary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600',
              ]"
            >
              {{ portfolioSummary.totalGainLoss >= 0 ? '+' : '' }}{{ portfolioSummary.totalGainLoss.toFixed(2) }} €
            </p>
            <UiBadge
              :variant="portfolioSummary.totalGainLossPercent >= 0 ? 'success' : 'danger'"
              class="mt-2"
            >
              {{ portfolioSummary.totalGainLossPercent >= 0 ? '+' : '' }}{{ portfolioSummary.totalGainLossPercent.toFixed(2) }}%
            </UiBadge>
          </UiCard>
        </div>

        <!-- Positions -->
        <UiCard padding="lg">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Mes positions</h2>

          <div v-if="positions.length === 0" class="text-center py-12">
            <Icon name="heroicons:chart-bar" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p class="text-gray-600 mb-4">Vous n'avez aucune position pour le moment</p>
            <UiButton variant="primary" @click="router.push('/investments/stocks')">
              Explorer les actions
            </UiButton>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix d'achat moyen
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix actuel
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valeur totale
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Perte
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="position in positions" :key="position.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-semibold text-gray-900">{{ position.stock.symbol }}</div>
                    <div class="text-sm text-gray-600">{{ position.stock.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                    {{ position.quantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                    {{ position.averageBuyPrice.toFixed(2) }} €
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-semibold text-gray-900">
                      {{ position.stock.currentPrice.toFixed(2) }} €
                    </div>
                    <UiBadge
                      :variant="position.stock.change >= 0 ? 'success' : 'danger'"
                      size="sm"
                    >
                      {{ position.stock.change >= 0 ? '+' : '' }}{{ position.stock.change.toFixed(2) }}%
                    </UiBadge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    {{ position.currentValue.toFixed(2) }} €
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      :class="[
                        'font-semibold',
                        position.gainLoss >= 0 ? 'text-green-600' : 'text-red-600',
                      ]"
                    >
                      {{ position.gainLoss >= 0 ? '+' : '' }}{{ position.gainLoss.toFixed(2) }} €
                    </div>
                    <div
                      :class="[
                        'text-sm',
                        position.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600',
                      ]"
                    >
                      {{ position.gainLossPercent >= 0 ? '+' : '' }}{{ position.gainLossPercent.toFixed(2) }}%
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UiButton
                      variant="danger"
                      size="sm"
                      @click="openSellModal(position)"
                    >
                      Vendre
                    </UiButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Sell Modal -->
    <UiModal
      v-model="showSellModal"
      :title="`Vendre ${selectedPosition?.stock.symbol}`"
    >
      <div v-if="selectedPosition" class="space-y-4">
        <div>
          <p class="text-sm text-gray-600">Prix actuel</p>
          <p class="text-2xl font-bold">{{ selectedPosition.stock.currentPrice.toFixed(2) }} €</p>
        </div>

        <div>
          <p class="text-sm text-gray-600">Quantité détenue</p>
          <p class="text-lg font-semibold">{{ selectedPosition.quantity }}</p>
        </div>

        <UiInput
          v-model="sellAccountId"
          label="Compte d'investissement"
          type="select"
        >
          <select v-model="sellAccountId" class="w-full px-4 py-2 border rounded-lg">
            <option value="">Sélectionnez un compte</option>
            <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
              {{ acc.name }} - {{ acc.balance.toFixed(2) }} €
            </option>
          </select>
        </UiInput>

        <UiInput
          v-model="sellQuantity"
          label="Quantité à vendre"
          type="number"
          min="1"
          :max="selectedPosition.quantity"
        />

        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between mb-2">
            <span>Sous-total</span>
            <span>{{ (selectedPosition.stock.currentPrice * Number(sellQuantity)).toFixed(2) }} €</span>
          </div>
          <div class="flex justify-between mb-2">
            <span>Frais</span>
            <span>{{ transactionFee.toFixed(2) }} €</span>
          </div>
          <div class="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{{ ((selectedPosition.stock.currentPrice * Number(sellQuantity)) - transactionFee).toFixed(2) }} €</span>
          </div>
        </div>
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="showSellModal = false">Annuler</UiButton>
        <UiButton
          variant="danger"
          :loading="sellLoading"
          @click="handleSell"
        >
          Confirmer la vente
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

interface Position {
  id: string;
  stockId: string;
  quantity: number;
  averageBuyPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  stock: Stock;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

const loading = ref(true);
const positions = ref<Position[]>([]);
const accounts = ref<Account[]>([]);
const portfolioSummary = ref({
  totalValue: 0,
  totalInvested: 0,
  totalGainLoss: 0,
  totalGainLossPercent: 0,
});

const showSellModal = ref(false);
const selectedPosition = ref<Position | null>(null);
const sellAccountId = ref('');
const sellQuantity = ref(1);
const sellLoading = ref(false);
const transactionFee = ref(1);

const loadData = async () => {
  try {
    loading.value = true;

    const [portfolioData, accountsData] = await Promise.all([
      apiFetch<{
        positions: Position[];
        summary: {
          totalValue: number;
          totalInvested: number;
          totalGainLoss: number;
          totalGainLossPercent: number;
        };
      }>('/investment/portfolio'),
      apiFetch<Account[]>('/accounts'),
    ]);

    positions.value = portfolioData.positions;
    portfolioSummary.value = portfolioData.summary;

    const investmentAccounts = accountsData.filter((a) => a.type === 'investment');
    accounts.value = investmentAccounts;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
  } finally {
    loading.value = false;
  }
};

const openSellModal = (position: Position) => {
  selectedPosition.value = position;
  sellQuantity.value = 1;
  sellAccountId.value = '';
  showSellModal.value = true;
};

const handleSell = async () => {
  if (!sellAccountId.value || !selectedPosition.value) return;

  try {
    sellLoading.value = true;
    await apiFetch('/investment/orders', {
      method: 'POST',
      body: {
        accountId: sellAccountId.value,
        stockId: selectedPosition.value.stockId,
        orderType: 'SELL',
        quantity: Number(sellQuantity.value),
      },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Ordre de vente passé avec succès !',
    });

    showSellModal.value = false;
    await loadData();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la vente',
    });
  } finally {
    sellLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
