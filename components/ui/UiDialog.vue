<!-- components/ui/UiDialog.vue -->
<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'

type UiDialogSize = 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: UiDialogSize
    closeOnBackdrop?: boolean
    hideHeader?: boolean
    hideClose?: boolean
  }>(),
  {
    title: '',
    size: 'lg',
    closeOnBackdrop: true,
    hideHeader: false,
    hideClose: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'max-w-md'
    case 'md':
      return 'max-w-2xl'
    case 'lg':
      return 'max-w-4xl'
    case 'xl':
      return 'max-w-6xl'
    default:
      return 'max-w-4xl'
  }
})

const close = () => emit('update:modelValue', false)

/* BODY SCROLL LOCK */
watch(
  () => props.modelValue,
  v => {
    if (v) document.body.classList.add('overflow-hidden')
    else document.body.classList.remove('overflow-hidden')
  },
  { immediate: true }
)

/* ESC */
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function onBackdropClick() {
  if (props.closeOnBackdrop) close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[3000] flex items-center justify-center p-6">
      <!-- BACKDROP -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="onBackdropClick" />

      <!-- MODAL CONTAINER -->
      <div
        class="relative w-[95%] max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
        :class="sizeClass"
      >
        <!-- HEADER -->
        <div
          v-if="!hideHeader"
          class="flex items-center justify-between gap-3 border-b border-base-300 bg-base-200 px-5 py-4"
        >
          <h3 class="truncate text-base font-semibold">
            {{ title }}
          </h3>

          <button
            v-if="!hideClose"
            class="btn btn-circle btn-sm btn-ghost"
            type="button"
            @click="close"
          >
            ✕
          </button>
        </div>

        <!-- SLOT -->
        <div v-if="$slots.header || $slots.footer" class="p-0 flex-1 overflow-auto">
          <slot />
        </div>

        <div v-else class="px-5 py-5 flex-1 overflow-auto">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
