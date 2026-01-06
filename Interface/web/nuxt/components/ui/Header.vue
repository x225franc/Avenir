<template>
  <header class="bg-white shadow-sm">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <NuxtLink to="/" class="flex items-center">
            <span class="text-2xl font-bold gradient-text">
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
            class="gradient-button text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Ouvrir un compte
          </NuxtLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(to right, #2563eb, #9333ea);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.gradient-button {
  background: linear-gradient(to right, #2563eb, #9333ea);
  transition: all 0.3s ease;
}

.gradient-button:hover {
  background: linear-gradient(to right, #1d4ed8, #7e22ce);
}
</style>

