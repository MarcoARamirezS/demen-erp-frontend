<template>
  <UiDialog v-model="open" size="xl" hide-close>
    <!-- HEADER -->
    <header
      class="sticky top-0 z-20 flex items-center justify-between border-b border-base-300 bg-base-100 px-6 py-4"
    >
      <h2 class="text-lg font-semibold">
        {{ mode === 'create' ? 'Asignar proveedor a producto' : 'Editar proveedor del producto' }}
      </h2>
      <UiButton icon="x" variant="ghost" size="sm" @click="open = false" />
    </header>

    <!-- CONTENT -->
    <div class="max-h-[calc(90vh-140px)] overflow-y-auto p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Proveedor -->
        <UiSelectSearch
          v-model="form.supplierId"
          label="Proveedor"
          placeholder="Seleccionar proveedor"
          :options="suppliers"
          option-label="name"
          option-value="id"
          :disabled="mode === 'edit' || !!lockSupplier"
        />

        <!-- Producto -->
        <UiSelectSearch
          v-model="form.productId"
          label="Producto"
          placeholder="Seleccionar producto"
          :options="products"
          option-label="name"
          option-value="id"
          :disabled="mode === 'edit' || !!lockProduct"
        />

        <!-- SKU proveedor -->
        <UiInput
          v-model="form.supplierSku"
          label="SKU del proveedor"
          placeholder="SKU interno del proveedor"
        />

        <!-- Precio -->
        <UiInput v-model="form.currentPrice" label="Precio" type="number" min="0" />

        <!-- Moneda -->
        <UiSelect v-model="form.currency" label="Moneda">
          <UiOption value="MXN">MXN</UiOption>
          <UiOption value="USD">USD</UiOption>
        </UiSelect>

        <!-- Lead time -->
        <UiInput v-model="form.leadTimeDays" label="Lead time (días)" type="number" min="0" />

        <!-- MOQ -->
        <UiInput v-model="form.moq" label="MOQ" type="number" min="0" />

        <!-- Pack size -->
        <UiInput v-model="form.packSize" label="Tamaño de paquete" type="number" min="0" />

        <!-- Preferido -->
        <UiToggle
          v-model="form.preferred"
          label="Proveedor preferido para este producto"
          class="md:col-span-2"
        />

        <!-- Notas -->
        <UiInput v-model="form.notes" label="Notas" type="textarea" class="md:col-span-2" />
      </div>
    </div>

    <!-- FOOTER -->
    <footer
      class="sticky bottom-0 z-20 flex justify-end gap-2 border-t border-base-300 bg-base-100 px-6 py-4"
    >
      <UiButton variant="ghost" @click="open = false">Cancelar</UiButton>
      <UiButton variant="primary" :disabled="!isValid" @click="submit">Guardar</UiButton>
    </footer>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, onMounted } from 'vue'
import type { SupplierProduct } from '~/types/supplier-product'
import type { Supplier } from '~/types/supplier'
import type { Product } from '~/types/product'

import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model: SupplierProduct | Partial<SupplierProduct> | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: any): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()

const suppliers = computed<Supplier[]>(() => suppliersStore.items)
const products = computed<Product[]>(() => productsStore.items)

// 🔒 Si vienes de SupplierDetail o ProductDetail, bloquea el selector correspondiente
const lockSupplier = computed(() => !!(props.model as any)?.supplierId && props.mode === 'create')
const lockProduct = computed(() => !!(props.model as any)?.productId && props.mode === 'create')

const form = reactive({
  supplierId: '',
  productId: '',
  supplierSku: '',
  currentPrice: '0', // string para evitar warning de UiInput
  currency: 'MXN' as 'MXN' | 'USD',
  leadTimeDays: '0',
  moq: '0',
  packSize: '0',
  preferred: false,
  notes: '',
})

onMounted(async () => {
  if (!suppliersStore.items.length) await suppliersStore.fetch()
  if (!productsStore.items.length) await productsStore.fetch()
})

watch(
  () => props.model,
  v => {
    if (!v) {
      // reset
      Object.assign(form, {
        supplierId: '',
        productId: '',
        supplierSku: '',
        currentPrice: '0',
        currency: 'MXN',
        leadTimeDays: '0',
        moq: '0',
        packSize: '0',
        preferred: false,
        notes: '',
      })
      return
    }

    // Deep clone para evitar mutaciones por referencia
    const data = JSON.parse(JSON.stringify(v))

    Object.assign(form, {
      supplierId: data.supplierId ?? '',
      productId: data.productId ?? '',
      supplierSku: data.supplierSku ?? '',
      currentPrice: String(data.currentPrice ?? 0),
      currency: data.currency ?? 'MXN',
      leadTimeDays: String(data.leadTimeDays ?? 0),
      moq: String(data.moq ?? 0),
      packSize: String(data.packSize ?? 0),
      preferred: !!data.preferred,
      notes: data.notes ?? '',
    })
  },
  { immediate: true }
)

const isValid = computed(() => {
  const price = Number(form.currentPrice)
  return !!form.supplierId && !!form.productId && !Number.isNaN(price) && price >= 0
})

function submit() {
  emit('submit', {
    supplierId: form.supplierId,
    productId: form.productId,
    supplierSku: form.supplierSku || undefined,
    currentPrice: Number(form.currentPrice),
    currency: form.currency,
    leadTimeDays: Number(form.leadTimeDays),
    moq: Number(form.moq),
    packSize: Number(form.packSize),
    preferred: !!form.preferred,
    notes: form.notes || undefined,
  })
  open.value = false
}
</script>
