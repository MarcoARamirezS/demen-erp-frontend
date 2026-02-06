<template>
  <div
    class="relative min-h-screen bg-base-200"
    style="
      background:
        radial-gradient(circle at top, rgba(0, 182, 169, 0.08), transparent 60%),
        linear-gradient(180deg, #f4f7f1 0%, #eef2ea 100%);
    "
  >
    <!-- CONTENEDOR CENTRADO (ESTABLE EN SSR) -->
    <div class="min-h-screen flex items-center justify-center overflow-hidden">
      <div class="w-full max-w-lg px-4">
        <slot />
      </div>
    </div>

    <!-- UI global (FUERA del flujo del flex) -->
    <ClientOnly>
      <UiGlobalLoader />
      <UiToast />
      <UiConfirm />
    </ClientOnly>
  </div>
</template>

<script setup>
import UiGlobalLoader from '~/components/ui/UiGlobalLoader.vue'
import UiToast from '~/components/ui/UiToast.vue'
import UiConfirm from '~/components/ui/UiConfirm.vue'
</script>
