<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-5xl mx-auto">
      <NuxtLink
        to="/admin/users"
        class="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mb-6"
      >
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        Retour aux utilisateurs
      </NuxtLink>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-purple-600" />
      </div>

      <div v-else-if="user" class="space-y-6">
        <!-- User Header -->
        <UiCard padding="lg">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="heroicons:user" class="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-900">
                  {{ user.firstName }} {{ user.lastName }}
                </h1>
                <p class="text-gray-600 mt-1">{{ user.email }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <UiBadge :variant="getRoleBadgeVariant(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </UiBadge>
                  <UiBadge :variant="user.isVerified ? 'success' : 'warning'">
                    {{ user.isVerified ? 'Vérifié' : 'Non vérifié' }}
                  </UiBadge>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <UiButton variant="danger" size="sm" @click="showDeleteModal = true">
                Supprimer
              </UiButton>
            </div>
          </div>
        </UiCard>

        <!-- User Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UiCard padding="lg">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Informations</h2>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">Email</p>
                <p class="font-semibold">{{ user.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Rôle</p>
                <p class="font-semibold">{{ getRoleLabel(user.role) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Créé le</p>
                <p class="font-semibold">{{ formatDate(user.createdAt) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Dernière connexion</p>
                <p class="font-semibold">{{ user.lastLogin ? formatDate(user.lastLogin) : 'Jamais' }}</p>
              </div>
            </div>
          </UiCard>

          <UiCard padding="lg">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Statistiques</h2>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">Nombre de comptes</p>
                <p class="font-semibold">{{ user.accountsCount || 0 }}</p>
              </div>
              <div v-if="user.role === 'client'">
                <p class="text-sm text-gray-600">Solde total</p>
                <p class="font-semibold">{{ formatCurrency(user.totalBalance || 0) }}</p>
              </div>
            </div>
          </UiCard>
        </div>

        <!-- User Accounts (for clients) -->
        <UiCard v-if="user.role === 'client' && user.accounts" padding="lg">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Comptes</h2>
          <div v-if="user.accounts.length === 0" class="text-center py-8 text-gray-600">
            Aucun compte
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="account in user.accounts"
              :key="account.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-semibold text-gray-900">{{ account.name }}</p>
                <p class="text-sm text-gray-600">{{ account.iban }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-gray-900">{{ formatCurrency(account.balance) }}</p>
                <UiBadge variant="secondary" size="sm">{{ account.type }}</UiBadge>
              </div>
            </div>
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Delete Modal -->
    <UiModal v-model="showDeleteModal" title="Confirmer la suppression">
      <p class="text-gray-700">
        Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
      </p>

      <template #footer>
        <UiButton variant="ghost" @click="showDeleteModal = false">Annuler</UiButton>
        <UiButton variant="danger" :loading="deleting" @click="deleteUser">
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

const route = useRoute();
const router = useRouter();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

const userId = route.params.id as string;

interface Account {
  id: string;
  name: string;
  iban: string;
  balance: number;
  type: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  accountsCount?: number;
  totalBalance?: number;
  accounts?: Account[];
}

const user = ref<User | null>(null);
const loading = ref(true);
const showDeleteModal = ref(false);
const deleting = ref(false);

const loadUser = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<User>(`/admin/users/${userId}`);
    user.value = data;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
    router.push('/admin/users');
  } finally {
    loading.value = false;
  }
};

const deleteUser = async () => {
  try {
    deleting.value = true;
    await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Utilisateur supprimé avec succès',
    });

    router.push('/admin/users');
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la suppression',
    });
  } finally {
    deleting.value = false;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'director': return 'danger';
    case 'advisor': return 'primary';
    default: return 'secondary';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'director': return 'Directeur';
    case 'advisor': return 'Conseiller';
    default: return 'Client';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

onMounted(() => {
  loadUser();
});
</script>
