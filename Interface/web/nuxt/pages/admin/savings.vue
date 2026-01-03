<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Gestion des Taux d'Épargne</h1>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-purple-600" />
      </div>

      <div v-else class="space-y-6">
        <!-- Current Rate -->
        <UiCard padding="lg">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Taux d'intérêt actuel</h2>
          <div class="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <p class="text-sm text-green-800 mb-2">Taux annuel pour les comptes épargne</p>
            <p class="text-4xl font-bold text-green-900">{{ currentRate.toFixed(2) }}%</p>
            <p class="text-sm text-green-700 mt-2">Dernière mise à jour: {{ formatDate(lastUpdate) }}</p>
          </div>
        </UiCard>

        <!-- Update Rate -->
        <UiCard padding="lg">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Modifier le taux</h2>
          <UiAlert variant="info" class="mb-4">
            Les intérêts seront calculés automatiquement chaque mois pour tous les comptes épargne.
          </UiAlert>

          <form @submit.prevent="updateRate" class="space-y-4">
            <UiInput
              v-model="newRate"
              label="Nouveau taux d'intérêt annuel (%)"
              type="number"
              step="0.01"
              min="0"
              max="10"
              required
            />

            <UiButton type="submit" variant="primary" :loading="updating">
              Mettre à jour le taux
            </UiButton>
          </form>
        </UiCard>

        <!-- Rate History -->
        <UiCard padding="lg">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Historique des taux</h2>

          <div v-if="rateHistory.length === 0" class="text-center py-8 text-gray-600">
            Aucun historique disponible
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(rate, index) in rateHistory"
              :key="index"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-semibold text-gray-900">{{ rate.rate.toFixed(2) }}%</p>
                <p class="text-sm text-gray-600">{{ formatDate(rate.date) }}</p>
              </div>
              <UiBadge v-if="index === 0" variant="success">Actuel</UiBadge>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
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

interface RateHistory {
  rate: number;
  date: string;
}

const loading = ref(true);
const currentRate = ref(0);
const lastUpdate = ref('');
const newRate = ref(0);
const updating = ref(false);
const rateHistory = ref<RateHistory[]>([]);

const loadRateInfo = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<{
      currentRate: number;
      lastUpdate: string;
      history: RateHistory[];
    }>('/admin/savings-rate');

    currentRate.value = data.currentRate;
    lastUpdate.value = data.lastUpdate;
    newRate.value = data.currentRate;
    rateHistory.value = data.history || [];
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
  } finally {
    loading.value = false;
  }
};

const updateRate = async () => {
  try {
    updating.value = true;
    await apiFetch('/admin/savings-rate', {
      method: 'PUT',
      body: { rate: Number(newRate.value) },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Taux d\'intérêt mis à jour avec succès',
    });

    await loadRateInfo();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la mise à jour',
    });
  } finally {
    updating.value = false;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
};

onMounted(() => {
  loadRateInfo();
});
</script>
