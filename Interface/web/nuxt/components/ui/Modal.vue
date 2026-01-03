<template>
  <TransitionRoot :show="modelValue" as="template">
    <Dialog as="div" class="relative z-50" @close="close">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Modal container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              :class="[
                'w-full bg-white rounded-xl shadow-xl transform transition-all',
                sizeClasses,
              ]"
            >
              <!-- Header -->
              <div v-if="$slots.header || title" class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <DialogTitle as="h3" class="text-lg font-semibold text-gray-900">
                  <slot name="header">{{ title }}</slot>
                </DialogTitle>
                <button
                  v-if="closable"
                  @click="close"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon name="heroicons:x-mark" class="w-5 h-5" />
                </button>
              </div>

              <!-- Body -->
              <div class="px-6 py-4">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
  }>(),
  {
    size: 'md',
    closable: true,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'max-w-md';
    case 'lg':
      return 'max-w-3xl';
    case 'xl':
      return 'max-w-5xl';
    case 'full':
      return 'max-w-7xl';
    default:
      return 'max-w-lg';
  }
});

const close = () => {
  if (props.closable) {
    emit('update:modelValue', false);
  }
};
</script>
