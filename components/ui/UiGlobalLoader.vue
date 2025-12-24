<template>
  <div
    v-if="ui.loading"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-base-100/80 backdrop-blur-sm"
  >
    <div class="flex flex-col items-center gap-4">
      <img src="/logo-danam-transparent.svg" alt="DANAM" class="w-20 h-auto animate-pulse" />

      <span class="text-sm text-base-content opacity-70"> Procesando… </span>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui.store'
const ui = useUiStore()
</script>
