<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="uiStore.toggleSidebar()" class="p-2 rounded-md hover:bg-gray-100 lg:hidden">
            <Icon name="heroicons:bars-3" class="w-6 h-6" />
          </button>
          <h1 class="text-xl font-bold text-gray-900">Avenir Bank</h1>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-700">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
          <button @click="handleLogout" class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <div class="flex pt-16">
      <!-- Sidebar -->
      <aside
        v-show="uiStore.sidebarOpen"
        class="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg overflow-y-auto z-20 lg:relative lg:z-0"
      >
        <nav class="p-4 space-y-2">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            <Icon :name="item.icon" class="w-5 h-5" />
            <span class="font-medium">{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="uiStore.sidebarOpen"
      @click="uiStore.setSidebarOpen(false)"
      class="fixed inset-0 bg-black/20 z-10 lg:hidden"
    />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const uiStore = useUiStore();
const { logout } = useAuth();

const menuItems = computed(() => {
  const role = authStore.user?.role;

  if (role === 'client') {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: 'heroicons:home' },
      { path: '/dashboard/accounts', label: 'Mes Comptes', icon: 'heroicons:credit-card' },
      { path: '/dashboard/transfers', label: 'Virements', icon: 'heroicons:arrow-path' },
      { path: '/dashboard/credits', label: 'Crédits', icon: 'heroicons:banknotes' },
      { path: '/dashboard/investments', label: 'Investissements', icon: 'heroicons:chart-bar' },
      { path: '/messages', label: 'Messages', icon: 'heroicons:chat-bubble-left-right' },
      { path: '/news', label: 'Actualités', icon: 'heroicons:newspaper' },
    ];
  } else if (role === 'advisor') {
    return [
      { path: '/advisor/dashboard', label: 'Dashboard', icon: 'heroicons:home' },
      { path: '/advisor/clients', label: 'Clients', icon: 'heroicons:users' },
      { path: '/advisor/messages', label: 'Messages', icon: 'heroicons:chat-bubble-left-right' },
      { path: '/advisor/credits/grant', label: 'Crédits', icon: 'heroicons:currency-euro' },
      { path: '/advisor/news', label: 'Actualités', icon: 'heroicons:newspaper' },
      { path: '/advisor/internal-chat', label: 'Chat Interne', icon: 'heroicons:chat-bubble-oval-left-ellipsis' },
    ];
  } else if (role === 'director') {
    return [
      { path: '/admin/dashboard', label: 'Dashboard', icon: 'heroicons:home' },
      { path: '/admin/users', label: 'Utilisateurs', icon: 'heroicons:users' },
      { path: '/admin/investments', label: 'Actions', icon: 'heroicons:chart-bar' },
      { path: '/admin/news', label: 'Actualités', icon: 'heroicons:newspaper' },
      { path: '/admin/savings', label: 'Épargne', icon: 'heroicons:banknotes' },
      { path: '/admin/internal-chat', label: 'Chat Interne', icon: 'heroicons:chat-bubble-oval-left-ellipsis' },
    ];
  }

  return [];
});

const handleLogout = () => {
  logout();
};
</script>
