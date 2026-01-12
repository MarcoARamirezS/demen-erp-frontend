<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{
  clientName: string
}>()

const route = useRoute()
</script>

<template>
  <div class="mb-6 space-y-2">
    <h1 class="text-2xl font-semibold">{{ clientName }}</h1>

    <div class="tabs tabs-boxed">
      <NuxtLink
        :to="`/clients/${route.params.id}`"
        class="tab"
        :class="{ 'tab-active': route.path.endsWith(route.params.id as string) }"
      >
        Información
      </NuxtLink>

      <NuxtLink
        :to="`/clients/${route.params.id}/addresses`"
        class="tab"
        :class="{ 'tab-active': route.path.endsWith('addresses') }"
      >
        Direcciones
      </NuxtLink>
    </div>
  </div>
</template>
