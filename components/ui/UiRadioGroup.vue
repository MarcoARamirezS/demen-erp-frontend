<template>
  <div class="space-y-2">
    <div v-for="opt in normalizedOptions" :key="opt.value" class="flex items-center gap-2">
      <input
        type="radio"
        class="radio radio-primary"
        :value="opt.value"
        :checked="modelValue === opt.value"
        @change="emit('update:modelValue', opt.value)"
      />
      <span class="text-sm">{{ opt.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const normalizedOptions = computed(() =>
  props.options.map((opt: any) => (typeof opt === 'string' ? { label: opt, value: opt } : opt))
)
</script>
