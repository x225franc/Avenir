<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Effectuer un transfert</h1>
        <p class="text-gray-600">Transférez de l'argent entre vos comptes ou vers un compte externe</p>
      </div>

      <UiAlert v-if="error" variant="danger" class="mb-6" :closable="true" @close="error = ''">
        {{ error }}
      </UiAlert>

      <UiAlert v-if="success" variant="success" class="mb-6">
        {{ success }}
      </UiAlert>

      <UiCard v-if="accounts.length === 0" padding="lg" class="text-center">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h2 class="text-xl font-semibold text-yellow-800 mb-2">Aucun compte disponible</h2>
        <p class="text-yellow-700 mb-4">
          Vous devez avoir au moins un compte pour effectuer des transferts.
        </p>
        <UiButton variant="primary" @click="router.push('/dashboard/accounts/create')">
          Créer un compte
        </UiButton>
      </UiCard>

      <UiCard v-else padding="lg">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Compte source -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Compte source</label>
            <select
              v-model="formData.sourceAccountId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez un compte</option>
              <option
                v-for="account in accounts.filter((a) => a.balance > 0)"
                :key="account.id"
                :value="account.id"
              >
                {{ account.name }} - {{ formatCurrency(account.balance) }}
              </option>
            </select>
            <p v-if="errors.sourceAccountId" class="mt-1 text-sm text-red-600">
              {{ errors.sourceAccountId }}
            </p>
          </div>

          <!-- Solde disponible -->
          <UiAlert v-if="selectedFromAccount" variant="info">
            <strong>Solde disponible:</strong> {{ formatCurrency(selectedFromAccount.balance) }}
          </UiAlert>

          <!-- Type de transfert -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Type de virement</label>
            <div class="grid grid-cols-2 gap-4">
              <label
                :class="[
                  'p-4 border-2 rounded-lg cursor-pointer transition-all',
                  formData.transferType === 'internal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
              >
                <input
                  type="radio"
                  v-model="formData.transferType"
                  value="internal"
                  class="sr-only"
                />
                <div class="flex items-center space-x-3">
                  <div
                    :class="[
                      'w-4 h-4 rounded-full border-2',
                      formData.transferType === 'internal'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300',
                    ]"
                  >
                    <div
                      v-if="formData.transferType === 'internal'"
                      class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"
                    ></div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Virement interne</p>
                    <p class="text-sm text-gray-600">Entre vos comptes</p>
                  </div>
                </div>
              </label>

              <label
                :class="[
                  'p-4 border-2 rounded-lg cursor-pointer transition-all',
                  formData.transferType === 'external'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
              >
                <input
                  type="radio"
                  v-model="formData.transferType"
                  value="external"
                  class="sr-only"
                />
                <div class="flex items-center space-x-3">
                  <div
                    :class="[
                      'w-4 h-4 rounded-full border-2',
                      formData.transferType === 'external'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300',
                    ]"
                  >
                    <div
                      v-if="formData.transferType === 'external'"
                      class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"
                    ></div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Virement externe</p>
                    <p class="text-sm text-gray-600">Vers un IBAN</p>
                  </div>
                </div>
              </label>
            </div>
            <p v-if="errors.transferType" class="mt-2 text-sm text-red-600">
              {{ errors.transferType }}
            </p>
          </div>

          <!-- Compte destination interne -->
          <div v-if="formData.transferType === 'internal'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Compte destination</label>
            <select
              v-model="formData.destinationAccountId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez un compte</option>
              <option
                v-for="account in accounts.filter((a) => a.id !== formData.sourceAccountId)"
                :key="account.id"
                :value="account.id"
              >
                {{ account.name }} - {{ formatCurrency(account.balance) }}
              </option>
            </select>
            <p v-if="errors.destinationAccountId" class="mt-1 text-sm text-red-600">
              {{ errors.destinationAccountId }}
            </p>
          </div>

          <!-- IBAN destination externe -->
          <UiInput
            v-if="formData.transferType === 'external'"
            v-model="formData.destinationIban"
            label="IBAN du destinataire"
            placeholder="FR76 1234 5678 9012 3456 7890 123"
            :error="errors.destinationIban"
          />

          <!-- Montant -->
          <UiInput
            v-model="formData.amount"
            label="Montant (€)"
            type="number"
            step="0.01"
            placeholder="0.00"
            :error="errors.amount"
          />

          <!-- Description -->
          <div v-if="formData.transferType === 'internal'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Motif du transfert..."
            />
          </div>

          <!-- Boutons d'action -->
          <div class="flex gap-4">
            <UiButton type="submit" variant="primary" size="lg" :loading="loading" class="flex-1">
              Effectuer le transfert
            </UiButton>
            <UiButton variant="ghost" size="lg" @click="router.push('/dashboard/accounts')">
              Annuler
            </UiButton>
          </div>
        </form>
      </UiCard>

      <!-- Mes comptes -->
      <UiCard v-if="accounts.length > 0" padding="lg" class="mt-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Mes comptes</h2>
        <div class="space-y-3">
          <div
            v-for="account in accounts"
            :key="account.id"
            class="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div>
              <p class="font-medium text-gray-900">{{ account.name }}</p>
              <p class="text-sm text-gray-500 font-mono">{{ account.iban }}</p>
            </div>
            <p class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(account.balance) }}
            </p>
          </div>
        </div>
      </UiCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
});

