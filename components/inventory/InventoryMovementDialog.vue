<script setup lang="ts">
import { ref, watch, computed, reactive, nextTick, onBeforeUnmount } from 'vue'
import { useUiStore } from '~/stores/ui.store'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import UiButton from '~/components/ui/UiButton.vue'

type MovementType = 'IN' | 'OUT' | 'ADJUST'

type InventoryMovementForm = {
  productId: string
  type: MovementType
  quantity: string
  reason: string
}

type StockSearchItem = {
  id: string
  name: string
  partNumber?: string
  internalCode?: string
  location?: string
  stockOnHand?: number
  stockMin?: number
  stockMax?: number
  stockStatus?: 'OK' | 'LOW' | 'OUT'
}

const ui = useUiStore()
const open = defineModel<boolean>()

const emit = defineEmits<{
  (
    e: 'submit',
    payload: {
      productId: string
      type: MovementType
      quantity: number
      reason: string
      referenceType: 'manual'
    }
  ): void
}>()

/* =========================
   OPTIONS
========================= */

const typeOptions = [
  { label: 'Entrada', value: 'IN' },
  { label: 'Salida', value: 'OUT' },
  { label: 'Ajuste', value: 'ADJUST' },
]

const quickReasons = computed(() => {
  if (form.value.type === 'IN') {
    return [
      'Entrada por compra',
      'Ingreso por devolución',
      'Alta inicial de inventario',
      'Regularización de stock',
    ]
  }

  if (form.value.type === 'OUT') {
    return [
      'Salida por consumo interno',
      'Salida por daño',
      'Salida por merma',
      'Salida por traspaso',
    ]
  }

  return [
    'Ajuste por conteo físico',
    'Corrección de inventario',
    'Diferencia detectada en auditoría',
    'Regularización manual',
  ]
})

/* =========================
   FORM
========================= */

function getDefaultForm(): InventoryMovementForm {
  return {
    productId: '',
    type: 'IN',
    quantity: '1',
    reason: '',
  }
}

const form = ref<InventoryMovementForm>(getDefaultForm())

/* =========================
   REMOTE PRODUCT SEARCH
========================= */

const productSearch = ref('')
const productDropdownOpen = ref(false)
const searchTouched = ref(false)
const productsLoading = ref(false)
const productResults = ref<StockSearchItem[]>([])
const selectedProduct = ref<StockSearchItem | null>(null)
const highlightedIndex = ref(-1)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function formatProductLabel(product: Partial<StockSearchItem>) {
  const code = product.partNumber || product.internalCode || 'SIN-CÓDIGO'
  return `${code} · ${product.name || 'Producto'}`
}

function stockBadgeClass(status?: string) {
  if (status === 'OUT') return 'bg-error/10 text-error border-error/20'
  if (status === 'LOW') return 'bg-warning/10 text-warning border-warning/20'
  return 'bg-success/10 text-success border-success/20'
}

function stockLabel(status?: string) {
  if (status === 'OUT') return 'Sin existencias'
  if (status === 'LOW') return 'Stock bajo'
  return 'Disponible'
}

async function searchProducts(term = '') {
  productsLoading.value = true
  highlightedIndex.value = -1

  try {
    const response = await useApi<{ items: StockSearchItem[]; nextCursor: string | null }>(
      '/inventory/stock',
      {
        query: {
          limit: 12,
          search: term.trim() || undefined,
        },
      }
    )

    productResults.value = Array.isArray(response?.items) ? response.items : []
  } catch {
    productResults.value = []
  } finally {
    productsLoading.value = false
  }
}

function onProductFocus() {
  productDropdownOpen.value = true

  if (!productResults.value.length && !productsLoading.value) {
    searchProducts(productSearch.value)
  }
}

function onProductInput(value: string) {
  productSearch.value = value
  form.value.productId = ''
  selectedProduct.value = null
  productDropdownOpen.value = true
  searchTouched.value = true
  highlightedIndex.value = -1

  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(async () => {
    await searchProducts(value)
  }, 300)
}

function selectProduct(product: StockSearchItem) {
  form.value.productId = product.id
  selectedProduct.value = product
  productSearch.value = formatProductLabel(product)
  productDropdownOpen.value = false
  highlightedIndex.value = -1
  delete errors.productId
}

function clearSelectedProduct() {
  form.value.productId = ''
  selectedProduct.value = null
  productSearch.value = ''
  productDropdownOpen.value = false
  highlightedIndex.value = -1
}

