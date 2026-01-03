<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      <div v-if="loading" class="text-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-16 h-16 mx-auto mb-4 text-blue-600" />
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Conversations List -->
        <UiCard padding="lg" class="lg:col-span-1">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">Conversations</h2>
            <UiButton variant="primary" size="sm" @click="showNewConversationModal = true">
              Nouveau
            </UiButton>
          </div>

          <div v-if="conversations.length === 0" class="text-center py-8">
            <Icon name="heroicons:chat-bubble-left-right" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p class="text-gray-600 text-sm">Aucune conversation</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="conv in conversations"
              :key="conv.id"
              :class="[
                'p-4 rounded-lg cursor-pointer transition',
                selectedConversation?.id === conv.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent',
              ]"
              @click="selectConversation(conv)"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:user" class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ conv.advisor.firstName }} {{ conv.advisor.lastName }}</p>
                    <p class="text-xs text-gray-600">Conseiller</p>
                  </div>
                </div>
                <UiBadge v-if="conv.unreadCount > 0" variant="danger" size="sm">
                  {{ conv.unreadCount }}
                </UiBadge>
              </div>
              <p class="text-sm text-gray-600 truncate">{{ conv.lastMessage?.content || 'Nouvelle conversation' }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ conv.lastMessage ? formatDate(conv.lastMessage.createdAt) : '' }}
              </p>
            </div>
          </div>
        </UiCard>

        <!-- Messages Panel -->
        <UiCard padding="lg" class="lg:col-span-2">
          <div v-if="!selectedConversation" class="flex items-center justify-center h-96">
            <div class="text-center">
              <Icon name="heroicons:chat-bubble-left-right" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p class="text-gray-600">Sélectionnez une conversation pour commencer</p>
            </div>
          </div>

          <div v-else class="flex flex-col h-[600px]">
            <!-- Conversation Header -->
            <div class="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="heroicons:user" class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ selectedConversation.advisor.firstName }} {{ selectedConversation.advisor.lastName }}
                </h3>
                <p class="text-sm text-gray-600">Conseiller bancaire</p>
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900',
                  ]"
                >
                  <p class="text-sm">{{ message.content }}</p>
                  <p
                    :class="[
                      'text-xs mt-1',
                      message.senderId === authStore.user?.id ? 'text-blue-100' : 'text-gray-500',
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
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

    <!-- New Conversation Modal -->
    <UiModal v-model="showNewConversationModal" title="Nouvelle conversation">
      <div class="space-y-4">
        <UiInput v-model="newConversationAdvisorId" label="Sélectionner un conseiller" type="select">
          <select v-model="newConversationAdvisorId" class="w-full px-4 py-2 border rounded-lg">
            <option value="">Sélectionnez un conseiller</option>
            <option v-for="advisor in advisors" :key="advisor.id" :value="advisor.id">
              {{ advisor.firstName }} {{ advisor.lastName }}
            </option>
          </select>
        </UiInput>

        <UiInput
          v-model="newConversationMessage"
          label="Premier message"
          type="textarea"
        >
          <textarea
            v-model="newConversationMessage"
            placeholder="Bonjour, j'aurais besoin d'aide..."
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </UiInput>
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="showNewConversationModal = false">Annuler</UiButton>
        <UiButton
          variant="primary"
          :loading="creatingConversation"
          @click="createConversation"
          :disabled="!newConversationAdvisorId || !newConversationMessage.trim()"
        >
          Créer la conversation
        </UiButton>
      </template>
    </UiModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
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
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  advisorId: string;
  clientId: string;
  unreadCount: number;
  advisor: User;
  lastMessage?: Message;
}

const loading = ref(true);
const conversations = ref<Conversation[]>([]);
const selectedConversation = ref<Conversation | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref('');
const sending = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const showNewConversationModal = ref(false);
const advisors = ref<User[]>([]);
const newConversationAdvisorId = ref('');
const newConversationMessage = ref('');
const creatingConversation = ref(false);

const loadConversations = async () => {
  try {
    loading.value = true;
    const data = await apiFetch<Conversation[]>('/messages/conversations');
    conversations.value = data;
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement des conversations',
    });
  } finally {
    loading.value = false;
  }
};

const loadAdvisors = async () => {
  try {
    const data = await apiFetch<User[]>('/users/advisors');
    advisors.value = data;
  } catch (err: any) {
    console.error('Erreur de chargement des conseillers:', err);
  }
};

const selectConversation = async (conversation: Conversation) => {
  selectedConversation.value = conversation;
  await loadMessages(conversation.id);
};

const loadMessages = async (conversationId: string) => {
  try {
    const data = await apiFetch<Message[]>(`/messages/conversations/${conversationId}/messages`);
    messages.value = data;
    await markAsRead(conversationId);
    scrollToBottom();
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur de chargement des messages',
    });
  }
};

const markAsRead = async (conversationId: string) => {
  try {
    await apiFetch(`/messages/conversations/${conversationId}/read`, { method: 'PATCH' });
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (conv) {
      conv.unreadCount = 0;
    }
  } catch (err) {
    console.error('Erreur lors du marquage comme lu:', err);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return;

  try {
    sending.value = true;
    const message = await apiFetch<Message>('/messages', {
      method: 'POST',
      body: {
        conversationId: selectedConversation.value.id,
        content: newMessage.value.trim(),
      },
    });

    messages.value.push(message);
    newMessage.value = '';
    scrollToBottom();

    // Update last message in conversation
    const conv = conversations.value.find((c) => c.id === selectedConversation.value!.id);
    if (conv) {
      conv.lastMessage = message;
    }
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de l\'envoi du message',
    });
  } finally {
    sending.value = false;
  }
};

const createConversation = async () => {
  if (!newConversationAdvisorId.value || !newConversationMessage.value.trim()) return;

  try {
    creatingConversation.value = true;
    const conversation = await apiFetch<Conversation>('/messages/conversations', {
      method: 'POST',
      body: {
        advisorId: newConversationAdvisorId.value,
        initialMessage: newConversationMessage.value.trim(),
      },
    });

    conversations.value.unshift(conversation);
    selectedConversation.value = conversation;
    await loadMessages(conversation.id);

    showNewConversationModal.value = false;
    newConversationAdvisorId.value = '';
    newConversationMessage.value = '';

    notificationsStore.addNotification({
      type: 'success',
      message: 'Conversation créée avec succès',
    });
  } catch (err: any) {
    notificationsStore.addNotification({
      type: 'error',
      message: err.data?.message || 'Erreur lors de la création de la conversation',
    });
  } finally {
    creatingConversation.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

onMounted(() => {
  loadConversations();
  loadAdvisors();
});
</script>
