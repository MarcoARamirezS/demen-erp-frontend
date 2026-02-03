<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- Desktop -->
    <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Proveedor</th>
            <th>Producto</th>
            <th>Precio</th>
            <th>MOQ</th>
            <th>Lead time</th>
            <th>Preferido</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="sp in items" :key="sp.id" class="hover">
            <td>
              <div class="font-medium">{{ supplierName(sp.supplierId) }}</div>
              <div class="text-xs opacity-60 font-mono">{{ sp.supplierSku || sp.supplierId }}</div>
            </td>

            <td>
              <div class="font-medium">{{ productName(sp.productId) }}</div>
              <div class="text-xs opacity-60 font-mono">{{ sp.productId }}</div>
            </td>

            <td class="font-mono">{{ sp.currentPrice }} {{ sp.currency }}</td>

            <td>{{ sp.moq }}</td>
            <td>{{ sp.leadTimeDays }} días</td>

            <td>
              <span v-if="sp.preferred" class="badge badge-success">Sí</span>
              <span v-else class="badge badge-ghost">No</span>
            </td>

            <td class="text-right space-x-2">
              <UiButton size="sm" variant="ghost" icon="edit" @click="$emit('edit', sp)" />
              <UiButton size="sm" variant="ghost" icon="trash" @click="$emit('delete', sp)" />
            </td>
          </tr>

          <tr v-if="!loading && items.length === 0">
            <td colspan="7" class="py-10 text-center text-sm opacity-60">
              Sin relaciones registradas
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile -->
    <div class="md:hidden space-y-3">
      <div
        v-for="sp in items"
        :key="sp.id"
        class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-semibold">{{ supplierName(sp.supplierId) }}</div>
            <div class="text-xs opacity-60">{{ productName(sp.productId) }}</div>
          </div>

          <span v-if="sp.preferred" class="badge badge-success">Preferido</span>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-xs opacity-60">Precio</p>
            <p class="font-mono">{{ sp.currentPrice }} {{ sp.currency }}</p>
          </div>
          <div>
            <p class="text-xs opacity-60">MOQ</p>
            <p>{{ sp.moq }}</p>
          </div>
          <div>
            <p class="text-xs opacity-60">Lead time</p>
            <p>{{ sp.leadTimeDays }} días</p>
          </div>
          <div>
            <p class="text-xs opacity-60">Pack</p>
            <p>{{ sp.packSize }}</p>
          </div>
        </div>

        <div class="mt-3 flex justify-end gap-2">
          <UiButton size="sm" variant="ghost" icon="edit" @click="$emit('edit', sp)" />
          <UiButton size="sm" variant="ghost" icon="trash" @click="$emit('delete', sp)" />
        </div>
      </div>

      <div v-if="!loading && items.length === 0" class="py-8 text-center text-sm opacity-60">
        Sin relaciones registradas
      </div>
    </div>

    <!-- Load more -->
    <div class="mt-4 flex justify-center" v-if="hasMore">
      <UiButton size="sm" variant="outline" :loading="loading" @click="$emit('load-more')">
        Cargar más
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'

const props = defineProps<{
  items: any[]
  loading: boolean
  hasMore: boolean
}>()

defineEmits(['edit', 'delete', 'load-more'])

const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()

const suppliersMap = computed(() => new Map(suppliersStore.items.map(s => [s.id, s])))
const productsMap = computed(() => new Map(productsStore.items.map(p => [p.id, p])))

function supplierName(id: string) {
  return suppliersMap.value.get(id)?.name ?? id
}

function productName(id: string) {
  return productsMap.value.get(id)?.name ?? id
}
</script>
