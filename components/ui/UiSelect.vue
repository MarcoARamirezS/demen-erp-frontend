<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </label>

    <select
      class="select select-bordered w-full"
      :value="modelValue ?? ''"
      :disabled="disabled"
      @change="onChange"
    >
      <slot />
    </select>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number | null
  label?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number): void
}>()

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
