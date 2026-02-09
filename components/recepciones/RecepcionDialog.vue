<script setup lang="ts">
import { ref } from 'vue'

const open = defineModel<boolean>()
const emit = defineEmits(['submit'])

const form = ref({
  supplierId: '',
  items: [],
  notes: '',
})

function submit() {
  emit('submit', form.value)
  open.value = false
}
</script>

<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <!-- =========================
         HEADER (STICKY)
    ========================== -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="text-lg font-semibold">Nueva recepción</h2>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- =========================
         CONTENT (SCROLL)
    ========================== -->
    <div class="px-6 py-5 space-y-4 overflow-auto" style="max-height: calc(90vh - 160px)">
      <UiInput v-model="form.supplierId" label="Proveedor" />

      <!-- Aquí después conectas supplier-products -->

      <UiTextarea v-model="form.notes" label="Notas" />
    </div>

    <!-- =========================
         FOOTER (STICKY)
    ========================== -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="outline" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton @click="submit"> Registrar </UiButton>
    </div>
  </UiDialog>
</template>
