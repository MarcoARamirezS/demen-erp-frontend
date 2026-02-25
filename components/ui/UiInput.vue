<template>
  <div class="space-y-1">
    <!-- LABEL -->
    <label v-if="label" class="text-sm font-medium text-base-content/80">
      {{ label }}
    </label>

    <div class="relative">
      <!-- ICON -->
      <Icon
        v-if="icon"
        :name="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none"
      />

      <!-- INPUT -->
      <input
        v-bind="filteredAttrs"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :readonly="readonly || disabled"
        class="input input-bordered w-full transition"
        :class="[
          sizeClass,
          icon ? 'pl-10' : '',
          disabled ? 'bg-base-200 cursor-not-allowed opacity-80' : '',
        ]"
        @input="onInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import Icon from '~/components/ui/Icon.vue'

const attrs = useAttrs()

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  icon: String,
  autocomplete: String,

  /* 🔥 FIX: ahora size es prop controlada */
  size: {
    type: String,
    default: 'md', // xs | sm | md | lg
  },

  /* 🔥 FIXES IMPORTANTES */
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

/* 🔥 SSR SAFE: remover size de attrs para que no llegue al input nativo */
const filteredAttrs = computed(() => {
  const { size, ...rest } = attrs
  return rest
})

/* 🔥 Convertir size a clases DaisyUI */
const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'input-xs'
    case 'sm':
      return 'input-sm'
    case 'lg':
      return 'input-lg'
    default:
      return 'input-md'
  }
})

function onInput(event: Event) {
  if (props.disabled) return

  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
