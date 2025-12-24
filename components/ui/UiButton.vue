<template>
  <button class="btn" :class="classes">
    <Icon v-if="icon" :name="icon" class="mr-2" />
    <slot />
  </button>
</template>

<script setup>
import Icon from "./Icon.vue"

const props = defineProps({
  variant: { default: "primary" },
  size: { default: "md" },
  icon: String,
})

const classes = computed(() => [
  `btn-${props.variant}`,
  `btn-${props.size}`,
])
</script>
