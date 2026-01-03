<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon :name="icon" class="w-5 h-5 text-gray-400" />
      </div>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'block w-full rounded-lg border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
          icon ? 'pl-10' : 'pl-3',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white',
          sizeClasses,
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id?: string;
    modelValue?: string | number;
    label?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    hint?: string;
    icon?: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    type: 'text',
    size: 'md',
  }
);

defineEmits<{
  'update:modelValue': [value: string];
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'py-1.5 pr-3 text-sm';
    case 'lg':
      return 'py-3 pr-4 text-lg';
    default:
      return 'py-2 pr-3 text-base';
  }
});
</script>
