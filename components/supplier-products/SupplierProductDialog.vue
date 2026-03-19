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
        <!-- ALERTA DE VALIDACIÓN -->
        <div
          v-if="errorSummary.length"
          class="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm"
        >
          <div class="flex items-start gap-3">
            <Icon name="alert-triangle" class="mt-0.5 h-5 w-5 text-error" />

            <div class="flex-1">
              <p class="font-semibold text-error">Revisa los siguientes campos:</p>

              <ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/80">
                <li v-for="item in errorSummary" :key="item.key">
                  <span class="font-medium">{{ item.label }}:</span>
                  {{ item.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
          <!-- PROVEEDOR -->
          <div data-error-field="supplierId">
            <UiSelect
              v-model="form.supplierId"
              label="Proveedor *"
              placeholder="Selecciona el proveedor que surtirá este producto"
              :error="errors.supplierId"
              :disabled="mode === 'edit' || !!lockSupplier"
              :options="supplierOptions"
            />
            <p class="mt-1 text-xs text-base-content/60">
              Elige el proveedor con el que se negociará este producto.
            </p>
          </div>

          <!-- PRODUCTO -->
          <div data-error-field="productId">
            <UiSelect
              v-model="form.productId"
              label="Producto *"
              placeholder="Selecciona el producto que se relacionará con el proveedor"
              :error="errors.productId"
              :disabled="mode === 'edit' || !!lockProduct"
              :options="productOptions"
            />
            <p class="mt-1 text-xs text-base-content/60">
              Selecciona el producto exacto que este proveedor puede surtir.
            </p>
          </div>

          <!-- SKU -->
          <div data-error-field="supplierSku">
            <UiInput
              v-model="form.supplierSku"
              label="SKU del proveedor"
              placeholder="Ej: PROV-ABC-001 o código interno del proveedor"
              :error="errors.supplierSku"
            />
            <p class="mt-1 text-xs text-base-content/60">
              Déjalo vacío si el proveedor no maneja un SKU específico.
            </p>
          </div>

          <!-- PRECIO -->
          <div data-error-field="currentPrice">
            <UiInput
              v-model="form.currentPrice"
              label="Precio *"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 125.50"
              :error="errors.currentPrice"
            />
            <p class="mt-1 text-xs text-base-content/60">
              Captura el precio vigente que ofrece el proveedor.
            </p>
          </div>

          <!-- MONEDA -->
          <div data-error-field="currency">
            <UiSelect
              v-model="form.currency"
              label="Moneda"
              placeholder="Selecciona la moneda del precio"
              :options="currencyOptions"
              :error="errors.currency"
            />
            <p class="mt-1 text-xs text-base-content/60">
              Define si el precio está pactado en pesos o dólares.
            </p>
          </div>

          <!-- LEAD TIME -->
          <div data-error-field="leadTimeDays">
            <UiInput
              v-model="form.leadTimeDays"
              label="Lead time (días)"
              type="number"
              min="0"
              placeholder="Ej: 7"
              :error="errors.leadTimeDays"
            />
            <p class="mt-1 text-xs text-base-content/60">
              Tiempo estimado que tarda el proveedor en entregar.
            </p>
          </div>

          <!-- MOQ -->
          <div data-error-field="moq">
            <UiInput
              v-model="form.moq"
              label="MOQ"
              type="number"
              min="0"
              placeholder="Ej: 10"
              :error="errors.moq"
            />
            <p class="mt-1 text-xs text-base-content/60">
              Cantidad mínima que debes comprar al proveedor.
            </p>
          </div>

          <!-- PACK SIZE -->
          <div data-error-field="packSize">
            <UiInput
              v-model="form.packSize"
              label="Número de piezas"
              type="number"
              min="0"
              placeholder="Ej: 24"
              :error="errors.packSize"
            />
            <p class="mt-1 text-xs text-base-content/60">
              Unidades que vienen en cada caja o empaque.
            </p>
          </div>

          <UiToggle
            v-model="form.preferred"
            label="Proveedor preferido para este producto"
            class="md:col-span-2"
          />

          <div class="md:col-span-2" data-error-field="notes">
            <UiInput
              v-model="form.notes"
              label="Notas"
              type="textarea"
              placeholder="Ej: Precio negociado hasta fin de mes, entrega martes y jueves, contacto directo con compras"
              :error="errors.notes"
            />
            <p class="mt-1 text-xs text-base-content/60">
              Agrega condiciones especiales, acuerdos comerciales u observaciones importantes.
            </p>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 md:flex-row"
      >
        <UiButton variant="ghost" @click="open = false">Cancelar</UiButton>

        <UiButton variant="primary" @click="submit">Guardar</UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, onMounted, nextTick } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import UiToggle from '~/components/ui/UiToggle.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'
import { useUiStore } from '~/stores/ui.store'

type Mode = 'create' | 'edit'
type Currency = 'MXN' | 'USD'

type SupplierProductForm = {
  supplierId: string
  productId: string
  supplierSku: string
  currentPrice: string
  currency: Currency
  leadTimeDays: string
  moq: string
  packSize: string
  preferred: boolean
  notes: string
  active: boolean
}

const ui = useUiStore()

const props = defineProps<{
  modelValue: boolean
  mode: Mode
  model?: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (
    e: 'submit',
    payload: {
      supplierId: string
      productId: string
      supplierSku?: string
      currentPrice: number
      currency: Currency
      leadTimeDays: number
      moq: number
      packSize: number
      preferred: boolean
      notes?: string
      active: boolean
    }
  ): void
}>()

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
    label: s.name ?? s.razonSocial ?? 'Proveedor',
    value: s.id,
  }))
)

