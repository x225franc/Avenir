<template>
  <NuxtLayout name="dashboard">
    <!-- Loading -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
        <p class="text-gray-600">Chargement...</p>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!account" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Compte introuvable</h2>
        <UiButton variant="primary" @click="router.push('/dashboard/accounts')">
          Retour à mes comptes
        </UiButton>
      </div>
    </div>

    <!-- Account Details -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink
          to="/dashboard/accounts"
          class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-4"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          Retour à mes comptes
        </NuxtLink>
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900">Détails du compte</h1>
          <UiBadge :variant="getAccountTypeBadgeVariant(account.type)" size="md">
            {{ getAccountTypeLabel(account.type) }}
          </UiBadge>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Account Info -->
          <UiCard padding="lg">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Informations du compte</h2>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-600">IBAN</label>
                <div class="mt-1 flex items-center gap-2">
                  <p class="text-lg font-mono text-gray-900">{{ account.iban }}</p>
                  <button
                    @click="copyIban"
                    class="p-2 text-gray-500 hover:text-blue-600 transition"
                    title="Copier l'IBAN"
                  >
                    <Icon name="heroicons:clipboard-document" class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-600">Solde actuel</label>
                  <p class="mt-1 text-2xl font-bold text-gray-900">
                    {{ formatCurrency(account.balance) }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Statut</label>
                  <div class="mt-1 flex items-center gap-2">
                    <span
                      :class="[
                        'w-3 h-3 rounded-full',
                        account.isActive ? 'bg-green-500' : 'bg-red-500',
                      ]"
                    ></span>
                    <span class="text-gray-900">
                      {{ account.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Operation Buttons -->
              <div v-if="account.isActive" class="grid grid-cols-2 gap-4 pt-2">
                <UiButton variant="success" @click="showDepositModal = true">
                  <Icon name="heroicons:plus" class="w-5 h-5" />
                  Dépôt
                </UiButton>
                <UiButton
                  variant="warning"
                  :disabled="account.balance <= 0"
                  @click="showWithdrawModal = true"
                >
                  <Icon name="heroicons:minus" class="w-5 h-5" />
                  Retrait
                </UiButton>
              </div>

              <div v-if="account.type === 'savings' && account.interestRate">
                <label class="text-sm font-medium text-gray-600">Taux d'intérêt annuel</label>
                <p class="mt-1 text-lg font-semibold text-green-600">
                  {{ (account.interestRate * 100).toFixed(2) }}%
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-600">Date de création</label>
                <p class="mt-1 text-gray-900">{{ formatDate(account.createdAt) }}</p>
              </div>
            </div>
          </UiCard>

          <!-- Transaction History -->
          <UiCard padding="lg">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Historique des transactions</h2>

            <div v-if="loadingTransactions" class="text-center py-8">
              <Icon name="svg-spinners:ring-resize" class="w-8 h-8 mx-auto text-blue-600 animate-spin" />
            </div>

            <div v-else-if="transactions.length === 0" class="text-center py-8 text-gray-500">
              <Icon name="heroicons:document-text" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Aucune transaction pour ce compte</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="transaction in transactions"
                :key="transaction.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div class="flex items-center gap-4">
                  <div
                    :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      getTransactionColor(transaction).bg,
                    ]"
                  >
                    <Icon
                      name="heroicons:arrow-down"
                      :class="[
                        'w-5 h-5',
                        getTransactionColor(transaction).text,
                        isTransactionCredit(transaction) ? '' : 'rotate-180',
                      ]"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ getTransactionLabel(transaction) }}
                    </p>
                    <p v-if="transaction.description" class="text-sm text-gray-500">
                      {{ transaction.description }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ formatDate(transaction.createdAt) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    :class="[
                      'text-lg font-bold',
                      isTransactionCredit(transaction) ? 'text-green-600' : 'text-red-600',
                    ]"
                  >
                    {{ isTransactionCredit(transaction) ? '+' : '-' }}
                    {{ transaction.amount.toFixed(2) }}€
                  </p>
                  <UiBadge :variant="getTransactionStatusVariant(transaction.status)" size="sm">
                    {{ getTransactionStatusLabel(transaction.status) }}
                  </UiBadge>
                </div>
              </div>
            </div>
          </UiCard>

          <!-- Edit Form -->
          <UiCard padding="lg">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Modifier le compte</h2>
            <form @submit.prevent="handleUpdate" class="space-y-4">
              <UiInput
                v-model="editForm.accountName"
                label="Nom du compte"
                :error="editErrors.accountName"
              />
              <UiButton
                type="submit"
                variant="primary"
                :loading="updating"
                :disabled="!isDirty"
                class="w-full"
              >
                Enregistrer les modifications
              </UiButton>
            </form>
          </UiCard>
        </div>

        <!-- Actions Sidebar -->
        <div class="lg:col-span-1">
          <UiCard padding="lg">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
            <div class="space-y-3">
              <UiButton
                variant="primary"
                class="w-full"
                @click="router.push(`/dashboard/transfers?from=${account.id}`)"
              >
                <Icon name="heroicons:arrow-path-rounded-square" class="w-5 h-5" />
                Effectuer un virement
              </UiButton>
              <UiButton variant="danger" class="w-full" @click="showDeleteModal = true">
                <Icon name="heroicons:trash" class="w-5 h-5" />
                Supprimer le compte
              </UiButton>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-2">Informations</h3>
              <ul class="text-sm text-gray-600 space-y-2">
                <li>• Le solde doit être à 0€ pour supprimer</li>
                <li>• La suppression est définitive</li>
                <li>• L'IBAN ne peut pas être modifié</li>
              </ul>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <UiModal v-model="showDeleteModal" title="Confirmer la suppression" size="md">
      <p class="text-gray-600 mb-6">
        Êtes-vous sûr de vouloir supprimer le compte <strong>{{ account?.name }}</strong> ?
        Cette action est irréversible.
      </p>
      <template #footer>
        <UiButton variant="ghost" @click="showDeleteModal = false">Annuler</UiButton>
        <UiButton variant="danger" :loading="deleting" @click="handleDelete">
          Supprimer
        </UiButton>
      </template>
    </UiModal>

    <!-- Deposit Modal -->
    <UiModal v-model="showDepositModal" title="Effectuer un dépôt" size="md">
      <div class="space-y-4">
        <UiInput
          v-model="operationAmount"
          label="Montant (€)"
          type="number"
          step="0.01"
          max="10000"
          placeholder="100.00"
        />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            v-model="operationDescription"
            rows="3"
            placeholder="Raison du dépôt..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
      <template #footer>
        <UiButton variant="ghost" @click="showDepositModal = false">Annuler</UiButton>
        <UiButton variant="success" :loading="operationLoading" @click="handleDeposit">
          Déposer
        </UiButton>
      </template>
    </UiModal>

    <!-- Withdraw Modal -->
    <UiModal v-model="showWithdrawModal" title="Effectuer un retrait" size="md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Montant disponible
          </label>
          <p class="text-2xl font-bold text-gray-900 mb-3">
            {{ formatCurrency(account?.balance || 0) }}
          </p>
        </div>
        <UiInput
          v-model="operationAmount"
          label="Montant à retirer (€)"
          type="number"
          step="0.01"
          :max="account?.balance"
          placeholder="50.00"
        />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            v-model="operationDescription"
            rows="3"
            placeholder="Raison du retrait..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
      <template #footer>
        <UiButton variant="ghost" @click="showWithdrawModal = false">Annuler</UiButton>
        <UiButton variant="warning" :loading="operationLoading" @click="handleWithdraw">
          Retirer
        </UiButton>
      </template>
    </UiModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { z } from 'zod';

