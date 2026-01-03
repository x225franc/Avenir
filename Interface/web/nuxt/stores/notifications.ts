import { defineStore } from 'pinia';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
  }),

  actions: {
    addNotification(notification: Omit<Notification, 'id'>) {
      const id = Math.random().toString(36).substring(7);
      const newNotification: Notification = {
        id,
        ...notification,
        duration: notification.duration || 5000,
      };

      this.notifications.push(newNotification);

      // Auto-remove after duration
      if (newNotification.duration) {
        setTimeout(() => {
          this.removeNotification(id);
        }, newNotification.duration);
      }
    },

    removeNotification(id: string) {
      const index = this.notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },

    success(message: string, duration?: number) {
      this.addNotification({ type: 'success', message, duration });
    },

    error(message: string, duration?: number) {
      this.addNotification({ type: 'error', message, duration });
    },

    warning(message: string, duration?: number) {
      this.addNotification({ type: 'warning', message, duration });
    },

    info(message: string, duration?: number) {
      this.addNotification({ type: 'info', message, duration });
    },
  },
});
