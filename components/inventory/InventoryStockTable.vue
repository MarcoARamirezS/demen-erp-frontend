<script setup lang="ts">
import type { InventoryStockItem } from '~/types/inventory'
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  items: InventoryStockItem[]
  loading: boolean
  cursor: string | null
}>()

defineEmits<{
  (e: 'load-more'): void
}>()

function stockBadge(status: InventoryStockItem['stockStatus']) {
  if (status === 'OUT') return 'border-error bg-error text-error-content'
  if (status === 'LOW') return 'border-warning bg-warning text-warning-content'
  return 'border-success bg-success text-success-content'
}

function stockLabel(status: InventoryStockItem['stockStatus']) {
  if (status === 'OUT') return 'Sin existencias'
  if (status === 'LOW') return 'Stock bajo'
  return 'Disponible'
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
            <th class="min-w-[280px]">Producto</th>
            <th class="min-w-[150px]">Parte</th>
            <th class="min-w-[140px]">Ubicación</th>
            <th class="min-w-[120px] text-center">Existencia</th>
            <th class="min-w-[100px] text-center">Mínimo</th>
            <th class="min-w-[100px] text-center">Máximo</th>
            <th class="min-w-[170px] text-center">Estado</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="7" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando existencias…
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="items.length">
          <tr v-for="p in items" :key="p.id" class="transition hover:bg-base-200/40">
            <td>
              <div class="max-w-[360px] truncate font-semibold">
                {{ p.name }}
              </div>

              <div class="text-xs opacity-60">
                {{ p.internalCode || '—' }}
              </div>
            </td>

            <td class="font-medium uppercase tracking-wide">
              {{ p.partNumber || '—' }}
            </td>

            <td>
              {{ p.location || '—' }}
            </td>

            <td class="text-center">
              <span
                class="inline-flex min-w-[64px] justify-center rounded-full px-3 py-1 text-sm font-bold"
                :class="
                  p.stockStatus === 'OUT'
                    ? 'bg-error/10 text-error'
                    : p.stockStatus === 'LOW'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-success/10 text-success'
                "
              >
                {{ p.stockOnHand }}
              </span>
            </td>

            <td class="text-center">{{ p.stockMin }}</td>
            <td class="text-center">{{ p.stockMax }}</td>

            <td class="text-center">
              <span class="badge border font-semibold" :class="stockBadge(p.stockStatus)">
                <Icon
                  :name="
                    p.stockStatus === 'OUT'
                      ? 'package-x'
                      : p.stockStatus === 'LOW'
                        ? 'triangle-alert'
                        : 'badge-check'
                  "
                  class="h-3 w-3"
                />
                {{ stockLabel(p.stockStatus) }}
              </span>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="7" class="p-10 text-center opacity-70">
              No existen productos para mostrar
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
        <span class="text-sm opacity-70">Cargando existencias…</span>
      </div>

      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 text-center opacity-70 shadow-sm"
      >
        No existen productos para mostrar
      </div>

      <div
        v-else
        v-for="p in items"
        :key="p.id"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ p.name }}</p>
            <p class="truncate text-xs opacity-60">{{ p.partNumber || '—' }}</p>
          </div>

          <span class="badge border font-semibold" :class="stockBadge(p.stockStatus)">
            {{ stockLabel(p.stockStatus) }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-xl bg-base-200/60 p-3">
            <p class="text-xs uppercase tracking-wide opacity-60">Existencia</p>
            <p class="mt-1 text-lg font-bold">{{ p.stockOnHand }}</p>
          </div>

          <div class="rounded-xl bg-base-200/60 p-3">
            <p class="text-xs uppercase tracking-wide opacity-60">Ubicación</p>
            <p class="mt-1 font-medium">{{ p.location || '—' }}</p>
          </div>

          <div class="rounded-xl bg-base-200/60 p-3">
            <p class="text-xs uppercase tracking-wide opacity-60">Mínimo</p>
            <p class="mt-1 font-medium">{{ p.stockMin }}</p>
          </div>

          <div class="rounded-xl bg-base-200/60 p-3">
            <p class="text-xs uppercase tracking-wide opacity-60">Máximo</p>
            <p class="mt-1 font-medium">{{ p.stockMax }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cursor" class="mt-4 flex justify-center">
      <button class="btn btn-outline btn-sm" @click="$emit('load-more')">Cargar más</button>
    </div>
  </div>
</template>