definePageMeta({
  layout: false,
  middleware: 'auth',
});

const route = useRoute();
const router = useRouter();
const { apiFetch } = useApi();
const notificationsStore = useNotificationsStore();

const accountId = route.params.id as string;

interface Account {
  id: string;
  name: string;
  type: string;
  iban: string;
  balance: number;
  isActive: boolean;
  interestRate?: number;
  createdAt: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description?: string;
  status: string;
  fromAccountId?: string;
  toAccountId?: string;
  createdAt: string;
}

const account = ref<Account | null>(null);
const transactions = ref<Transaction[]>([]);
const loading = ref(true);
const loadingTransactions = ref(false);
const updating = ref(false);
const deleting = ref(false);
const operationLoading = ref(false);

const showDeleteModal = ref(false);
const showDepositModal = ref(false);
const showWithdrawModal = ref(false);

const operationAmount = ref('');
const operationDescription = ref('');

const editForm = ref({ accountName: '' });
const editErrors = ref<Record<string, string>>({});

const isDirty = computed(() => {
  return editForm.value.accountName !== account.value?.name;
});

const loadAccount = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<Account>(`/accounts/${accountId}`);
    account.value = data;
    editForm.value.accountName = data.name;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Impossible de charger le compte',
    });
  } finally {
    loading.value = false;
  }
};

const loadTransactions = async () => {
  try {
    loadingTransactions.value = true;
    const data = await apiFetch<Transaction[]>(`/transactions/account/${accountId}`);
    transactions.value = data.slice(0, 10); // Prendre les 10 dernières
  } catch (err: any) {
    console.error('Erreur chargement transactions:', err);
  } finally {
    loadingTransactions.value = false;
  }
};

