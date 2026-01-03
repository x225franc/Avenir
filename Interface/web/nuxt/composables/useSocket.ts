import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const connect = () => {
    if (socket?.connected) {
      return socket;
    }

    socket = io(config.public.wsUrl as string, {
      auth: {
        token: authStore.token,
      },
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);

      // Join user room
      if (authStore.user) {
        socket?.emit('join', { userId: authStore.user.id });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return socket;
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const emit = (event: string, data: any) => {
    socket?.emit(event, data);
  };

  const on = (event: string, callback: (data: any) => void) => {
    socket?.on(event, callback);
  };

  const off = (event: string, callback?: (data: any) => void) => {
    socket?.off(event, callback);
  };

  return {
    socket,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};
