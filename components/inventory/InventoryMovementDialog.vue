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
  <UiDialog v-model="open" size="md" hide-header hide-close>
    <!-- =========================
         HEADER (STICKY)
    ========================== -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="font-semibold text-lg">Movimiento de inventario</h2>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- =========================
         CONTENT (SCROLL)
    ========================== -->
    <div class="px-6 py-5 space-y-4 overflow-auto" style="max-height: calc(90vh - 160px)">
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

    <!-- =========================
         FOOTER (STICKY)
    ========================== -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="outline" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton :disabled="!form.productId" @click="submit"> Guardar </UiButton>
    </div>
  </UiDialog>
</template>
