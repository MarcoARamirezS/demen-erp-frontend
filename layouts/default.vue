<template>
  <div
    class="flex min-h-screen overflow-x-hidden"
    style="
      background:
        radial-gradient(circle at top left, rgba(0, 182, 169, 0.06), transparent 55%),
        linear-gradient(180deg, #f4f7f1 0%, #eef2ea 100%);
    "
  >
    <!-- SIDEBAR DESKTOP -->
    <aside class="hidden xl:block w-64 min-h-screen border-r border-base-300 bg-base-200">
      <AppSidebar />
    </aside>

    <!-- SIDEBAR DRAWER -->
    <aside
      v-if="layout.sidebarOpen"
      class="fixed inset-y-0 left-0 z-50 w-64 bg-base-200 border-r border-base-300 xl:hidden"
    >
      <AppSidebar />
    </aside>

    <!-- CONTENT -->
    <div class="flex flex-1 flex-col min-h-screen min-w-0 overflow-x-hidden">
      <AppHeader />

      <main
        class="flex-1 overflow-y-auto overflow-x-hidden pt-20 xl:pt-6 px-4 sm:px-6 lg:px-8 pb-6"
      >
        <div class="w-full max-w-screen-2xl mx-auto">
          <slot />
        </div>
      </main>
    </div>

    <!-- OVERLAY -->
    <div
      v-if="layout.sidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 xl:hidden"
      @click="layout.closeSidebar"
    />

    <UiGlobalLoader />
    <UiConfirm />
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import UiGlobalLoader from '~/components/ui/UiGlobalLoader.vue'
import UiConfirm from '~/components/ui/UiConfirm.vue'
import { useLayoutStore } from '~/stores/layout.store'

const layout = useLayoutStore()
</script>
