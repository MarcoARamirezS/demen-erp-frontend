<template>
  <div class="form-control w-full">
    <!-- Label -->
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </label>

    <select
      class="select select-bordered w-full"
      :value="modelValue"
      :disabled="disabled || isEmpty"
      @change="onChange"
    >
      <!-- Empty state -->
      <option v-if="isEmpty" value="" disabled>
        {{ emptyText }}
      </option>

      <!-- Options -->
      <slot v-else />
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = defineProps<{
  modelValue: string | number
  label?: string
  disabled?: boolean
  emptyText?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const slots = useSlots()

/**
 * Detecta si NO hay UiOption
 */
const isEmpty = computed(() => {
  const nodes = slots.default?.() ?? []
  return nodes.length === 0
})

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
