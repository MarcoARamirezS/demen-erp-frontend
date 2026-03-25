<template>
  <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- Loading inicial -->
    <div
      v-if="loading && !items.length"
      class="flex items-center justify-center rounded-2xl border border-base-300 bg-base-100 p-10"
    >
      <span class="loading loading-spinner loading-md mr-3" />
      <span class="text-sm opacity-70">Cargando relaciones proveedor-producto...</span>
    </div>

    <template v-else>
      <!-- Desktop -->
      <div class="hidden overflow-x-auto rounded-2xl border border-base-300 md:block">
        <table class="table w-full">
          <thead class="bg-base-200 text-xs uppercase tracking-wider text-base-content/70">
            <tr>
              <th class="min-w-[280px]">Producto</th>
              <th class="min-w-[260px]">Proveedor</th>
              <th class="min-w-[220px]">Condición comercial</th>
              <th class="min-w-[120px]">Lead time</th>
              <th class="min-w-[200px]">Estado</th>
              <th class="w-[140px] text-center">Acciones</th>
            </tr>
          </thead>

          <tbody v-if="items.length">
            <tr v-for="item in items" :key="item.id" class="transition hover:bg-base-200/40">
              <!-- Producto -->
              <td class="align-top">
                <div class="flex min-w-0 flex-col gap-2">
                  <div
                    class="truncate text-sm font-bold text-base-content"
                    :title="getProductDisplayName(item)"
                  >
                    {{ getProductDisplayName(item) }}
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <span
                      v-if="getProductDisplayPartNumber(item)"
                      class="badge badge-outline badge-sm font-medium"
                    >
                      {{ getProductDisplayPartNumber(item) }}
                    </span>

                    <span v-if="getProductInternalCode(item)" class="badge badge-outline badge-sm">
                      {{ getProductInternalCode(item) }}
                    </span>

                    <span
                      v-if="isProductInactive(item)"
                      class="badge badge-sm border-warning bg-warning text-warning-content"
                    >
                      Producto inactivo
                    </span>
                  </div>

                  <div
                    v-if="!item.product && !item.productName"
                    class="truncate text-xs text-base-content/50"
                    :title="item.productId"
                  >
                    ID producto: {{ item.productId }}
                  </div>
                </div>
              </td>

              <!-- Proveedor -->
              <td class="align-top">
                <div class="flex min-w-0 flex-col gap-2">
                  <div
                    class="truncate text-sm font-bold text-base-content"
                    :title="getSupplierDisplayName(item)"
                  >
                    {{ getSupplierDisplayName(item) }}
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <span
                      v-if="getSupplierDisplayCode(item)"
                      class="badge badge-outline badge-sm font-medium"
                    >
                      {{ getSupplierDisplayCode(item) }}
                    </span>

                    <span
                      v-if="isSupplierInactive(item)"
                      class="badge badge-sm border-warning bg-warning text-warning-content"
                    >
                      Proveedor inactivo
                    </span>
                  </div>

                  <div
                    v-if="!item.supplier && !item.supplierName"
                    class="truncate text-xs text-base-content/50"
                    :title="item.supplierId"
                  >
                    ID proveedor: {{ item.supplierId }}
                  </div>
                </div>
              </td>

              <!-- Condición comercial -->
              <td class="align-top">
                <div class="flex min-w-0 flex-col gap-2">
                  <div class="text-sm font-bold text-base-content">
                    {{ formatMoney(item.currentPrice, item.currency) }}
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <span
                      v-if="item.preferred"
                      class="badge badge-sm border-info bg-info text-info-content"
                    >
                      Preferido
                    </span>

                    <span
                      v-if="item.supplierSku"
                      class="badge badge-outline badge-sm font-mono"
                      :title="item.supplierSku"
                    >
                      SKU: {{ item.supplierSku }}
                    </span>
                  </div>

                  <div
                    v-if="item.notes"
                    class="line-clamp-1 text-xs text-base-content/60"
                    :title="item.notes"
                  >
                    {{ item.notes }}
                  </div>
                </div>
              </td>

              <!-- Lead time -->
              <td class="align-top">
                <div class="text-sm text-base-content">
                  {{ formatLeadTime(item.leadTimeDays) }}
                </div>
              </td>

              <!-- Estado -->
              <td class="align-top">
                <div class="flex min-w-0 flex-col gap-2">
                  <span
                    class="badge badge-sm w-fit border font-semibold"
                    :class="relationshipBadgeClass(item)"
                  >
                    {{ relationshipBadgeText(item) }}
                  </span>

                  <p
                    v-if="relationshipHelperText(item)"
                    class="text-xs leading-snug text-base-content/60"
                  >
                    {{ relationshipHelperText(item) }}
                  </p>
                </div>
              </td>

              <!-- Acciones -->
              <td class="align-top">
                <div class="flex items-center justify-center gap-2">
                  <div class="tooltip" data-tip="Editar relación">
                    <button
                      type="button"
                      class="btn btn-circle btn-sm btn-ghost text-primary"
                      @click="$emit('edit', item)"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                  </div>

                  <div
                    class="tooltip"
                    :data-tip="item.active === false ? 'Activar relación' : 'Desactivar relación'"
                  >
                    <button
                      type="button"
                      class="btn btn-circle btn-sm btn-ghost"
                      :class="item.active === false ? 'text-success' : 'text-warning'"
                      @click="$emit('toggle-active', item)"
                    >
                      <Icon :name="item.active === false ? 'check-circle' : 'ban'" size="sm" />
                    </button>
                  </div>

                  <div class="tooltip" data-tip="Eliminar relación">
                    <button
                      type="button"
                      class="btn btn-circle btn-sm btn-ghost text-error"
                      @click="$emit('delete', item)"
                    >
                      <Icon name="trash" size="sm" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td colspan="6" class="p-10 text-center">
                <div class="mx-auto max-w-md space-y-2">
                  <p class="text-sm font-semibold text-base-content">
                    Aún no existen relaciones proveedor-producto
                  </p>
                  <p class="text-sm text-base-content/60">
                    Usa el botón <span class="font-medium">“Asignar proveedor”</span> para crear la
                    primera relación comercial.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile -->
      <div class="space-y-3 md:hidden">
        <div
          v-for="item in items"
          :key="item.id"
          class="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
        >
          <div class="border-b border-base-300 px-4 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div
                  class="truncate text-sm font-bold text-base-content"
                  :title="getProductDisplayName(item)"
                >
                  {{ getProductDisplayName(item) }}
                </div>

                <div
                  class="mt-1 truncate text-xs text-base-content/60"
                  :title="getSupplierDisplayName(item)"
                >
                  {{ getSupplierDisplayName(item) }}
                </div>
              </div>

              <span
                class="badge badge-sm border font-semibold"
                :class="relationshipBadgeClass(item)"
              >
                {{ relationshipBadgeText(item) }}
              </span>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <span v-if="getProductDisplayPartNumber(item)" class="badge badge-outline badge-sm">
                {{ getProductDisplayPartNumber(item) }}
              </span>

              <span v-if="getSupplierDisplayCode(item)" class="badge badge-outline badge-sm">
                {{ getSupplierDisplayCode(item) }}
              </span>

              <span
                v-if="item.preferred"
                class="badge badge-sm border-info bg-info text-info-content"
              >
                Preferido
              </span>

              <span
                v-if="isSupplierInactive(item)"
                class="badge badge-sm border-warning bg-warning text-warning-content"
              >
                Proveedor inactivo
              </span>

              <span
                v-if="isProductInactive(item)"
                class="badge badge-sm border-warning bg-warning text-warning-content"
              >
                Producto inactivo
              </span>
            </div>
          </div>

          <div class="space-y-3 px-4 py-4 text-sm">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-base-300 bg-base-200/40 px-3 py-2">
                <p class="text-xs uppercase text-base-content/50">Precio</p>
                <p class="mt-1 font-bold text-base-content">
                  {{ formatMoney(item.currentPrice, item.currency) }}
                </p>
              </div>

              <div class="rounded-xl border border-base-300 bg-base-200/40 px-3 py-2">
                <p class="text-xs uppercase text-base-content/50">Lead time</p>
                <p class="mt-1 font-bold text-base-content">
                  {{ formatLeadTime(item.leadTimeDays) }}
                </p>
              </div>
            </div>

            <div v-if="item.supplierSku || item.notes" class="space-y-2">
              <div
                v-if="item.supplierSku"
                class="truncate text-xs text-base-content/60"
                :title="item.supplierSku"
              >
                <span class="font-medium">SKU proveedor:</span> {{ item.supplierSku }}
              </div>

              <div
                v-if="item.notes"
                class="line-clamp-2 text-xs text-base-content/60"
                :title="item.notes"
              >
                <span class="font-medium">Notas:</span> {{ item.notes }}
              </div>
            </div>

            <div
              v-if="relationshipHelperText(item)"
              class="rounded-xl border border-base-300 bg-base-200/40 px-3 py-2 text-xs text-base-content/70"
            >
              {{ relationshipHelperText(item) }}
            </div>

            <div
              v-if="(!item.supplier && !item.supplierName) || (!item.product && !item.productName)"
              class="grid grid-cols-1 gap-2 text-xs text-base-content/50"
            >
              <div
                v-if="!item.supplier && !item.supplierName"
                class="truncate"
                :title="item.supplierId"
              >
                <span class="font-medium">ID proveedor:</span> {{ item.supplierId }}
              </div>

              <div
                v-if="!item.product && !item.productName"
                class="truncate"
                :title="item.productId"
              >
                <span class="font-medium">ID producto:</span> {{ item.productId }}
              </div>
            </div>
          </div>

          <div class="border-t border-base-300 px-4 py-3">
            <div class="grid grid-cols-3 gap-2">
              <button type="button" class="btn btn-sm btn-outline" @click="$emit('edit', item)">
                <Icon name="edit" size="sm" />
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline"
                :class="item.active === false ? 'text-success' : 'text-warning'"
                @click="$emit('toggle-active', item)"
              >
                <Icon :name="item.active === false ? 'check-circle' : 'ban'" size="sm" />
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline text-error"
                @click="$emit('delete', item)"
              >
                <Icon name="trash" size="sm" />
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="!items.length && !loading"
          class="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm"
        >
          <div class="mx-auto max-w-xs space-y-2">
            <p class="text-sm font-semibold text-base-content">
              Aún no existen relaciones proveedor-producto
            </p>
            <p class="text-sm text-base-content/60">
              Crea la primera relación con <span class="font-medium">“Asignar proveedor”</span>.
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'

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

  supplierName?: string
  supplierCode?: string
  productName?: string
  productPartNumber?: string
}

