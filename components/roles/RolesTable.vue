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
            placeholder="Buscar rol o descripción…"
            class="input input-sm input-bordered w-full pl-9"
          />
        </div>

        <select v-model="statusFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

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
      <div class="relative flex-1 min-w-[260px]">
        <label class="text-xs opacity-70 block mb-1">Buscar</label>
        <span class="pointer-events-none absolute left-3 top-[34px] opacity-50">
          <Icon name="search" class="h-4 w-4" />
        </span>
        <input
          v-model="search"
          type="text"
          placeholder="Rol o descripción…"
          class="input input-sm input-bordered w-full pl-9"
        />
      </div>

      <div class="w-44">
        <label class="text-xs opacity-70 block mb-1">Estado</label>
        <select v-model="statusFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <div class="w-36">
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
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th class="min-w-[260px]">Rol</th>
            <th class="min-w-[160px] text-center">Permisos</th>
            <th class="min-w-[160px] text-center">Estado</th>
            <th class="w-[120px] text-center">Acciones</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando roles…
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else-if="paginated.length">
          <tr v-for="r in paginated" :key="r.id" class="hover:bg-base-200/40 transition">
            <td>
              <div class="font-semibold truncate max-w-[420px]" :title="r.name">
                {{ r.name }}
              </div>
              <div class="text-xs opacity-60 truncate max-w-[420px]">
                {{ r.description || '—' }}
              </div>
            </td>

            <td class="text-center">
              <span class="badge badge-outline">
                {{ r.permissionCodes?.length ?? 0 }} permisos
              </span>
            </td>

            <td class="text-center">
              <span
                class="badge badge-outline"
                :class="r.active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
              >
                {{ r.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="text-center">
              <div class="flex items-center justify-center gap-1">
                <div class="tooltip" data-tip="Editar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="emit('edit', r)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div class="tooltip" data-tip="Eliminar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-error"
                    @click="emit('delete', r)"
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
            <td colspan="4" class="p-10 text-center opacity-70">No hay roles registrados</td>
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
        <span class="text-sm opacity-70">Cargando roles…</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!paginated.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        No hay roles registrados
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="r in paginated"
        :key="r.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm overflow-hidden"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="font-semibold truncate">
              {{ r.name }}
            </div>
            <div class="text-xs opacity-60 truncate mt-1">
              {{ r.description || '—' }}
            </div>
          </div>

          <span
            class="badge badge-outline shrink-0"
            :class="r.active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
          >
            {{ r.active ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="mt-3 text-sm">
          <span class="opacity-60">Permisos:</span>
          {{ r.permissionCodes?.length ?? 0 }}
        </div>

        <div class="mt-4 flex gap-2">
          <button class="btn btn-sm btn-outline flex-1" @click="emit('edit', r)">
            <Icon name="edit" size="sm" />
            Editar
          </button>

          <button class="btn btn-sm btn-outline btn-error flex-1" @click="emit('delete', r)">
            <Icon name="trash" size="sm" />
            Eliminar
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Role } from '~/types/role'
import Icon from '~/components/ui/Icon.vue'

/* =========================
   PROPS
========================= */
const props = defineProps<{
  roles: Role[]
  loading: boolean
}>()

/* =========================
   EMITS (FIX CRÍTICO)
========================= */
const emit = defineEmits<{
  (e: 'edit', role: Role): void
  (e: 'delete', role: Role): void
}>()

/* =========================
   FILTROS
========================= */
const search = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const itemsPerPage = ref(10)
const currentPage = ref(1)

/* =========================
   COMPUTED: FILTERED
========================= */
const filtered = computed(() => {
  let data = [...props.roles]

  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter(
      r => r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q)
    )
  }

  if (statusFilter.value !== 'all') {
    const active = statusFilter.value === 'active'
    data = data.filter(r => r.active === active)
  }

  return data
})

/* =========================
   PAGINATION
========================= */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / itemsPerPage.value))
)

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)

const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage.value, filtered.value.length)
)

const paginated = computed(() => filtered.value.slice(startIndex.value, endIndex.value))

/* =========================
   PAGINATION ACTIONS
========================= */
function setPage(page: number) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

const visiblePages = computed(() => {
  const range = []
  for (let i = 1; i <= totalPages.value; i++) range.push(i)
  return range
})

/* =========================
   RESET FILTERS
========================= */
function resetFilters() {
  search.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1
}

/* =========================
   WATCHERS
========================= */
watch([search, statusFilter, itemsPerPage], () => {
  currentPage.value = 1
})
</script>
