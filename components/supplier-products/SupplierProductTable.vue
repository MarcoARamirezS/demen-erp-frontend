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
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Proveedor</th>
            <th>Producto</th>
            <th>SKU proveedor</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-8 text-center">Cargando…</td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="sp in items" :key="sp.id" class="hover:bg-base-200/40">
            <td>{{ sp.supplier?.razonSocial }}</td>
            <td>{{ sp.product?.name }}</td>
            <td class="font-mono text-xs">{{ sp.supplierSku || '—' }}</td>
            <td class="text-center">
              <button
                v-if="canDelete"
                class="btn btn-circle btn-sm btn-ghost text-error"
                @click="$emit('delete', sp.id)"
              >
                <Icon name="trash" size="sm" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
