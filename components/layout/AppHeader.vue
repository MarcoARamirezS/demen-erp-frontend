<template>
  <header class="h-16 flex items-center justify-between px-6 border-b border-base-300 bg-base-100">
    <div class="text-sm font-medium text-base-content/70">ERP DEMEN</div>

    <div class="flex items-center gap-3">
      <!-- User badge -->
      <div class="flex items-center gap-2 px-3 py-1 rounded-lg bg-base-200 text-sm">
        <Icon name="user" class="w-4 h-4" />
        <span>Administrador</span>
      </div>

      <!-- Logout -->
      <button class="btn btn-sm btn-ghost text-error hover:bg-error/10" @click="logout">
        <Icon name="logout" class="w-4 h-4" />
        Salir
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth.store'
import { useRoute } from 'vue-router'

const auth = useAuthStore()
const route = useRoute()

const logout = () => auth.logout()
</script>
