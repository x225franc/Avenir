<template>
  <NuxtLayout name="dashboard">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Plateforme d'Investissement</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Investissez dans les actions avec des frais réduits et suivez votre portefeuille en temps réel
      </p>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <UiCard padding="lg" class="text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:chart-bar" class="w-8 h-8 text-blue-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Actions disponibles</h3>
        <p class="text-gray-600">
          Investissez dans une sélection d'actions de qualité avec des prix en temps réel
        </p>
      </UiCard>

      <UiCard padding="lg" class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:wallet" class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Frais réduits</h3>
        <p class="text-gray-600">
          {{ feeLoading ? 'Chargement...' : `Seulement ${transactionFee}€ de frais par transaction` }}
        </p>
      </UiCard>

      <UiCard padding="lg" class="text-center">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:presentation-chart-line" class="w-8 h-8 text-purple-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Suivi en temps réel</h3>
        <p class="text-gray-600">
          Suivez la performance de votre portefeuille avec des gains/pertes calculés automatiquement
        </p>
      </UiCard>
    </div>

    <!-- Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UiCard
        :hoverable="true"
        padding="lg"
        class="group cursor-pointer"
        @click="router.push('/investments/stocks')"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Actions disponibles</h3>
          <Icon
            name="heroicons:chevron-right"
            class="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform"
          />
        </div>
        <p class="text-gray-600 mb-4">
          Consultez toutes les actions disponibles à l'investissement et passez vos ordres
        </p>
        <div class="flex items-center text-blue-600 font-medium">
          <span>Explorer les actions</span>
        </div>
      </UiCard>

      <UiCard
        :hoverable="true"
        padding="lg"
        class="group cursor-pointer"
        @click="router.push('/investments/portfolio')"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Mon portefeuille</h3>
          <Icon
            name="heroicons:chevron-right"
            class="w-6 h-6 text-green-600 group-hover:translate-x-1 transition-transform"
          />
        </div>
        <p class="text-gray-600 mb-4">
          Suivez vos positions, gains/pertes et la performance globale de vos investissements
        </p>
        <div class="flex items-center text-green-600 font-medium">
          <span>Voir mon portefeuille</span>
        </div>
      </UiCard>

      <UiCard
        :hoverable="true"
        padding="lg"
        class="group cursor-pointer"
        @click="router.push('/investments/orders')"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Historique des ordres</h3>
          <Icon
            name="heroicons:chevron-right"
            class="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform"
          />
        </div>
        <p class="text-gray-600 mb-4">
          Consultez tous vos ordres d'achat et de vente passés avec leurs détails
        </p>
        <div class="flex items-center text-purple-600 font-medium">
          <span>Voir l'historique</span>
        </div>
      </UiCard>
    </div>

    <!-- Info Section -->
    <UiCard padding="lg" class="mt-12">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">Comment ça marche ?</h3>
      <div class="space-y-4">
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-blue-600 font-bold">1</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-1">Consultez les actions disponibles</h4>
            <p class="text-gray-600 text-sm">
              Parcourez notre sélection d'actions avec leurs prix en temps réel et leurs performances.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-green-600 font-bold">2</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-1">Passez un ordre</h4>
            <p class="text-gray-600 text-sm">
              Choisissez une action, indiquez la quantité et validez. Les ordres sont exécutés instantanément.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-purple-600 font-bold">3</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-1">Suivez votre portefeuille</h4>
            <p class="text-gray-600 text-sm">
              Consultez vos positions, vos gains/pertes et la performance globale de vos investissements.
            </p>
          </div>
        </div>
      </div>
    </UiCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
});

const router = useRouter();
const { apiFetch } = useApi();

const transactionFee = ref(1); // Défaut 1€
const feeLoading = ref(true);

const loadInvestmentFee = async () => {
  try {
    feeLoading.value = true;
    const data = await apiFetch<{ fee: number }>('/investments/fee');
    transactionFee.value = data.fee;
  } catch (err: any) {
    // Garder la valeur par défaut en cas d'erreur
    console.error('Erreur lors de la récupération des frais:', err);
  } finally {
    feeLoading.value = false;
  }
};

onMounted(() => {
  loadInvestmentFee();
});
</script>
