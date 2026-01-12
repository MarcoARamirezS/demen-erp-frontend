<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useClientsStore } from '~/stores/clients.store'
import Icon from '~/components/ui/Icon.vue'

const clientsStore = useClientsStore()

/* =======================
   STATE
======================= */
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

/* =======================
   FETCH
======================= */
clientsStore.reset()
clientsStore.fetch(itemsPerPage.value)

/* =======================
   FILTERED
======================= */
const filtered = computed(() => {
  const term = search.value.toLowerCase()

  return clientsStore.items.filter(
    c =>
      !term ||
      c.razonSocial.toLowerCase().includes(term) ||
      c.nombreComercial?.toLowerCase().includes(term) ||
      c.rfc?.toLowerCase().includes(term)
  )
})

/* =======================
   PAGINATION
======================= */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / itemsPerPage.value))
)

const paginated = computed(() =>
  filtered.value.slice(
    (currentPage.value - 1) * itemsPerPage.value,
    currentPage.value * itemsPerPage.value
  )
)

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + paginated.value.length)

const visiblePages = computed(() => {
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const setPage = (p: number) => (currentPage.value = p)
const nextPage = () => setPage(currentPage.value + 1)
const prevPage = () => setPage(currentPage.value - 1)

/* =======================
   WATCH
======================= */
watch([search, itemsPerPage], () => {
  currentPage.value = 1
})

/* =======================
   ACTIONS
======================= */
function goToClient(id: string) {
  navigateTo(`/clients/${id}`)
}

function resetFilters() {
  search.value = ''
  currentPage.value = 1
}
</script>

<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =======================
         FILTROS
    ======================== -->
    <div
      class="mb-4 flex flex-col gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <!-- Buscar -->
        <div class="relative w-full md:w-80">
          <span class="pointer-events-none absolute left-3 top-2.5 opacity-50">
            <Icon name="search" class="h-4 w-4" />
          </span>

          <input
            v-model="search"
            type="text"
            placeholder="Buscar por razón social, nombre o RFC..."
            class="input input-sm input-bordered w-full pl-9"
          />
        </div>

        <!-- Limpiar -->
        <button class="btn btn-sm" type="button" @click="resetFilters">
          <Icon name="x" class="h-4 w-4" />
          Limpiar
        </button>
      </div>

      <!-- Por página -->
      <div class="flex items-center gap-2 text-xs opacity-70 md:justify-end">
        <span class="font-medium">Mostrar:</span>
        <select v-model.number="itemsPerPage" class="select select-xs select-bordered">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
        <span>por página</span>
      </div>
    </div>

    <!-- =======================
         TABLA DESKTOP
    ======================== -->
    <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wide text-base-content/70">
          <tr>
            <th class="px-4 py-3">Razón social</th>
            <th class="px-4 py-3">RFC</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3 text-center">Estado</th>
            <th class="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="clientsStore.loading">
          <tr>
            <td colspan="5" class="p-8 text-center text-base-content/60">Cargando clientes…</td>
          </tr>
        </tbody>

        <tbody v-else-if="paginated.length" class="divide-y divide-base-300">
          <tr v-for="c in paginated" :key="c.id" class="transition hover:bg-base-200/40">
            <td class="px-4 py-3 font-semibold">
              {{ c.razonSocial }}
              <div v-if="c.nombreComercial" class="text-xs opacity-60">
                {{ c.nombreComercial }}
              </div>
            </td>

            <td class="px-4 py-3">{{ c.rfc || '—' }}</td>
            <td class="px-4 py-3">{{ c.email || '—' }}</td>

            <td class="px-4 py-3 text-center">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="c.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
              >
                <span class="h-2 w-2 rounded-full" :class="c.activo ? 'bg-success' : 'bg-error'" />
                {{ c.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center">
                <button
                  type="button"
                  class="btn btn-circle btn-sm btn-ghost text-primary hover:bg-primary/10"
                  data-tip="Ver cliente"
                  @click="goToClient(c.id)"
                >
                  <Icon name="eye" size="sm" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="5" class="p-8 text-center text-base-content/60">
              No hay resultados con los filtros actuales.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =======================
         CARDS MOBILE
    ======================== -->
    <div class="grid gap-3 md:hidden">
      <div
        v-for="c in paginated"
        :key="c.id"
        class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold">{{ c.razonSocial }}</p>
            <p class="text-sm opacity-60">{{ c.rfc || 'Sin RFC' }}</p>
          </div>

          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            :class="c.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
          >
            <span class="h-2 w-2 rounded-full" :class="c.activo ? 'bg-success' : 'bg-error'" />
            {{ c.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="mt-3 flex justify-end">
          <button
            type="button"
            class="btn btn-circle btn-sm btn-ghost text-primary"
            @click="goToClient(c.id)"
          >
            <Icon name="eye" size="sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- =======================
         PAGINACIÓN
    ======================== -->
    <div class="mt-4 flex flex-col items-center justify-center gap-3">
      <p class="text-xs opacity-70">
        Mostrando {{ startIndex + 1 }}–{{ endIndex }} de {{ filtered.length }}
      </p>

      <div class="join">
        <button class="btn join-item btn-sm" :disabled="currentPage === 1" @click="prevPage">
          «
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          class="btn join-item btn-sm"
          :class="p === currentPage ? 'btn-primary' : ''"
          @click="setPage(p)"
        >
          {{ p }}
        </button>

        <button
          class="btn join-item btn-sm"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>
