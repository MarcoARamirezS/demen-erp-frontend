<template>
  <NuxtLink
    :to="to"
    class="group flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content transition"
    active-class="bg-base-200 text-base-content font-medium"
  >
    <Icon :name="icon" class="w-4 h-4 text-base-content/40 group-hover:text-base-content" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup>
import Icon from '~/components/ui/Icon.vue'

defineProps({
  icon: String,
  label: String,
  to: String,
})
</script>
