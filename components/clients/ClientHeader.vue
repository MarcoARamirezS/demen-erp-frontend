<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  clientId: string
  clientName: string
  section?: 'info' | 'addresses'
}>()
</script>

<template>
  <div class="mb-6 space-y-3">
    <!-- =======================
         BREADCRUMB
    ======================== -->
    <nav class="flex items-center gap-2 text-sm text-base-content/60">
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
        <span class="font-medium text-base-content"> Direcciones </span>
      </template>
    </nav>

    <!-- =======================
         TABS
    ======================== -->
    <div class="tabs tabs-boxed">
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
</template>
