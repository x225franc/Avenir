<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      sizeClasses,
      variantClasses,
    ]"
  >
    <Icon v-if="icon" :name="icon" class="w-4 h-4" />
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
  }>(),
  {
    variant: 'gray',
    size: 'md',
  }
);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-2 py-0.5 text-xs';
    case 'lg':
      return 'px-4 py-1.5 text-base';
    default:
      return 'px-3 py-1 text-sm';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue-100 text-blue-800';
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'danger':
      return 'bg-red-100 text-red-800';
    case 'info':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});
</script>
