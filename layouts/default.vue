<template>
  <div
    class="flex min-h-screen"
    style="
      background: radial-gradient(circle at top left, rgba(0, 182, 169, 0.06), transparent 55%),
        linear-gradient(180deg, #f4f7f1 0%, #eef2ea 100%);
    "
  >
    <!-- SIDEBAR -->
    <aside class="hidden md:block w-64 min-h-screen border-r border-base-300 bg-base-200">
      <AppSidebar />
    </aside>

    <!-- MOBILE SIDEBAR -->
    <aside
      v-if="layout.sidebarOpen"
      class="fixed inset-y-0 left-0 z-50 w-64 bg-base-200 border-r border-base-300 md:hidden"
    >
      <AppSidebar />
    </aside>

    <!-- CONTENT -->
    <div class="flex flex-1 flex-col min-h-screen">
      <AppHeader />

      <main class="flex-1 p-4 sm:p-6 pt-20 md:pt-6 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Overlay mobile -->
    <div
      v-if="layout.sidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 md:hidden"
      @click="layout.closeSidebar"
    />

    <!-- Global UI -->
    <UiGlobalLoader />
    <UiToast />
    <UiConfirm />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import UiGlobalLoader from '~/components/ui/UiGlobalLoader.vue'
import UiToast from '~/components/ui/UiToast.vue'
import UiConfirm from '~/components/ui/UiConfirm.vue'
import { useAuthStore } from '~/stores/auth.store'
import { useLayoutStore } from '~/stores/layout.store'

const auth = useAuthStore()
const layout = useLayoutStore()

onMounted(async () => {
  if (auth.accessToken && !auth.userId) {
    await auth.fetchMe()
  }
})
</script>
