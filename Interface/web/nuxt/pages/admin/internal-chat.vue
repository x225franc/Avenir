<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Chat Interne</h1>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Team Members -->
        <UiCard padding="lg" class="lg:col-span-1">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Équipe</h2>

          <div v-if="loadingMembers" class="text-center py-8">
            <Icon name="svg-spinners:ring-resize" class="w-8 h-8 mx-auto text-purple-600" />
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="member in teamMembers"
              :key="member.id"
              :class="[
                'p-3 rounded-lg cursor-pointer transition',
                selectedMember?.id === member.id
                  ? 'bg-purple-50 border-2 border-purple-500'
                  : 'bg-gray-50 hover:bg-gray-100',
              ]"
              @click="selectMember(member)"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon name="heroicons:user" class="w-5 h-5 text-purple-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900 truncate">
                    {{ member.firstName }} {{ member.lastName }}
                  </p>
                  <p class="text-xs text-gray-600">{{ getRoleLabel(member.role) }}</p>
                </div>
              </div>
            </div>
          </div>
        </UiCard>

        <!-- Chat -->
        <UiCard padding="lg" class="lg:col-span-3">
          <div v-if="!selectedMember" class="flex items-center justify-center h-96">
            <div class="text-center">
              <Icon name="heroicons:chat-bubble-left-right" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p class="text-gray-600">Sélectionnez un membre de l'équipe pour commencer</p>
            </div>
          </div>

          <div v-else class="flex flex-col h-[600px]">
            <!-- Chat Header -->
            <div class="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="heroicons:user" class="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ selectedMember.firstName }} {{ selectedMember.lastName }}
                </h3>
                <p class="text-sm text-gray-600">{{ getRoleLabel(selectedMember.role) }}</p>
              </div>
            </div>

            <!-- Messages -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto py-4 space-y-4">
              <div v-if="messages.length === 0" class="text-center py-12">
                <p class="text-gray-600">Aucun message dans cette conversation</p>
              </div>

              <div
                v-for="message in messages"
                :key="message.id"
                :class="[
                  'flex',
                  message.senderId === authStore.user?.id ? 'justify-end' : 'justify-start',
                ]"
              >
                <div
                  :class="[
                    'max-w-[70%] rounded-lg p-3',
                    message.senderId === authStore.user?.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900',
                  ]"
                >
                  <p class="text-sm">{{ message.content }}</p>
                  <p
                    :class="[
                      'text-xs mt-1',
                      message.senderId === authStore.user?.id ? 'text-purple-100' : 'text-gray-500',
                    ]"
                  >
                    {{ formatDate(message.createdAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="pt-4 border-t border-gray-200">
              <form @submit.prevent="sendMessage" class="flex gap-2">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Écrivez votre message..."
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <UiButton type="submit" variant="primary" :disabled="!newMessage.trim() || sending">
                  <Icon v-if="sending" name="svg-spinners:ring-resize" class="w-5 h-5" />
                  <Icon v-else name="heroicons:paper-airplane" class="w-5 h-5" />
                </UiButton>
              </form>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['auth', 'role'],
  role: 'director',
});

const { apiFetch } = useApi();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

const teamMembers = ref<User[]>([]);
const loadingMembers = ref(true);
const selectedMember = ref<User | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref('');
const sending = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const loadTeamMembers = async () => {
  try {
    loadingMembers.value = true;
    const data = await apiFetch<User[]>('/admin/team-members');
    teamMembers.value = data.filter((m) => m.id !== authStore.user?.id);
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement',
    });
  } finally {
    loadingMembers.value = false;
  }
};

const selectMember = async (member: User) => {
  selectedMember.value = member;
  await loadMessages(member.id);
};

const loadMessages = async (userId: string) => {
  try {
    const data = await apiFetch<Message[]>(`/admin/internal-chat/${userId}/messages`);
    messages.value = data;
    scrollToBottom();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement des messages',
    });
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedMember.value) return;

  try {
    sending.value = true;
    const message = await apiFetch<Message>('/admin/internal-chat/messages', {
      method: 'POST',
      body: {
        recipientId: selectedMember.value.id,
        content: newMessage.value.trim(),
      },
    });

    messages.value.push(message);
    newMessage.value = '';
    scrollToBottom();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de l\'envoi',
    });
  } finally {
    sending.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'director': return 'Directeur';
    case 'advisor': return 'Conseiller';
    default: return 'Client';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

onMounted(() => {
  loadTeamMembers();
});
</script>
