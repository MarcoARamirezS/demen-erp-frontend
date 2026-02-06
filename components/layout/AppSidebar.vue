<script setup lang="ts">
import SidebarItem from './SidebarItem.vue'
import SidebarGroup from './SidebarGroup.vue'
import { sidebarMenu } from './sidebar.menu'
import { useAuthStore } from '~/stores/auth.store'
import { useLayoutStore } from '~/stores/layout.store'
import Icon from '~/components/ui/Icon.vue'

const auth = useAuthStore()
const layout = useLayoutStore()

const hasPermission = (perm?: string) => {
  if (!perm) return true
  return auth.permissions.includes(perm)
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="layout.sidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 md:hidden"
      @click="layout.closeSidebar()"
    />

    <aside
      class="fixed inset-y-0 left-0 z-50 h-full w-64 bg-base-200 border-r border-base-300 flex flex-col transition-transform duration-200 md:static md:translate-x-0"
      :class="layout.sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-16 flex items-center justify-between px-6 border-b border-base-300">
        <img src="/logo-danam-transparent.svg" class="h-9" />
        <button class="btn btn-ghost btn-sm md:hidden" @click="layout.closeSidebar()">
          <Icon name="close" />
        </button>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        <SidebarGroup
          v-for="item in sidebarMenu"
          :key="item.label"
          :item="item"
          :has-permission="hasPermission"
          @navigate="layout.closeSidebar()"
        />
      </nav>

      <div class="px-6 py-4 border-t border-base-300 text-xs text-base-content/50">ERP DEMEN</div>
    </aside>
  </ClientOnly>
</template>
