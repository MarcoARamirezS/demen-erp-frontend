<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import type { Product } from '~/types/product'

const props = defineProps<{
  items: Product[]
  loading?: boolean
  canRead?: boolean
}>()

defineEmits<{
  (e: 'edit', product: Product): void
}>()

const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

/* =========================
   FILTER
========================= */
const filtered = computed(() => {
  const term = search.value.toLowerCase()
  return (props.items || []).filter(p => {
    if (!term) return true
    return `${p.sku} ${p.name}`.toLowerCase().includes(term)
  })
})

/* =========================
   PAGINATION
========================= */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / itemsPerPage.value))
)

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filtered.value.slice(start, start + itemsPerPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() =>
  Math.min(startIndex.value + paginated.value.length, filtered.value.length)
)

const visiblePages = computed(() => {
  const delta = 2
  const start = Math.max(1, currentPage.value - delta)
  const end = Math.min(totalPages.value, currentPage.value + delta)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const setPage = (p: number) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}
const nextPage = () => setPage(currentPage.value + 1)
const prevPage = () => setPage(currentPage.value - 1)

watch(search, () => (currentPage.value = 1))

const resetFilters = () => {
  search.value = ''
  currentPage.value = 1
}
</script>

<template>
  <div
    class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg space-y-4"
  >
    <!-- =========================
         FILTERS (MOBILE)
    ========================== -->
    <details class="md:hidden rounded-xl border border-base-300 bg-base-200 p-4">
      <summary class="flex items-center gap-2 cursor-pointer font-semibold text-sm">
        <Icon name="filter" size="sm" />
        Filtros
      </summary>

      <div class="mt-4 space-y-3">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por SKU o nombre..."
          class="input input-sm input-bordered w-full"
        />

        <button class="btn btn-sm btn-outline w-full" @click="resetFilters">Limpiar filtros</button>
      </div>
    </details>

    <!-- =========================
         FILTERS (DESKTOP)
    ========================== -->
    <div
      class="hidden md:flex items-center gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
    >
      <div class="relative w-72">
        <span class="absolute left-3 top-2.5 opacity-50">
          <Icon name="search" class="h-4 w-4" />
        </span>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por SKU o nombre..."
          class="input input-sm input-bordered w-full pl-9"
        />
      </div>

      <button class="btn btn-sm btn-outline" @click="resetFilters">Limpiar</button>
    </div>

    <!-- =========================
         DESKTOP TABLE
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-8 text-center opacity-70">Cargando…</td>
          </tr>
        </tbody>

        <tbody v-else-if="paginated.length">
          <tr v-for="p in paginated" :key="p.id" class="hover:bg-base-200/40">
            <td class="font-mono text-xs">{{ p.sku }}</td>
            <td>{{ p.name }}</td>

            <td class="text-center">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="p.active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
              >
                <span class="h-2 w-2 rounded-full" :class="p.active ? 'bg-success' : 'bg-error'" />
                {{ p.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="text-center">
              <div class="tooltip" data-tip="Editar producto">
                <button
                  class="btn btn-circle btn-sm btn-ghost"
                  :disabled="!canRead"
                  @click="$emit('edit', p)"
                >
                  <Icon name="eye" size="sm" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="4" class="p-8 text-center opacity-70">No hay resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
         MOBILE CARDS
    ========================== -->
    <div class="md:hidden space-y-4">
      <div
        v-for="p in paginated"
        :key="p.id"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm space-y-2"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="font-semibold">{{ p.name }}</div>
            <div class="text-xs font-mono opacity-60">{{ p.sku }}</div>
          </div>

          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            :class="p.active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
          >
            <span class="h-2 w-2 rounded-full" :class="p.active ? 'bg-success' : 'bg-error'" />
            {{ p.active ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="flex justify-end">
          <button
            class="btn btn-circle btn-sm btn-ghost"
            :disabled="!canRead"
            @click="$emit('edit', p)"
          >
            <Icon name="eye" size="sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- =========================
         PAGINATION
    ========================== -->
    <div v-if="totalPages > 1" class="flex flex-col items-center gap-2 pt-2">
      <p class="text-xs opacity-60">
        Mostrando {{ startIndex + 1 }}–{{ endIndex }} de {{ filtered.length }}
      </p>

      <div class="join">
        <button class="btn btn-sm join-item" :disabled="currentPage === 1" @click="prevPage">
          «
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          class="btn btn-sm join-item"
          :class="p === currentPage ? 'btn-primary' : ''"
          @click="setPage(p)"
        >
          {{ p }}
        </button>

        <button
          class="btn btn-sm join-item"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>
