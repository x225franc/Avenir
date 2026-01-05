<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Actualités</h1>
        <UiButton variant="primary" @click="router.push('/admin/news/create')">
          Créer une actualité
        </UiButton>
      </div>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-purple-600" />
      </div>

      <UiCard v-else padding="lg">
        <div v-if="news.length === 0" class="text-center py-12">
          <Icon name="heroicons:newspaper" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600">Aucune actualité publiée</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="article in news"
            :key="article.id"
            class="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <UiBadge variant="primary" size="sm">{{ article.category }}</UiBadge>
                <span class="text-sm text-gray-600">{{ formatDate(article.publishedAt) }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ article.title }}</h3>
              <p class="text-gray-600 text-sm mb-2">{{ article.summary }}</p>
              <p class="text-sm text-gray-500">
                Par {{ article.author.firstName }} {{ article.author.lastName }}
              </p>
            </div>
            <div class="flex gap-2 ml-4">
              <UiButton variant="ghost" size="sm" @click="router.push(`/admin/news/${article.id}`)">
                Modifier
              </UiButton>
              <UiButton variant="danger" size="sm" @click="openDeleteModal(article)">
                Supprimer
              </UiButton>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Delete Modal -->
    <UiModal v-model="showDeleteModal" title="Confirmer la suppression">
      <p>Êtes-vous sûr de vouloir supprimer l'actualité <strong>{{ selectedArticle?.title }}</strong> ?</p>
      <template #footer>
        <UiButton variant="ghost" @click="showDeleteModal = false">Annuler</UiButton>
        <UiButton variant="danger" :loading="deleting" @click="deleteArticle">
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

const router = useRouter();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface Author {
  id: string;
  firstName: string;
  lastName: string;
}

interface News {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  author: Author;
}

const news = ref<News[]>([]);
const loading = ref(true);
const showDeleteModal = ref(false);
const selectedArticle = ref<News | null>(null);
const deleting = ref(false);

const loadNews = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<News[]>('/news');
    news.value = data;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
  } finally {
    loading.value = false;
  }
};

const openDeleteModal = (article: News) => {
  selectedArticle.value = article;
  showDeleteModal.value = true;
};

const deleteArticle = async () => {
  if (!selectedArticle.value) return;

  try {
    deleting.value = true;
    await apiFetch(`/news/${selectedArticle.value.id}`, { method: 'DELETE' });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Actualité supprimée avec succès',
    });

    news.value = news.value.filter((n) => n.id !== selectedArticle.value!.id);
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
