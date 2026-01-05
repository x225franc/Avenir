<template>
  <div class="min-h-screen bg-gray-50">
    <DashboardHeader />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <NuxtLink to="/dashboard" class="hover:text-blue-600">Dashboard</NuxtLink>
          </li>
          <li>/</li>
          <li>
            <NuxtLink to="/dashboard/transfers" class="hover:text-blue-600">Transferts</NuxtLink>
          </li>
          <li>/</li>
          <li class="text-gray-900 font-medium">Nouveau transfert</li>
        </ol>
      </nav>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Nouveau transfert</h1>
        <p class="text-gray-600">Effectuez un transfert entre vos comptes ou vers un compte externe</p>
      </div>

      <!-- Transfer Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Transfer Type Selection -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">Type de transfert</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="transferType = 'internal'"
                :class="[
                  'p-4 border-2 rounded-xl transition-all',
                  transferType === 'internal'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <Icon name="material-symbols:swap-horiz" class="text-2xl mb-2" :class="transferType === 'internal' ? 'text-blue-600' : 'text-gray-400'" />
                <div class="font-semibold" :class="transferType === 'internal' ? 'text-blue-600' : 'text-gray-700'">Entre mes comptes</div>
              </button>

              <button
                type="button"
                @click="transferType = 'external'"
                :class="[
                  'p-4 border-2 rounded-xl transition-all',
                  transferType === 'external'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <Icon name="material-symbols:account-balance" class="text-2xl mb-2" :class="transferType === 'external' ? 'text-purple-600' : 'text-gray-400'" />
                <div class="font-semibold" :class="transferType === 'external' ? 'text-purple-600' : 'text-gray-700'">Vers un IBAN externe</div>
              </button>
            </div>
          </div>

          <!-- From Account -->
          <div>
            <label for="fromAccount" class="block text-sm font-semibold text-gray-700 mb-2">
              Compte source
            </label>
            <select
              id="fromAccount"
              v-model="formData.fromAccountId"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionnez un compte</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }} - {{ formatCurrency(account.balance) }} ({{ account.iban }})
              </option>
            </select>
          </div>

          <!-- To Account (Internal) or IBAN (External) -->
          <div v-if="transferType === 'internal'">
            <label for="toAccount" class="block text-sm font-semibold text-gray-700 mb-2">
              Compte destination
            </label>
            <select
              id="toAccount"
              v-model="formData.toAccountId"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionnez un compte</option>
              <option
                v-for="account in accounts"
                :key="account.id"
                :value="account.id"
                :disabled="account.id === formData.fromAccountId"
              >
                {{ account.name }} - {{ account.iban }}
              </option>
            </select>
          </div>

          <div v-else>
            <label for="toIban" class="block text-sm font-semibold text-gray-700 mb-2">
              IBAN destination
            </label>
            <input
              id="toIban"
              v-model="formData.toIban"
              type="text"
              required
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <!-- Amount -->
          <div>
            <label for="amount" class="block text-sm font-semibold text-gray-700 mb-2">
              Montant
            </label>
            <div class="relative">
              <input
                id="amount"
                v-model.number="formData.amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                €
              </div>
            </div>
            <p v-if="selectedFromAccount" class="mt-2 text-sm text-gray-500">
              Solde disponible: {{ formatCurrency(selectedFromAccount.balance) }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <input
              id="description"
              v-model="formData.description"
              type="text"
              placeholder="Ex: Loyer, Courses, Épargne..."
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div class="flex items-center text-red-700">
              <Icon name="material-symbols:error" class="text-xl mr-2" />
              <span>{{ error }}</span>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div class="flex items-center text-green-700">
              <Icon name="material-symbols:check-circle" class="text-xl mr-2" />
              <span>Transfert effectué avec succès !</span>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Traitement...' : 'Effectuer le transfert' }}
            </button>
            <NuxtLink
              to="/dashboard/transfers"
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Annuler
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const router = useRouter()

const transferType = ref<'internal' | 'external'>('internal')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const formData = ref({
  fromAccountId: '',
  toAccountId: '',
  toIban: '',
  amount: 0,
  description: ''
})

const accounts = ref([])

const selectedFromAccount = computed(() => {
  return accounts.value.find((a: any) => a.id === formData.value.fromAccountId)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const loadAccounts = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${config.public.apiBase}/accounts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      accounts.value = await response.json()
    }
  } catch (err) {
    console.error('Erreur lors du chargement des comptes:', err)
  }
}

const handleSubmit = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {
    const token = localStorage.getItem('token')

    if (transferType.value === 'internal') {
      // Internal transfer
      const response = await fetch(`${config.public.apiBase}/transactions/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fromAccountId: formData.value.fromAccountId,
          toAccountId: formData.value.toAccountId,
          amount: formData.value.amount,
          description: formData.value.description || 'Transfert interne'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Erreur lors du transfert')
      }
    } else {
      // External transfer via IBAN
      const response = await fetch(`${config.public.apiBase}/transactions/iban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fromAccountId: formData.value.fromAccountId,
          toIban: formData.value.toIban,
          amount: formData.value.amount,
          description: formData.value.description || 'Transfert externe'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Erreur lors du transfert')
      }
    }

    success.value = true

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/dashboard/transfers')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAccounts()
})

useSeoMeta({
  title: 'Nouveau transfert - Banque AVENIR',
  description: 'Effectuez un transfert entre vos comptes ou vers un compte externe'
})
</script>
