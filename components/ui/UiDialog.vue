<template>
  <dialog ref="dialog" class="modal" :class="{ 'modal-open': modelValue }">
    <div
      class="modal-box relative flex max-h-[90vh] w-[95] flex-col rounded-2xl border border-base-300 bg-base-100 p-0 shadow-xl"
      :class="sizeClass"
    >
      <!-- CLOSE BUTTON (DEFAULT, OPTIONAL) -->
      <button
        v-if="!hideClose"
        class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 z-20"
        aria-label="Cerrar"
        @click="close"
      >
        <Icon name="close" />
      </button>

      <!-- CONTENT SLOT -->
      <slot />
    </div>

    <!-- BACKDROP -->
    <form method="dialog" class="modal-backdrop">
      <button aria-label="Cerrar" />
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Icon from '~/components/ui/Icon.vue'

const props = defineProps<{
  modelValue: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hideClose?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const dialog = ref<HTMLDialogElement | null>(null)

watch(
  () => props.modelValue,
  v => {
    if (!dialog.value) return
    v ? dialog.value.showModal() : dialog.value.close()
  }
)

const close = () => {
  emit('update:modelValue', false)
}

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'max-w-sm'
    case 'md':
      return 'max-w-md'
    case 'lg':
      return 'max-w-3xl'
    case 'xl':
    default:
      return 'max-w-5xl'
  }
})
</script>
