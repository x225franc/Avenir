<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <NuxtRouteAnnouncer />
    
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div class="text-center">
          <h1 class="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-6">
            <span class="block">Bienvenue chez</span>
            <span class="block text-blue-600">
              Banque AVENIR
            </span>
          </h1>
          <p class="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600">
            Alliance de Valeurs Économiques et Nationales Investies
            Responsablement
          </p>
          <p class="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
            Gérez vos finances en toute simplicité avec notre plateforme
            moderne et sécurisée
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/register"
              class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Ouvrir un compte
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border-2 border-gray-200 transform hover:-translate-y-0.5"
            >
              Se connecter
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Background animations -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div class="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style="animation-delay: 2s;"></div>
        <div class="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style="animation-delay: 4s;"></div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div class="p-6">
            <div class="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
              50K+
            </div>
            <div class="text-gray-600 font-medium">Clients satisfaits</div>
          </div>
          <div class="p-6">
            <div class="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
              98%
            </div>
            <div class="text-gray-600 font-medium">Taux de satisfaction</div>
          </div>
          <div class="p-6">
            <div class="text-4xl md:text-5xl font-bold text-green-600 mb-2">
              24/7
            </div>
            <div class="text-gray-600 font-medium">Support client</div>
          </div>
          <div class="p-6">
            <div class="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
              100%
            </div>
            <div class="text-gray-600 font-medium">Sécurisé</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            Vos finances, simplifiées
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Des outils puissants pour gérer votre argent comme un pro
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="material-symbols:shield-locked" class="text-white text-3xl" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">
              Sécurité maximale
            </h3>
            <p class="text-gray-600">
              Vos données sont protégées par un chiffrement de niveau
              bancaire et une authentification à double facteur.
            </p>
          </div>

          <div class="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="material-symbols:trending-up" class="text-white text-3xl" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">
              Investissement facile
            </h3>
            <p class="text-gray-600">
              Investissez dans des actions avec des frais réduits et suivez
              votre portefeuille en temps réel.
            </p>
          </div>

          <div class="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="material-symbols:savings" class="text-white text-3xl" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">
              Épargne rémunérée
            </h3>
            <p class="text-gray-600">
              Faites fructifier votre argent avec nos comptes d'épargne à
              taux compétitifs, calculés quotidiennement.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            Tous nos services bancaires
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Une gamme complète de services pour répondre à tous vos besoins financiers
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all">
            <Icon name="material-symbols:credit-card" class="text-blue-600 text-4xl mb-4" />
            <h3 class="text-xl font-bold text-gray-900 mb-2">Comptes courants</h3>
            <p class="text-gray-600">Gérez votre argent au quotidien avec nos comptes sans frais cachés.</p>
          </div>

          <div class="p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all">
            <Icon name="material-symbols:account-balance" class="text-purple-600 text-4xl mb-4" />
            <h3 class="text-xl font-bold text-gray-900 mb-2">Épargne</h3>
            <p class="text-gray-600">Faites fructifier votre argent avec des taux d'intérêt attractifs.</p>
          </div>

          <div class="p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-green-300 hover:shadow-lg transition-all">
            <Icon name="material-symbols:home" class="text-green-600 text-4xl mb-4" />
            <h3 class="text-xl font-bold text-gray-900 mb-2">Crédits immobiliers</h3>
            <p class="text-gray-600">Réalisez vos projets immobiliers avec des conditions avantageuses.</p>
          </div>

          <div class="p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all">
            <Icon name="material-symbols:show-chart" class="text-indigo-600 text-4xl mb-4" />
            <h3 class="text-xl font-bold text-gray-900 mb-2">Investissements</h3>
            <p class="text-gray-600">Investissez en bourse avec des frais réduits et un suivi en temps réel.</p>
          </div>

          <div class="p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-pink-300 hover:shadow-lg transition-all">
            <Icon name="material-symbols:support-agent" class="text-pink-600 text-4xl mb-4" />
            <h3 class="text-xl font-bold text-gray-900 mb-2">Conseiller dédié</h3>
            <p class="text-gray-600">Bénéficiez de l'accompagnement d'un conseiller pour vos projets.</p>
          </div>

          <div class="p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all">
            <Icon name="material-symbols:phone-iphone" class="text-orange-600 text-4xl mb-4" />
            <h3 class="text-xl font-bold text-gray-900 mb-2">Application mobile</h3>
            <p class="text-gray-600">Gérez vos comptes où que vous soyez avec notre app intuitive.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            Ils nous font confiance
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les témoignages de nos clients satisfaits
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-lg">
            <div class="flex items-center mb-4">
              <div class="flex text-yellow-400">
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
              </div>
            </div>
            <p class="text-gray-600 mb-6">
              "Une expérience bancaire vraiment moderne. L'interface est intuitive et le service client très réactif. Je recommande vivement !"
            </p>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                MC
              </div>
              <div>
                <div class="font-semibold text-gray-900">Marie Curie</div>
                <div class="text-sm text-gray-500">Cliente depuis 2 ans</div>
              </div>
            </div>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg">
            <div class="flex items-center mb-4">
              <div class="flex text-yellow-400">
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
              </div>
            </div>
            <p class="text-gray-600 mb-6">
              "Les frais sont transparents, les outils d'investissement sont excellents. J'ai pu développer mon portefeuille facilement."
            </p>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                JD
              </div>
              <div>
                <div class="font-semibold text-gray-900">Jean Dupont</div>
                <div class="text-sm text-gray-500">Client depuis 1 an</div>
              </div>
            </div>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg">
            <div class="flex items-center mb-4">
              <div class="flex text-yellow-400">
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
                <Icon name="material-symbols:star" class="text-2xl" />
              </div>
            </div>
            <p class="text-gray-600 mb-6">
              "Mon conseiller m'a accompagné dans mon projet immobilier. Service personnalisé et professionnel. Merci à toute l'équipe !"
            </p>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                SL
              </div>
              <div>
                <div class="font-semibold text-gray-900">Sophie Laurent</div>
                <div class="text-sm text-gray-500">Cliente depuis 3 ans</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-bold text-gray-900 mb-6">
          Prêt à commencer ?
        </h2>
        <p class="text-xl text-gray-600 mb-10">
          Ouvrez votre compte en quelques minutes et profitez de tous nos
          services dès aujourd'hui.
        </p>
        <NuxtLink
          to="/register"
          class="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Ouvrir un compte gratuitement
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Meta tags pour SEO
useSeoMeta({
  title: 'Banque AVENIR - Votre partenaire financier',
  ogTitle: 'Banque AVENIR - Votre partenaire financier',
  description: 'Alliance de Valeurs Économiques et Nationales Investies Responsablement. Gérez vos finances en toute simplicité avec notre plateforme moderne et sécurisée.',
  ogDescription: 'Gérez vos finances en toute simplicité avec notre plateforme moderne et sécurisée.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
})

// Navigation guards ou logique d'authentification peuvent être ajoutées ici
// const { $auth } = useNuxtApp()
// if ($auth?.isAuthenticated) {
//   await navigateTo('/dashboard')
// }
</script>

<style scoped>
/* Classes personnalisées pour les gradients si nécessaire */
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background: linear-gradient(to right, var(--tw-gradient-stops));
}

.bg-clip-text {
  background-clip: text;
  -webkit-background-clip: text;
}

.text-transparent {
  color: transparent;
}

/* Animation personnalisée pour les blobs */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>