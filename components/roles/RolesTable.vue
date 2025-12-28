<!-- ~/components/roles/RolesTable.vue -->
<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         FILTROS
    ========================== -->
    <div
      class="mb-4 flex flex-col gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <!-- Buscar -->
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

        <!-- Estado -->
        <select v-model="statusFilter" class="select select-sm select-bordered w-full md:w-48">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <!-- Limpiar -->
        <button class="btn btn-sm" type="button" @click="resetFilters">
          <Icon name="x" class="h-4 w-4" />
          Limpiar
        </button>
      </div>

      <!-- Por página -->
      <div class="flex items-center justify-between gap-2 text-xs opacity-70 md:justify-end">
        <span class="font-medium">Mostrar:</span>
        <select v-model.number="itemsPerPage" class="select select-xs select-bordered">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
        <span>por página</span>
      </div>
    </div>

    <!-- =========================
         TABLA
    ========================== -->
    <div class="overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3">Rol</th>
            <th class="px-4 py-3 text-center">Permisos</th>
            <th class="px-4 py-3 text-center">Estado</th>
            <th class="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-8 text-center opacity-70">Cargando roles...</td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else-if="paginated.length" class="divide-y divide-base-300">
          <tr
            v-for="r in paginated.filter(Boolean)"
            :key="r.id"
            class="transition hover:bg-base-200/40"
          >
            <!-- Rol -->
            <td class="px-4 py-3">
              <div class="font-semibold">{{ r.name }}</div>
              <div class="text-xs opacity-60">{{ r.description || '—' }}</div>
            </td>

            <!-- Permisos -->
            <td class="px-4 py-3 text-center">
              <span class="badge badge-outline">
                {{ r.permissionCodes?.length ?? 0 }} permisos
              </span>
            </td>

            <!-- Estado -->
            <td class="px-4 py-3 text-center">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="r.active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
              >
                <span class="h-2 w-2 rounded-full" :class="r.active ? 'bg-success' : 'bg-error'" />
                {{ r.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <div class="tooltip" data-tip="Editar rol">
                  <button
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-primary hover:bg-primary/10"
                    @click="$emit('edit', r)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div class="tooltip" data-tip="Eliminar rol">
                  <button
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-error hover:bg-error/10"
                    @click="$emit('delete', r)"
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
            <td colspan="4" class="p-8 text-center opacity-70">
              No hay roles con los filtros actuales.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
         PAGINACIÓN
    ========================== -->
    <div class="mt-4 flex flex-col items-center justify-center gap-2">
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
import Icon from '~/components/ui/Icon.vue'
import type { Role } from '~/types/role'

const props = defineProps<{
  roles: Role[]
  loading?: boolean
}>()

defineEmits<{
  (e: 'edit', r: Role): void
  (e: 'delete', r: Role): void
}>()

const search = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const currentPage = ref(1)
const itemsPerPage = ref(10)

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  return (props.roles || []).filter(Boolean).filter(r => {
    const matchesSearch =
      !term ||
      r.name.toLowerCase().includes(term) ||
      (r.description || '').toLowerCase().includes(term)

    const matchesStatus =
      statusFilter.value === 'all' ? true : statusFilter.value === 'active' ? !!r.active : !r.active

    return matchesSearch && matchesStatus
  })
})

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
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const start = Math.max(1, current - delta)
  const end = Math.min(total, current + delta)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const setPage = (p: number) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}
const nextPage = () => setPage(currentPage.value + 1)
const prevPage = () => setPage(currentPage.value - 1)

function resetFilters() {
  search.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1
}

watch([search, statusFilter, itemsPerPage], () => {
  currentPage.value = 1
})
</script>
