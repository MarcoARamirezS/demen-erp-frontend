<script setup lang="ts">
import { ref, watch } from 'vue'

const open = defineModel<boolean>()

const emit = defineEmits<{
  (e: 'submit', payload: any): void
}>()

const form = ref({
  productId: '',
  type: 'IN',
  quantity: 1,
  reason: '',
})

function submit() {
  emit('submit', { ...form.value, referenceType: 'manual' })
  open.value = false
}

watch(open, v => {
  if (!v) {
    form.value = { productId: '', type: 'IN', quantity: 1, reason: '' }
  }
})
</script>

<template>
  <UiDialog v-model="open" size="md" hide-close>
    <header class="sticky top-0 bg-base-200 px-6 py-4 font-semibold">
      Movimiento de Inventario
    </header>

    <div class="p-6 space-y-4">
      <UiInput v-model="form.productId" label="Producto ID" />
      <UiSelect v-model="form.type" label="Tipo" :items="['IN', 'OUT', 'ADJUST']" />
      <UiInput v-model.number="form.quantity" type="number" label="Cantidad" />
      <UiTextarea v-model="form.reason" label="Motivo" />
    </div>

    <footer class="sticky bottom-0 bg-base-200 px-6 py-4 flex justify-end gap-2">
      <UiButton outline @click="open = false">Cancelar</UiButton>
      <UiButton @click="submit">Guardar</UiButton>
    </footer>
  </UiDialog>
</template>
