<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header visible uniquement sur la page d'accueil -->
    <UiHeader v-if="route.path === '/'" />
    
    <slot />
    
    <!-- Footer visible uniquement sur la page d'accueil -->
    <UiFooter v-if="route.path === '/'" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>

