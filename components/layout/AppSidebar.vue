<template>
  <aside
    class="w-64 bg-base-100 border-r border-base-300 flex flex-col"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center px-6 border-b border-base-300">
      <img
        src="/logo-danam-transparent.svg"
        alt="DANAM"
        class="h-9"
      />
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <SidebarItem
        v-for="item in menu"
        :key="item.to"
        :icon="item.icon"
        :label="item.label"
        :to="item.to"
      />
    </nav>

    <!-- Footer -->
    <div class="px-6 py-4 border-t border-base-300 text-xs text-base-content/50">
      ERP DEMEN
    </div>
  </aside>
</template>

<script setup lang="ts">
import SidebarItem from "./SidebarItem.vue"
import { sidebarMenu } from "./sidebar.menu"

const menu = sidebarMenu
</script>
