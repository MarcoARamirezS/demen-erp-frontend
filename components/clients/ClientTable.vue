<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useClientsStore } from '~/stores/clients.store'
import { useUiStore } from '~/stores/ui.store'
import Icon from '~/components/ui/Icon.vue'

const clientsStore = useClientsStore()
const ui = useUiStore()

/* =========================
STATE
========================= */

const search = ref('')
const searchDebounced = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const sortField = ref<'razonSocial' | 'rfc' | 'email'>('razonSocial')
const sortDirection = ref<'asc' | 'desc'>('asc')

/* =========================
FETCH
========================= */

onMounted(async () => {
  if (!clientsStore.items.length) {
    clientsStore.reset()
    await clientsStore.fetch(itemsPerPage.value, '')
  }
})

/* =========================
SEARCH DEBOUNCE
========================= */

let debounce: any

watch(search, v => {
  clearTimeout(debounce)

  debounce = setTimeout(async () => {
    searchDebounced.value = v
    currentPage.value = 1
    clientsStore.reset()
    await clientsStore.fetch(itemsPerPage.value, searchDebounced.value)
  }, 400)
})

watch(itemsPerPage, async () => {
  currentPage.value = 1
  clientsStore.reset()
  await clientsStore.fetch(itemsPerPage.value, searchDebounced.value)
})

/* =========================
SORTING
========================= */

function sortBy(field: 'razonSocial' | 'rfc' | 'email') {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const sortedItems = computed(() => {
  return [...clientsStore.items].sort((a: any, b: any) => {
    const A = (a[sortField.value] || '').toLowerCase()
    const B = (b[sortField.value] || '').toLowerCase()

    if (A < B) return sortDirection.value === 'asc' ? -1 : 1
    if (A > B) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

/* =========================
PAGINATION
========================= */

const totalItems = computed(() => sortedItems.value.length)

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)))

const paginated = computed(() =>
  sortedItems.value.slice(
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

/* =========================
ACTIONS
========================= */

function goToClient(id: string) {
  navigateTo(`/clients/${id}`)
}

async function toggleClient(client: any) {
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

async function resetFilters() {
  search.value = ''
  searchDebounced.value = ''
  currentPage.value = 1
  clientsStore.reset()
  await clientsStore.fetch(itemsPerPage.value)
}
</script>

<template>
  <div
    class="animate-fadeIn space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg"
  >
    <!-- =========================
FILTERS
========================= -->

    <div
      class="flex flex-wrap items-center gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
    >
      <div class="relative">
        <Icon name="search" class="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
        <input
          v-model="search"
          class="input input-sm input-bordered w-36 md:w-44 lg:w-64 pl-9"
          placeholder="Buscar cliente..."
        />
      </div>

      <select v-model.number="itemsPerPage" class="select select-sm select-bordered min-w-[90px]">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
      </select>

      <button class="btn btn-sm btn-outline" @click="resetFilters">
        <Icon name="x-circle" class="h-4 w-4 mr-1" /> Limpiar
      </button>
    </div>

    <!-- =========================
TABLE (TABLET + DESKTOP)
========================= -->

    <div class="overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wider">
          <tr>
            <th class="cursor-pointer" @click="sortBy('razonSocial')">Razón Social</th>

            <th class="cursor-pointer" @click="sortBy('rfc')">RFC</th>

            <th class="hidden md:table-cell cursor-pointer" @click="sortBy('email')">Email</th>

            <th class="text-center">Estado</th>

            <th class="text-right w-[90px]">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="clientsStore.loading">
          <tr v-for="i in 5" :key="i">
            <td colspan="5">
              <div class="h-10 w-full animate-pulse rounded bg-base-200"></div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="paginated.length">
          <tr
            v-for="c in paginated"
            :key="c.id"
            class="border-b border-base-200 hover:bg-base-200/40 transition"
          >
            <td>
              <div class="flex items-center gap-3">
                <div
                  class="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold"
                >
                  {{ c.razonSocial?.charAt(0) || '?' }}
                </div>

                <div>
                  <div
                    class="font-semibold truncate max-w-[260px] md:max-w-[220px] lg:max-w-[360px]"
                  >
                    {{ c.razonSocial }}
                  </div>

                  <div v-if="c.nombreComercial" class="text-xs opacity-60 truncate">
                    {{ c.nombreComercial }}
                  </div>
                </div>
              </div>
            </td>

            <td class="whitespace-nowrap">
              {{ c.rfc || '—' }}
            </td>

            <td class="hidden md:table-cell truncate max-w-[200px]">
              {{ c.email || '—' }}
            </td>

            <td class="text-center">
              <span class="badge badge-sm" :class="c.activo ? 'badge-success' : 'badge-outline'">
                {{ c.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="text-right">
              <div class="flex justify-end gap-2">
                <div class="tooltip" data-tip="Ver cliente">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="goToClient(c.id)"
                  >
                    <Icon name="eye" />
                  </button>
                </div>

                <div
                  class="tooltip"
                  :data-tip="c.activo ? 'Desactivar cliente' : 'Activar cliente'"
                >
                  <button
                    class="btn btn-circle btn-sm btn-ghost"
                    :class="c.activo ? 'text-warning' : 'text-success'"
                    @click="toggleClient(c)"
                  >
                    <Icon :name="c.activo ? 'power' : 'checkCircle'" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="5" class="p-6 text-center opacity-70">No hay clientes</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
PAGINATION
========================= -->

    <div class="mt-4 flex flex-col lg:flex-row items-center justify-between gap-3">
      <p class="text-xs opacity-70">
        Mostrando <b>{{ startIndex + 1 }}</b> – <b>{{ endIndex }}</b> de <b>{{ totalItems }}</b>
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
