<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notificationsStore.notifications"
          :key="notification.id"
          :class="[
            'px-4 py-3 rounded-lg shadow-lg max-w-sm',
            {
              'bg-green-500 text-white': notification.type === 'success',
              'bg-red-500 text-white': notification.type === 'error',
              'bg-yellow-500 text-white': notification.type === 'warning',
              'bg-blue-500 text-white': notification.type === 'info',
            }
          ]"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium">{{ notification.message }}</p>
            <button
              @click="notificationsStore.removeNotification(notification.id)"
              class="flex-shrink-0"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
const notificationsStore = useNotificationsStore();
const authStore = useAuthStore();

// Initialize auth on app mount
onMounted(() => {
  authStore.initializeAuth();
});
</script>

<style>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
