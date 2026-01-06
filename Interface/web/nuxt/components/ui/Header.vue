<template>
  <header class="bg-white shadow-sm">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <NuxtLink to="/" class="flex items-center">
            <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AVENIR
            </span>
          </NuxtLink>
        </div>
        <div class="flex items-center space-x-4">
          <NuxtLink 
            to="/login" 
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            Connexion
          </NuxtLink>
          <NuxtLink 
            to="/register" 
            class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700"
          >
            Ouvrir un compte
          </NuxtLink>
        </div>
      </div>
    </nav>
  </header>
</template>

