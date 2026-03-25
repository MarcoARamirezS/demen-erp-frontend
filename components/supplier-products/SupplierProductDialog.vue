<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <header
        class="sticky top-0 z-10 flex flex-col gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Icon name="link" class="h-6 w-6 text-primary" />
          </div>

          <div>
            <h2 class="text-xl font-bold text-primary">
              {{
                mode === 'create'
                  ? 'Nueva relación proveedor-producto'
                  : 'Editar relación proveedor-producto'
              }}
            </h2>
            <p class="text-sm opacity-60">
              Vincula productos con proveedores y define condiciones comerciales.
            </p>
          </div>
        </div>

        <button class="btn btn-circle btn-ghost btn-sm" type="button" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <section class="flex-1 space-y-6 overflow-y-auto px-6 py-6 pb-10">
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

        <div
          v-if="selectedSupplier && selectedSupplier.active === false"
          class="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm"
        >
          <div class="flex items-start gap-3">
            <Icon name="alert-circle" class="mt-0.5 h-5 w-5 text-warning" />
            <div class="flex-1">
              <p class="font-semibold text-warning">Proveedor inactivo</p>
              <p class="mt-1 text-base-content/80">
                El proveedor seleccionado está inactivo. Esta relación no debería usarse para nuevas
                operaciones.
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="selectedProduct && selectedProduct.active === false"
          class="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm"
        >
          <div class="flex items-start gap-3">
            <Icon name="alert-circle" class="mt-0.5 h-5 w-5 text-warning" />
            <div class="flex-1">
              <p class="font-semibold text-warning">Producto inactivo</p>
              <p class="mt-1 text-base-content/80">
                El producto seleccionado está inactivo. Esta relación no debería usarse para nuevas
                operaciones.
              </p>
            </div>
          </div>
        </div>

        <form class="space-y-8" @submit.prevent="submit">
          <section class="space-y-4">
            <h3 class="text-sm font-semibold text-base-content/70">Relación base</h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div data-error-field="supplierId">
                <UiSelect
                  v-model="form.supplierId"
                  label="Proveedor *"
                  :options="supplierOptions"
                  :error="errors.supplierId"
                  placeholder="Selecciona un proveedor"
                />
                <p class="mt-1 text-xs opacity-60">
                  Solo selecciona proveedores vigentes para compras nuevas.
                </p>
              </div>

              <div data-error-field="productId">
                <UiSelect
                  v-model="form.productId"
                  label="Producto *"
                  :options="productOptions"
                  :error="errors.productId"
                  placeholder="Selecciona un producto"
                />
                <p class="mt-1 text-xs opacity-60">
                  El producto vinculado podrá tener precio, lead time y proveedor preferido.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div data-error-field="preferred">
                <label class="label">
                  <span class="label-text">Proveedor preferido</span>
                </label>

                <div class="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                  <UiToggle v-model="form.preferred" />
                  <p class="mt-2 text-xs opacity-60">
                    Si activas esta opción, este proveedor se considera el preferido para el
                    producto.
                  </p>
                </div>
              </div>

              <div data-error-field="active">
                <label class="label">
                  <span class="label-text">Relación activa</span>
                </label>

                <div class="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                  <UiToggle v-model="form.active" />
                  <p class="mt-2 text-xs opacity-60">
                    Desactiva la relación cuando ya no deba usarse, sin perder historial.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section class="space-y-4">
            <h3 class="text-sm font-semibold text-base-content/70">Condiciones comerciales</h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div data-error-field="currentPrice">
                <UiInput
                  v-model="form.currentPrice"
                  label="Precio actual *"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 1250.50"
                  :error="errors.currentPrice"
                />
              </div>

              <div data-error-field="currency">
                <UiSelect
                  v-model="form.currency"
                  label="Moneda *"
                  :options="currencyOptions"
                  :error="errors.currency"
                  placeholder="Selecciona moneda"
                />
              </div>

              <div data-error-field="leadTimeDays">
                <UiInput
                  v-model="form.leadTimeDays"
                  label="Lead time (días)"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ej: 15"
                  :error="errors.leadTimeDays"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div data-error-field="supplierSku">
                <UiInput
                  v-model="form.supplierSku"
                  label="SKU / código del proveedor"
                  placeholder="Ej: PROV-AX-204"
                  :error="errors.supplierSku"
                />
              </div>

              <div class="rounded-xl border border-base-300 bg-base-200/40 p-4">
                <p class="text-sm font-semibold">Resumen operativo</p>

                <div class="mt-3 space-y-2 text-sm">
                  <div class="flex items-center justify-between gap-3">
                    <span class="opacity-60">Proveedor</span>
                    <span class="truncate text-right font-medium">
                      {{ selectedSupplier?.name || selectedSupplier?.legalName || '—' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-3">
                    <span class="opacity-60">Producto</span>
                    <span class="truncate text-right font-medium">
                      {{ selectedProduct?.name || '—' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-3">
                    <span class="opacity-60">Estado operativo</span>
                    <span
                      class="badge badge-sm border font-semibold"
                      :class="operationalBadgeClass"
                    >
                      {{ operationalStatusText }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div data-error-field="notes">
              <label class="label">
                <span class="label-text">Notas</span>
              </label>

              <textarea
                v-model="form.notes"
                rows="4"
                maxlength="1000"
                placeholder="Ej: Precio sujeto a volumen, entrega parcial permitida, requiere orden abierta."
                :class="[
                  'textarea min-h-[120px] w-full',
                  errors.notes ? 'textarea-error' : 'textarea-bordered',
                ]"
              />

              <p class="mt-1 text-xs opacity-60">
                Registra observaciones comerciales o logísticas de esta relación.
              </p>

              <p v-if="errors.notes" class="mt-1 text-xs text-error">
                {{ errors.notes }}
              </p>

              <div class="mt-1 text-right text-xs opacity-50">{{ form.notes.length }} / 1000</div>
            </div>
          </section>
        </form>
      </section>

      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] md:flex-row"
      >
        <UiButton
          variant="ghost"
          type="button"
          class="w-full md:w-auto"
          :disabled="saving"
          @click="open = false"
        >
          Cancelar
        </UiButton>

        <UiButton
          variant="primary"
          class="w-full md:w-auto"
          :loading="saving"
          :disabled="saving || hasInactiveSelection"
          @click="submit"
        >
          Guardar
        </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiToggle from '~/components/ui/UiToggle.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import { useUiStore } from '~/stores/ui.store'

type SupplierRef = {
  id: string
  code?: string
  name?: string
  legalName?: string
  active?: boolean
}

type ProductRef = {
  id: string
  internalCode?: string
  partNumber?: string
  name?: string
  active?: boolean
}

type SupplierProduct = {
  id: string
  supplierId: string
  productId: string
  currentPrice: number
  currency: string
  leadTimeDays?: number | null
  supplierSku?: string | null
  notes?: string | null
  preferred?: boolean
  active?: boolean
  supplier?: SupplierRef | null
  product?: ProductRef | null
}

type SupplierProductForm = {
  supplierId: string
  productId: string
  currentPrice: number | string
  currency: string
  leadTimeDays: number | string
  supplierSku: string
  notes: string
  preferred: boolean
  active: boolean
}

const props = defineProps<{
  modelValue: boolean
  model?: SupplierProduct | null
  mode: 'create' | 'edit'
  suppliers: SupplierRef[]
  products: ProductRef[]
  onSubmit: (payload: {
    supplierId: string
    productId: string
    currentPrice: number
    currency: string
    leadTimeDays?: number
    supplierSku?: string
    notes?: string
    preferred: boolean
    active: boolean
  }) => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const ui = useUiStore()
const saving = ref(false)

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const currencyOptions = [
  { label: 'MXN', value: 'MXN' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
]

const form = reactive<SupplierProductForm>({
  supplierId: '',
  productId: '',
  currentPrice: '',
  currency: 'MXN',
  leadTimeDays: '',
  supplierSku: '',
  notes: '',
  preferred: false,
  active: true,
})

const errors = reactive<Record<string, string>>({})

const fieldLabels: Record<string, string> = {
  supplierId: 'Proveedor',
  productId: 'Producto',
  currentPrice: 'Precio actual',
  currency: 'Moneda',
  leadTimeDays: 'Lead time',
  supplierSku: 'SKU del proveedor',
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

const supplierOptions = computed(() =>
  props.suppliers.map(item => ({
    value: item.id,
    label: `${item.code ? `${item.code} · ` : ''}${item.name || item.legalName || 'Proveedor'}${item.active === false ? ' · INACTIVO' : ''}`,
  }))
)

const productOptions = computed(() =>
  props.products.map(item => ({
    value: item.id,
    label: `${item.internalCode ? `${item.internalCode} · ` : ''}${item.partNumber ? `${item.partNumber} · ` : ''}${item.name || 'Producto'}${item.active === false ? ' · INACTIVO' : ''}`,
  }))
)

const selectedSupplier = computed(
  () => props.suppliers.find(item => item.id === form.supplierId) || props.model?.supplier || null
)

const selectedProduct = computed(
  () => props.products.find(item => item.id === form.productId) || props.model?.product || null
)

const hasInactiveSelection = computed(() => {
  return selectedSupplier.value?.active === false || selectedProduct.value?.active === false
})

const operationalStatusText = computed(() => {
  if (form.active === false) return 'Relación inactiva'
  if (selectedSupplier.value?.active === false && selectedProduct.value?.active === false)
    return 'Proveedor y producto inactivos'
  if (selectedSupplier.value?.active === false) return 'Proveedor inactivo'
  if (selectedProduct.value?.active === false) return 'Producto inactivo'
  return 'Operativa'
})

const operationalBadgeClass = computed(() => {
  if (form.active === false) return 'border-error bg-error text-error-content'
  if (selectedSupplier.value?.active === false || selectedProduct.value?.active === false) {
    return 'border-warning bg-warning text-warning-content'
  }
  return 'border-success bg-success text-success-content'
})

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function resetForm() {
  form.supplierId = ''
  form.productId = ''
  form.currentPrice = ''
  form.currency = 'MXN'
  form.leadTimeDays = ''
  form.supplierSku = ''
  form.notes = ''
  form.preferred = false
  form.active = true
  clearErrors()
}

function hydrateForm() {
  clearErrors()

  if (!props.model) {
    resetForm()
    return
  }

  form.supplierId = props.model.supplierId || ''
  form.productId = props.model.productId || ''
  form.currentPrice = props.model.currentPrice ?? ''
  form.currency = props.model.currency || 'MXN'
  form.leadTimeDays = props.model.leadTimeDays ?? ''
  form.supplierSku = props.model.supplierSku || ''
  form.notes = props.model.notes || ''
  form.preferred = props.model.preferred ?? false
  form.active = props.model.active ?? true
}

watch(
  () => props.modelValue,
  value => {
    if (value) {
      hydrateForm()
      return
    }

    clearErrors()
  },
  { immediate: true }
)

watch(
  () => props.model,
  () => {
    if (props.modelValue) hydrateForm()
  }
)

function normalizeOptionalText(value: string) {
  const clean = String(value || '').trim()
  return clean || undefined
}

function validate() {
  clearErrors()

  if (!form.supplierId) {
    errors.supplierId = 'Debes seleccionar un proveedor'
  }

  if (!form.productId) {
    errors.productId = 'Debes seleccionar un producto'
  }

  const price = Number(form.currentPrice)
  if (Number.isNaN(price) || price < 0) {
    errors.currentPrice = 'Debes capturar un precio válido mayor o igual a 0'
  }

  if (!form.currency) {
    errors.currency = 'Debes seleccionar una moneda'
  }

  if (String(form.leadTimeDays).trim() !== '') {
    const lead = Number(form.leadTimeDays)
    if (Number.isNaN(lead) || lead < 0) {
      errors.leadTimeDays = 'Debes capturar un lead time válido mayor o igual a 0'
    }
  }

  if (form.notes.length > 1000) {
    errors.notes = 'Las notas no pueden exceder 1000 caracteres'
  }

  if (selectedSupplier.value?.active === false) {
    errors.supplierId = 'No puedes guardar una relación con un proveedor inactivo'
  }

  if (selectedProduct.value?.active === false) {
    errors.productId = 'No puedes guardar una relación con un producto inactivo'
  }

  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) {
    const first = errorSummary.value[0]
    if (first) {
      ui.showToast('warning', `${first.label}: ${first.message}`)
    }
    return
  }

  saving.value = true

  try {
    await props.onSubmit({
      supplierId: form.supplierId,
      productId: form.productId,
      currentPrice: Number(form.currentPrice),
      currency: form.currency,
      leadTimeDays: String(form.leadTimeDays).trim() !== '' ? Number(form.leadTimeDays) : undefined,
      supplierSku: normalizeOptionalText(form.supplierSku),
      notes: normalizeOptionalText(form.notes),
      preferred: form.preferred,
      active: form.active,
    })

    open.value = false
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo guardar la relación proveedor-producto'
    )
  } finally {
    saving.value = false
  }
}
</script>
