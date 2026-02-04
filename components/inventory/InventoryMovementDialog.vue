<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProductsStore } from '~/stores/products.store'

const open = defineModel<boolean>()

const emit = defineEmits<{
  (e: 'submit', payload: any): void
}>()

const productsStore = useProductsStore()

const form = ref({
  productId: '',
  type: 'IN',
  quantity: '1',
  reason: '',
})

onMounted(async () => {
  if (!productsStore.items.length) {
    await productsStore.fetch({ limit: 100 })
  }
})

function submit() {
  emit('submit', {
    ...form.value,
    quantity: Number(form.value.quantity),
    referenceType: 'manual',
  })
  open.value = false
}

watch(open, v => {
  if (!v) {
    form.value = {
      productId: '',
      type: 'IN',
      quantity: '1',
      reason: '',
    }
  }
})
</script>

<template>
  <UiDialog v-model="open" size="md" hide-close>
    <header class="sticky top-0 bg-base-200 px-6 py-4 font-semibold">
      Movimiento de Inventario
    </header>

    <div class="p-6 space-y-4">
      <!-- PRODUCTO -->
      <UiSelect v-model="form.productId" label="Producto" empty-text="No hay productos">
        <UiOption v-for="p in productsStore.items" :key="p.id" :value="p.id">
          {{ p.sku }} · {{ p.name }}
          <span v-if="p.brand" class="opacity-60"> — {{ p.brand }} </span>
        </UiOption>
      </UiSelect>

      <!-- TIPO -->
      <UiSelect v-model="form.type" label="Tipo">
        <UiOption value="IN">Entrada</UiOption>
        <UiOption value="OUT">Salida</UiOption>
        <UiOption value="ADJUST">Ajuste</UiOption>
      </UiSelect>

      <!-- CANTIDAD -->
      <UiInput v-model="form.quantity" type="number" label="Cantidad" />

      <!-- MOTIVO -->
      <UiInput v-model="form.reason" label="Motivo" type="textarea" />
    </div>

    <footer class="sticky bottom-0 bg-base-200 px-6 py-4 flex justify-end gap-2">
      <UiButton outline @click="open = false">Cancelar</UiButton>
      <UiButton :disabled="!form.productId" @click="submit"> Guardar </UiButton>
    </footer>
  </UiDialog>
</template>
