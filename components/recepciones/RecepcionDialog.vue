<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick, onBeforeUnmount } from 'vue'
import { useUiStore } from '~/stores/ui.store'
import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'

import UiDialog from '~/components/ui/UiDialog.vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import UiTextarea from '~/components/ui/UiTextarea.vue'
import Icon from '~/components/ui/Icon.vue'

type RecepcionItemForm = {
  productId: string
  quantity: number
  cost: number
  search: string
  showDropdown: boolean
}

type RecepcionForm = {
  supplierId: string
  items: RecepcionItemForm[]
  notes: string
}

const ui = useUiStore()
const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()

const open = defineModel<boolean>()
const emit = defineEmits<{
  (
    e: 'submit',
    payload: {
      supplierId: string
      notes?: string
      items: Array<{
        productId: string
        quantity: number
        cost: number
      }>
    }
  ): void
}>()

/* =========================
   FORM
========================= */

function getDefaultItem(): RecepcionItemForm {
  return {
    productId: '',
    quantity: 1,
    cost: 0,
    search: '',
    showDropdown: false,
  }
}

function getDefaultForm(): RecepcionForm {
  return {
    supplierId: '',
    items: [],
    notes: '',
  }
}

const form = ref<RecepcionForm>(getDefaultForm())

/* =========================
   ERRORS
========================= */

const errors = reactive<Record<string, string>>({})

function getFieldLabel(key: string) {
  const staticLabels: Record<string, string> = {
    supplierId: 'Proveedor',
    notes: 'Notas',
    items: 'Productos',
  }

  if (staticLabels[key]) return staticLabels[key]

  const productMatch = key.match(/^item_productId_(\d+)$/)
  if (productMatch) return `Producto ${Number(productMatch[1]) + 1} · Producto`

  const quantityMatch = key.match(/^item_quantity_(\d+)$/)
  if (quantityMatch) return `Producto ${Number(quantityMatch[1]) + 1} · Cantidad`

  const costMatch = key.match(/^item_cost_(\d+)$/)
  if (costMatch) return `Producto ${Number(costMatch[1]) + 1} · Costo`

  return key
}

const errorSummary = computed(() =>
  Object.entries(errors)
    .filter(([, message]) => !!message)
    .map(([key, message]) => ({
      key,
      label: getFieldLabel(key),
      message,
    }))
)

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function resetForm() {
  form.value = getDefaultForm()
  clearErrors()
}

/* =========================
   LOAD DATA
========================= */

onMounted(async () => {
  if (!suppliersStore.items.length) {
    await suppliersStore.fetch()
  }

  if (!productsStore.items.length) {
    await productsStore.fetch()
  }

  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

/* =========================
   SUPPLIERS
========================= */

const supplierOptions = computed(() =>
  suppliersStore.items.map(s => ({
    label: s.name ?? s.razonSocial ?? 'Proveedor',
    value: s.id,
  }))
)

/* =========================
   ITEMS
========================= */

function addItem() {
  form.value.items.push(getDefaultItem())
}

function removeItem(index: number) {
  form.value.items.splice(index, 1)
  reindexItemErrors(index)
}

function reindexItemErrors(removedIndex: number) {
  const current = Object.entries(errors)
  clearErrors()

  for (const [key, message] of current) {
    const productMatch = key.match(/^item_productId_(\d+)$/)
    const quantityMatch = key.match(/^item_quantity_(\d+)$/)
    const costMatch = key.match(/^item_cost_(\d+)$/)

    if (!productMatch && !quantityMatch && !costMatch) {
      errors[key] = message
      continue
    }

    const index = Number((productMatch || quantityMatch || costMatch)?.[1])

    if (index < removedIndex) {
      errors[key] = message
      continue
    }

    if (index === removedIndex) {
      continue
    }

    if (productMatch) {
      errors[`item_productId_${index - 1}`] = message
    } else if (quantityMatch) {
      errors[`item_quantity_${index - 1}`] = message
    } else if (costMatch) {
      errors[`item_cost_${index - 1}`] = message
    }
  }
}

function closeAllDropdowns() {
  form.value.items.forEach(item => {
    item.showDropdown = false
  })
}

/* =========================
   PRODUCT SEARCH
========================= */

function filteredProducts(search: string) {
  const term = search.trim().toLowerCase()

  if (!term) return productsStore.items.slice(0, 10)

  return productsStore.items
    .filter(p => {
      const name = String(p.name ?? '').toLowerCase()
      const sku = String(p.sku ?? '').toLowerCase()
      const partNumber = String(p.partNumber ?? '').toLowerCase()
      const brand = String(p.brand ?? '').toLowerCase()

      return (
        name.includes(term) ||
        sku.includes(term) ||
        partNumber.includes(term) ||
        brand.includes(term)
      )
    })
    .slice(0, 10)
}

function getProductOptionLabel(product: any) {
  return `${product.sku ?? product.partNumber ?? ''} · ${product.name}${product.brand ? ` — ${product.brand}` : ''}`
}

function selectProduct(item: RecepcionItemForm, product: any, index: number) {
  item.productId = product.id
  item.search = getProductOptionLabel(product)
  item.showDropdown = false
  item.cost = Number(product.lastCost || product.avgCost || 0)

  delete errors[`item_productId_${index}`]
  delete errors[`item_cost_${index}`]
}

function handleOutsideClick() {
  closeAllDropdowns()
}

function onSearchFocus(item: RecepcionItemForm) {
  closeAllDropdowns()
  item.showDropdown = true
}

/* =========================
   TOTAL
========================= */

const total = computed(() =>
  form.value.items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.cost || 0), 0)
)

