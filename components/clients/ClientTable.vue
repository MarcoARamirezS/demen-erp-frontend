<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClientsStore } from '~/stores/clients.store'
import { useUiStore } from '~/stores/ui.store'
import { useAuthStore } from '~/stores/auth.store'
import Icon from '~/components/ui/Icon.vue'
import type { Client } from '~/types/client'

const emit = defineEmits<{
  (e: 'edit', client: Client): void
}>()

const clientsStore = useClientsStore()
const ui = useUiStore()
const auth = useAuthStore()

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
HELPERS
========================= */

function normalizeText(value: string | null | undefined) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

function normalizeRFC(value: string | null | undefined) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9&Ñ]/g, '')
    .trim()
}

function updateSearch(value: string) {
  search.value = String(value || '').toUpperCase()
}

function getSearchScore(client: Client, term: string) {
  const normalizedTerm = normalizeText(term)
  const normalizedRfcTerm = normalizeRFC(term)

  const razonSocial = normalizeText(client.razonSocial)
  const nombreComercial = normalizeText(client.nombreComercial)
  const email = normalizeText(client.email)
  const rfc = normalizeRFC(client.rfc)

  if (!normalizedTerm && !normalizedRfcTerm) return 0

  if (rfc && normalizedRfcTerm && rfc === normalizedRfcTerm) return 100
  if (rfc && normalizedRfcTerm && rfc.startsWith(normalizedRfcTerm)) return 80
  if (razonSocial && razonSocial.startsWith(normalizedTerm)) return 70
  if (nombreComercial && nombreComercial.startsWith(normalizedTerm)) return 65
  if (email && email.startsWith(normalizedTerm)) return 60

  if (rfc && normalizedRfcTerm && rfc.includes(normalizedRfcTerm)) return 50
  if (razonSocial && razonSocial.includes(normalizedTerm)) return 40
  if (nombreComercial && nombreComercial.includes(normalizedTerm)) return 35
  if (email && email.includes(normalizedTerm)) return 30

  return 0
}

/* =========================
SEARCH DEBOUNCE
========================= */

let debounce: ReturnType<typeof setTimeout> | null = null

watch(search, value => {
  if (debounce) clearTimeout(debounce)

  debounce = setTimeout(() => {
    searchDebounced.value = normalizeText(value)
    currentPage.value = 1
  }, 350)
})

