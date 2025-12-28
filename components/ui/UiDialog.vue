<!-- components/ui/UiDialog.vue -->
<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

type UiDialogSize = 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: UiDialogSize
    closeOnBackdrop?: boolean
  }>(),
  {
    title: '',
    size: 'lg',
    closeOnBackdrop: true,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const dlg = ref<HTMLDialogElement | null>(null)

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

watch(
  () => props.modelValue,
  async v => {
    await nextTick()
    if (!dlg.value) return
    if (v && !dlg.value.open) dlg.value.showModal()
    if (!v && dlg.value.open) dlg.value.close()
  },
  { immediate: true }
)

// Cuando el usuario cierra con ESC o el close() nativo
const onCloseNative = () => {
  if (props.modelValue) emit('update:modelValue', false)
}

// click backdrop
const onBackdropClick = (e: MouseEvent) => {
  if (!props.closeOnBackdrop) return
  if (e.target === dlg.value) close()
}
</script>

<template>
  <dialog ref="dlg" class="modal" @close="onCloseNative" @click="onBackdropClick">
    <div class="modal-box w-11/12 p-0" :class="sizeClass">
      <!-- Header -->
      <div class="flex items-center justify-between gap-3 border-b border-base-300 px-5 py-4">
        <div class="min-w-0">
          <h3 class="truncate text-base font-semibold">
            {{ title }}
          </h3>
        </div>

        <button class="btn btn-ghost btn-sm" type="button" @click="close">✕</button>
      </div>

      <!-- Body -->
      <div class="px-5 py-5">
        <slot />
      </div>
    </div>
  </dialog>
</template>
