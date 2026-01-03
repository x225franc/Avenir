<template>
  <NuxtLayout name="dashboard">
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Section -->
        <div class="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white mb-8">
          <h2 class="text-3xl font-bold mb-2">Bienvenue, {{ authStore.user?.firstName }} !</h2>
          <p class="text-purple-100">Gérez votre banque, vos équipes et supervisez toutes les opérations</p>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <UiCard :hoverable="true" padding="lg" class="cursor-pointer" @click="router.push('/admin/users')">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:users" class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Utilisateurs</h3>
            <p class="text-sm text-gray-600">Gérer clients & conseillers</p>
          </UiCard>

          <UiCard :hoverable="true" padding="lg" class="cursor-pointer" @click="router.push('/admin/news')">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:newspaper" class="w-6 h-6 text-blue-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Actualités</h3>
            <p class="text-sm text-gray-600">Publier des actualités</p>
          </UiCard>

          <UiCard :hoverable="true" padding="lg" class="cursor-pointer" @click="router.push('/admin/investments')">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:chart-bar" class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Investissements</h3>
            <p class="text-sm text-gray-600">Gérer les actions</p>
          </UiCard>

          <UiCard :hoverable="true" padding="lg" class="cursor-pointer" @click="router.push('/admin/savings')">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:banknotes" class="w-6 h-6 text-yellow-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Épargne</h3>
            <p class="text-sm text-gray-600">Taux d'intérêt</p>
          </UiCard>

          <UiCard :hoverable="true" padding="lg" class="cursor-pointer" @click="router.push('/admin/internal-chat')">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Chat Interne</h3>
            <p class="text-sm text-gray-600">Communication équipe</p>
          </UiCard>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Total Clients</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalClients }}</p>
          </UiCard>

          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Total Conseillers</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalAdvisors }}</p>
          </UiCard>

          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Comptes Actifs</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalAccounts }}</p>
          </UiCard>

          <UiCard padding="lg">
            <p class="text-sm text-gray-600 mb-1">Volume Total</p>
            <p class="text-3xl font-bold text-gray-900">{{ formatCurrency(stats.totalVolume) }}</p>
          </UiCard>
        </div>

        <!-- Recent News -->
        <UiCard padding="lg">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Actualités récentes</h3>
            <UiButton variant="primary" size="sm" @click="router.push('/admin/news/create')">
              Nouvelle actualité
            </UiButton>
          </div>

          <div v-if="loading" class="text-center py-8">
            <Icon name="svg-spinners:ring-resize" class="w-12 h-12 mx-auto text-purple-600" />
          </div>

          <div v-else-if="news.length === 0" class="text-center py-8">
            <Icon name="heroicons:newspaper" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p class="text-gray-600">Aucune actualité publiée</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="article in news.slice(0, 5)"
              :key="article.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              @click="router.push(`/admin/news/${article.id}`)"
            >
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 mb-1">{{ article.title }}</h4>
                <div class="flex items-center gap-3 text-sm text-gray-600">
                  <UiBadge variant="primary" size="sm">{{ article.category }}</UiBadge>
                  <span>{{ formatDate(article.publishedAt) }}</span>
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
  role: 'director',
});

const router = useRouter();
const authStore = useAuthStore();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface News {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
}

interface Stats {
  totalClients: number;
  totalAdvisors: number;
  totalAccounts: number;
  totalVolume: number;
}

const news = ref<News[]>([]);
const loading = ref(true);
const stats = ref<Stats>({
  totalClients: 0,
  totalAdvisors: 0,
  totalAccounts: 0,
  totalVolume: 0,
});

const loadData = async () => {
  try {
    loading.value = true;

    const [newsData, statsData] = await Promise.all([
      apiFetch<News[]>('/news?limit=5'),
      apiFetch<Stats>('/admin/stats'),
    ]);

    news.value = newsData;
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount);
};

onMounted(() => {
  loadData();
});
</script>
