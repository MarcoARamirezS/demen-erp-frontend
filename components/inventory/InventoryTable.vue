<script setup lang="ts">
import type { InventoryMovement } from '~/types/inventory-movement'
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  items: InventoryMovement[]
  loading: boolean
  cursor: string | null
}>()

defineEmits<{
  (e: 'load-more'): void
}>()

/* =========================
   FORMAT DATE (Firestore Safe)
========================= */
function formatDate(date: any) {
  if (!date) return '—'

  // Caso Firestore Timestamp plano (_seconds)
  if (date._seconds) {
    const d = new Date(date._seconds * 1000)
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Caso Timestamp con toDate()
  if (typeof date?.toDate === 'function') {
    return date.toDate().toLocaleString('es-MX')
  }

  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'

  return d.toLocaleString('es-MX')
}

/* =========================
   TYPE BADGE
========================= */
const typeBadge = (type: string) => {
  if (type === 'IN') return 'badge-success'
  if (type === 'OUT') return 'badge-error'
  return 'badge-warning'
}
</script>

<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wide">
          <tr>
            <th class="min-w-[140px]">Tipo</th>
            <th class="min-w-[260px]">Producto</th>
            <th class="min-w-[120px]">Cantidad</th>
            <th class="min-w-[220px]">Motivo</th>
            <th class="min-w-[200px]">Fecha</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr>
            <td colspan="5" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando movimientos…
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else-if="items.length">
          <tr
            v-for="m in items"
            :key="m.id"
            class="border-b border-base-200 hover:bg-base-200/30 transition"
          >
            <!-- Tipo -->
            <td>
              <span class="badge gap-1 badge-outline" :class="typeBadge(m.type)">
                <Icon :name="m.type === 'IN' ? 'arrow-down' : 'arrow-up'" class="w-3 h-3" />
                {{ m.type }}
              </span>
            </td>

            <!-- Producto -->
            <td>
              <div class="flex flex-col">
                <span class="font-medium truncate">
                  {{ m.product?.name || m.productId }}
                </span>
              </div>
            </td>

            <!-- Cantidad -->
            <td>
              <span class="font-bold" :class="m.type === 'OUT' ? 'text-error' : 'text-success'">
                {{ m.type === 'OUT' ? '-' : '+' }}{{ m.quantity }}
              </span>
            </td>

            <!-- Motivo -->
            <td class="truncate max-w-[320px]" :title="m.reason">
              {{ m.reason || '—' }}
            </td>

            <!-- Fecha -->
            <td class="text-xs opacity-70 whitespace-nowrap">
              {{ formatDate(m.createdAt) }}
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else>
          <tr>
            <td colspan="5" class="p-10 text-center opacity-70">
              No existen movimientos de inventario
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
         MOBILE CARDS (<md)
    ========================== -->
    <div class="md:hidden space-y-3">
      <!-- Loading -->
      <div
        v-if="loading"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center justify-center gap-2"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando movimientos…</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        No existen movimientos de inventario
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="m in items"
        :key="m.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <span class="badge gap-1 badge-outline" :class="typeBadge(m.type)">
            <Icon :name="m.type === 'IN' ? 'arrow-down' : 'arrow-up'" class="w-3 h-3" />
            {{ m.type }}
          </span>

          <div class="text-xs opacity-60">
            {{ formatDate(m.createdAt) }}
          </div>
        </div>

        <!-- Body -->
        <div class="mt-3 space-y-2 text-sm">
          <div>
            <span class="opacity-60">Producto:</span>
            <div class="font-mono text-xs break-all mt-1">
              {{ m.product?.name || m.productId }}
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span class="opacity-60">Cantidad:</span>
            <span
              class="text-lg font-bold"
              :class="m.type === 'OUT' ? 'text-error' : 'text-success'"
            >
              {{ m.type === 'OUT' ? '-' : '+' }}{{ m.quantity }}
            </span>
          </div>

          <div v-if="m.reason">
            <span class="opacity-60">Motivo:</span>
            <div class="mt-1">{{ m.reason }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================
         LOAD MORE
    ========================== -->
    <div v-if="cursor" class="mt-4 flex justify-center">
      <UiButton size="sm" outline @click="$emit('load-more')"> Cargar más </UiButton>
    </div>
  </div>
</template>
