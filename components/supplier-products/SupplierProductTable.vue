<template>
  <div
    class="animate-fadeIn space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg"
  >
    <!-- FILTROS -->
    <div
      class="flex flex-col gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative">
          <Icon name="search" class="absolute left-3 top-2.5 h-4 w-4 opacity-50" />

          <input
            v-model="search"
            type="text"
            placeholder="Buscar proveedor, producto, código, SKU..."
            class="input input-sm input-bordered w-full pl-9 sm:w-64 lg:w-80"
          />
        </div>

        <button v-if="search" type="button" class="btn btn-sm btn-outline" @click="search = ''">
          Limpiar
        </button>
      </div>

      <div class="text-xs opacity-70">
        {{ filtered.length }} {{ filtered.length === 1 ? 'relación' : 'relaciones' }}
      </div>
    </div>

    <!-- TABLA DESKTOP -->
    <div class="hidden overflow-x-auto lg:block">
      <table
        class="table w-full min-w-[1100px] overflow-hidden rounded-xl border border-base-300 text-sm"
      >
        <thead class="bg-base-200 text-xs uppercase tracking-wider">
          <tr>
            <th class="min-w-[260px]">Proveedor</th>
            <th class="min-w-[280px]">Producto</th>
            <th class="cursor-pointer whitespace-nowrap" @click="toggleSort">
              Precio
              <Icon
                name="chevron-down"
                class="ml-1 inline h-3 w-3 transition-transform"
                :class="{ 'rotate-180': sortDesc }"
              />
            </th>
            <th class="whitespace-nowrap">MOQ</th>
            <th class="whitespace-nowrap">Lead</th>
            <th class="text-center whitespace-nowrap">Preferido</th>
            <th class="w-[120px] whitespace-nowrap text-right">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="7" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2"></span>
              Cargando relaciones…
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="!filtered.length">
          <tr>
            <td colspan="7" class="p-10 text-center opacity-70">Sin relaciones registradas</td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="sp in sorted" :key="sp.id" class="transition hover:bg-base-200/40">
            <!-- PROVEEDOR -->
            <td>
              <div class="space-y-1">
                <div class="max-w-[360px] truncate font-semibold">
                  {{ getSupplierDisplay(sp).title }}
                </div>

                <div
                  v-if="getSupplierDisplay(sp).subtitle"
                  class="max-w-[360px] truncate text-xs opacity-60"
                >
                  {{ getSupplierDisplay(sp).subtitle }}
                </div>
              </div>
            </td>

            <!-- PRODUCTO -->
            <td>
              <div class="space-y-1">
                <div class="max-w-[380px] truncate font-semibold">
                  {{ getProductDisplay(sp).title }}
                </div>

                <div
                  v-if="getProductDisplay(sp).subtitle"
                  class="max-w-[380px] truncate text-xs opacity-60"
                >
                  {{ getProductDisplay(sp).subtitle }}
                </div>
              </div>
            </td>

            <!-- PRECIO -->
            <td class="whitespace-nowrap font-mono">
              <span :class="sp.preferred ? 'font-semibold text-success' : ''">
                {{ formatPrice(sp.currentPrice, sp.currency) }}
              </span>
            </td>

            <!-- MOQ -->
            <td class="whitespace-nowrap">
              {{ formatMoq(sp.moq) }}
            </td>

            <!-- LEAD -->
            <td class="whitespace-nowrap">
              {{ formatLeadTime(sp.leadTimeDays) }}
            </td>

            <!-- PREFERIDO -->
            <td class="text-center">
              <span
                class="badge badge-outline"
                :class="
                  sp.preferred ? 'bg-success/15 text-success' : 'bg-base-200 text-base-content/60'
                "
              >
                {{ sp.preferred ? 'Sí' : 'No' }}
              </span>
            </td>

            <!-- ACCIONES -->
            <td class="text-right">
              <div class="flex justify-end gap-2">
                <div class="tooltip" data-tip="Editar">
                  <button
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="$emit('edit', sp)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div class="tooltip" data-tip="Eliminar">
                  <button
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-error"
                    @click="$emit('delete', sp)"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE / TABLET LOADING -->
    <div v-if="loading" class="space-y-3 lg:hidden">
      <div
        v-for="n in 3"
        :key="n"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="animate-pulse space-y-3">
          <div class="h-4 w-40 rounded bg-base-300"></div>
          <div class="h-3 w-28 rounded bg-base-300"></div>
          <div class="h-4 w-48 rounded bg-base-300"></div>
          <div class="h-3 w-32 rounded bg-base-300"></div>
        </div>
      </div>
    </div>

    <!-- MOBILE / TABLET EMPTY -->
    <div v-else-if="!filtered.length" class="lg:hidden">
      <div
        class="rounded-2xl border border-base-300 bg-base-100 px-4 py-8 text-center text-sm opacity-70 shadow-sm"
      >
        Sin relaciones registradas
      </div>
    </div>

    <!-- MOBILE / TABLET CARDS -->
    <div v-else class="space-y-3 lg:hidden">
      <div
        v-for="sp in sorted"
        :key="sp.id"
        class="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
      >
        <div class="border-b border-base-300 bg-base-200/40 px-4 py-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold">
                {{ getProductDisplay(sp).title }}
              </div>

              <div v-if="getProductDisplay(sp).subtitle" class="truncate text-xs opacity-60">
                {{ getProductDisplay(sp).subtitle }}
              </div>
            </div>

            <span
              class="badge badge-outline shrink-0"
              :class="
                sp.preferred ? 'bg-success/15 text-success' : 'bg-base-100 text-base-content/60'
              "
            >
              {{ sp.preferred ? 'Preferido' : 'Normal' }}
            </span>
          </div>
        </div>

        <div class="space-y-3 px-4 py-4 text-sm">
          <div>
            <div class="text-xs font-medium uppercase tracking-wide opacity-60">Proveedor</div>
            <div class="mt-1 font-semibold">{{ getSupplierDisplay(sp).title }}</div>
            <div v-if="getSupplierDisplay(sp).subtitle" class="text-xs opacity-60">
              {{ getSupplierDisplay(sp).subtitle }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-base-200/40 px-3 py-2">
              <div class="text-xs uppercase tracking-wide opacity-60">Precio</div>
              <div class="mt-1 font-mono" :class="sp.preferred ? 'font-semibold text-success' : ''">
                {{ formatPrice(sp.currentPrice, sp.currency) }}
              </div>
            </div>

            <div class="rounded-xl bg-base-200/40 px-3 py-2">
              <div class="text-xs uppercase tracking-wide opacity-60">MOQ</div>
              <div class="mt-1">{{ formatMoq(sp.moq) }}</div>
            </div>

            <div class="rounded-xl bg-base-200/40 px-3 py-2">
              <div class="text-xs uppercase tracking-wide opacity-60">Lead</div>
              <div class="mt-1">{{ formatLeadTime(sp.leadTimeDays) }}</div>
            </div>

            <div class="rounded-xl bg-base-200/40 px-3 py-2">
              <div class="text-xs uppercase tracking-wide opacity-60">SKU proveedor</div>
              <div class="mt-1 truncate">
                {{ normalizeText(sp.supplierSku) || 'Sin SKU' }}
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-base-300 px-4 py-3">
          <div class="flex gap-2">
            <button type="button" class="btn btn-sm btn-outline flex-1" @click="$emit('edit', sp)">
              <Icon name="edit" />
              Editar
            </button>

            <button
              type="button"
              class="btn btn-sm btn-outline btn-error flex-1"
              @click="$emit('delete', sp)"
            >
              <Icon name="trash" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- LOAD MORE -->
    <div v-if="hasMore && !loading" class="flex justify-center pt-2">
      <UiButton variant="outline" size="sm" @click="$emit('load-more')">Cargar más</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'

type SupplierProductRow = {
  id: string
  supplierId: string
  productId: string
  supplierSku?: string
  currentPrice?: number
  currency?: string
  moq?: number
  leadTimeDays?: number
  preferred?: boolean
  supplier?: any
  product?: any
  supplierName?: string
  supplierCode?: string
  productName?: string
  partNumber?: string
}

const props = defineProps<{
  items: SupplierProductRow[]
  loading: boolean
  hasMore: boolean
}>()

defineEmits(['edit', 'delete', 'load-more'])

const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()

const search = ref('')
const sortDesc = ref(false)

const suppliersMap = computed(
  () => new Map((suppliersStore.items ?? []).map((s: any) => [s.id, s]))
)
const productsMap = computed(() => new Map((productsStore.items ?? []).map((p: any) => [p.id, p])))

function normalizeText(value: unknown) {
  return String(value ?? '').trim()
}

function searchableText(value: unknown) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function formatPrice(value: unknown, currency: unknown) {
  const amount = Number(value ?? 0)
  const code = normalizeText(currency) || 'MXN'

  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)

  return `${formatted} ${code}`
}

