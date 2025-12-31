<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         FILTROS
    ========================== -->
    <details class="md:hidden rounded-xl border border-base-300 bg-base-200 p-3 mb-4">
      <summary class="cursor-pointer font-medium text-sm">Filtros</summary>
      <div class="mt-3 space-y-3">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar..."
          class="input input-sm input-bordered w-full"
        />

        <select v-model="resourceFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todos los recursos</option>
          <option v-for="r in resourceOptions" :key="r" :value="r">
            {{ prettyResource(r) }}
          </option>
        </select>

        <select v-model="actionFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todas las acciones</option>
          <option v-for="a in actionOptions" :key="a" :value="a">
            {{ prettyAction(a) }}
          </option>
        </select>

        <button class="btn btn-sm w-full" @click="resetFilters">Limpiar</button>
      </div>
    </details>

    <!-- Desktop filters -->
    <div
      class="hidden md:flex mb-4 items-center gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
    >
      <input
        v-model="search"
        type="text"
        placeholder="Buscar..."
        class="input input-sm input-bordered w-80"
      />

      <select v-model="resourceFilter" class="select select-sm select-bordered w-56">
        <option value="all">Todos los recursos</option>
        <option v-for="r in resourceOptions" :key="r" :value="r">
          {{ prettyResource(r) }}
        </option>
      </select>

      <select v-model="actionFilter" class="select select-sm select-bordered w-48">
        <option value="all">Todas las acciones</option>
        <option v-for="a in actionOptions" :key="a" :value="a">
          {{ prettyAction(a) }}
        </option>
      </select>

      <button class="btn btn-sm" @click="resetFilters">Limpiar</button>
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
              <div class="text-xs opacity-60">{{ a.id }}</div>
            </td>
            <td>
              <span class="badge" :class="actionTone(a.action)">
                {{ prettyAction(a.action) }}
              </span>
            </td>
            <td>{{ prettyResource(a.resource) }}</td>
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
    <div class="md:hidden space-y-3">
      <div
        v-for="a in paginated"
        :key="a.id"
        class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex justify-between items-start gap-2">
          <div>
            <div class="font-semibold text-sm">{{ prettyAction(a.action) }}</div>
            <div class="text-xs opacity-60">{{ formatDateTime(a.createdAt) }}</div>
          </div>

          <span class="badge text-xs" :class="actionTone(a.action)">
            {{ prettyAction(a.action) }}
          </span>
        </div>

        <div class="mt-2 text-sm space-y-1">
          <div>
            <span class="opacity-60">Recurso:</span>
            {{ prettyResource(a.resource) }}
          </div>
          <div>
            <span class="opacity-60">Actor:</span>
            {{ a.actor?.nombre || a.actorUserId || 'Sistema' }}
          </div>
          <div v-if="a.resourceId">
            <span class="opacity-60">ID:</span>
            <span class="break-all">{{ a.resourceId }}</span>
          </div>
        </div>

        <div class="mt-3 flex justify-end">
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
   DATA
========================= */
const filtered = computed(() =>
  (props.items || []).filter(a => {
    const text = `${a.action} ${a.resource} ${a.actorUserId ?? ''}`.toLowerCase()
    return (
      (!search.value || text.includes(search.value.toLowerCase())) &&
      (resourceFilter.value === 'all' || a.resource === resourceFilter.value) &&
      (actionFilter.value === 'all' || a.action === actionFilter.value)
    )
  })
)

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

/* =========================
   HELPERS
========================= */
const setPage = (p: number) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}
const nextPage = () => setPage(currentPage.value + 1)
const prevPage = () => setPage(currentPage.value - 1)

const resetFilters = () => {
  search.value = ''
  resourceFilter.value = 'all'
  actionFilter.value = 'all'
  currentPage.value = 1
}

watch([search, resourceFilter, actionFilter], () => {
  currentPage.value = 1
})

const resourceOptions = computed(() =>
  Array.from(new Set((props.items || []).map(i => i.resource)))
)
const actionOptions = computed(() => Array.from(new Set((props.items || []).map(i => i.action))))

const prettyAction = (a: string) => a.toUpperCase()
const prettyResource = (r: string) => r.toUpperCase()

const actionTone = (a: string) =>
  a === 'delete'
    ? 'bg-error/15 text-error'
    : a === 'update'
    ? 'bg-warning/15 text-warning'
    : a === 'create'
    ? 'bg-success/15 text-success'
    : 'bg-base-200'
</script>
