<template>
  <div class="space-y-4 border rounded-2xl p-6 bg-base-100 shadow-sm">
    <h2 class="text-lg font-semibold text-primary">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup>
defineProps({ title: String })
</script>
