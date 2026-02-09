<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         FILTROS (MOBILE)
    ========================== -->
    <details class="md:hidden rounded-xl border border-base-300 bg-base-200 p-3 mb-4">
      <summary class="cursor-pointer font-medium text-sm">Filtros</summary>

      <div class="mt-3 space-y-3">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por usuario o nombre…"
          class="input input-sm input-bordered w-full"
        />

        <select v-model="statusFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <button class="btn btn-sm w-full" @click="resetFilters">Limpiar</button>
      </div>
    </details>

    <!-- =========================
         FILTROS (DESKTOP / iPAD)
    ========================== -->
    <div
      class="hidden md:flex mb-4 items-center justify-between gap-4 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
    >
      <div class="flex items-center gap-3">
        <div class="relative w-72">
          <span class="pointer-events-none absolute left-3 top-2.5 opacity-50">
            <Icon name="search" class="h-4 w-4" />
          </span>

          <input
            v-model="search"
            type="text"
            placeholder="Buscar por usuario o nombre…"
            class="input input-sm input-bordered w-full pl-9"
          />
        </div>

        <select v-model="statusFilter" class="select select-sm select-bordered w-44">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <button class="btn btn-sm" @click="resetFilters">Limpiar</button>
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

    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th class="min-w-[160px]">Usuario</th>
            <th class="min-w-[260px]">Nombre</th>
            <th class="w-[140px] text-center">Estado</th>
            <th class="w-[120px] text-center">Acciones</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando usuarios…
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else-if="paginated.length">
          <tr v-for="u in paginated" :key="u.id" class="hover:bg-base-200/40 transition">
            <td class="font-semibold truncate" :title="u.usuario">
              {{ u.usuario }}
            </td>

            <td class="truncate" :title="`${u.nombre} ${u.apaterno} ${u.amaterno || ''}`">
              {{ u.nombre }} {{ u.apaterno }}
              <span class="opacity-60">{{ u.amaterno || '' }}</span>
            </td>

            <td class="text-center">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="u.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
              >
                <span class="h-2 w-2 rounded-full" :class="u.activo ? 'bg-success' : 'bg-error'" />
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="text-center">
              <div class="flex justify-center gap-1">
                <div class="tooltip" data-tip="Editar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="$emit('edit', u)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div class="tooltip" data-tip="Eliminar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-error"
                    @click="$emit('delete', u)"
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
            <td colspan="4" class="p-10 text-center opacity-70">
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
        v-if="loading"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center justify-center gap-2"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando usuarios…</span>
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
        v-for="u in paginated"
        :key="u.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm overflow-hidden"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold truncate">{{ u.usuario }}</p>
            <p class="text-sm opacity-70 truncate">
              {{ u.nombre }} {{ u.apaterno }} {{ u.amaterno || '' }}
            </p>
          </div>

          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            :class="u.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
          >
            <span class="h-2 w-2 rounded-full" :class="u.activo ? 'bg-success' : 'bg-error'" />
            {{ u.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="mt-4 flex gap-2">
          <button class="btn btn-sm btn-outline flex-1" @click="$emit('edit', u)">
            <Icon name="edit" size="sm" />
            Editar
          </button>

          <button class="btn btn-sm btn-outline btn-error flex-1" @click="$emit('delete', u)">
            <Icon name="trash" size="sm" />
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- =========================
         PAGINACIÓN
    ========================== -->
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
import { computed, ref, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import type { User } from '~/types/user'

defineProps<{ users: User[]; loading?: boolean }>()
defineEmits(['edit', 'delete'])

const search = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filtered = computed(() => {
  const term = search.value.toLowerCase()
  return (Array.isArray((<any>arguments)[0]?.users) ? (<any>arguments)[0].users : []).filter(
    (u: User) =>
      (!term ||
        u.usuario.toLowerCase().includes(term) ||
        `${u.nombre} ${u.apaterno} ${u.amaterno || ''}`.toLowerCase().includes(term)) &&
      (statusFilter.value === 'all' ? true : statusFilter.value === 'active' ? u.activo : !u.activo)
  )
})

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

function resetFilters() {
  search.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1
}

watch([search, statusFilter, itemsPerPage], () => (currentPage.value = 1))
</script>
