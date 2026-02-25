<template>
  <div class="space-y-3">
    <p v-if="label" class="font-medium text-sm text-base-content/80">
      {{ label }}
    </p>

    <!-- Opciones normales -->
    <UiCheckbox
      v-for="opt in options"
      :key="opt"
      :model-value="modelValue"
      :value="opt"
      :label="opt"
      @update:modelValue="updateValue"
    />

    <!-- Opción Otros -->
    <UiCheckbox
      :model-value="modelValue"
      value="otros"
      label="Otros"
      @update:modelValue="updateValue"
    />

    <!-- Input cuando está seleccionado "otros" -->
    <UiInput
      v-if="modelValue?.includes('otros')"
      v-model="otherValue"
      placeholder="Especificar"
      class="ml-6"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  other: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: String,
})

const emit = defineEmits(['update:modelValue', 'update:other'])

// Maneja actualización de array
function updateValue(val: string[]) {
  emit('update:modelValue', val)

  // Si quitaron "otros", limpiar input
  if (!val.includes('otros')) {
    emit('update:other', '')
  }
}

// Computed para v-model:other
const otherValue = computed({
  get: () => props.other,
  set: val => emit('update:other', val),
})
</script>
