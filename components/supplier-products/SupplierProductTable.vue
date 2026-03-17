<template>
  <div
    class="animate-fadeIn space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg"
  >
    <!-- =========================
    FILTERS
    ========================== -->

    <div
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
    >
      <div class="flex items-center gap-3">
        <div class="relative">
          <Icon name="search" class="absolute left-3 top-2.5 h-4 w-4 opacity-50" />

          <input
            v-model="search"
            placeholder="Buscar proveedor o producto..."
            class="input input-sm input-bordered w-44 md:w-60 lg:w-72 pl-9"
          />
        </div>

        <button v-if="search" class="btn btn-sm btn-outline" @click="search = ''">Limpiar</button>
      </div>

      <div class="text-xs opacity-70">{{ filtered.length }} relaciones</div>
    </div>

    <!-- =========================
    TABLE DESKTOP
    ========================== -->

    <!-- FIX: md -> lg para evitar mala vista en iPad -->

    <div class="hidden lg:block overflow-x-auto w-full">
      <table
        class="table w-full min-w-[1000px] xl:min-w-[1100px] text-sm border border-base-300 rounded-xl overflow-hidden"
      >
        <thead class="bg-base-200 text-xs uppercase tracking-wider">
          <tr>
            <th class="min-w-[240px]">Proveedor</th>

            <th class="min-w-[240px]">Producto</th>

            <th class="cursor-pointer whitespace-nowrap" @click="toggleSort">
              Precio
              <Icon
                name="chevron-down"
                class="inline ml-1 w-3 h-3"
                :class="{ 'rotate-180': sortDesc }"
              />
            </th>

            <th class="whitespace-nowrap">MOQ</th>

            <th class="whitespace-nowrap">Lead</th>

            <th class="text-center whitespace-nowrap">Preferido</th>

            <th class="text-right w-[120px] whitespace-nowrap">Acciones</th>
          </tr>
        </thead>

        <!-- LOADING -->

        <tbody v-if="loading">
          <tr>
            <td colspan="7" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2"></span>
              Cargando relaciones…
            </td>
          </tr>
        </tbody>

        <!-- EMPTY -->

        <tbody v-else-if="!filtered.length">
          <tr>
            <td colspan="7" class="p-10 text-center opacity-70">Sin relaciones registradas</td>
          </tr>
        </tbody>

        <!-- ROWS -->

        <tbody v-else>
          <tr v-for="sp in sorted" :key="sp.id" class="hover:bg-base-200/40 transition">
            <!-- PROVEEDOR -->

            <td>
              <div class="font-semibold truncate max-w-[360px]">
                {{ supplierName(sp.supplierId) }}
              </div>

              <div class="text-xs opacity-60 font-mono truncate max-w-[360px]">
                {{ sp.supplierSku || sp.supplierId }}
              </div>
            </td>

            <!-- PRODUCTO -->

            <td>
              <div class="font-semibold truncate max-w-[360px]">
                {{ productName(sp.productId) }}
              </div>

              <div class="text-xs opacity-60 font-mono truncate max-w-[360px]">
                {{ sp.productId }}
              </div>
            </td>

            <!-- PRECIO -->

            <td class="font-mono whitespace-nowrap">
              <span :class="sp.preferred ? 'text-success font-semibold' : ''">
                {{ sp.currentPrice }} {{ sp.currency }}
              </span>
            </td>

            <!-- MOQ -->

            <td class="whitespace-nowrap">
              {{ sp.moq }}
            </td>

            <!-- LEAD -->

            <td class="whitespace-nowrap">{{ sp.leadTimeDays }} días</td>

            <!-- PREFERRED -->

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

            <!-- ACTIONS -->

            <td class="text-right">
              <div class="flex justify-end gap-2">
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
      </table>
    </div>

    <!-- =========================
    MOBILE + TABLET CARDS
    ========================== -->

    <!-- FIX: md:hidden -> lg:hidden -->

    <div class="lg:hidden space-y-3">
      <div
        v-for="sp in sorted"
        :key="sp.id"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="font-semibold">
              {{ supplierName(sp.supplierId) }}
            </div>

            <div class="text-xs opacity-60">
              {{ productName(sp.productId) }}
            </div>
          </div>

          <span
            class="badge badge-outline"
            :class="
              sp.preferred ? 'bg-success/15 text-success' : 'bg-base-200 text-base-content/60'
            "
          >
            {{ sp.preferred ? 'Preferido' : 'Normal' }}
          </span>
        </div>

        <div class="mt-3 text-sm space-y-1">
          <div>
            <span class="opacity-60">Precio:</span>
            <span class="font-mono ml-1"> {{ sp.currentPrice }} {{ sp.currency }} </span>
          </div>

          <div>
            <span class="opacity-60">MOQ:</span>
            {{ sp.moq }}
          </div>

          <div>
            <span class="opacity-60">Lead:</span>
            {{ sp.leadTimeDays }} días
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button class="btn btn-sm btn-outline flex-1" @click="$emit('edit', sp)">
            <Icon name="edit" />
            Editar
          </button>

          <button class="btn btn-sm btn-outline btn-error flex-1" @click="$emit('delete', sp)">
            <Icon name="trash" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '~/components/ui/Icon.vue'

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

const search = ref('')
const sortDesc = ref(false)

/* =========================
MAPS
========================= */

const suppliersMap = computed(() => new Map(suppliersStore.items.map(s => [s.id, s])))

const productsMap = computed(() => new Map(productsStore.items.map(p => [p.id, p])))

function supplierName(id: string) {
  return suppliersMap.value.get(id)?.name ?? id
}

function productName(id: string) {
  return productsMap.value.get(id)?.name ?? id
}

/* =========================
SEARCH
========================= */

const filtered = computed(() => {
  if (!search.value) return props.items

  const q = search.value.toLowerCase()

  return props.items.filter(
    sp =>
      supplierName(sp.supplierId).toLowerCase().includes(q) ||
      productName(sp.productId).toLowerCase().includes(q)
  )
})

/* =========================
SORT
========================= */

function toggleSort() {
  sortDesc.value = !sortDesc.value
}

const sorted = computed(() => {
  return [...filtered.value].sort((a, b) => {
    const diff = a.currentPrice - b.currentPrice
    return sortDesc.value ? -diff : diff
  })
})
</script>
