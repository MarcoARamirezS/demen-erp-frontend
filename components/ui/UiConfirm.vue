<template>
  <dialog v-if="confirm.visible" class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-semibold text-lg mb-2">
        {{ confirm.title }}
      </h3>

      <p class="mb-6">{{ confirm.message }}</p>

      <div class="flex justify-end gap-3">
        <UiButton variant="ghost" @click="ui.closeConfirm()">
          {{ confirm.cancelText || 'Cancelar' }}
        </UiButton>

        <UiButton variant="primary" @click="confirmAction">
          {{ confirm.confirmText || 'Confirmar' }}
        </UiButton>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUiStore } from '~/stores/ui.store'
import UiButton from './UiButton.vue'

const ui = useUiStore()
const confirm = computed(() => ui.confirmState)

// 🔥 Esto limpia estado si quedó colgado al recargar
onMounted(() => {
  ui.closeConfirm()
})

const confirmAction = () => {
  confirm.value.onConfirm?.()
}
</script>
