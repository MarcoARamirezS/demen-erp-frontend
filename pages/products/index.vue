<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useProductsStore } from '~/stores/products.store'
import Icon from '~/components/ui/Icon.vue'

const auth = useAuthStore()
const products = useProductsStore()

onMounted(() => {
  products.reset()
  products.fetch()
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Productos</h1>
        <p class="text-sm text-base-content/60">Catálogo de productos (sin inventario)</p>
      </div>

      <UiButton v-if="auth.hasPermission('products:create')" variant="primary">
        Nuevo producto
      </UiButton>
    </header>

    <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
      <table class="table w-full">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="products.loading">
          <tr>
            <td colspan="4" class="p-8 text-center">Cargando…</td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="p in products.items" :key="p.id">
            <td class="font-mono text-xs">{{ p.sku }}</td>
            <td>{{ p.name }}</td>
            <td class="text-center">
              {{ p.active ? 'Activo' : 'Inactivo' }}
            </td>
            <td class="text-center">
              <Icon name="eye" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
