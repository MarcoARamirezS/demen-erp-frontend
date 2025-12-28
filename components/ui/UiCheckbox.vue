<template>
  <label class="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      class="checkbox checkbox-primary"
      :value="value"
      :checked="modelValue.includes(value)"
      @change="toggle"
    />
    <span class="text-sm">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  value: string
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
}>()

function toggle(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  const next = checked
    ? [...props.modelValue, props.value]
    : props.modelValue.filter(v => v !== props.value)

  emit('update:modelValue', next)
}
</script>
