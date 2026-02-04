<template>
  <option :value="value">
    <slot />
  </option>
</template>

<script setup lang="ts">
defineProps<{
  value: string | number
}>()
</script>
