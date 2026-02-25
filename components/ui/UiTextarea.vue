<template>
  <div class="space-y-1">
    <label v-if="label" class="text-sm font-medium text-base-content/80">
      {{ label }}
    </label>

    <textarea
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly || disabled"
      class="textarea textarea-bordered w-full transition"
      :class="disabled ? 'bg-base-200 cursor-not-allowed opacity-80' : ''"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
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

function onInput(event: Event) {
  if (props.disabled) return
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>
