<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th class="min-w-[260px]">Proveedor</th>
            <th class="min-w-[260px]">Producto</th>
            <th class="min-w-[160px]">Precio</th>
            <th class="min-w-[100px]">MOQ</th>
            <th class="min-w-[140px]">Lead time</th>
            <th class="min-w-[120px] text-center">Preferido</th>
            <th class="w-[120px] text-center">Acciones</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr>
            <td colspan="7" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando relaciones…
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else-if="items.length">
          <tr v-for="sp in items" :key="sp.id" class="hover:bg-base-200/40 transition">
            <!-- Proveedor -->
            <td>
              <div class="font-semibold truncate max-w-[360px]">
                {{ supplierName(sp.supplierId) }}
              </div>
              <div class="text-xs opacity-60 font-mono truncate max-w-[360px]">
                {{ sp.supplierSku || sp.supplierId }}
              </div>
            </td>

            <!-- Producto -->
            <td>
              <div class="font-semibold truncate max-w-[360px]">
                {{ productName(sp.productId) }}
              </div>
              <div class="text-xs opacity-60 font-mono truncate max-w-[360px]">
                {{ sp.productId }}
              </div>
            </td>

            <!-- Precio -->
            <td class="font-mono whitespace-nowrap">{{ sp.currentPrice }} {{ sp.currency }}</td>

            <!-- MOQ -->
            <td>
              {{ sp.moq }}
            </td>

            <!-- Lead time -->
            <td>{{ sp.leadTimeDays }} días</td>

            <!-- Preferido -->
            <td class="text-center">
              <span
                class="badge badge-outline"
                :class="
                  sp.preferred ? 'bg-success/15 text-success' : 'bg-base-200 text-base-content/60'
                "
              >
                {{ sp.preferred ? 'Sí' : 'No' }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="text-center">
              <div class="flex items-center justify-center gap-1">
                <div class="tooltip" data-tip="Editar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="$emit('edit', sp)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div class="tooltip" data-tip="Eliminar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-error"
                    @click="$emit('delete', sp)"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else>
          <tr>
            <td colspan="7" class="p-10 text-center opacity-70">Sin relaciones registradas</td>
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
        <span class="text-sm opacity-70">Cargando relaciones…</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        Sin relaciones registradas
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="sp in items"
        :key="sp.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="font-semibold truncate">
              {{ supplierName(sp.supplierId) }}
            </div>
            <div class="text-xs opacity-60 truncate mt-1">
              {{ productName(sp.productId) }}
            </div>
          </div>

          <span
            class="badge badge-outline shrink-0"
            :class="
              sp.preferred ? 'bg-success/15 text-success' : 'bg-base-200 text-base-content/60'
            "
          >
            {{ sp.preferred ? 'Preferido' : 'Normal' }}
          </span>
        </div>

        <!-- Body -->
        <div class="mt-3 space-y-2 text-sm">
          <div>
            <span class="opacity-60">Precio:</span>
            <span class="font-mono ml-1"> {{ sp.currentPrice }} {{ sp.currency }} </span>
          </div>

          <div>
            <span class="opacity-60">MOQ:</span>
            {{ sp.moq }}
          </div>

          <div>
            <span class="opacity-60">Lead time:</span>
            {{ sp.leadTimeDays }} días
          </div>

          <div v-if="sp.packSize">
            <span class="opacity-60">Pack:</span>
            {{ sp.packSize }}
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex gap-2">
          <button class="btn btn-sm btn-outline flex-1" @click="$emit('edit', sp)">
            <Icon name="edit" size="sm" />
            Editar
          </button>

          <button class="btn btn-sm btn-outline btn-error flex-1" @click="$emit('delete', sp)">
            <Icon name="trash" size="sm" />
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- =========================
         LOAD MORE
    ========================== -->
    <div v-if="hasMore" class="mt-4 flex justify-center">
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
