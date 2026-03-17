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
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[3000] flex items-start md:items-center justify-center p-6"
    >
      <!-- BACKDROP -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="onBackdropClick" />

      <!-- 🔥 FIX: CONTENEDOR LIMPIO (SIN CARD VISUAL) -->
      <div class="relative w-[95%] max-h-[92vh] flex justify-center" :class="sizeClass">
        <!-- 🔥 SLOT DIRECTO: EL CARD LO CONTROLA EL DIALOG HIJO -->
        <slot />
      </div>
    </div>
  </Teleport>
</template>
