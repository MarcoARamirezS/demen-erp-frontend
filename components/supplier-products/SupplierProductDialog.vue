<template>
  <UiDialog v-model="open" size="xl" hide-close>
    <!-- HEADER -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="text-lg font-semibold">
        {{ mode === 'create' ? 'Asignar proveedor a producto' : 'Editar proveedor del producto' }}
      </h2>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- CONTENT -->
    <div class="px-6 py-5 overflow-auto space-y-6" style="max-height: calc(90vh - 160px)">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <!-- PROVEEDOR -->
        <UiSelect
          v-model="form.supplierId"
          label="Proveedor"
          placeholder="Selecciona un proveedor"
          empty-text="No existen proveedores"
          :disabled="mode === 'edit' || !!lockSupplier"
          :options="
            suppliers.map(s => ({
              label: s.name,
              value: s.id,
              image: s.image,
            }))
          "
        />

        <!-- PRODUCTO -->
        <UiSelect
          v-model="form.productId"
          label="Producto"
          placeholder="Selecciona un producto"
          empty-text="No existen productos"
          :disabled="mode === 'edit' || !!lockProduct"
          :options="
            products.map(p => ({
              label: p.name,
              value: p.id,
              image: p.image,
            }))
          "
        />

        <!-- SKU -->
        <UiInput
          v-model="form.supplierSku"
          label="SKU del proveedor"
          placeholder="Se generará automáticamente si lo dejas vacío"
        />

        <UiInput
          v-model="form.currentPrice"
          label="Precio"
          type="number"
          min="0"
          placeholder="0.00"
        />

        <UiSelect
          v-model="form.currency"
          label="Moneda"
          :options="[
            { label: 'MXN – Peso mexicano', value: 'MXN' },
            { label: 'USD – Dólar americano', value: 'USD' },
          ]"
        />

        <UiInput
          v-model="form.leadTimeDays"
          label="Lead time (días)"
          type="number"
          min="0"
          placeholder="Días estimados de entrega"
        />

        <!-- MOQ -->
        <div>
          <UiInput
            v-model="form.moq"
            label="MOQ"
            type="number"
            min="0"
            placeholder="Cantidad mínima por pedido"
          />
          <p class="text-xs text-base-content/60 mt-1">
            Cantidad mínima que debes comprar al proveedor.
          </p>
        </div>

        <!-- PACK SIZE -->
        <div>
          <UiInput
            v-model="form.packSize"
            label="Tamaño de paquete"
            type="number"
            min="0"
            placeholder="Unidades por caja o empaque"
          />
          <p class="text-xs text-base-content/60 mt-1">
            Número de piezas que vienen en cada caja o empaque.
          </p>
        </div>

        <UiToggle
          v-model="form.preferred"
          label="Proveedor preferido para este producto"
          class="md:col-span-2"
        />

        <UiInput v-model="form.notes" label="Notas" type="textarea" class="md:col-span-2" />
      </div>
    </div>

    <!-- FOOTER -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton variant="primary" :disabled="!isValid" @click="submit"> Guardar </UiButton>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, onMounted } from 'vue'
import type { SupplierProduct } from '~/types/supplier-product'
import type { Supplier } from '~/types/supplier'
import type { Product } from '~/types/product'

import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'
import { useSupplierProductPricesStore } from '~/stores/supplier-product-prices.store'
import { useUiStore } from '~/stores/ui.store'

const ui = useUiStore()
const pricesStore = useSupplierProductPricesStore()

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model: SupplierProduct | Partial<SupplierProduct> | null
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()

const suppliers = computed<Supplier[]>(() => suppliersStore.items)
const products = computed<Product[]>(() => productsStore.items)

const lockSupplier = computed(() => !!(props.model as any)?.supplierId && props.mode === 'create')
const lockProduct = computed(() => !!(props.model as any)?.productId && props.mode === 'create')

/* ========================= FORM ========================== */

const form = reactive({
  supplierId: '',
  productId: '',
  supplierSku: '',
  currentPrice: '0',
  currency: 'MXN' as 'MXN' | 'USD',
  leadTimeDays: '0',
  moq: '0',
  packSize: '0',
  preferred: false,
  notes: '',
})

/* ========================= SKU AUTO ========================== */

function short(text: string) {
  return text
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase()
}

function random3() {
  return Math.floor(100 + Math.random() * 900)
}

/* 🔥 GENERAR SKU CUANDO CAMBIAN PROVEEDOR O PRODUCTO */
watch(
  () => [form.supplierId, form.productId],
  ([supId, prodId]) => {
    if (props.mode !== 'create') return
    if (form.supplierSku) return
    if (!supId || !prodId) return

    const supplier = suppliers.value.find(s => s.id === supId)
    const product = products.value.find(p => p.id === prodId)
    if (!supplier || !product) return

    const sup = short(supplier.code ?? supplier.name)
    const prod = short(product.code ?? product.name)

    form.supplierSku = `${sup}-${prod}-${random3()}`
  }
)

/* ========================= LOAD DATA ========================== */

onMounted(async () => {
  if (!suppliersStore.items.length) await suppliersStore.fetch()
  if (!productsStore.items.length) await productsStore.fetch()
})

watch(
  () => [props.model, props.mode],
  ([model, mode]) => {
    if (mode === 'create') {
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

    if (mode === 'edit' && model) {
      const data = JSON.parse(JSON.stringify(model))
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
    }
  },
  { immediate: true }
)

/* ========================= VALIDATION ========================== */

const isValid = computed(() => {
  const price = Number(form.currentPrice)
  return !!form.supplierId && !!form.productId && !Number.isNaN(price) && price >= 0
})

/* ========================= SUBMIT ========================== */

async function submit() {
  const payload = {
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
  }

  try {
    emit('submit', payload)
    open.value = false
  } catch (e: any) {
    ui.showToast('error', 'Error al guardar')
  }
}
</script>
