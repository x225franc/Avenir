<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Mes Clients</h1>

      <!-- Filters -->
      <UiCard padding="lg" class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UiInput v-model="filters.search" label="Rechercher" placeholder="Nom, email...">
            <template #icon>
              <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-gray-400" />
            </template>
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

      <!-- Clients Table -->
      <UiCard padding="lg">
        <div v-if="loading" class="text-center py-12">
          <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-green-600" />
        </div>

        <div v-else-if="filteredClients.length === 0" class="text-center py-12">
          <Icon name="heroicons:users" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600">Aucun client trouvé</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comptes</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="client in filteredClients" :key="client.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon name="heroicons:user" class="w-5 h-5 text-green-600" />
                    </div>
                    <div class="ml-4">
                      <div class="font-semibold text-gray-900">
                        {{ client.firstName }} {{ client.lastName }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ client.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ client.accountsCount || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UiBadge :variant="client.isVerified ? 'success' : 'warning'">
                    {{ client.isVerified ? 'Vérifié' : 'Non vérifié' }}
                  </UiBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UiButton variant="ghost" size="sm" @click="viewClient(client)">
                    Détails
                  </UiButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>

    <!-- Client Details Modal -->
    <UiModal v-model="showDetailsModal" :title="`${selectedClient?.firstName} ${selectedClient?.lastName}`">
      <div v-if="selectedClient" class="space-y-4">
        <div>
          <p class="text-sm text-gray-600">Email</p>
          <p class="font-semibold">{{ selectedClient.email }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Nombre de comptes</p>
          <p class="font-semibold">{{ selectedClient.accountsCount || 0 }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Statut</p>
          <UiBadge :variant="selectedClient.isVerified ? 'success' : 'warning'">
            {{ selectedClient.isVerified ? 'Vérifié' : 'Non vérifié' }}
          </UiBadge>
        </div>
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="showDetailsModal = false">Fermer</UiButton>
      </template>
    </UiModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['auth', 'role'],
});

const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  accountsCount?: number;
}

const clients = ref<Client[]>([]);
const loading = ref(true);
const filters = ref({
  search: '',
  verified: '',
});

const showDetailsModal = ref(false);
const selectedClient = ref<Client | null>(null);

const filteredClients = computed(() => {
  let result = clients.value;

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
    );
  }

  if (filters.value.verified !== '') {
    const verified = filters.value.verified === 'true';
    result = result.filter((c) => c.isVerified === verified);
  }

  return result;
});

const loadClients = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<Client[]>('/advisor/clients');
    clients.value = data;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    verified: '',
  };
};

const viewClient = (client: Client) => {
  selectedClient.value = client;
  showDetailsModal.value = true;
};

onMounted(() => {
  loadClients();
});
</script>
