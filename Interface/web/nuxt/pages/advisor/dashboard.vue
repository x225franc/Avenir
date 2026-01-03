<template>
  <NuxtLayout name="dashboard">
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Section -->
        <div class="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-8 text-white mb-8">
          <h2 class="text-3xl font-bold mb-2">Bienvenue, {{ authStore.user?.firstName }} !</h2>
          <p class="text-green-100">Gérez vos clients et accompagnez-les dans leurs projets</p>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <UiCard :hoverable="true" padding="lg" class="cursor-pointer" @click="router.push('/advisor/clients')">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:users" class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Mes Clients</h3>
            <p class="text-sm text-gray-600">Gérer mon portefeuille</p>
          </UiCard>

          <UiCard :hoverable="true" padding="lg" class="cursor-pointer" @click="router.push('/advisor/credits/grant')">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:banknotes" class="w-6 h-6 text-blue-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Crédits</h3>
            <p class="text-sm text-gray-600">Accorder un crédit</p>
          </UiCard>

          <UiCard :hoverable="true" padding="lg" class="cursor-pointer" @click="router.push('/advisor/messages')">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Messages</h3>
            <p class="text-sm text-gray-600">Communiquer</p>
          </UiCard>

          <UiCard :hoverable="true" padding="lg" class="cursor-pointer" @click="router.push('/advisor/news')">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:newspaper" class="w-6 h-6 text-yellow-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Actualités</h3>
            <p class="text-sm text-gray-600">Publier</p>
          </UiCard>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Mes Clients</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalClients }}</p>
          </UiCard>

          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Messages non lus</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.unreadMessages }}</p>
          </UiCard>

          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Crédits actifs</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.activeCredits }}</p>
          </UiCard>
        </div>

        <!-- Recent Clients -->
        <UiCard padding="lg">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Clients récents</h3>
            <UiButton variant="primary" size="sm" @click="router.push('/advisor/clients')">
              Voir tous
            </UiButton>
          </div>

          <div v-if="loading" class="text-center py-8">
            <Icon name="svg-spinners:ring-resize" class="w-12 h-12 mx-auto text-green-600" />
          </div>

          <div v-else-if="recentClients.length === 0" class="text-center py-8 text-gray-600">
            Aucun client assigné
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="client in recentClients"
              :key="client.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              @click="router.push(`/advisor/clients?id=${client.id}`)"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="heroicons:user" class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ client.firstName }} {{ client.lastName }}</p>
                  <p class="text-sm text-gray-600">{{ client.email }}</p>
                </div>
              </div>
              <Icon name="heroicons:chevron-right" class="w-5 h-5 text-gray-400" />
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
});

const router = useRouter();
const authStore = useAuthStore();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Stats {
  totalClients: number;
  unreadMessages: number;
  activeCredits: number;
}

const loading = ref(true);
const recentClients = ref<Client[]>([]);
const stats = ref<Stats>({
  totalClients: 0,
  unreadMessages: 0,
  activeCredits: 0,
});

const loadData = async () => {
  try {
    loading.value = true;

    const [clientsData, statsData] = await Promise.all([
      apiFetch<Client[]>('/advisor/clients?limit=5'),
      apiFetch<Stats>('/advisor/stats'),
    ]);

    recentClients.value = clientsData;
    stats.value = statsData;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
