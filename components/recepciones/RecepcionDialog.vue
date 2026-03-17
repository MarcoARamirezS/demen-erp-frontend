<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUiStore } from '~/stores/ui.store'
import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'
import Icon from '~/components/ui/Icon.vue'

const ui = useUiStore()
const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()

const open = defineModel<boolean>()
const emit = defineEmits(['submit'])

/* =========================
FORM
========================= */

const form = ref({
  supplierId: '',
  items: [] as {
    productId: string
    quantity: number
    cost: number
    search?: string
    showDropdown?: boolean
  }[],
  notes: '',
})

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
  form.value.items.push({
    productId: '',
    quantity: 1,
    cost: 0,
    search: '',
    showDropdown: false,
  })
}

function removeItem(index: number) {
  form.value.items.splice(index, 1)
}

/* =========================
PRODUCT SEARCH
========================= */

function filteredProducts(search: string) {
  if (!search) return productsStore.items.slice(0, 10)

  return productsStore.items
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10)
}

function selectProduct(item: any, product: any) {
  item.productId = product.id
  item.search = product.name
  item.showDropdown = false

  item.cost = product.lastCost || product.avgCost || 0
}

/* =========================
TOTAL
========================= */

const total = computed(() => form.value.items.reduce((sum, i) => sum + i.quantity * i.cost, 0))

/* =========================
SUBMIT
========================= */

function submit() {
  if (!form.value.supplierId) {
    ui.showToast('warning', 'Selecciona un proveedor')
    return
  }

  if (!form.value.items.length) {
    ui.showToast('warning', 'Agrega al menos un producto')
    return
  }

  for (const item of form.value.items) {
    if (!item.productId || item.quantity <= 0 || item.cost <= 0) {
      ui.showToast('warning', 'Revisa los productos agregados')
      return
    }
  }

  emit('submit', form.value)
  open.value = false
}
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
      <section class="flex-1 overflow-y-auto px-6 py-6 space-y-8 relative">
        <!-- DATOS -->
        <section class="space-y-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide opacity-60">Datos generales</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiSelect
              v-model="form.supplierId"
              label="Proveedor *"
              placeholder="Seleccionar proveedor"
              :options="supplierOptions"
            />

            <UiTextarea v-model="form.notes" label="Notas" />
          </div>
        </section>

        <!-- PRODUCTOS -->
        <section class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-xs font-semibold uppercase opacity-60">Productos</h3>

            <UiButton size="sm" variant="outline" @click="addItem">
              <Icon name="plus" class="mr-1" />
              Agregar producto
            </UiButton>
          </div>

          <!-- EMPTY -->
          <div
            v-if="!form.items.length"
            class="rounded-xl border border-dashed p-6 text-center text-sm opacity-60"
          >
            No hay productos agregados
          </div>

          <!-- TABLE -->
          <div class="relative overflow-visible rounded-xl border border-base-300">
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
                <tr v-for="(item, i) in form.items" :key="i">
                  <!-- AUTOCOMPLETE -->
                  <td class="relative">
                    <input
                      v-model="item.search"
                      @focus="item.showDropdown = true"
                      @input="item.showDropdown = true"
                      placeholder="Buscar producto..."
                      class="input input-sm input-bordered w-full"
                    />

                    <!-- DROPDOWN FIXED -->
                    <div
                      v-if="item.showDropdown"
                      class="absolute left-0 top-full z-[9999] mt-1 w-full max-h-60 overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-xl"
                    >
                      <div
                        v-for="p in filteredProducts(item.search)"
                        :key="p.id"
                        class="px-3 py-2 hover:bg-base-200 cursor-pointer text-sm"
                        @click="selectProduct(item, p)"
                      >
                        {{ p.name }}
                      </div>

                      <div
                        v-if="!filteredProducts(item.search).length"
                        class="px-3 py-2 text-xs opacity-60"
                      >
                        Sin resultados
                      </div>
                    </div>
                  </td>

                  <td class="w-[120px]">
                    <UiInput type="number" v-model.number="item.quantity" min="1" />
                  </td>

                  <td class="w-[140px]">
                    <UiInput type="number" v-model.number="item.cost" min="0" />
                  </td>

                  <td class="text-right font-medium">
                    {{ (item.quantity * item.cost).toFixed(2) }}
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
        class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
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