function formatLeadTime(value: unknown) {
  const days = Number(value ?? 0)
  return `${Number.isFinite(days) ? days : 0} días`
}

function formatMoq(value: unknown) {
  const moq = Number(value ?? 0)
  return Number.isFinite(moq) ? moq : 0
}

function getSupplierEntity(sp: SupplierProductRow) {
  return sp.supplier || suppliersMap.value.get(sp.supplierId) || null
}

function getProductEntity(sp: SupplierProductRow) {
  return sp.product || productsMap.value.get(sp.productId) || null
}

function getSupplierDisplay(sp: SupplierProductRow) {
  const supplier = getSupplierEntity(sp)

  const title =
    normalizeText(sp.supplierName) ||
    normalizeText(supplier?.name) ||
    normalizeText(supplier?.legalName) ||
    normalizeText(supplier?.razonSocial) ||
    'Proveedor sin nombre'

  const subtitle =
    normalizeText(sp.supplierCode) ||
    normalizeText(supplier?.code) ||
    normalizeText(supplier?.rfc) ||
    normalizeText(supplier?.email) ||
    normalizeText(sp.supplierSku) ||
    ''

  return { title, subtitle }
}

function getProductDisplay(sp: SupplierProductRow) {
  const product = getProductEntity(sp)

  const title =
    normalizeText(sp.productName) ||
    normalizeText(product?.name) ||
    normalizeText(product?.description) ||
    normalizeText(product?.partNumber) ||
    'Producto sin nombre'

  const subtitle =
    normalizeText(sp.partNumber) ||
    normalizeText(product?.partNumber) ||
    normalizeText(product?.internalCode) ||
    normalizeText(product?.brand) ||
    normalizeText(sp.supplierSku) ||
    ''

  return { title, subtitle }
}

function rowSearchText(sp: SupplierProductRow) {
  return searchableText(
    [
      getSupplierDisplay(sp).title,
      getSupplierDisplay(sp).subtitle,
      getProductDisplay(sp).title,
      getProductDisplay(sp).subtitle,
      normalizeText(sp.supplierSku),
      normalizeText(sp.currency),
    ].join(' ')
  )
}

const filtered = computed(() => {
  const q = searchableText(search.value)
  if (!q) return props.items

  return props.items.filter(sp => rowSearchText(sp).includes(q))
})

function toggleSort() {
  sortDesc.value = !sortDesc.value
}

const sorted = computed(() => {
  return [...filtered.value].sort((a, b) => {
    const diff = Number(a.currentPrice ?? 0) - Number(b.currentPrice ?? 0)
    return sortDesc.value ? -diff : diff
  })
})
</script>
