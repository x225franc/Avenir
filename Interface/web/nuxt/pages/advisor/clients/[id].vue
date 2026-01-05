<template>
  <div class="min-h-screen bg-gray-50">
    <AdvisorHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <NuxtLink to="/advisor/dashboard" class="hover:text-blue-600">Dashboard</NuxtLink>
          </li>
          <li>/</li>
          <li>
            <NuxtLink to="/advisor/clients" class="hover:text-blue-600">Clients</NuxtLink>
          </li>
          <li>/</li>
          <li class="text-gray-900 font-medium">{{ client?.firstName }} {{ client?.lastName }}</li>
        </ol>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-gray-500">Chargement des informations du client...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
        <div class="flex items-center text-red-700">
          <Icon name="material-symbols:error" class="text-xl mr-2" />
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Client Details -->
      <div v-else-if="client">
        <!-- Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center">
              <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                {{ client.firstName[0] }}{{ client.lastName[0] }}
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-1">
                  {{ client.firstName }} {{ client.lastName }}
                </h1>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <div class="flex items-center">
                    <Icon name="material-symbols:mail" class="mr-1" />
                    {{ client.email }}
                  </div>
                  <div class="flex items-center">
                    <Icon name="material-symbols:phone" class="mr-1" />
                    {{ client.phoneNumber || 'Non renseigné' }}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span :class="[
                'px-4 py-2 rounded-full text-sm font-semibold',
                client.emailVerified
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              ]">
                {{ client.emailVerified ? 'Vérifié' : 'Non vérifié' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid md:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="text-sm text-gray-600 mb-1">Comptes</div>
            <div class="text-3xl font-bold text-blue-600">{{ accounts.length }}</div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="text-sm text-gray-600 mb-1">Solde total</div>
            <div class="text-3xl font-bold text-green-600">{{ formatCurrency(totalBalance) }}</div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="text-sm text-gray-600 mb-1">Crédits actifs</div>
            <div class="text-3xl font-bold text-purple-600">{{ credits.length }}</div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="text-sm text-gray-600 mb-1">Client depuis</div>
            <div class="text-lg font-bold text-gray-900">{{ formatDate(client.createdAt) }}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                @click="activeTab = 'accounts'"
                :class="[
                  'px-6 py-4 text-sm font-semibold border-b-2 transition-colors',
                  activeTab === 'accounts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                ]"
              >
                Comptes
              </button>
              <button
                @click="activeTab = 'credits'"
                :class="[
                  'px-6 py-4 text-sm font-semibold border-b-2 transition-colors',
                  activeTab === 'credits'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                ]"
              >
                Crédits
              </button>
              <button
                @click="activeTab = 'transactions'"
                :class="[
                  'px-6 py-4 text-sm font-semibold border-b-2 transition-colors',
                  activeTab === 'transactions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                ]"
              >
                Transactions
              </button>
            </nav>
          </div>

          <div class="p-6">
            <!-- Accounts Tab -->
            <div v-if="activeTab === 'accounts'">
              <div v-if="accounts.length === 0" class="text-center py-12 text-gray-500">
                Aucun compte
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="account in accounts"
                  :key="account.id"
                  class="p-6 border-2 border-gray-100 rounded-xl hover:border-blue-200 transition-all"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-bold text-gray-900">{{ account.name }}</h3>
                        <span :class="[
                          'px-3 py-1 rounded-full text-xs font-semibold',
                          account.accountType === 'savings'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        ]">
                          {{ account.accountType === 'savings' ? 'Épargne' : 'Courant' }}
                        </span>
                      </div>
                      <div class="text-sm text-gray-600">{{ account.iban }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-2xl font-bold text-gray-900">
                        {{ formatCurrency(account.balance) }}
                      </div>
                      <div class="text-sm text-gray-500">Solde</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Credits Tab -->
            <div v-if="activeTab === 'credits'">
              <div v-if="credits.length === 0" class="text-center py-12">
                <div class="text-gray-500 mb-4">Aucun crédit en cours</div>
                <NuxtLink
                  to="/advisor/credits/grant"
                  class="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                >
                  Octroyer un crédit
                </NuxtLink>
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="credit in credits"
                  :key="credit.id"
                  class="p-6 border-2 border-gray-100 rounded-xl"
                >
                  <div class="grid md:grid-cols-3 gap-4">
                    <div>
                      <div class="text-sm text-gray-600 mb-1">Montant initial</div>
                      <div class="text-xl font-bold text-gray-900">
                        {{ formatCurrency(credit.principalAmount) }}
                      </div>
                    </div>
                    <div>
                      <div class="text-sm text-gray-600 mb-1">Restant dû</div>
                      <div class="text-xl font-bold text-orange-600">
                        {{ formatCurrency(credit.remainingAmount) }}
                      </div>
                    </div>
                    <div>
                      <div class="text-sm text-gray-600 mb-1">Mensualité</div>
                      <div class="text-xl font-bold text-blue-600">
                        {{ formatCurrency(credit.monthlyPayment) }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                    <div>Taux: {{ credit.annualInterestRate }}%</div>
                    <div>{{ credit.durationMonths }} mois</div>
                    <div>{{ credit.paidMonths }}/{{ credit.durationMonths }} payés</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transactions Tab -->
            <div v-if="activeTab === 'transactions'">
              <div v-if="transactions.length === 0" class="text-center py-12 text-gray-500">
                Aucune transaction
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="transaction in transactions"
                  :key="transaction.id"
                  class="p-4 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      ]">
                        <Icon
                          :name="transaction.type === 'credit' ? 'material-symbols:arrow-downward' : 'material-symbols:arrow-upward'"
                          :class="transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'"
                        />
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900">{{ transaction.description }}</div>
                        <div class="text-sm text-gray-500">{{ formatDate(transaction.createdAt) }}</div>
                      </div>
                    </div>
                    <div :class="[
                      'text-lg font-bold',
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    ]">
                      {{ transaction.type === 'credit' ? '+' : '-' }}{{ formatCurrency(Math.abs(transaction.amount)) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

const clientId = route.params.id as string

const loading = ref(true)
const error = ref('')
const client = ref<any>(null)
const accounts = ref<any[]>([])
const credits = ref<any[]>([])
const transactions = ref<any[]>([])
const activeTab = ref('accounts')

const totalBalance = computed(() => {
  return accounts.value.reduce((sum, account) => sum + account.balance, 0)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadClientData = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')

    // Load client info
    const clientResponse = await fetch(`${config.public.apiBase}/admin/users/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!clientResponse.ok) {
      throw new Error('Client non trouvé')
    }

    client.value = await clientResponse.json()

    // Load accounts
    const accountsResponse = await fetch(`${config.public.apiBase}/accounts/user/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (accountsResponse.ok) {
      accounts.value = await accountsResponse.json()
    }

    // Load credits
    const creditsResponse = await fetch(`${config.public.apiBase}/credits/user/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (creditsResponse.ok) {
      credits.value = await creditsResponse.json()
    }

    // Load recent transactions from all accounts
    if (accounts.value.length > 0) {
      const allTransactions = []
      for (const account of accounts.value) {
        const txResponse = await fetch(`${config.public.apiBase}/transactions/account/${account.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (txResponse.ok) {
          const txs = await txResponse.json()
          allTransactions.push(...txs)
        }
      }
      // Sort by date and limit to 20 most recent
      transactions.value = allTransactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20)
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des données'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClientData()
})

useSeoMeta({
  title: `Client ${clientId} - Banque AVENIR`,
  description: 'Détails du client'
})
</script>
