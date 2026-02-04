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

const typeBadge = (type: string) => {
  if (type === 'IN') return 'badge-success'
  if (type === 'OUT') return 'badge-error'
  return 'badge-warning'
}
</script>

<template>
  <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <div v-if="loading" class="text-center py-6 opacity-60">Cargando…</div>

    <div v-else-if="items.length === 0" class="text-center py-10 opacity-60">
      No existen movimientos de inventario
    </div>

    <div v-else class="overflow-x-auto">
      <table class="table table-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Tipo</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Motivo</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in items" :key="m.id" class="hover:bg-base-200/40">
            <td>
              <span class="badge badge-outline" :class="typeBadge(m.type)">
                {{ m.type }}
              </span>
            </td>
            <td class="font-mono text-xs">{{ m.productId }}</td>
            <td class="font-semibold">{{ m.quantity }}</td>
            <td>{{ m.reason }}</td>
            <td class="text-xs opacity-70">
              {{ new Date(m.createdAt?.toDate?.() ?? m.createdAt).toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="cursor" class="flex justify-center mt-4">
        <UiButton size="sm" outline @click="$emit('load-more')"> Cargar más </UiButton>
      </div>
    </div>
  </div>
</template>
