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
  <UiDialog v-model="open" size="xl" hide-close>
    <header class="sticky top-0 bg-base-200 px-6 py-4 font-semibold">Nueva Recepción</header>

    <div class="p-6 space-y-4">
      <UiInput v-model="form.supplierId" label="Proveedor" />
      <!-- Aquí después conectas supplier-products -->
      <UiTextarea v-model="form.notes" label="Notas" />
    </div>

    <footer class="sticky bottom-0 bg-base-200 px-6 py-4 flex justify-end gap-2">
      <UiButton outline @click="open = false">Cancelar</UiButton>
      <UiButton @click="submit">Registrar</UiButton>
    </footer>
  </UiDialog>
</template>
