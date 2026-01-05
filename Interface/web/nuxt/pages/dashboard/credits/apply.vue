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
            <NuxtLink to="/dashboard/credits" class="hover:text-blue-600">Crédits</NuxtLink>
          </li>
          <li>/</li>
          <li class="text-gray-900 font-medium">Demande de crédit</li>
        </ol>
      </nav>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Demande de crédit</h1>
        <p class="text-gray-600">Simulez et demandez un crédit immobilier auprès de nos conseillers</p>
      </div>

      <!-- Credit Calculator -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Icon name="material-symbols:calculate" class="mr-3 text-blue-600" />
          Simulateur de crédit
        </h2>

        <form @submit.prevent="calculateCredit" class="space-y-6">
          <!-- Amount -->
          <div>
            <label for="amount" class="block text-sm font-semibold text-gray-700 mb-2">
              Montant du crédit
            </label>
            <div class="relative">
              <input
                id="amount"
                v-model.number="formData.principalAmount"
                type="number"
                step="1000"
                min="1000"
                required
                placeholder="50000"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                €
              </div>
            </div>
          </div>

          <!-- Duration -->
          <div>
            <label for="duration" class="block text-sm font-semibold text-gray-700 mb-2">
              Durée (en mois)
            </label>
            <input
              id="duration"
              v-model.number="formData.durationMonths"
              type="number"
              step="12"
              min="12"
              max="360"
              required
              placeholder="240"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-sm text-gray-500">Entre 1 et 30 ans (12 à 360 mois)</p>
          </div>

          <!-- Interest Rate -->
          <div>
            <label for="interestRate" class="block text-sm font-semibold text-gray-700 mb-2">
              Taux d'intérêt annuel (%)
            </label>
            <input
              id="interestRate"
              v-model.number="formData.annualInterestRate"
              type="number"
              step="0.01"
              min="0"
              max="20"
              required
              placeholder="2.5"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Insurance Rate -->
          <div>
            <label for="insuranceRate" class="block text-sm font-semibold text-gray-700 mb-2">
              Taux d'assurance (%)
            </label>
            <input
              id="insuranceRate"
              v-model.number="formData.insuranceRate"
              type="number"
              step="0.01"
              min="0"
              max="5"
              required
              placeholder="0.36"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-sm text-gray-500">Taux d'assurance emprunteur obligatoire</p>
          </div>

          <!-- Account Selection -->
          <div>
            <label for="account" class="block text-sm font-semibold text-gray-700 mb-2">
              Compte de versement
            </label>
            <select
              id="account"
              v-model="formData.accountId"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionnez un compte</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }} - {{ account.iban }}
              </option>
            </select>
          </div>

          <button
            type="submit"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Calculer les mensualités
          </button>
        </form>
      </div>

      <!-- Calculation Results -->
      <div v-if="calculation" class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-sm border border-blue-200 p-8 mb-6">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Icon name="material-symbols:receipt-long" class="mr-3 text-purple-600" />
          Résultats de la simulation
        </h3>

        <div class="grid md:grid-cols-3 gap-6 mb-6">
          <div class="bg-white p-6 rounded-xl">
            <div class="text-sm text-gray-600 mb-1">Mensualité</div>
            <div class="text-2xl font-bold text-blue-600">{{ formatCurrency(calculation.monthlyPayment) }}</div>
          </div>

          <div class="bg-white p-6 rounded-xl">
            <div class="text-sm text-gray-600 mb-1">Coût total du crédit</div>
            <div class="text-2xl font-bold text-purple-600">{{ formatCurrency(calculation.totalCost) }}</div>
          </div>

          <div class="bg-white p-6 rounded-xl">
            <div class="text-sm text-gray-600 mb-1">Total à rembourser</div>
            <div class="text-2xl font-bold text-gray-900">{{ formatCurrency(calculation.totalAmount) }}</div>
          </div>
        </div>

        <!-- Request Credit Button -->
        <button
          @click="requestCredit"
          :disabled="loading"
          class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Envoi en cours...' : 'Soumettre ma demande à un conseiller' }}
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
        <div class="flex items-center text-red-700">
          <Icon name="material-symbols:error" class="text-xl mr-2" />
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
        <div class="flex items-center text-green-700">
          <Icon name="material-symbols:check-circle" class="text-xl mr-2" />
          <span>Votre demande de crédit a été envoyée à nos conseillers. Vous serez contacté prochainement.</span>
        </div>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h4 class="font-bold text-blue-900 mb-3 flex items-center">
          <Icon name="material-symbols:info" class="mr-2" />
          Important à savoir
        </h4>
        <ul class="space-y-2 text-sm text-blue-800">
          <li class="flex items-start">
            <Icon name="material-symbols:check-circle" class="mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            <span>Votre demande sera étudiée par un conseiller bancaire</span>
          </li>
          <li class="flex items-start">
            <Icon name="material-symbols:check-circle" class="mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            <span>L'assurance emprunteur est obligatoire pour tout crédit immobilier</span>
          </li>
          <li class="flex items-start">
            <Icon name="material-symbols:check-circle" class="mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            <span>Les taux sont indicatifs et peuvent être ajustés par votre conseiller</span>
          </li>
          <li class="flex items-start">
            <Icon name="material-symbols:check-circle" class="mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            <span>Vous recevrez une réponse sous 48h ouvrées</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref(false)

const formData = ref({
  principalAmount: 100000,
  durationMonths: 240,
  annualInterestRate: 2.5,
  insuranceRate: 0.36,
  accountId: ''
})

const accounts = ref([])
const calculation = ref<any>(null)

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

const calculateCredit = async () => {
  error.value = ''
  calculation.value = null

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${config.public.apiBase}/credits/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        principalAmount: formData.value.principalAmount,
        annualInterestRate: formData.value.annualInterestRate,
        insuranceRate: formData.value.insuranceRate,
        durationMonths: formData.value.durationMonths
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Erreur lors du calcul')
    }

    calculation.value = await response.json()
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue'
  }
}

const requestCredit = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {
    const token = localStorage.getItem('token')

    // In a real application, this would send the credit request to the advisor
    // For now, we'll simulate a successful request
    await new Promise(resolve => setTimeout(resolve, 1500))

    success.value = true

    // Redirect after 3 seconds
    setTimeout(() => {
      router.push('/dashboard/credits')
    }, 3000)
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
  title: 'Demande de crédit - Banque AVENIR',
  description: 'Simulez et demandez un crédit immobilier'
})
</script>
