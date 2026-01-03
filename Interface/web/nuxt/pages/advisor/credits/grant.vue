<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Accorder un Crédit</h1>

      <UiCard padding="lg">
        <UiAlert variant="info" class="mb-6">
          Vérifiez la solvabilité du client avant d'accorder un crédit
        </UiAlert>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <UiInput v-model="formData.clientId" label="Client" type="select" :error="errors.clientId" required>
            <select v-model="formData.clientId" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Sélectionnez un client</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.firstName }} {{ client.lastName }} - {{ client.email }}
              </option>
            </select>
          </UiInput>

          <UiInput v-model="formData.type" label="Type de crédit" type="select" :error="errors.type" required>
            <select v-model="formData.type" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Sélectionnez un type</option>
              <option value="personal">Crédit Personnel</option>
              <option value="home">Crédit Immobilier</option>
              <option value="car">Crédit Auto</option>
              <option value="business">Crédit Professionnel</option>
            </select>
          </UiInput>

          <UiInput
            v-model="formData.amount"
            label="Montant (€)"
            type="number"
            step="1000"
            min="1000"
            max="500000"
            :error="errors.amount"
            required
          />

          <UiInput
            v-model="formData.interestRate"
            label="Taux d'intérêt (%)"
            type="number"
            step="0.1"
            min="0.1"
            max="20"
            :error="errors.interestRate"
            required
          />

          <UiInput
            v-model="formData.duration"
            label="Durée (mois)"
            type="number"
            step="12"
            min="12"
            max="360"
            :error="errors.duration"
            required
          />

          <UiInput v-model="formData.purpose" label="Objet du crédit" type="textarea">
            <textarea
              v-model="formData.purpose"
              placeholder="Décrivez l'objet du crédit..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            ></textarea>
          </UiInput>

          <!-- Calculation Summary -->
          <div v-if="formData.amount && formData.interestRate && formData.duration" class="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 class="font-semibold text-green-900 mb-2">Récapitulatif</h3>
            <div class="space-y-1 text-sm text-green-800">
              <p>Montant: {{ formatCurrency(Number(formData.amount)) }}</p>
              <p>Taux: {{ formData.interestRate }}%</p>
              <p>Durée: {{ formData.duration }} mois</p>
              <p class="font-bold">Mensualité estimée: {{ formatCurrency(calculateMonthlyPayment()) }}</p>
            </div>
          </div>

          <div class="flex gap-4">
            <UiButton type="submit" variant="primary" size="lg" :loading="loading" class="flex-1">
              Accorder le crédit
            </UiButton>
            <UiButton variant="ghost" size="lg" @click="router.push('/advisor/dashboard')">
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

const creditSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis'),
  type: z.string().min(1, 'Le type est requis'),
  amount: z.number().min(1000, 'Montant minimum: 1000€').max(500000, 'Montant maximum: 500000€'),
  interestRate: z.number().min(0.1).max(20),
  duration: z.number().min(12).max(360),
  purpose: z.string().optional(),
});

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const clients = ref<Client[]>([]);
const formData = ref({
  clientId: '',
  type: '',
  amount: 0,
  interestRate: 3.5,
  duration: 120,
  purpose: '',
});

const errors = ref<Record<string, string>>({});
const loading = ref(false);

const loadClients = async () => {
  try {
    const data = await apiFetch<Client[]>('/advisor/clients');
    clients.value = data;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement des clients',
    });
  }
};

const calculateMonthlyPayment = () => {
  const P = Number(formData.value.amount);
  const r = Number(formData.value.interestRate) / 100 / 12;
  const n = Number(formData.value.duration);

  if (!P || !r || !n) return 0;

  const monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return monthly;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const validateForm = () => {
  errors.value = {};
  const result = creditSchema.safeParse({
    ...formData.value,
    amount: Number(formData.value.amount),
    interestRate: Number(formData.value.interestRate),
    duration: Number(formData.value.duration),
  });

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
    await apiFetch('/advisor/credits', {
      method: 'POST',
      body: {
        clientId: formData.value.clientId,
        type: formData.value.type,
        amount: Number(formData.value.amount),
        interestRate: Number(formData.value.interestRate),
        duration: Number(formData.value.duration),
        purpose: formData.value.purpose,
      },
    });

    notificationsStore.addNotification({
      type: 'success',
      message: 'Crédit accordé avec succès',
    });

    router.push('/advisor/dashboard');
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de l\'accord du crédit',
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadClients();
});
</script>