defineProps<{
  items: SupplierProduct[]
  loading: boolean
}>()

defineEmits<{
  (e: 'edit', item: SupplierProduct): void
  (e: 'delete', item: SupplierProduct): void
  (e: 'toggle-active', item: SupplierProduct): void
}>()

function getSupplierDisplayName(item: SupplierProduct) {
  return (
    item.supplier?.name ||
    item.supplier?.legalName ||
    item.supplierName ||
    'Proveedor no encontrado'
  )
}

function getSupplierDisplayCode(item: SupplierProduct) {
  return item.supplier?.code || item.supplierCode || ''
}

function getProductDisplayName(item: SupplierProduct) {
  return item.product?.name || item.productName || 'Producto no encontrado'
}

function getProductDisplayPartNumber(item: SupplierProduct) {
  return item.product?.partNumber || item.productPartNumber || ''
}

function getProductInternalCode(item: SupplierProduct) {
  return item.product?.internalCode || ''
}

function isSupplierInactive(item: SupplierProduct) {
  return item.supplier?.active === false
}

function isProductInactive(item: SupplierProduct) {
  return item.product?.active === false
}

function formatMoney(value?: number | null, currency?: string | null) {
  const amount = Number(value || 0)
  const code = String(currency || 'MXN')

  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${code}`
  }
}

function formatLeadTime(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `${Number(value)} días`
}

function relationshipBadgeText(item: SupplierProduct) {
  if (item.active === false) return 'Solo histórico'
  if (isSupplierInactive(item) && isProductInactive(item)) return 'Revisar ambos'
  if (isSupplierInactive(item)) return 'Revisar proveedor'
  if (isProductInactive(item)) return 'Revisar producto'
  return 'Operativa'
}

function relationshipBadgeClass(item: SupplierProduct) {
  if (item.active === false) {
    return 'border-error bg-error text-error-content'
  }

  if (isSupplierInactive(item) && isProductInactive(item)) {
    return 'border-warning bg-warning text-warning-content'
  }

  if (isSupplierInactive(item) || isProductInactive(item)) {
    return 'border-warning bg-warning text-warning-content'
  }

  return 'border-success bg-success text-success-content'
}

function relationshipHelperText(item: SupplierProduct) {
  if (item.active === false) {
    return 'La relación está desactivada y debería conservarse solo como historial.'
  }

  if (isSupplierInactive(item) && isProductInactive(item)) {
    return 'Proveedor y producto están inactivos. No usar esta relación en operaciones nuevas.'
  }

  if (isSupplierInactive(item)) {
    return 'El proveedor está inactivo. Revisa antes de usar esta relación en compras nuevas.'
  }

  if (isProductInactive(item)) {
    return 'El producto está inactivo. Revisa antes de usar esta relación en operaciones nuevas.'
  }

  return ''
}
</script>
