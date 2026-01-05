<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-4xl mx-auto">
      <NuxtLink
        to="/admin/news"
        class="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mb-6"
      >
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        Retour aux actualités
      </NuxtLink>

      <h1 class="text-3xl font-bold text-gray-900 mb-8">Modifier l'actualité</h1>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto text-purple-600" />
      </div>

      <UiCard v-else-if="article" padding="lg">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <UiInput
            v-model="formData.title"
            label="Titre"
            type="text"
            required
          />

          <UiInput v-model="formData.category" label="Catégorie" type="select" required>
            <select v-model="formData.category" class="w-full px-4 py-2 border rounded-lg">
              <option value="Économie">Économie</option>
              <option value="Finance">Finance</option>
              <option value="Investissement">Investissement</option>
              <option value="Banque">Banque</option>
              <option value="Réglementation">Réglementation</option>
            </select>
          </UiInput>

          <UiInput v-model="formData.summary" label="Résumé" type="textarea">
            <textarea
              v-model="formData.summary"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            ></textarea>
          </UiInput>

          <UiInput v-model="formData.content" label="Contenu" type="textarea">
            <textarea
              v-model="formData.content"
              rows="10"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            ></textarea>
          </UiInput>

          <UiInput
            v-model="formData.imageUrl"
            label="URL de l'image"
            type="text"
          />

          <div class="flex gap-4">
            <UiButton type="submit" variant="primary" size="lg" :loading="saving" class="flex-1">
              Enregistrer les modifications
            </UiButton>
            <UiButton variant="ghost" size="lg" @click="router.push('/admin/news')">
              Annuler
            </UiButton>
          </div>
        </form>
      </UiCard>
    </div>
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

const newsId = route.params.id as string;

interface News {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  imageUrl?: string;
}

const article = ref<News | null>(null);
const loading = ref(true);
const saving = ref(false);

const formData = ref({
  title: '',
  category: '',
  summary: '',
  content: '',
  imageUrl: '',
});

const loadArticle = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<News>(`/news/${newsId}`);
    article.value = data;
    formData.value = {
      title: data.title,
      category: data.category,
      summary: data.summary,
      content: data.content,
      imageUrl: data.imageUrl || '',
    };
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
    router.push('/admin/news');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  saving.value = true;

  try {
    await apiFetch(`/news/${newsId}`, {
      method: 'PUT',
      body: formData.value,
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Actualité modifiée avec succès',
    });

    router.push('/admin/news');
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la modification',
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadArticle();
});
</script>
