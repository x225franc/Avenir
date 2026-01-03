<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Actualités</h1>
        <p class="text-gray-600">Restez informé des dernières actualités bancaires et financières</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-blue-600" />
      </div>

      <div v-else>
        <!-- Categories Filter -->
        <div class="mb-6 flex gap-2 overflow-x-auto pb-2">
          <UiButton
            :variant="selectedCategory === null ? 'primary' : 'ghost'"
            size="sm"
            @click="selectedCategory = null"
          >
            Toutes
          </UiButton>
          <UiButton
            v-for="cat in categories"
            :key="cat"
            :variant="selectedCategory === cat ? 'primary' : 'ghost'"
            size="sm"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </UiButton>
        </div>

        <!-- News Grid -->
        <div v-if="filteredNews.length === 0" class="text-center py-12">
          <Icon name="heroicons:newspaper" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600">Aucune actualité disponible</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UiCard
            v-for="article in filteredNews"
            :key="article.id"
            :hoverable="true"
            padding="none"
            class="overflow-hidden cursor-pointer group"
            @click="viewArticle(article)"
          >
            <!-- Image -->
            <div
              v-if="article.imageUrl"
              class="h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden"
            >
              <img
                :src="article.imageUrl"
                :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div
              v-else
              class="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Icon name="heroicons:newspaper" class="w-16 h-16 text-white opacity-50" />
            </div>

            <!-- Content -->
            <div class="p-6">
              <div class="flex items-center gap-2 mb-3">
                <UiBadge variant="primary" size="sm">{{ article.category }}</UiBadge>
                <span class="text-sm text-gray-500">{{ formatDate(article.publishedAt) }}</span>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                {{ article.title }}
              </h3>

              <p class="text-gray-600 text-sm line-clamp-3 mb-4">
                {{ article.summary }}
              </p>

              <div class="flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center gap-2">
                  <Icon name="heroicons:user" class="w-4 h-4" />
                  <span>{{ article.author.firstName }} {{ article.author.lastName }}</span>
                </div>
                <Icon name="heroicons:chevron-right" class="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Article Modal -->
    <UiModal v-model="showArticleModal" :title="selectedArticle?.title || ''" size="xl">
      <div v-if="selectedArticle" class="space-y-4">
        <!-- Article Header -->
        <div class="flex items-center gap-3 pb-4 border-b border-gray-200">
          <UiBadge variant="primary">{{ selectedArticle.category }}</UiBadge>
          <span class="text-sm text-gray-500">{{ formatDate(selectedArticle.publishedAt) }}</span>
        </div>

        <!-- Author Info -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:user" class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="font-semibold text-gray-900">
              {{ selectedArticle.author.firstName }} {{ selectedArticle.author.lastName }}
            </p>
            <p class="text-sm text-gray-600">{{ selectedArticle.author.role === 'director' ? 'Directeur' : 'Conseiller' }}</p>
          </div>
        </div>

        <!-- Article Image -->
        <div
          v-if="selectedArticle.imageUrl"
          class="rounded-lg overflow-hidden"
        >
          <img
            :src="selectedArticle.imageUrl"
            :alt="selectedArticle.title"
            class="w-full h-64 object-cover"
          />
        </div>

        <!-- Article Summary -->
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p class="text-gray-800 font-medium">{{ selectedArticle.summary }}</p>
        </div>

        <!-- Article Content -->
        <div class="prose prose-sm max-w-none">
          <div v-html="selectedArticle.content" class="text-gray-700 whitespace-pre-wrap"></div>
        </div>
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="showArticleModal = false">Fermer</UiButton>
      </template>
    </UiModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
});

const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl?: string;
  publishedAt: string;
  authorId: string;
  author: User;
}

const loading = ref(true);
const news = ref<News[]>([]);
const selectedCategory = ref<string | null>(null);
const showArticleModal = ref(false);
const selectedArticle = ref<News | null>(null);

const categories = computed(() => {
  const cats = new Set<string>();
  news.value.forEach((n) => cats.add(n.category));
  return Array.from(cats);
});

const filteredNews = computed(() => {
  if (!selectedCategory.value) {
    return news.value;
  }
  return news.value.filter((n) => n.category === selectedCategory.value);
});

const loadNews = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<News[]>('/news');
    news.value = data;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement des actualités',
    });
  } finally {
    loading.value = false;
  }
};

const viewArticle = (article: News) => {
  selectedArticle.value = article;
  showArticleModal.value = true;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
  }).format(date);
};

onMounted(() => {
  loadNews();
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>