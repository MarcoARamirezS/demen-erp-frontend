<script setup lang="ts">
import SidebarItem from './SidebarItem.vue'
import SidebarGroup from './SidebarGroup.vue'
import { sidebarMenu } from './sidebar.menu'
import { useAuthStore } from '~/stores/auth.store'

const auth = useAuthStore()

const hasPermission = (perm?: string) => {
  if (!perm) return true
  return auth.permissions.includes(perm)
}
</script>

<template>
  <ClientOnly>
    <aside class="w-64 bg-base-200 border-r border-base-300 flex flex-col">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-base-300">
        <img src="/logo-danam-transparent.svg" class="h-9" />
      </div>

      <!-- Menu -->
      <nav class="flex-1 px-3 py-4 space-y-2">
        <template v-for="item in sidebarMenu" :key="item.label">
          <!-- Link -->
          <SidebarItem
            v-if="'to' in item && hasPermission(item.permission)"
            :icon="item.icon"
            :label="item.label"
            :to="item.to"
          />

          <!-- Group -->
          <SidebarGroup
            v-else-if="'children' in item"
            :label="item.label"
            :icon="item.icon"
            :items="item.children.filter(c => hasPermission(c.permission))"
          />
        </template>
      </nav>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-base-300 text-xs text-base-content/50">ERP DEMEN</div>
    </aside>
  </ClientOnly>
</template>
