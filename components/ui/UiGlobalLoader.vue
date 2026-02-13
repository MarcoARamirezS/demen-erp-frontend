<template>
  <transition name="fade">
    <div
      v-if="mounted && ui.loading"
      class="fixed inset-0 z-[9999] bg-base-100/80 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-4">
        <img src="/logo-danam-transparent.svg" alt="Loading" class="w-20 animate-pulse" />
        <span class="text-sm opacity-70">Procesando...</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui.store'
const ui = useUiStore()

const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