const handleUpdate = async () => {
  const updateSchema = z.object({
    accountName: z
      .string()
      .min(3, 'Le nom doit contenir au moins 3 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  });

  editErrors.value = {};
  const result = updateSchema.safeParse(editForm.value);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        editErrors.value[issue.path[0] as string] = issue.message;
      }
    });
    return;
  }

  try {
    updating.value = true;
    await apiFetch(`/accounts/${accountId}`, {
      method: 'PATCH',
      body: { accountName: editForm.value.accountName },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Compte modifié avec succès !',
    });
    await loadAccount();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Impossible de modifier le compte',
    });
  } finally {
    updating.value = false;
  }
};

const handleDelete = async () => {
  try {
    deleting.value = true;
    await apiFetch(`/accounts/${accountId}`, { method: 'DELETE' });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Compte supprimé avec succès !',
    });

    setTimeout(() => {
      router.push('/dashboard/accounts');
    }, 1000);
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Impossible de supprimer le compte',
    });
    showDeleteModal.value = false;
  } finally {
    deleting.value = false;
  }
};

const handleDeposit = async () => {
  const amount = parseFloat(operationAmount.value);
  if (isNaN(amount) || amount <= 0) {
    notificationsStore.addNotification({
      type: 'error',
      message: 'Montant invalide',
    });
    return;
  }

  try {
    operationLoading.value = true;
    await apiFetch('/transactions/deposit', {
      method: 'POST',
      body: {
        accountId,
        amount,
        description: operationDescription.value || 'Dépôt',
      },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: `Dépôt de ${formatCurrency(amount)} effectué avec succès !`,
    });

    showDepositModal.value = false;
    operationAmount.value = '';
    operationDescription.value = '';
    await loadAccount();
    await loadTransactions();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Impossible d\'effectuer le dépôt',
    });
  } finally {
    operationLoading.value = false;
  }
};

const handleWithdraw = async () => {
  const amount = parseFloat(operationAmount.value);
  if (isNaN(amount) || amount <= 0) {
    notificationsStore.addNotification({
      type: 'error',
      message: 'Montant invalide',
    });
    return;
  }

  try {
    operationLoading.value = true;
    await apiFetch('/transactions/withdraw', {
      method: 'POST',
      body: {
        accountId,
        amount,
        description: operationDescription.value || 'Retrait',
      },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: `Retrait de ${formatCurrency(amount)} effectué avec succès !`,
    });

    showWithdrawModal.value = false;
    operationAmount.value = '';
    operationDescription.value = '';
    await loadAccount();
    await loadTransactions();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Impossible d\'effectuer le retrait',
    });
  } finally {
    operationLoading.value = false;
  }
};

const copyIban = () => {
  if (account.value) {
    navigator.clipboard.writeText(account.value.iban);
    notificationsStore.addNotification({
      type: 'success',
      message: 'IBAN copié !',
    });
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getAccountTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    checking: 'Compte Courant',
    savings: 'Compte Épargne',
    investment: 'Compte Titres',
  };
  return labels[type] || type;
};

const getAccountTypeBadgeVariant = (type: string): 'primary' | 'success' | 'info' => {
  const variants: Record<string, 'primary' | 'success' | 'info'> = {
    checking: 'primary',
    savings: 'success',
    investment: 'info',
  };
  return variants[type] || 'primary';
};

const isTransactionCredit = (transaction: Transaction) => {
  const txType = transaction.type.toLowerCase();
  const isIncoming = String(transaction.toAccountId) === String(accountId);

  return (
    txType === 'deposit' ||
    txType === 'interest' ||
    (txType === 'transfer' && isIncoming) ||
    txType === 'investment_sell'
  );
};

const getTransactionLabel = (transaction: Transaction) => {
  const txType = transaction.type.toLowerCase();
  const isCredit = isTransactionCredit(transaction);

  const labels: Record<string, string> = {
    transfer: isCredit ? 'Virement reçu' : 'Virement envoyé',
    deposit: 'Dépôt',
    withdrawal: 'Retrait',
    interest: 'Intérêts créditeurs',
    investment_buy: 'Achat d\'actions',
    investment_sell: 'Vente d\'actions',
  };

  return labels[txType] || transaction.type;
};

const getTransactionColor = (transaction: Transaction) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'bg-green-100', text: 'text-green-600' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    failed: { bg: 'bg-red-100', text: 'text-red-600' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-600' },
  };
  return statusColors[transaction.status] || statusColors.completed;
};

const getTransactionStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    completed: 'Complété',
    pending: 'En cours',
    failed: 'Échoué',
    cancelled: 'Annulé',
  };
  return labels[status] || status;
};

const getTransactionStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'gray' => {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger',
    cancelled: 'gray',
  };
  return variants[status] || 'gray';
};

onMounted(() => {
  loadAccount();
  loadTransactions();
});
</script>
