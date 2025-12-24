<template>
  <dialog class="modal" :open="confirm.visible">
    <div class="modal-box">
      <h3 class="font-semibold text-lg mb-2">
        {{ confirm.title }}
      </h3>
      <p class="mb-6">{{ confirm.message }}</p>

      <div class="flex justify-end gap-3">
        <UiButton variant="ghost" @click="ui.closeConfirm">
          Cancelar
        </UiButton>
        <UiButton variant="primary" @click="confirmAction">
          Confirmar
        </UiButton>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { useUiStore } from "~/stores/ui.store"
import UiButton from "./UiButton.vue"

const ui = useUiStore()
const confirm = computed(() => ui.confirm)

const confirmAction = () => {
  confirm.value.onConfirm?.()
  ui.closeConfirm()
}
</script>
