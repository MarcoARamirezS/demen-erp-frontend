<template>
  <label class="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      class="toggle toggle-primary"
      :checked="modelValue"
      @change="$emit('update:modelValue', !modelValue)"
    />
    <span class="text-sm">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label?: string
}>()

defineEmits(['update:modelValue'])
</script>
