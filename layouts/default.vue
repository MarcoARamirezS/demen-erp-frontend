<template>
  <div
    class="min-h-screen flex"
    style="
      background:
        radial-gradient(
          circle at top left,
          rgba(0, 182, 169, 0.06),
          transparent 55%
        ),
        linear-gradient(
          180deg,
          #f4f7f1 0%,
          #eef2ea 100%
        );
    "
  >
    <AppSidebar />

    <div class="flex-1 flex flex-col">
      <AppHeader />

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>

    <!-- UI global -->
    <UiGlobalLoader />
    <UiToast />
    <UiConfirm />
  </div>
</template>

<script setup>
import AppSidebar from "~/components/layout/AppSidebar.vue"
import AppHeader from "~/components/layout/AppHeader.vue"

import UiGlobalLoader from "~/components/ui/UiGlobalLoader.vue"
import UiToast from "~/components/ui/UiToast.vue"
import UiConfirm from "~/components/ui/UiConfirm.vue"
</script>
