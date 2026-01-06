<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <NuxtRouteAnnouncer />
    
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div class="text-center">
          <h1 class="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-6">
            <span class="block">Bienvenue chez</span>
            <span class="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
              class="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border-2 border-gray-200"
            >
              Se connecter
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Background animations -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div class="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div class="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
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
              <Icon name="material-symbols:shield-check" class="text-white text-3xl" />
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

/* Animations pour les blobs */
.animate-blob {
  animation: blob 7s infinite;
}

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

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>