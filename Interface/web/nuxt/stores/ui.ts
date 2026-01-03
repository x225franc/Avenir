import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: true,
    loading: false,
    modals: {} as Record<string, boolean>,
  }),

  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    setSidebarOpen(open: boolean) {
      this.sidebarOpen = open;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    openModal(modalId: string) {
      this.modals[modalId] = true;
    },

    closeModal(modalId: string) {
      this.modals[modalId] = false;
    },

    isModalOpen(modalId: string): boolean {
      return this.modals[modalId] || false;
    },
  },
});