const router = useRouter();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

interface Account {
  id: string;
  name: string;
  type: string;
  iban: string;
  balance: number;
}

const accounts = ref<Account[]>([]);
const loading = ref(false);
const error = ref('');
const success = ref('');

const formData = ref({
  sourceAccountId: '',
  transferType: 'internal' as 'internal' | 'external',
  destinationAccountId: '',
  destinationIban: '',
  amount: '',
  description: '',
});

const errors = ref<Record<string, string>>({});

const selectedFromAccount = computed(() => {
  return accounts.value.find((a) => a.id === formData.value.sourceAccountId);
});

const loadAccounts = async () => {
  try {
    const data = await apiFetch<Account[]>('/accounts');
    accounts.value = data;
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Erreur lors du chargement des comptes';
  }
};

const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (!formData.value.sourceAccountId) {
    errors.value.sourceAccountId = 'Veuillez sélectionner un compte source';
    isValid = false;
  }

  if (!formData.value.transferType) {
    errors.value.transferType = 'Veuillez sélectionner un type de virement';
    isValid = false;
  }

  if (formData.value.transferType === 'internal' && !formData.value.destinationAccountId) {
    errors.value.destinationAccountId = 'Le compte de destination est requis';
    isValid = false;
  }

  if (formData.value.transferType === 'external' && !formData.value.destinationIban) {
    errors.value.destinationIban = "L'IBAN est requis pour un virement externe";
    isValid = false;
  }

  if (!formData.value.amount || parseFloat(formData.value.amount) <= 0) {
    errors.value.amount = 'Le montant doit être supérieur à 0';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    if (formData.value.transferType === 'external') {
      await apiFetch('/transactions/transfer-iban', {
        method: 'POST',
        body: {
          sourceAccountId: formData.value.sourceAccountId,
          destinationIban: formData.value.destinationIban,
          amount: parseFloat(formData.value.amount),
          currency: 'EUR',
          description: formData.value.description || undefined,
        },
      });
    } else {
      await apiFetch('/transactions/transfer', {
        method: 'POST',
        body: {
          sourceAccountId: formData.value.sourceAccountId,
          destinationAccountId: formData.value.destinationAccountId,
          amount: parseFloat(formData.value.amount),
          currency: 'EUR',
          description: formData.value.description || undefined,
        },
      });
    }

    success.value = 'Transfert effectué avec succès !';
    notificationsStore.addNotification({
      type: 'success',
      message: success.value,
    });

    // Reset form
    formData.value = {
      sourceAccountId: '',
      transferType: 'internal',
      destinationAccountId: '',
      destinationIban: '',
      amount: '',
      description: '',
    };

    // Recharger les comptes
    await loadAccounts();
  } catch (err: any) {
    const errorMessage =
      err.data?.message || err.message || 'Une erreur est survenue lors du transfert';
    error.value = errorMessage;
    notificationsStore.addNotification({
      type: 'error',
      message: errorMessage,
    });
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

onMounted(() => {
  loadAccounts();
});
</script>
