<template>
  <div
    :class="[
      'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
      paddingClasses,
      hoverClasses,
    ]"
  >
    <!-- Header -->
    <div v-if="$slots.header || title" class="border-b border-gray-200 px-6 py-4">
      <slot name="header">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      </slot>
    </div>

    <!-- Body -->
    <div :class="bodyPaddingClasses">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="border-t border-gray-200 px-6 py-4 bg-gray-50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
  }>(),
  {
    padding: 'md',
    hoverable: false,
  }
);

const paddingClasses = computed(() => {
  if (props.padding === 'none') return '';
  return '';
});

const bodyPaddingClasses = computed(() => {
  switch (props.padding) {
    case 'none':
      return '';
    case 'sm':
      return 'p-4';
    case 'lg':
      return 'p-8';
    default:
      return 'p-6';
  }
});

const hoverClasses = computed(() => {
  return props.hoverable ? 'transition-shadow hover:shadow-md cursor-pointer' : '';
});
</script>
