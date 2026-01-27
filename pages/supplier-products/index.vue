<script setup lang="ts">
import { onMounted } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'

import { useSupplierProductsStore } from '~/stores/supplierProducts.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

const supplierProductsStore = useSupplierProductsStore()
const auth = useAuthStore()
const ui = useUiStore()

onMounted(() => {
  supplierProductsStore.fetch()
})

async function removeRelation(id: string) {
  const ok = await ui.confirm({
    title: 'Eliminar relación',
    message: 'Se eliminará la relación proveedor–producto.',
    confirmText: 'Eliminar',
    confirmVariant: 'danger',
  })

  if (!ok) return
  await supplierProductsStore.remove(id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Productos por proveedor</h1>
        <p class="text-sm opacity-60">Relación entre proveedores y productos</p>
      </div>

      <UiButton v-if="auth.hasPermission('supplier_products:create')" variant="primary">
        Nueva relación
      </UiButton>
    </header>

    <!-- TABLE -->
    <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
      <div class="overflow-x-auto rounded-xl border border-base-300">
        <table class="table w-full text-sm">
          <thead class="bg-base-200 text-xs uppercase tracking-wide">
            <tr>
              <th>Proveedor</th>
              <th>Producto</th>
              <th class="text-center">Código proveedor</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody v-if="supplierProductsStore.loading">
            <tr>
              <td colspan="4" class="p-8 text-center opacity-70">Cargando relaciones…</td>
            </tr>
          </tbody>

          <tbody v-else-if="supplierProductsStore.items.length" class="divide-y divide-base-300">
            <tr
              v-for="sp in supplierProductsStore.items"
              :key="sp.id"
              class="hover:bg-base-200/40 transition"
            >
              <td class="font-medium">
                {{ sp.supplier.nombre }}
              </td>

              <td>
                {{ sp.product.nombre }}
              </td>

              <td class="text-center font-mono text-xs">
                {{ sp.supplierSku ?? '—' }}
              </td>

              <td class="text-center">
                <div class="flex justify-center gap-2">
                  <button
                    v-if="auth.hasPermission('supplier_products:delete')"
                    class="btn btn-circle btn-sm btn-ghost text-error hover:bg-error/10"
                    data-tip="Eliminar relación"
                    @click="removeRelation(sp.id)"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td colspan="4" class="p-10 text-center opacity-70">No hay relaciones registradas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
