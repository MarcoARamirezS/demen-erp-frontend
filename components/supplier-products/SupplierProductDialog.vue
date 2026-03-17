<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- HEADER -->
      <header
        class="sticky top-0 z-10 flex flex-col gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Icon name="truck" class="h-6 w-6 text-primary" />
          </div>

          <div>
            <h2 class="text-xl font-bold text-primary">
              {{
                mode === 'create' ? 'Asignar proveedor a producto' : 'Editar proveedor del producto'
              }}
            </h2>

            <p class="text-sm opacity-60">
              Condiciones comerciales del proveedor para este producto
            </p>
          </div>
        </div>

        <button class="btn btn-circle btn-ghost btn-sm" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- CONTENT -->
      <section class="flex-1 overflow-y-auto px-6 py-6 pb-10 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <!-- PROVEEDOR -->
          <UiSelect
            v-model="form.supplierId"
            label="Proveedor *"
            :error="errors.supplierId"
            :disabled="mode === 'edit' || !!lockSupplier"
            :options="supplierOptions"
          />

          <!-- PRODUCTO -->
          <UiSelect
            v-model="form.productId"
            label="Producto *"
            :error="errors.productId"
            :disabled="mode === 'edit' || !!lockProduct"
            :options="productOptions"
          />

          <!-- SKU -->
          <UiInput
            v-model="form.supplierSku"
            label="SKU del proveedor"
            placeholder="Se generará automáticamente si lo dejas vacío"
          />

          <!-- PRECIO -->
          <UiInput
            v-model="form.currentPrice"
            label="Precio *"
            type="number"
            min="0"
            :error="errors.currentPrice"
          />

          <!-- MONEDA -->
          <UiSelect v-model="form.currency" label="Moneda" :options="currencyOptions" />

          <!-- LEAD TIME -->
          <UiInput
            v-model="form.leadTimeDays"
            label="Lead time (días)"
            type="number"
            min="0"
            :error="errors.leadTimeDays"
          />

          <!-- MOQ -->
          <div>
            <UiInput v-model="form.moq" label="MOQ" type="number" min="0" :error="errors.moq" />
            <p class="text-xs text-base-content/60 mt-1">
              Cantidad mínima que debes comprar al proveedor.
            </p>
          </div>

          <!-- PACK SIZE -->
          <div>
            <UiInput
              v-model="form.packSize"
              label="Número de piezas"
              type="number"
              min="0"
              :error="errors.packSize"
            />
            <p class="text-xs text-base-content/60 mt-1">Unidades que vienen en cada caja.</p>
          </div>

          <UiToggle
            v-model="form.preferred"
            label="Proveedor preferido para este producto"
            class="md:col-span-2"
          />

          <UiInput
            v-model="form.notes"
            label="Notas"
            type="textarea"
            class="md:col-span-2"
            :error="errors.notes"
          />
        </div>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse md:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <UiButton variant="ghost" @click="open = false"> Cancelar </UiButton>

        <UiButton variant="primary" @click="submit"> Guardar </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, onMounted } from 'vue'
import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'
import { useUiStore } from '~/stores/ui.store'

const ui = useUiStore()

const props = defineProps({
  modelValue: Boolean,
  mode: String,
  model: Object,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()

const suppliers = computed(() => suppliersStore.items)
const products = computed(() => productsStore.items)

const supplierOptions = computed(() =>
  suppliers.value.map(s => ({
    label: s.name,
    value: s.id,
  }))
)

const productOptions = computed(() =>
  products.value.map(p => ({
    label: p.name,
    value: p.id,
  }))
)

const currencyOptions = [
  { label: 'MXN – Peso mexicano', value: 'MXN' },
  { label: 'USD – Dólar americano', value: 'USD' },
]

const lockSupplier = computed(() => !!props.model?.supplierId && props.mode === 'create')
const lockProduct = computed(() => !!props.model?.productId && props.mode === 'create')

const form = reactive({
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

const errors = reactive<any>({})

onMounted(async () => {
  if (!suppliersStore.items.length) await suppliersStore.fetch()
  if (!productsStore.items.length) await productsStore.fetch()
})

watch(
  () => props.model,
  v => {
    if (!v) return
    Object.assign(form, {
      supplierId: v.supplierId ?? '',
      productId: v.productId ?? '',
      supplierSku: v.supplierSku ?? '',
      currentPrice: String(v.currentPrice ?? 0),
      currency: v.currency ?? 'MXN',
      leadTimeDays: String(v.leadTimeDays ?? 0),
      moq: String(v.moq ?? 0),
      packSize: String(v.packSize ?? 0),
      preferred: !!v.preferred,
      notes: v.notes ?? '',
    })
  },
  { immediate: true }
)

function validate() {
  Object.keys(errors).forEach(k => (errors[k] = ''))

  if (!form.supplierId || form.supplierId.length < 20) {
    errors.supplierId = 'Proveedor inválido'
    ui.showToast('warning', 'Debes seleccionar un proveedor válido')
    return false
  }

  if (!form.productId || form.productId.length < 20) {
    errors.productId = 'Producto inválido'
    ui.showToast('warning', 'Debes seleccionar un producto válido')
    return false
  }

  const price = Number(form.currentPrice)

  if (isNaN(price) || price < 0) {
    errors.currentPrice = 'Precio inválido'
    ui.showToast('warning', 'El precio debe ser mayor o igual a 0')
    return false
  }

  const lead = Number(form.leadTimeDays)

  if (lead < 0 || lead > 3650) {
    errors.leadTimeDays = 'Valor inválido'
    ui.showToast('warning', 'El lead time debe estar entre 0 y 3650 días')
    return false
  }

  const moq = Number(form.moq)

  if (moq < 0 || moq > 1000000) {
    errors.moq = 'MOQ inválido'
    ui.showToast('warning', 'El MOQ debe estar entre 0 y 1,000,000')
    return false
  }

  const pack = Number(form.packSize)

  if (pack < 0 || pack > 1000000) {
    errors.packSize = 'Valor inválido'
    ui.showToast('warning', 'El número de piezas debe estar entre 0 y 1,000,000')
    return false
  }

  if (form.notes && form.notes.length > 2000) {
    errors.notes = 'Notas demasiado largas'
    ui.showToast('warning', 'Las notas no pueden superar 2000 caracteres')
    return false
  }

  return true
}

function submit() {
  if (!validate()) return

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
