<template>
  <div
    :class="[
      'p-4 rounded-lg border',
      variantClasses,
    ]"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <Icon v-if="icon" :name="icon" class="w-5 h-5 flex-shrink-0" />

      <div class="flex-1">
        <h3 v-if="title" class="font-semibold mb-1">{{ title }}</h3>
        <div class="text-sm">
          <slot />
        </div>
      </div>

      <button
        v-if="closable"
        @click="$emit('close')"
        class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <Icon name="heroicons:x-mark" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'danger';
    title?: string;
    icon?: string;
    closable?: boolean;
  }>(),
  {
    variant: 'info',
    closable: false,
  }
);

defineEmits<{
  close: [];
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'danger':
      return 'bg-red-50 border-red-200 text-red-800';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800';
  }
});

// Auto icon based on variant if not provided
const icon = computed(() => {
  if (props.icon) return props.icon;

  switch (props.variant) {
    case 'success':
      return 'heroicons:check-circle';
    case 'warning':
      return 'heroicons:exclamation-triangle';
    case 'danger':
      return 'heroicons:x-circle';
    default:
      return 'heroicons:information-circle';
  }
});
</script>
