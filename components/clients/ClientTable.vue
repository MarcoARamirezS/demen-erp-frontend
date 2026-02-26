<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useClientsStore } from '~/stores/clients.store'
import Icon from '~/components/ui/Icon.vue'
import { useUiStore } from '~/stores/ui.store'

const ui = useUiStore()
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

async function toggleClient(client: any) {
  console.log('Toggling client', client.id, 'Current status:', client.activo)
  const newStatus = !client.activo

  if (client.activo) {
    const ok = await ui.confirm({
      title: 'Desactivar cliente',
      message: `¿Seguro que deseas desactivar a "${client.razonSocial}"?`,
      confirmText: 'Desactivar',
    })

    if (!ok) return
  }

  await clientsStore.toggleActive(client.id, newStatus)
}

function resetFilters() {
  search.value = ''
  currentPage.value = 1
}
</script>

<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         FILTROS (Mobile)
    ========================== -->
    <details class="md:hidden rounded-2xl border border-base-300 bg-base-200/60 p-3 mb-4">
      <summary class="cursor-pointer font-medium text-sm flex items-center justify-between">
        <span>Filtros</span>
        <span class="text-xs opacity-60">Toca para abrir</span>
      </summary>

      <div class="mt-3 space-y-3">
        <div class="relative w-full">
          <span class="pointer-events-none absolute left-3 top-2.5 opacity-50">
            <Icon name="search" class="h-4 w-4" />
          </span>
          <input
            v-model="search"
            type="text"
            placeholder="Buscar razón social, nombre o RFC…"
            class="input input-sm input-bordered w-full pl-9"
          />
        </div>

        <select v-model.number="itemsPerPage" class="select select-sm select-bordered w-full">
          <option :value="10">10 por página</option>
          <option :value="25">25 por página</option>
          <option :value="50">50 por página</option>
        </select>

        <button class="btn btn-sm btn-outline w-full" @click="resetFilters">Limpiar filtros</button>
      </div>
    </details>

    <!-- =========================
         FILTROS (iPad + Desktop)
    ========================== -->
    <div
      class="hidden md:flex mb-4 items-end gap-3 rounded-2xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
    >
      <div class="relative flex-1 min-w-[280px]">
        <label class="text-xs opacity-70 block mb-1">Buscar</label>
        <span class="pointer-events-none absolute left-3 top-[34px] opacity-50">
          <Icon name="search" class="h-4 w-4" />
        </span>
        <input
          v-model="search"
          type="text"
          placeholder="Razón social, nombre o RFC…"
          class="input input-sm input-bordered w-full pl-9"
        />
      </div>

      <div class="w-40">
        <label class="text-xs opacity-70 block mb-1">Por página</label>
        <select v-model.number="itemsPerPage" class="select select-sm select-bordered w-full">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>

      <button class="btn btn-sm btn-outline mt-5" @click="resetFilters">Limpiar</button>
    </div>

    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase text-base-content/70">
          <tr>
            <th class="min-w-[260px]">Razón social</th>
            <th class="min-w-[160px]">RFC</th>
            <th class="min-w-[220px]">Email</th>
            <th class="min-w-[140px] text-center">Estado</th>
            <th class="w-[90px] text-center">Acciones</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="clientsStore.loading">
          <tr>
            <td colspan="5" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando clientes…
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else-if="paginated.length">
          <tr v-for="c in paginated" :key="c.id" class="hover:bg-base-200/40 transition">
            <td>
              <div class="font-semibold truncate max-w-[420px]" :title="c.razonSocial">
                {{ c.razonSocial }}
              </div>
              <div v-if="c.nombreComercial" class="text-xs opacity-60 truncate max-w-[420px]">
                {{ c.nombreComercial }}
              </div>
            </td>

            <td class="truncate max-w-[200px]">
              {{ c.rfc || '—' }}
            </td>

            <td class="truncate max-w-[260px]">
              {{ c.email || '—' }}
            </td>

            <td class="text-center">
              <span
                class="badge badge-outline"
                :class="c.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
              >
                {{ c.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="text-center">
              <div class="flex items-center justify-center gap-1">
                <!-- VER -->
                <div class="tooltip tooltip-left" data-tip="Ver cliente">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="goToClient(c.id)"
                  >
                    <Icon name="eye" size="sm" />
                  </button>
                </div>

                <!-- ACTIVAR / DESACTIVAR -->
                <div
                  class="tooltip tooltip-left"
                  :data-tip="c.activo ? 'Desactivar cliente' : 'Activar cliente'"
                >
                  <button
                    class="btn btn-circle btn-sm btn-ghost"
                    :class="c.activo ? 'text-warning' : 'text-success'"
                    @click="toggleClient(c)"
                  >
                    <Icon :name="c.activo ? 'power' : 'checkCircle'" size="sm" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else>
          <tr>
            <td colspan="5" class="p-10 text-center opacity-70">
              No hay resultados con los filtros actuales
            </td>
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
        v-if="clientsStore.loading"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center justify-center gap-2"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando clientes…</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!paginated.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        No hay resultados
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="c in paginated"
        :key="c.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm overflow-hidden"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="font-semibold truncate">
              {{ c.razonSocial }}
            </div>
            <div class="text-xs opacity-60 truncate mt-1">
              {{ c.rfc || 'Sin RFC' }}
            </div>
          </div>

          <span
            class="badge badge-outline shrink-0"
            :class="c.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
          >
            {{ c.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-sm btn-outline flex-1" @click="goToClient(c.id)">
            <Icon name="eye" size="sm" />
            Ver cliente
          </button>

          <button
            class="btn btn-sm flex-1"
            :class="c.activo ? 'btn-warning' : 'btn-success'"
            @click="toggleClient(c)"
          >
            <Icon :name="c.activo ? 'power' : 'checkCircle'" size="sm" />
            {{ c.activo ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- =========================
         PAGINACIÓN
    ========================== -->
    <div class="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <p class="text-xs opacity-70">
        Mostrando <span class="font-medium">{{ startIndex + 1 }}</span
        >–<span class="font-medium">{{ endIndex }}</span> de
        <span class="font-medium">{{ filtered.length }}</span>
      </p>

      <div class="join self-center md:self-auto">
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
