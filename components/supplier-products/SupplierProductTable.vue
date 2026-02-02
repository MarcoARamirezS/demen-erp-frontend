<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'
import type { SupplierProduct } from '~/types/supplier-product'

defineProps<{
  items: SupplierProduct[]
  loading?: boolean
  canDelete?: boolean
}>()

defineEmits<{ (e: 'delete', id: string): void }>()
</script>

<template>
  <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <div class="overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <!-- =========================
             HEADER
        ========================== -->
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Proveedor</th>
            <th>Producto</th>
            <th>SKU proveedor</th>
            <th class="text-right">Precio vigente</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <!-- =========================
             LOADING
        ========================== -->
        <tbody v-if="loading">
          <tr>
            <td colspan="5" class="p-8 text-center opacity-70">Cargando…</td>
          </tr>
        </tbody>

        <!-- =========================
             ROWS
        ========================== -->
        <tbody v-else-if="items.length">
          <tr v-for="sp in items" :key="sp.id" class="hover:bg-base-200/40">
            <!-- Proveedor -->
            <td class="font-medium">
              {{ sp.supplier?.razonSocial || '—' }}
            </td>

            <!-- Producto -->
            <td>
              {{ sp.product?.nombre || '—' }}
            </td>

            <!-- SKU proveedor -->
            <td class="font-mono text-xs">
              {{ sp.supplierSku || '—' }}
            </td>

            <!-- 🔥 PRECIO VIGENTE -->
            <td class="text-right font-mono text-sm">
              {{ sp.currentPrice.toFixed(2) }}
              <span class="text-xs opacity-60">{{ sp.currency }}</span>
            </td>

            <!-- Acciones -->
            <td class="text-center">
              <button
                v-if="canDelete"
                class="btn btn-circle btn-sm btn-ghost text-error hover:bg-error/10"
                @click="$emit('delete', sp.id)"
              >
                <Icon name="trash" size="sm" />
              </button>
            </td>
          </tr>
        </tbody>

        <!-- =========================
             EMPTY
        ========================== -->
        <tbody v-else>
          <tr>
            <td colspan="5" class="p-10 text-center opacity-70">No hay relaciones registradas</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
