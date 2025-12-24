<template>
  <div
    class="fixed top-6 right-6 z-50 flex flex-col gap-3"
  >
    <TransitionGroup
      name="toast"
      tag="div"
      class="flex flex-col gap-3"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="
          flex items-start gap-3
          min-w-[280px] max-w-sm
          rounded-xl
          border
          shadow-lg
          px-4 py-3
          bg-base-100
          text-base-content
        "
        :class="borderByType(toast.type)"
      >
        <!-- Icon -->
        <div
          class="mt-0.5"
          :class="iconColorByType(toast.type)"
        >
          <Icon :name="iconByType(toast.type)" class="w-5 h-5" />
        </div>

        <!-- Message -->
        <div class="text-sm leading-snug flex-1">
          {{ toast.message }}
        </div>

        <!-- Close -->
        <button
          class="text-base-content/40 hover:text-base-content"
          @click="remove(toast.id)"
        >
          <Icon name="close" class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from "~/stores/ui.store"
import Icon from "./Icon.vue"

const ui = useUiStore()

const toasts = computed(() => ui.toasts)

const remove = (id: string) => ui.removeToast(id)

const iconByType = (type: string) => ({
  success: "check",
  error: "error",
  warning: "warning",
  info: "info",
}[type])

const borderByType = (type: string) => ({
  success: "border-l-4 border-success",
  error: "border-l-4 border-error",
  warning: "border-l-4 border-warning",
  info: "border-l-4 border-info",
}[type])

const iconColorByType = (type: string) => ({
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  info: "text-info",
}[type])
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
