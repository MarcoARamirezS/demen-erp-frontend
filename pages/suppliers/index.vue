<script setup lang="ts">
import { onMounted } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'

import { useSuppliersStore } from '~/stores/suppliers.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

const suppliersStore = useSuppliersStore()
const auth = useAuthStore()
const ui = useUiStore()

onMounted(() => {
  suppliersStore.fetch()
})

async function removeSupplier(id: string) {
  const ok = await ui.confirm({
    title: 'Dar de baja proveedor',
    message: 'El proveedor quedará inactivo. ¿Deseas continuar?',
    confirmText: 'Dar de baja',
    confirmVariant: 'danger',
  })

  if (!ok) return
  await suppliersStore.remove(id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Proveedores</h1>
        <p class="text-sm opacity-60">Catálogo de proveedores del sistema</p>
      </div>

      <UiButton v-if="auth.hasPermission('suppliers:create')" variant="primary">
        Nuevo proveedor
      </UiButton>
    </header>

    <!-- TABLE -->
    <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
      <div class="overflow-x-auto rounded-xl border border-base-300">
        <table class="table w-full text-sm">
          <thead class="bg-base-200 text-xs uppercase tracking-wide">
            <tr>
              <th>Proveedor</th>
              <th>Contacto</th>
              <th class="text-center">Estado</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody v-if="suppliersStore.loading">
            <tr>
              <td colspan="4" class="p-8 text-center opacity-70">Cargando proveedores…</td>
            </tr>
          </tbody>

          <tbody v-else-if="suppliersStore.items.length" class="divide-y divide-base-300">
            <tr
              v-for="s in suppliersStore.items"
              :key="s.id"
              class="hover:bg-base-200/40 transition"
            >
              <td class="font-medium">
                {{ s.nombre }}
              </td>

              <td class="text-sm opacity-80">
                {{ s.contacto ?? '—' }}
              </td>

              <td class="text-center">
                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="s.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
                >
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="s.activo ? 'bg-success' : 'bg-error'"
                  />
                  {{ s.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>

              <td class="text-center">
                <div class="flex justify-center gap-2">
                  <button
                    v-if="auth.hasPermission('suppliers:delete')"
                    class="btn btn-circle btn-sm btn-ghost text-error hover:bg-error/10"
                    data-tip="Dar de baja"
                    @click="removeSupplier(s.id)"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td colspan="4" class="p-10 text-center opacity-70">
                No hay proveedores registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
