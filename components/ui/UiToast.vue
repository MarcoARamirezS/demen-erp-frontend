<template>
  <div class="fixed top-6 right-6 z-50 flex flex-col gap-3">
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="
          relative
          flex items-start gap-3
          min-w-[300px] max-w-sm
          rounded-xl
          border
          px-4 py-3
          bg-base-100
          text-base-content
          shadow-xl
          backdrop-blur
        "
        :class="wrapperByType(toast.type)"
      >
        <!-- Accent bar -->
        <span
          class="absolute left-0 top-0 h-full w-1 rounded-l-xl"
          :class="accentByType(toast.type)"
        />

        <!-- Icon -->
        <div
          class="mt-0.5"
          :class="iconByTypeColor(toast.type)"
        >
          <Icon :name="iconByType(toast.type)" class="w-5 h-5" />
        </div>

        <!-- Message -->
        <div class="text-sm font-medium leading-snug flex-1">
          {{ toast.message }}
        </div>

        <!-- Close -->
        <button
          class="text-base-content/40 hover:text-base-content transition"
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

const wrapperByType = (type: string) => ({
  success: "border-success/30 shadow-success/20",
  error: "border-error/30 shadow-error/20",
  warning: "border-warning/30 shadow-warning/20",
  info: "border-info/30 shadow-info/20",
}[type])

const accentByType = (type: string) => ({
  success: "bg-success",
  error: "bg-error",
  warning: "bg-warning",
  info: "bg-info",
}[type])

const iconByTypeColor = (type: string) => ({
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  info: "text-info",
}[type])

</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}
</style>