/* =========================
   HELPERS
========================= */

function optionalString(value?: string | null) {
  const clean = String(value ?? '').trim()
  return clean ? clean : undefined
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

/* =========================
   SUBMIT
========================= */

async function submit() {
  clearErrors()

  const supplierId = form.value.supplierId.trim()
  const notes = form.value.notes.trim()

  if (!supplierId) {
    errors.supplierId = 'Debes seleccionar un proveedor'
  }

  if (!form.value.items.length) {
    errors.items = 'Debes agregar al menos un producto'
  }

  form.value.items.forEach((item, index) => {
    if (!item.productId) {
      errors[`item_productId_${index}`] = 'Debes seleccionar un producto'
    }

    if (Number.isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
      errors[`item_quantity_${index}`] = 'La cantidad debe ser mayor a 0'
    }

    if (Number.isNaN(Number(item.cost)) || Number(item.cost) <= 0) {
      errors[`item_cost_${index}`] = 'El costo debe ser mayor a 0'
    }
  })

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${getFieldLabel(key)}: ${message}`)
    await focusFirstErrorField()
    return
  }

  emit('submit', {
    supplierId,
    notes: optionalString(notes),
    items: form.value.items.map(item => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      cost: Number(item.cost),
    })),
  })

  open.value = false
}

/* =========================
   RESET ON CLOSE
========================= */

function handleClose() {
  resetForm()
}

watch(open, value => {
  if (!value) {
    handleClose()
  }
})
</script>

<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- HEADER -->
      <header
        class="sticky top-0 z-10 flex items-start gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <div class="rounded-full bg-primary/10 p-3">
          <Icon name="package" />
        </div>

        <div class="flex-1">
          <h2 class="text-lg font-semibold text-primary">Nueva recepción</h2>
          <p class="text-xs opacity-60">Registro de entrada de inventario</p>
        </div>

        <button class="btn btn-circle btn-sm btn-ghost" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- CONTENT -->
      <section class="relative flex-1 space-y-8 overflow-y-auto px-6 py-6">
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

        <!-- DATOS -->
        <section class="space-y-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide opacity-60">Datos generales</h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div data-error-field="supplierId">
              <UiSelect
                v-model="form.supplierId"
                label="Proveedor *"
                placeholder="Selecciona el proveedor de esta recepción"
                :options="supplierOptions"
                :error="errors.supplierId"
              />
              <p class="mt-1 text-xs opacity-60">
                Elige el proveedor que envió los productos recibidos.
              </p>
            </div>

            <div data-error-field="notes">
              <UiTextarea
                v-model="form.notes"
                label="Notas"
                placeholder="Ej: Recepción parcial, mercancía revisada, pendiente factura"
              />
              <p class="mt-1 text-xs opacity-60">
                Agrega observaciones generales sobre esta recepción.
              </p>
            </div>
          </div>
        </section>

        <!-- PRODUCTOS -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-semibold uppercase opacity-60">Productos</h3>

            <UiButton size="sm" variant="outline" @click="addItem">
              <Icon name="plus" class="mr-1" />
              Agregar producto
            </UiButton>
          </div>

          <div
            v-if="errors.items"
            data-error-field="items"
            class="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
          >
            {{ errors.items }}
          </div>

          <!-- EMPTY -->
          <div
            v-if="!form.items.length"
            class="rounded-xl border border-dashed p-6 text-center text-sm opacity-60"
          >
            No hay productos agregados. Presiona “Agregar producto” para comenzar.
          </div>

          <!-- TABLE -->
          <div v-else class="relative overflow-visible rounded-xl border border-base-300">
            <table class="table w-full text-sm">
              <thead class="bg-base-200 text-xs uppercase">
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Costo</th>
                  <th class="text-right">Subtotal</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, i) in form.items" :key="i" class="align-top">
                  <!-- AUTOCOMPLETE -->
                  <td class="relative min-w-[280px]" :data-error-field="`item_productId_${i}`">
                    <input
                      v-model="item.search"
                      @focus.stop="onSearchFocus(item)"
                      @input="item.showDropdown = true"
                      placeholder="Busca por nombre, SKU o número de parte"
                      class="input input-sm input-bordered w-full"
                      :class="{ 'input-error': errors[`item_productId_${i}`] }"
                    />

                    <p class="mt-1 text-xs opacity-60">
                      Selecciona el producto exacto que llegó en esta recepción.
                    </p>

                    <p v-if="errors[`item_productId_${i}`]" class="mt-1 text-xs text-error">
                      {{ errors[`item_productId_${i}`] }}
                    </p>

                    <div
                      v-if="item.showDropdown"
                      class="absolute left-0 top-full z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-xl"
                      @click.stop
                    >
                      <div
                        v-for="p in filteredProducts(item.search)"
                        :key="p.id"
                        class="cursor-pointer px-3 py-2 text-sm hover:bg-base-200"
                        @click="selectProduct(item, p, i)"
                      >
                        {{ getProductOptionLabel(p) }}
                      </div>

                      <div
                        v-if="!filteredProducts(item.search).length"
                        class="px-3 py-2 text-xs opacity-60"
                      >
                        Sin resultados
                      </div>
                    </div>
                  </td>

                  <td class="w-[140px]" :data-error-field="`item_quantity_${i}`">
                    <UiInput
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      placeholder="Ej: 10"
                      :error="errors[`item_quantity_${i}`]"
                    />
                    <p class="mt-1 text-xs opacity-60">
                      Captura la cantidad recibida del producto.
                    </p>
                  </td>

                  <td class="w-[160px]" :data-error-field="`item_cost_${i}`">
                    <UiInput
                      v-model.number="item.cost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ej: 125.50"
                      :error="errors[`item_cost_${i}`]"
                    />
                    <p class="mt-1 text-xs opacity-60">Ingresa el costo unitario del proveedor.</p>
                  </td>

                  <td class="text-right font-medium">
                    {{ (Number(item.quantity || 0) * Number(item.cost || 0)).toFixed(2) }}
                  </td>

                  <td class="text-right">
                    <button
                      class="btn btn-circle btn-sm btn-ghost text-error"
                      @click="removeItem(i)"
                    >
                      <Icon name="trash" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- TOTAL -->
        <section class="flex justify-end">
          <div class="rounded-xl border bg-base-200/40 px-6 py-4">
            <div class="text-sm opacity-60">Total</div>
            <div class="text-xl font-bold text-primary">$ {{ total.toFixed(2) }}</div>
          </div>
        </section>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 sm:flex-row"
      >
        <UiButton variant="ghost" class="w-full sm:w-auto" @click="open = false">
          Cancelar
        </UiButton>

        <UiButton variant="primary" class="w-full sm:w-auto" @click="submit">
          Registrar recepción
        </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>
