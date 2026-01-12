<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  clientName: string
}>()
</script>

<template>
  <div class="mb-6 space-y-2">
    <h1 class="text-2xl font-semibold">{{ clientName }}</h1>

    <div class="tabs tabs-boxed">
      <NuxtLink to="" class="tab">Información</NuxtLink>
      <NuxtLink to="addresses" class="tab">Direcciones</NuxtLink>
    </div>
  </div>
</template>
