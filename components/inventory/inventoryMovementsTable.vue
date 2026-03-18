<script setup lang="ts">
import type { InventoryMovement } from '~/types/inventory'
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  items: InventoryMovement[]
  loading: boolean
  cursor: string | null
}>()

defineEmits<{
  (e: 'load-more'): void
}>()

function formatDate(date: any) {
  if (!date) return '—'

  if (date?._seconds) {
    return new Date(date._seconds * 1000).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (typeof date?.toDate === 'function') {
    return date.toDate().toLocaleString('es-MX')
  }

  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-MX')
}

function typeLabel(type: string) {
  if (type === 'IN') return 'Entrada'
  if (type === 'OUT') return 'Salida'
  return 'Ajuste'
}

function typeBadge(type: string) {
  if (type === 'IN') return 'border-success bg-success text-success-content'
  if (type === 'OUT') return 'border-error bg-error text-error-content'
  return 'border-warning bg-warning text-warning-content'
}

function qtyClass(type: string, quantity: number) {
  if (type === 'OUT') return 'text-error'
  if (type === 'ADJUST' && quantity < 0) return 'text-error'
  return 'text-success'
}

function qtyText(type: string, quantity: number) {
  if (type === 'OUT') return `-${Math.abs(quantity)}`
  if (type === 'IN') return `+${Math.abs(quantity)}`
  return quantity > 0 ? `+${quantity}` : `${quantity}`
}
</script>

<template>
  <div
    class="animate-fadeIn space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg"
  >
    <div class="hidden overflow-x-auto rounded-xl border border-base-300 md:block">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wider">
          <tr>
            <th class="min-w-[130px]">Tipo</th>
            <th class="min-w-[260px]">Producto</th>
            <th class="min-w-[150px]">Parte</th>
            <th class="min-w-[100px] text-center">Cantidad</th>
            <th class="min-w-[110px] text-center">Stock final</th>
            <th class="min-w-[220px]">Motivo</th>
            <th class="min-w-[160px]">Referencia</th>
            <th class="min-w-[190px]">Fecha</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="8" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando movimientos…
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="items.length">
          <tr v-for="m in items" :key="m.id" class="transition hover:bg-base-200/40">
            <td>
              <span class="badge border font-semibold" :class="typeBadge(m.type)">
                <Icon
                  :name="
                    m.type === 'IN'
                      ? 'arrow-down-left'
                      : m.type === 'OUT'
                        ? 'arrow-up-right'
                        : 'refresh-cw'
                  "
                  class="h-3 w-3"
                />
                {{ typeLabel(m.type) }}
              </span>
            </td>

            <td>
              <div class="max-w-[340px] truncate font-semibold">
                {{ m.product?.name || m.productId }}
              </div>
            </td>

            <td>
              <div class="text-xs font-medium uppercase tracking-wide text-base-content/70">
                {{ m.product?.partNumber || '—' }}
              </div>
            </td>

            <td class="text-center">
              <span class="text-base font-bold" :class="qtyClass(m.type, m.quantity)">
                {{ qtyText(m.type, m.quantity) }}
              </span>
            </td>

            <td class="text-center">
              <span class="font-semibold">
                {{ m.stockAfter ?? '—' }}
              </span>
            </td>

            <td class="max-w-[260px] truncate" :title="m.reason">
              {{ m.reason || '—' }}
            </td>

            <td>
              <div class="text-xs">
                <span class="font-semibold">{{ m.referenceType || 'manual' }}</span>
                <span v-if="m.referenceId" class="block opacity-60">
                  {{ m.referenceId }}
                </span>
              </div>
            </td>

            <td class="whitespace-nowrap text-xs opacity-70">
              {{ formatDate(m.createdAt) }}
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="8" class="p-10 text-center opacity-70">
              No existen movimientos de inventario
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 md:hidden">
      <div
        v-if="loading"
        class="flex items-center justify-center gap-2 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando movimientos…</span>
      </div>

      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 text-center opacity-70 shadow-sm"
      >
        No existen movimientos de inventario
      </div>

      <div
        v-else
        v-for="m in items"
        :key="m.id"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <span class="badge border font-semibold" :class="typeBadge(m.type)">
            <Icon
              :name="
                m.type === 'IN'
                  ? 'arrow-down-left'
                  : m.type === 'OUT'
                    ? 'arrow-up-right'
                    : 'refresh-cw'
              "
              class="h-3 w-3"
            />
            {{ typeLabel(m.type) }}
          </span>

          <div class="text-xs opacity-60">
            {{ formatDate(m.createdAt) }}
          </div>
        </div>

        <div class="mt-3 space-y-2">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">
              Producto
            </p>
            <p class="font-semibold">{{ m.product?.name || m.productId }}</p>
            <p class="text-xs opacity-60">{{ m.product?.partNumber || '—' }}</p>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm opacity-60">Cantidad</span>
            <span class="text-lg font-bold" :class="qtyClass(m.type, m.quantity)">
              {{ qtyText(m.type, m.quantity) }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm opacity-60">Stock final</span>
            <span class="font-semibold">{{ m.stockAfter ?? '—' }}</span>
          </div>

          <div>
            <span class="text-sm opacity-60">Motivo</span>
            <p class="mt-1">{{ m.reason || '—' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cursor" class="mt-4 flex justify-center">
      <button class="btn btn-outline btn-sm" @click="$emit('load-more')">Cargar más</button>
    </div>
  </div>
</template>