const productOptions = computed(() =>
  products.value.map(p => ({
    label: p.name ?? p.partNumber ?? 'Producto',
    value: p.id,
  }))
)

const currencyOptions = [
  { label: 'MXN – Peso mexicano', value: 'MXN' },
  { label: 'USD – Dólar americano', value: 'USD' },
]

const lockSupplier = computed(() => !!props.model?.supplierId && props.mode === 'create')
const lockProduct = computed(() => !!props.model?.productId && props.mode === 'create')

function getDefaultForm(): SupplierProductForm {
  return {
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
    active: true,
  }
}

const form = reactive<SupplierProductForm>(getDefaultForm())
const errors = reactive<Record<string, string>>({})

const fieldLabels: Record<string, string> = {
  supplierId: 'Proveedor',
  productId: 'Producto',
  supplierSku: 'SKU del proveedor',
  currentPrice: 'Precio',
  currency: 'Moneda',
  leadTimeDays: 'Lead time',
  moq: 'MOQ',
  packSize: 'Número de piezas',
  notes: 'Notas',
}

const errorSummary = computed(() =>
  Object.entries(errors)
    .filter(([, message]) => !!message)
    .map(([key, message]) => ({
      key,
      label: fieldLabels[key] || key,
      message,
    }))
)

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function optionalString(value?: string | null) {
  const clean = String(value ?? '').trim()
  return clean ? clean : undefined
}

function hydrateForm(model?: any) {
  clearErrors()

  if (!model) {
    Object.assign(form, {
      ...getDefaultForm(),
      supplierId: props.model?.supplierId ?? '',
      productId: props.model?.productId ?? '',
    })
    return
  }

  Object.assign(form, {
    ...getDefaultForm(),
    supplierId: model.supplierId ?? '',
    productId: model.productId ?? '',
    supplierSku: model.supplierSku ?? '',
    currentPrice: String(model.currentPrice ?? 0),
    currency: model.currency ?? 'MXN',
    leadTimeDays: String(model.leadTimeDays ?? 0),
    moq: String(model.moq ?? 0),
    packSize: String(model.packSize ?? 0),
    preferred: !!model.preferred,
    notes: model.notes ?? '',
    active: model.active ?? true,
  })
}

async function focusFirstErrorField() {
  const firstKey = Object.keys(errors).find(key => errors[key])
  if (!firstKey) return

  await nextTick()

  const wrapper = document.querySelector(`[data-error-field="${firstKey}"]`)
  const target = wrapper?.querySelector('input, textarea, select, button') as HTMLElement | null

  if (wrapper) {
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (target?.focus) {
    target.focus()
  }
}

onMounted(async () => {
  if (!suppliersStore.items.length) await suppliersStore.fetch()
  if (!productsStore.items.length) await productsStore.fetch()
})

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      hydrateForm(props.model)
    } else {
      clearErrors()
    }
  },
  { immediate: true }
)

watch(
  () => props.model,
  value => {
    if (!props.modelValue) return
    hydrateForm(value)
  },
  { deep: true }
)

async function submit() {
  clearErrors()

  const supplierId = form.supplierId.trim()
  const productId = form.productId.trim()
  const supplierSku = form.supplierSku.trim()
  const currentPrice = Number(form.currentPrice)
  const currency = form.currency
  const leadTimeDays = Number(form.leadTimeDays)
  const moq = Number(form.moq)
  const packSize = Number(form.packSize)
  const notes = form.notes.trim()

  if (!supplierId || supplierId.length < 20) {
    errors.supplierId = 'Debes seleccionar un proveedor válido'
  }

  if (!productId || productId.length < 20) {
    errors.productId = 'Debes seleccionar un producto válido'
  }

  if (supplierSku.length > 80) {
    errors.supplierSku = 'No puede exceder 80 caracteres'
  }

  if (Number.isNaN(currentPrice) || currentPrice < 0) {
    errors.currentPrice = 'Debe ser un número mayor o igual a 0'
  }

  if (!['MXN', 'USD'].includes(currency)) {
    errors.currency = 'Debes seleccionar una moneda válida'
  }

  if (
    Number.isNaN(leadTimeDays) ||
    !Number.isInteger(leadTimeDays) ||
    leadTimeDays < 0 ||
    leadTimeDays > 3650
  ) {
    errors.leadTimeDays = 'Debe ser un entero entre 0 y 3650'
  }

  if (Number.isNaN(moq) || !Number.isInteger(moq) || moq < 0 || moq > 1000000) {
    errors.moq = 'Debe ser un entero entre 0 y 1,000,000'
  }

  if (Number.isNaN(packSize) || !Number.isInteger(packSize) || packSize < 0 || packSize > 1000000) {
    errors.packSize = 'Debe ser un entero entre 0 y 1,000,000'
  }

  if (notes.length > 2000) {
    errors.notes = 'No puede exceder 2000 caracteres'
  }

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${fieldLabels[key] || key}: ${message}`)
    await focusFirstErrorField()
    return
  }

  emit('submit', {
    supplierId,
    productId,
    supplierSku: optionalString(supplierSku),
    currentPrice,
    currency,
    leadTimeDays,
    moq,
    packSize,
    preferred: !!form.preferred,
    notes: optionalString(notes),
    active: !!form.active,
  })

  open.value = false
}
</script>
