<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  clientId: string
  clientName: string
  section?: 'info' | 'addresses'
}>()
</script>

<template>
  <div class="space-y-4">
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-5"
    >
      <!-- BREADCRUMB -->
      <nav class="flex flex-wrap items-center gap-2 text-sm opacity-70">
        <NuxtLink to="/clients" class="flex items-center gap-1 hover:text-primary">
          <Icon name="users" size="sm" />
          Clientes
        </NuxtLink>

        <Icon name="chevron-right" size="sm" />

        <NuxtLink :to="`/clients/${clientId}`" class="font-medium hover:text-primary">
          {{ clientName }}
        </NuxtLink>

        <template v-if="section === 'addresses'">
          <Icon name="chevron-right" size="sm" />
          <span class="font-medium text-base-content">Direcciones</span>
        </template>
      </nav>

      <!-- TABS -->
      <div class="mt-4 tabs tabs-boxed">
        <NuxtLink
          :to="`/clients/${clientId}`"
          class="tab"
          :class="{ 'tab-active': section !== 'addresses' }"
        >
          Información
        </NuxtLink>

        <NuxtLink
          :to="`/clients/${clientId}/addresses`"
          class="tab"
          :class="{ 'tab-active': section === 'addresses' }"
        >
          Direcciones
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