function onProductKeydown(event: KeyboardEvent) {
  if (!productDropdownOpen.value && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
    productDropdownOpen.value = true
    return
  }

  if (!productResults.value.length) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    highlightedIndex.value =
      highlightedIndex.value < productResults.value.length - 1 ? highlightedIndex.value + 1 : 0
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    highlightedIndex.value =
      highlightedIndex.value > 0 ? highlightedIndex.value - 1 : productResults.value.length - 1
  }

  if (event.key === 'Enter' && highlightedIndex.value >= 0) {
    event.preventDefault()
    selectProduct(productResults.value[highlightedIndex.value])
  }

  if (event.key === 'Escape') {
    productDropdownOpen.value = false
    highlightedIndex.value = -1
  }
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target) return

  if (!target.closest('[data-product-combobox]')) {
    productDropdownOpen.value = false
  }
}

watch(open, isOpen => {
  if (isOpen) {
    document.addEventListener('click', handleOutsideClick)
  } else {
    document.removeEventListener('click', handleOutsideClick)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

/* =========================
   ERRORS
========================= */

const errors = reactive<Record<string, string>>({})

const fieldLabels: Record<string, string> = {
  productId: 'Producto',
  type: 'Tipo de movimiento',
  quantity: 'Cantidad',
  reason: 'Motivo del movimiento',
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

function resetForm() {
  form.value = getDefaultForm()
  productSearch.value = ''
  selectedProduct.value = null
  productDropdownOpen.value = false
  productResults.value = []
  searchTouched.value = false
  highlightedIndex.value = -1
  clearErrors()
}

/* =========================
   HELPERS
========================= */

const quantityHelper = computed(() => {
  if (form.value.type === 'IN') {
    return 'Captura la cantidad que ingresará al inventario.'
  }

  if (form.value.type === 'OUT') {
    return 'Captura la cantidad que saldrá del inventario.'
  }

  return 'Para ajuste puedes usar valores positivos o negativos, pero no 0.'
})

const quantityPlaceholder = computed(() => {
  if (form.value.type === 'IN') return 'Ej: 10'
  if (form.value.type === 'OUT') return 'Ej: 5'
  return 'Ej: 10 o -5'
})

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

/* =========================
   SUBMIT
========================= */

async function submit() {
  clearErrors()

  const productId = form.value.productId
  const type = form.value.type
  const quantity = Number(form.value.quantity)
  const reason = form.value.reason.trim()

  if (!productId) {
    errors.productId = 'Debes seleccionar un producto'
  }

  if (!['IN', 'OUT', 'ADJUST'].includes(type)) {
    errors.type = 'Debes seleccionar un tipo de movimiento válido'
  }

  if (Number.isNaN(quantity)) {
    errors.quantity = 'La cantidad debe ser un número válido'
  } else if (quantity === 0) {
    errors.quantity = 'La cantidad no puede ser 0'
  }

  if (!reason) {
    errors.reason = 'Debes indicar el motivo del movimiento'
  } else if (reason.length < 3) {
    errors.reason = 'El motivo debe tener al menos 3 caracteres'
  }

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${fieldLabels[key] || key}: ${message}`)
    await focusFirstErrorField()
    return
  }

  emit('submit', {
    productId,
    type,
    quantity,
    reason,
    referenceType: 'manual',
  })

  open.value = false
}

/* =========================
   RESET FORM
========================= */

watch(open, v => {
  if (!v) {
    resetForm()
  }
})
</script>

<template>
  <UiDialog v-model="open" size="md" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- HEADER -->
      <header
        class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-full bg-primary/10 p-2">
            <Icon name="boxes" class="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 class="text-lg font-semibold">Movimiento de inventario</h2>
            <p class="text-sm opacity-60">Registro manual de entradas, salidas y ajustes</p>
          </div>
        </div>

        <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- CONTENT -->
      <section class="flex-1 space-y-5 overflow-auto px-6 py-5">
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

        <form class="space-y-4" @submit.prevent="submit">
          <!-- PRODUCTO -->
          <div data-error-field="productId" data-product-combobox>
            <div class="flex items-center justify-between gap-3">
              <label class="label py-0">
                <span class="label-text">Producto *</span>
              </label>

              <button
                v-if="selectedProduct"
                type="button"
                class="btn btn-ghost btn-xs"
                @click="clearSelectedProduct"
              >
                Limpiar selección
              </button>
            </div>

            <div class="relative">
              <label
                class="input input-bordered flex items-center gap-2"
                :class="{ 'input-error': !!errors.productId }"
              >
                <Icon name="search" class="h-4 w-4 opacity-60" />
                <input
                  :value="productSearch"
                  type="text"
                  class="grow"
                  placeholder="Busca por nombre, parte o código interno"
                  @focus="onProductFocus"
                  @keydown="onProductKeydown"
                  @input="onProductInput(($event.target as HTMLInputElement).value)"
                />
              </label>

              <div
                v-if="productDropdownOpen"
                class="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl"
              >
                <div v-if="productsLoading" class="px-4 py-3 text-sm opacity-70">
                  <span class="loading loading-spinner loading-sm mr-2"></span>
                  Buscando productos...
                </div>

                <template v-else-if="productResults.length">
                  <button
                    v-for="(product, index) in productResults"
                    :key="product.id"
                    type="button"
                    class="w-full border-b border-base-200 px-4 py-3 text-left last:border-b-0"
                    :class="index === highlightedIndex ? 'bg-base-200/80' : 'hover:bg-base-200/60'"
                    @mouseenter="highlightedIndex = index"
                    @click="selectProduct(product)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="truncate font-medium">
                          {{ product.name }}
                        </div>

                        <div class="text-xs opacity-60">
                          {{ product.partNumber || product.internalCode || 'Sin código' }}
                          <span v-if="product.location"> · {{ product.location }}</span>
                        </div>
                      </div>

                      <span
                        class="shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium"
                        :class="stockBadgeClass(product.stockStatus)"
                      >
                        {{ product.stockOnHand ?? 0 }}
                      </span>
                    </div>
                  </button>
                </template>

                <div v-else class="px-4 py-3 text-sm opacity-60">
                  {{
                    searchTouched
                      ? 'No se encontraron productos con ese criterio.'
                      : 'Escribe para buscar productos.'
                  }}
                </div>
              </div>
            </div>

            <p class="mt-1 text-xs opacity-60">
              Busca por nombre, número de parte o código interno para encontrar el producto
              rápidamente.
            </p>

            <p v-if="errors.productId" class="mt-1 text-xs text-error">
              {{ errors.productId }}
            </p>

            <!-- PRODUCTO SELECCIONADO -->
            <div
              v-if="selectedProduct"
              class="mt-3 rounded-2xl border border-base-300 bg-base-200/30 p-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="font-semibold truncate">{{ selectedProduct.name }}</p>
                  <p class="text-xs opacity-60 mt-1">
                    {{ selectedProduct.partNumber || selectedProduct.internalCode || 'Sin código' }}
                    <span v-if="selectedProduct.location"> · {{ selectedProduct.location }}</span>
                  </p>
                </div>

                <span
                  class="rounded-full border px-2.5 py-1 text-xs font-medium"
                  :class="stockBadgeClass(selectedProduct.stockStatus)"
                >
                  {{ stockLabel(selectedProduct.stockStatus) }}
                </span>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div class="rounded-xl bg-base-100 p-3">
                  <p class="text-xs uppercase tracking-wide opacity-60">Existencia actual</p>
                  <p class="mt-1 text-base font-bold">{{ selectedProduct.stockOnHand ?? 0 }}</p>
                </div>

                <div class="rounded-xl bg-base-100 p-3">
                  <p class="text-xs uppercase tracking-wide opacity-60">Ubicación</p>
                  <p class="mt-1 font-medium">{{ selectedProduct.location || '—' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- TIPO -->
          <div data-error-field="type">
            <UiSelect
              v-model="form.type"
              label="Tipo de movimiento *"
              placeholder="Selecciona el tipo de movimiento"
              :options="typeOptions"
              :error="errors.type"
            />
            <p class="mt-1 text-xs opacity-60">
              Usa entrada para agregar stock, salida para descontar y ajuste para correcciones.
            </p>
          </div>

          <!-- CANTIDAD -->
          <div data-error-field="quantity">
            <UiInput
              v-model="form.quantity"
              type="number"
              label="Cantidad *"
              :placeholder="quantityPlaceholder"
              :error="errors.quantity"
            />
            <p class="mt-1 text-xs opacity-60">{{ quantityHelper }}</p>
          </div>

          <!-- MOTIVO -->
          <div data-error-field="reason">
            <UiInput
              v-model="form.reason"
              label="Motivo del movimiento *"
              type="textarea"
              placeholder="Ej: Entrada por compra, salida por consumo interno, ajuste por conteo físico"
              :error="errors.reason"
            />

            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="item in quickReasons"
                :key="item"
                type="button"
                class="btn btn-xs btn-outline"
                @click="form.reason = item"
              >
                {{ item }}
              </button>
            </div>

            <p class="mt-2 text-xs opacity-60">
              Describe claramente por qué se está registrando este movimiento.
            </p>
          </div>
        </form>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 sm:flex-row"
      >
        <UiButton variant="outline" type="button" @click="open = false">Cancelar</UiButton>

        <UiButton @click="submit">Guardar</UiButton>
      </footer>
    </div>
  </UiDialog>
</template>
