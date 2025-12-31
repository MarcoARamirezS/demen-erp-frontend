<!-- ~/components/roles/RolesTable.vue -->
<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- Filtros -->
    <div
      class="mb-4 flex flex-col gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <div class="relative w-full md:w-72">
          <span class="pointer-events-none absolute left-3 top-2.5 opacity-50">
            <Icon name="search" class="h-4 w-4" />
          </span>

          <input
            v-model="search"
            type="text"
            placeholder="Buscar rol o descripción..."
            class="input input-sm input-bordered w-full pl-9"
          />
        </div>

        <select v-model="statusFilter" class="select select-sm select-bordered w-full md:w-48">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <button class="btn btn-sm" type="button" @click="resetFilters">
          <Icon name="x" class="h-4 w-4" />
          Limpiar
        </button>
      </div>

      <div class="flex items-center gap-2 text-xs opacity-70">
        <span>Mostrar:</span>
        <select v-model.number="itemsPerPage" class="select select-xs select-bordered">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <!-- MOBILE CARDS -->
    <div class="space-y-3 md:hidden">
      <div
        v-for="r in paginated"
        :key="r.id"
        class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold">{{ r.name }}</div>
            <div class="text-xs opacity-60">{{ r.description || '—' }}</div>
          </div>

          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            :class="r.active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
          >
            <span class="h-2 w-2 rounded-full" :class="r.active ? 'bg-success' : 'bg-error'" />
            {{ r.active ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="mt-3 flex items-center justify-between">
          <span class="text-xs opacity-60"> {{ r.permissionCodes?.length ?? 0 }} permisos </span>

          <div class="flex gap-2">
            <button class="btn btn-circle btn-sm btn-ghost text-primary" @click="$emit('edit', r)">
              <Icon name="edit" size="sm" />
            </button>

            <button class="btn btn-circle btn-sm btn-ghost text-error" @click="$emit('delete', r)">
              <Icon name="trash" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DESKTOP TABLE -->
    <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Rol</th>
            <th class="text-center">Permisos</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-8 text-center opacity-70">Cargando roles...</td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="r in paginated" :key="r.id" class="hover:bg-base-200/40">
            <td>
              <div class="font-semibold">{{ r.name }}</div>
              <div class="text-xs opacity-60">{{ r.description || '—' }}</div>
            </td>

            <td class="text-center">
              <span class="badge badge-outline">
                {{ r.permissionCodes?.length ?? 0 }} permisos
              </span>
            </td>

            <td class="text-center">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="r.active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
              >
                <span class="h-2 w-2 rounded-full" :class="r.active ? 'bg-success' : 'bg-error'" />
                {{ r.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="text-center">
              <button class="btn btn-circle btn-sm btn-ghost" @click="$emit('edit', r)">
                <Icon name="edit" size="sm" />
              </button>
              <button
                class="btn btn-circle btn-sm btn-ghost text-error"
                @click="$emit('delete', r)"
              >
                <Icon name="trash" size="sm" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex flex-col items-center gap-2">
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Role } from '~/types/role'

/* =========================
   PROPS
========================= */
const props = defineProps<{
  roles: Role[]
  loading: boolean
}>()

defineEmits<{
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
