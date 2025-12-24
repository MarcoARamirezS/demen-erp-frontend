<template>
  <header
    class="
      h-14
      bg-base-100
      border-b border-base-300
      flex items-center justify-between
      px-6
    "
  >
    <!-- Left -->
    <div class="text-sm font-medium text-base-content">
      {{ pageTitle }}
    </div>

    <!-- Right -->
    <div class="flex items-center gap-3">
      <span class="text-sm text-base-content/70">
        {{ auth.user?.nombre }}
      </span>

      <UiButton
        size="sm"
        variant="ghost"
        icon="logout"
        @click="auth.logout"
      />
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth.store"
import { useRoute } from "vue-router"

const auth = useAuthStore()
const route = useRoute()

const pageTitle = computed(() => route.meta.title || "ERP DEMEN")
</script>
