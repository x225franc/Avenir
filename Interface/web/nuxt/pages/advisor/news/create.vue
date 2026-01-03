<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-4xl mx-auto">
      <NuxtLink
        to="/advisor/news"
        class="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 mb-6"
      >
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        Retour aux actualités
      </NuxtLink>

      <h1 class="text-3xl font-bold text-gray-900 mb-8">Créer une actualité</h1>

      <UiCard padding="lg">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <UiInput
            v-model="formData.title"
            label="Titre"
            type="text"
            placeholder="Titre de l'actualité"
            :error="errors.title"
            required
          />

          <UiInput v-model="formData.category" label="Catégorie" type="select" required>
            <select v-model="formData.category" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Sélectionnez une catégorie</option>
              <option value="Économie">Économie</option>
              <option value="Finance">Finance</option>
              <option value="Investissement">Investissement</option>
              <option value="Banque">Banque</option>
              <option value="Réglementation">Réglementation</option>
            </select>
          </UiInput>

          <UiInput
            v-model="formData.summary"
            label="Résumé"
            type="textarea"
          >
            <textarea
              v-model="formData.summary"
              placeholder="Résumé court de l'actualité..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            ></textarea>
          </UiInput>

          <UiInput
            v-model="formData.content"
            label="Contenu"
            type="textarea"
          >
            <textarea
              v-model="formData.content"
              placeholder="Contenu complet de l'actualité..."
              rows="10"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            ></textarea>
          </UiInput>

          <UiInput
            v-model="formData.imageUrl"
            label="URL de l'image (optionnel)"
            type="text"
            placeholder="https://example.com/image.jpg"
          />

          <div class="flex gap-4">
            <UiButton type="submit" variant="primary" size="lg" :loading="loading" class="flex-1">
              Publier l'actualité
            </UiButton>
            <UiButton variant="ghost" size="lg" @click="router.push('/advisor/news')">
              Annuler
            </UiButton>
          </div>
        </form>
      </UiCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { z } from 'zod';

definePageMeta({
  layout: false,
  middleware: ['auth', 'role'],
});

const router = useRouter();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

const newsSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  summary: z.string().min(20, 'Le résumé doit contenir au moins 20 caractères'),
  content: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

const formData = ref({
  title: '',
  category: '',
  summary: '',
  content: '',
  imageUrl: '',
});

const errors = ref<Record<string, string>>({});
const loading = ref(false);

const validateForm = () => {
  errors.value = {};
  const result = newsSchema.safeParse(formData.value);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errors.value[issue.path[0] as string] = issue.message;
      }
    });
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    await apiFetch('/advisor/news', {
      method: 'POST',
      body: {
        ...formData.value,
        imageUrl: formData.value.imageUrl || undefined,
      },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Actualité publiée avec succès',
    });

    router.push('/advisor/news');
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la publication',
    });
  } finally {
    loading.value = false;
  }
};
</script>
