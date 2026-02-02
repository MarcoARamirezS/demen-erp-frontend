<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'
import { formatDateTime } from '~/utils/dates'
import type { SupplierProductPrice } from '~/stores/supplierProductPrices.store'

defineProps<{
  items: SupplierProductPrice[]
  loading?: boolean
}>()
</script>

<template>
  <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- DESKTOP TABLE -->
    <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Desde</th>
            <th>Hasta</th>
            <th class="text-right">Precio</th>
            <th class="text-center">Estado</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-8 text-center opacity-70">Cargando precios…</td>
          </tr>
        </tbody>

        <tbody v-else-if="items.length">
          <tr v-for="p in items" :key="p.id" class="hover:bg-base-200/40">
            <td>{{ formatDateTime(p.validFrom) }}</td>
            <td>{{ p.validTo ? formatDateTime(p.validTo) : '—' }}</td>
            <td class="text-right font-mono">{{ p.cost.toFixed(2) }} {{ p.currency }}</td>
            <td class="text-center">
              <span class="badge" :class="p.active ? 'badge-success' : 'badge-outline'">
                {{ p.active ? 'Vigente' : 'Histórico' }}
              </span>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="4" class="p-8 text-center opacity-70">No hay precios registrados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARDS -->
    <div class="md:hidden space-y-3">
      <div
        v-for="p in items"
        :key="p.id"
        class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="font-mono text-sm">{{ p.cost.toFixed(2) }} {{ p.currency }}</div>
            <div class="text-xs opacity-60">Desde {{ formatDateTime(p.validFrom) }}</div>
          </div>

          <span class="badge" :class="p.active ? 'badge-success' : 'badge-outline'">
            {{ p.active ? 'Vigente' : 'Histórico' }}
          </span>
        </div>

        <div v-if="p.validTo" class="text-xs opacity-60 mt-1">
          Hasta {{ formatDateTime(p.validTo) }}
        </div>
      </div>
    </div>
  </div>
</template>
