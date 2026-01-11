<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'
import Icon from '~/components/ui/Icon.vue'

const route = useRoute()
const auth = useAuthStore()

const clientId = route.params.id as string

const items = [
  {
    label: 'Información general',
    to: `/clients/${clientId}`,
    icon: 'user',
    permission: 'clients:read',
  },
  {
    label: 'Direcciones',
    to: `/clients/${clientId}/addresses`,
    icon: 'location',
    permission: 'client_addresses:list',
  },
]

const hasPermission = (perm?: string) => !perm || auth.permissions.includes(perm)
</script>

<template>
  <nav class="flex gap-2 border-b border-base-300 mb-4">
    <NuxtLink
      v-for="item in items.filter(i => hasPermission(i.permission))"
      :key="item.to"
      :to="item.to"
      class="flex items-center gap-2 px-4 py-2 text-sm rounded-t-lg transition"
      active-class="bg-primary/10 text-primary font-semibold"
    >
      <Icon :name="item.icon" size="sm" />
      {{ item.label }}
    </NuxtLink>
  </nav>
</template>
