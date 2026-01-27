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
          placeholder="Buscar..."
          class="input input-sm input-bordered w-full"
        />

        <select v-model="resourceFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todos los recursos</option>
          <option v-for="r in resourceOptions" :key="r" :value="r">
            {{ r.toUpperCase() }}
          </option>
        </select>

        <select v-model="actionFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todas las acciones</option>
          <option v-for="a in actionOptions" :key="a" :value="a">
            {{ a.toUpperCase() }}
          </option>
        </select>

        <button class="btn btn-sm btn-outline w-full" @click="resetFilters">Limpiar filtros</button>
      </div>
    </details>

    <!-- =========================
         FILTERS (DESKTOP)
    ========================== -->
    <div
      class="hidden md:flex items-center gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
    >
      <input
        v-model="search"
        type="text"
        placeholder="Buscar..."
        class="input input-sm input-bordered w-72"
      />

      <select v-model="resourceFilter" class="select select-sm select-bordered w-52">
        <option value="all">Todos los recursos</option>
        <option v-for="r in resourceOptions" :key="r" :value="r">
          {{ r.toUpperCase() }}
        </option>
      </select>

      <select v-model="actionFilter" class="select select-sm select-bordered w-44">
        <option value="all">Todas las acciones</option>
        <option v-for="a in actionOptions" :key="a" :value="a">
          {{ a.toUpperCase() }}
        </option>
      </select>

      <button class="btn btn-sm btn-outline" @click="resetFilters">Limpiar</button>
    </div>

    <!-- =========================
         DESKTOP TABLE
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Fecha</th>
            <th>Acción</th>
            <th>Recurso</th>
            <th>Actor</th>
            <th>Recurso ID</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="6" class="p-8 text-center opacity-70">Cargando...</td>
          </tr>
        </tbody>

        <tbody v-else-if="paginated.length">
          <tr v-for="a in paginated" :key="a.id" class="hover:bg-base-200/40">
            <td>
              <div class="font-medium">{{ formatDateTime(a.createdAt) }}</div>
              <div class="text-[10px] opacity-50 font-mono">{{ a.id }}</div>
            </td>

            <td>
              <span class="badge badge-outline" :class="actionTone(a.action)">
                {{ a.action }}
              </span>
            </td>

            <td>{{ a.resource }}</td>
            <td>{{ a.actor?.nombre || a.actorUserId || 'Sistema' }}</td>
            <td class="text-xs opacity-70">{{ a.resourceId || '—' }}</td>

            <td class="text-center">
              <button
                class="btn btn-circle btn-sm btn-ghost"
                :disabled="!canRead"
                @click="$emit('view', a.id)"
              >
                <Icon name="eye" size="sm" />
              </button>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="6" class="p-8 text-center opacity-70">No hay resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
         MOBILE CARDS
    ========================== -->
    <div class="md:hidden space-y-4">
      <div
        v-for="a in paginated"
        :key="a.id"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm space-y-3"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="font-semibold">{{ a.action }}</div>
            <div class="text-xs opacity-60">
              {{ formatDateTime(a.createdAt) }}
            </div>
          </div>

          <span class="badge badge-outline text-xs" :class="actionTone(a.action)">
            {{ a.resource }}
          </span>
        </div>

        <div class="text-sm space-y-1">
          <div>
            <span class="opacity-60">Actor:</span>
            {{ a.actor?.nombre || a.actorUserId || 'Sistema' }}
          </div>

          <div v-if="a.resourceId">
            <span class="opacity-60">ID:</span>
            <span class="break-all">{{ a.resourceId }}</span>
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button class="btn btn-sm btn-outline" :disabled="!canRead" @click="$emit('view', a.id)">
            <Icon name="eye" size="sm" />
            Ver detalle
          </button>
        </div>
      </div>
    </div>

    <!-- =========================
         PAGINACIÓN
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import { formatDateTime } from '~/utils/dates'
import type { AuditLog } from '~/types/audit'

const props = defineProps<{
  items: AuditLog[]
  loading?: boolean
  canRead?: boolean
}>()

defineEmits(['view'])

const search = ref('')
const resourceFilter = ref('all')
const actionFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

/* =========================
   FILTERING
========================= */
const filtered = computed(() =>
  (props.items || []).filter(a => {
    const text = `${a.action} ${a.resource}`.toLowerCase()
    return (
      (!search.value || text.includes(search.value.toLowerCase())) &&
      (resourceFilter.value === 'all' || a.resource === resourceFilter.value) &&
      (actionFilter.value === 'all' || a.action === actionFilter.value)
    )
  })
)

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

/* =========================
   HELPERS
========================= */
watch([search, resourceFilter, actionFilter], () => {
  currentPage.value = 1
})

const resourceOptions = computed(() =>
  Array.from(new Set((props.items || []).map(i => i.resource)))
)

const actionOptions = computed(() => Array.from(new Set((props.items || []).map(i => i.action))))

const resetFilters = () => {
  search.value = ''
  resourceFilter.value = 'all'
  actionFilter.value = 'all'
  currentPage.value = 1
}

const actionTone = (a: string) =>
  a === 'delete'
    ? 'bg-error/15 text-error'
    : a === 'update'
      ? 'bg-warning/15 text-warning'
      : a === 'create'
        ? 'bg-success/15 text-success'
        : 'bg-base-200'
</script>
