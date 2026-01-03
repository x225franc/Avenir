<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <UiButton variant="primary" @click="router.push('/admin/users/create')">
          Créer un utilisateur
        </UiButton>
      </div>

      <!-- Filters -->
      <UiCard padding="lg" class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <UiInput v-model="filters.search" label="Rechercher" placeholder="Nom, email...">
            <template #icon>
              <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-gray-400" />
            </template>
          </UiInput>

          <UiInput v-model="filters.role" label="Rôle" type="select">
            <select v-model="filters.role" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="advisor">Conseillers</option>
              <option value="director">Directeurs</option>
            </select>
          </UiInput>

          <UiInput v-model="filters.verified" label="Statut" type="select">
            <select v-model="filters.verified" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Tous</option>
              <option value="true">Vérifiés</option>
              <option value="false">Non vérifiés</option>
            </select>
          </UiInput>

          <div class="flex items-end">
            <UiButton variant="ghost" @click="resetFilters" class="w-full">
              Réinitialiser
            </UiButton>
          </div>
        </div>
      </UiCard>

      <!-- Users Table -->
      <UiCard padding="lg">
        <div v-if="loading" class="text-center py-12">
          <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-purple-600" />
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
          <Icon name="heroicons:users" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600">Aucun utilisateur trouvé</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Icon name="heroicons:user" class="w-5 h-5 text-purple-600" />
                    </div>
                    <div class="ml-4">
                      <div class="font-semibold text-gray-900">
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UiBadge :variant="getRoleBadgeVariant(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </UiBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UiBadge :variant="user.isVerified ? 'success' : 'warning'">
                    {{ user.isVerified ? 'Vérifié' : 'Non vérifié' }}
                  </UiBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex items-center gap-2">
                    <UiButton variant="ghost" size="sm" @click="router.push(`/admin/users/${user.id}`)">
                      Voir
                    </UiButton>
                    <UiButton variant="danger" size="sm" @click="openDeleteModal(user)">
                      Supprimer
                    </UiButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredUsers.length > 0" class="mt-6 flex items-center justify-between">
          <p class="text-sm text-gray-600">
            Affichage {{ (currentPage - 1) * itemsPerPage + 1 }} à
            {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} sur
            {{ filteredUsers.length }} utilisateurs
          </p>
          <div class="flex gap-2">
            <UiButton
              variant="ghost"
              size="sm"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Précédent
            </UiButton>
            <UiButton
              variant="ghost"
              size="sm"
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
            >
              Suivant
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Delete Confirmation Modal -->
    <UiModal v-model="showDeleteModal" title="Confirmer la suppression">
      <p class="text-gray-700">
        Êtes-vous sûr de vouloir supprimer l'utilisateur
        <strong>{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong> ?
      </p>
      <p class="text-sm text-red-600 mt-2">Cette action est irréversible.</p>

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

const router = useRouter();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

const users = ref<User[]>([]);
const loading = ref(true);
const filters = ref({
  search: '',
  role: '',
  verified: '',
});

const currentPage = ref(1);
const itemsPerPage = 10;

const showDeleteModal = ref(false);
const selectedUser = ref<User | null>(null);
const deleting = ref(false);

const filteredUsers = computed(() => {
  let result = users.value;

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(
      (u) =>
        u.firstName.toLowerCase().includes(search) ||
        u.lastName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
    );
  }

  if (filters.value.role) {
    result = result.filter((u) => u.role === filters.value.role);
  }

  if (filters.value.verified !== '') {
    const verified = filters.value.verified === 'true';
    result = result.filter((u) => u.isVerified === verified);
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage));

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

const loadUsers = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<User[]>('/admin/users');
    users.value = data;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement des utilisateurs',
    });
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    role: '',
    verified: '',
  };
  currentPage.value = 1;
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'director':
      return 'danger';
    case 'advisor':
      return 'primary';
    default:
      return 'secondary';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'director':
      return 'Directeur';
    case 'advisor':
      return 'Conseiller';
    default:
      return 'Client';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
  }).format(date);
};

const openDeleteModal = (user: User) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const deleteUser = async () => {
  if (!selectedUser.value) return;

  try {
    deleting.value = true;
    await apiFetch(`/admin/users/${selectedUser.value.id}`, {
      method: 'DELETE',
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Utilisateur supprimé avec succès',
    });

    users.value = users.value.filter((u) => u.id !== selectedUser.value!.id);
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

onMounted(() => {
  loadUsers();
});
</script>
