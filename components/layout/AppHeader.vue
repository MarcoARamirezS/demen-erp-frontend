<template>
  <header
    class="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-base-300 bg-base-100"
  >
    <!-- Left -->
    <div class="flex items-center gap-3">
      <!-- Hamburger (mobile only) -->
      <button class="btn btn-ghost btn-sm md:hidden" type="button" @click="layout.toggleSidebar()">
        <Icon name="menu" class="w-5 h-5" />
      </button>

      <span class="text-sm font-medium text-base-content/70"> ERP DEMEN </span>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-3">
      <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-base-200 text-sm">
        <Icon name="user" class="w-4 h-4" />
        <span>Administrador</span>
      </div>

      <button class="btn btn-sm btn-ghost text-error hover:bg-error/10" @click="logout">
        <Icon name="logout" class="w-4 h-4" />
        <span class="hidden sm:inline">Salir</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'
import { useAuthStore } from '~/stores/auth.store'
import { useLayoutStore } from '~/stores/layout.store'

const auth = useAuthStore()
const layout = useLayoutStore()

const logout = () => auth.logout()
</script>