watch(itemsPerPage, () => {
  currentPage.value = 1
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

function getSortValue(item: Client, field: 'razonSocial' | 'rfc' | 'email') {
  if (field === 'rfc') return normalizeRFC(item[field])
  return normalizeText(item[field])
}

/* =========================
FILTERED + SORTED
========================= */

const filteredItems = computed(() => {
  const term = searchDebounced.value.trim()

  if (!term) return clientsStore.items

  return [...clientsStore.items]
    .map(client => ({
      client,
      score: getSearchScore(client, term),
    }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.client)
})

const sortedItems = computed(() => {
  return [...filteredItems.value].sort((a, b) => {
    const A = getSortValue(a, sortField.value)
    const B = getSortValue(b, sortField.value)

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

const startIndex = computed(() =>
  totalItems.value ? (currentPage.value - 1) * itemsPerPage.value : 0
)
const endIndex = computed(() => startIndex.value + paginated.value.length)

const visiblePages = computed(() => {
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function setPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function nextPage() {
  setPage(currentPage.value + 1)
}

function prevPage() {
  setPage(currentPage.value - 1)
}

/* =========================
ACTIONS
========================= */

function goToClient(id: string) {
  navigateTo(`/clients/${id}`)
}

function editClient(client: Client) {
  emit('edit', client)
}

async function toggleClient(client: Client) {
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
  searchDebounced.value = ''
  currentPage.value = 1
}
</script>

<template>
  <div
    class="animate-fadeIn space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg"
  >
    <!-- =========================
    FILTERS
    ========================= -->

    <div class="rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4">
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_110px_auto] lg:items-end">
        <div>
          <label class="label pb-1">
            <span class="label-text text-sm font-medium">Búsqueda</span>
          </label>

          <div class="relative">
            <Icon name="search" class="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
            <input
              :value="search"
              class="input input-sm input-bordered w-full pl-9 uppercase"
              placeholder="BUSCAR POR RAZÓN SOCIAL, NOMBRE COMERCIAL, RFC O EMAIL..."
              @input="updateSearch(($event.target as HTMLInputElement).value)"
            />
          </div>

          <p class="mt-1 text-xs text-base-content/60">
            Búsqueda rápida sobre razón social, nombre comercial, RFC y correo.
          </p>
        </div>

        <div>
          <label class="label pb-1">
            <span class="label-text text-sm font-medium">Mostrar</span>
          </label>

          <select v-model.number="itemsPerPage" class="select select-sm select-bordered w-full">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>

        <div class="flex items-end">
          <button class="btn btn-sm btn-outline w-full lg:w-auto" @click="resetFilters">
            <Icon name="x-circle" class="mr-1 h-4 w-4" />
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- =========================
    TABLE
    ========================= -->

    <div class="overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wider">
          <tr>
            <th class="cursor-pointer select-none" @click="sortBy('razonSocial')">
              <div class="inline-flex items-center gap-1">
                Razón Social
                <Icon
                  v-if="sortField === 'razonSocial'"
                  :name="sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'"
                  class="h-4 w-4"
                />
              </div>
            </th>

            <th class="cursor-pointer select-none" @click="sortBy('rfc')">
              <div class="inline-flex items-center gap-1">
                RFC
                <Icon
                  v-if="sortField === 'rfc'"
                  :name="sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'"
                  class="h-4 w-4"
                />
              </div>
            </th>

            <th class="hidden md:table-cell cursor-pointer select-none" @click="sortBy('email')">
              <div class="inline-flex items-center gap-1">
                Email
                <Icon
                  v-if="sortField === 'email'"
                  :name="sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'"
                  class="h-4 w-4"
                />
              </div>
            </th>

            <th class="text-center">Estado</th>
            <th class="text-right w-[140px]">Acciones</th>
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
            class="border-b border-base-200 transition hover:bg-base-200/40"
          >
            <td>
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                >
                  {{ c.razonSocial?.charAt(0) || '?' }}
                </div>

                <div class="min-w-0">
                  <div
                    class="max-w-[260px] truncate font-semibold md:max-w-[220px] lg:max-w-[360px]"
                  >
                    {{ c.razonSocial }}
                  </div>

                  <div class="mt-0.5 flex flex-wrap items-center gap-2">
                    <div v-if="c.nombreComercial" class="truncate text-xs opacity-60">
                      {{ c.nombreComercial }}
                    </div>

                    <span v-if="c.usuarios?.length" class="badge badge-outline badge-xs">
                      {{ c.usuarios.length }} usuario{{ c.usuarios.length === 1 ? '' : 's' }}
                    </span>
                  </div>
                </div>
              </div>
            </td>

            <td class="whitespace-nowrap uppercase">
              {{ c.rfc || '—' }}
            </td>

            <td class="hidden md:table-cell max-w-[200px] truncate uppercase">
              {{ c.email || '—' }}
            </td>

            <td class="text-center">
              <span class="badge badge-sm" :class="c.activo ? 'badge-success' : 'badge-outline'">
                {{ c.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="text-right">
              <div class="flex justify-end gap-2">
                <div
                  v-if="auth.hasPermission('clients:update')"
                  class="tooltip"
                  data-tip="Editar cliente"
                >
                  <button class="btn btn-circle btn-sm btn-ghost text-info" @click="editClient(c)">
                    <Icon name="pencil" />
                  </button>
                </div>

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
            <td colspan="5" class="p-6 text-center opacity-70">
              <div class="space-y-1">
                <p class="font-medium">
                  {{
                    searchDebounced
                      ? 'No se encontraron clientes con ese criterio'
                      : 'No hay clientes registrados'
                  }}
                </p>

                <p v-if="searchDebounced" class="text-xs opacity-60">
                  Intenta buscar por razón social, nombre comercial, RFC o email.
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
    PAGINATION
    ========================= -->

    <div class="mt-4 flex flex-col items-center justify-between gap-3 lg:flex-row">
      <p class="text-xs opacity-70">
        Mostrando
        <b>{{ totalItems ? startIndex + 1 : 0 }}</b>
        –
        <b>{{ endIndex }}</b>
        de
        <b>{{ totalItems }}</b>
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
