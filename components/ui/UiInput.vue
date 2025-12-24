<template>
  <div class="relative">
    <Icon v-if="icon" :name="icon" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      class="input input-bordered w-full pl-10"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  type: { type: String, default: "text" },
  placeholder: String,
  icon: String,
  autocomplete: String,
})

defineEmits(["update:modelValue"])
</script>
