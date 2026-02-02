<template>
  <UiDialog v-model="open" size="xl">
    <!-- =========================
         TITLE
    ========================== -->
    <template #title>
      {{ mode === 'create' ? 'Asignar proveedor a producto' : 'Editar proveedor del producto' }}
    </template>

    <!-- =========================
         FORM
    ========================== -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Proveedor -->
      <UiSelectSearch
        v-model="form.supplierId"
        label="Proveedor"
        placeholder="Seleccionar proveedor"
        :options="suppliers"
        option-label="name"
        option-value="id"
        :disabled="mode === 'edit'"
      />

      <!-- Producto -->
      <UiSelectSearch
        v-model="form.productId"
        label="Producto"
        placeholder="Seleccionar producto"
        :options="products"
        option-label="name"
        option-value="id"
        :disabled="mode === 'edit'"
      />

      <!-- SKU proveedor -->
      <UiInput
        v-model="form.supplierSku"
        label="SKU del proveedor"
        placeholder="SKU interno del proveedor"
      />

      <!-- Precio -->
      <UiInput v-model.number="form.currentPrice" label="Precio" type="number" min="0" />

      <!-- Moneda -->
      <UiSelect v-model="form.currency" label="Moneda" :options="['MXN', 'USD']" />

      <!-- Lead time -->
      <UiInput v-model.number="form.leadTimeDays" label="Lead time (días)" type="number" min="0" />

      <!-- MOQ -->
      <UiInput v-model.number="form.moq" label="MOQ" type="number" min="0" />

      <!-- Pack size -->
      <UiInput v-model.number="form.packSize" label="Tamaño de paquete" type="number" min="0" />

      <!-- Preferido -->
      <UiToggle
        v-model="form.preferred"
        label="Proveedor preferido para este producto"
        class="md:col-span-2"
      />

      <!-- Notas -->
      <UiTextarea v-model="form.notes" label="Notas" class="md:col-span-2" />
    </div>

    <!-- =========================
         FOOTER
    ========================== -->
    <template #footer>
      <UiButton variant="ghost" @click="open = false"> Cancelar </UiButton>

      <UiButton variant="primary" :disabled="!isValid" @click="submit"> Guardar </UiButton>
    </template>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, onMounted } from 'vue'
import type { SupplierProduct } from '~/types/supplier-product'
import type { Supplier } from '~/types/supplier'
import type { Product } from '~/types/product'

import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'

/* =========================
   PROPS
========================= */
const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model: SupplierProduct | null
}>()

/* =========================
   EMITS
========================= */
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: any): void
}>()

/* =========================
   v-model PROXY
========================= */
const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

/* =========================
   STORES
========================= */
const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()

const suppliers = computed<Supplier[]>(() => suppliersStore.items)
const products = computed<Product[]>(() => productsStore.items)

/* =========================
   FORM
========================= */
const form = reactive({
  supplierId: '',
  productId: '',
  supplierSku: '',
  currentPrice: 0,
  currency: 'MXN' as 'MXN' | 'USD',
  leadTimeDays: 0,
  moq: 0,
  packSize: 0,
  preferred: false,
  notes: '',
})

/* =========================
   LOAD DEPENDENCIES
========================= */
onMounted(async () => {
  if (!suppliersStore.items.length) {
    await suppliersStore.fetch()
  }
  if (!productsStore.items.length) {
    await productsStore.fetch()
  }
})

/* =========================
   SYNC EDIT MODE
========================= */
watch(
  () => props.model,
  v => {
    if (v) Object.assign(form, v)
  },
  { immediate: true }
)

/* =========================
   VALIDATION
========================= */
const isValid = computed(() => {
  return form.supplierId && form.productId && form.currentPrice >= 0
})

/* =========================
   SUBMIT
========================= */
function submit() {
  emit('submit', { ...form })
  open.value = false
}
</script>
