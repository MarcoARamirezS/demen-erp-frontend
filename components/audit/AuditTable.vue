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
        <input
          v-model="search"
          type="text"
          placeholder="Buscar acción, recurso, actor..."
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

        <select v-model.number="itemsPerPage" class="select select-sm select-bordered w-full">
          <option :value="10">10 por página</option>
          <option :value="20">20 por página</option>
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
      <div class="flex-1 min-w-[260px]">
        <label class="text-xs opacity-70 block mb-1">Buscar</label>
        <input
          v-model="search"
          type="text"
          placeholder="Acción, recurso, actor..."
          class="input input-sm input-bordered w-full"
        />
      </div>

      <div class="w-56">
        <label class="text-xs opacity-70 block mb-1">Recurso</label>
        <select v-model="resourceFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todos</option>
          <option v-for="r in resourceOptions" :key="r" :value="r">
            {{ prettyResource(r) }}
          </option>
        </select>
      </div>

      <div class="w-52">
        <label class="text-xs opacity-70 block mb-1">Acción</label>
        <select v-model="actionFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todas</option>
          <option v-for="a in actionOptions" :key="a" :value="a">
            {{ prettyAction(a) }}
          </option>
        </select>
      </div>

      <div class="w-40">
        <label class="text-xs opacity-70 block mb-1">Por página</label>
        <select v-model.number="itemsPerPage" class="select select-sm select-bordered w-full">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>

      <button class="btn btn-sm btn-outline" @click="resetFilters">Limpiar</button>
    </div>

    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th class="min-w-[190px]">Fecha</th>
            <th class="min-w-[140px]">Acción</th>
            <th class="min-w-[160px]">Recurso</th>
            <th class="min-w-[240px]">Actor</th>
            <th class="min-w-[260px]">Recurso ID</th>
            <th class="w-[90px] text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="6" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando...
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="paginated.length">
          <tr v-for="a in paginated" :key="a.id" class="hover:bg-base-200/40">
            <td>
              <div class="font-medium whitespace-nowrap">{{ formatDateTime(a.createdAt) }}</div>
              <div class="text-xs opacity-60 font-mono truncate max-w-[260px]" :title="a.id">
                {{ a.id }}
              </div>
            </td>

            <td>
              <span class="badge badge-outline" :class="actionTone(a.action)">
                {{ prettyAction(a.action) }}
              </span>
            </td>

            <td class="truncate max-w-[260px]" :title="prettyResource(a.resource)">
              {{ prettyResource(a.resource) }}
            </td>

            <td
              class="truncate max-w-[320px]"
              :title="a.actor?.nombre || a.actorUserId || 'Sistema'"
            >
              {{ a.actor?.nombre || a.actorUserId || 'Sistema' }}
            </td>

            <td
              class="text-xs opacity-70 font-mono truncate max-w-[360px]"
              :title="a.resourceId || '—'"
            >
              {{ a.resourceId || '—' }}
            </td>

            <td class="text-center">
              <div class="tooltip tooltip-left" data-tip="Ver detalle">
                <button
                  class="btn btn-circle btn-sm btn-ghost"
                  :disabled="!canRead"
                  @click="$emit('view', a.id)"
                >
                  <Icon name="eye" size="sm" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="6" class="p-10 text-center opacity-70">No hay resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
         MOBILE CARDS (<md)
    ========================== -->
    <div class="md:hidden space-y-3">
      <div
        v-if="loading"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center justify-center gap-2"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando...</span>
      </div>

      <div
        v-else-if="!paginated.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        No hay resultados
      </div>

      <div
        v-else
        v-for="a in paginated"
        :key="a.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm overflow-hidden"
      >
        <!-- Header card -->
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-outline" :class="actionTone(a.action)">
                {{ prettyAction(a.action) }}
              </span>
              <span class="text-xs opacity-60">
                {{ formatDateTime(a.createdAt) }}
              </span>
            </div>

            <div class="mt-2 text-sm font-semibold truncate" :title="prettyResource(a.resource)">
              {{ prettyResource(a.resource) }}
            </div>

            <div
              class="mt-1 text-xs opacity-70 truncate"
              :title="a.actor?.nombre || a.actorUserId || 'Sistema'"
            >
              {{ a.actor?.nombre || a.actorUserId || 'Sistema' }}
            </div>
          </div>

          <button
            class="btn btn-circle btn-sm btn-ghost shrink-0"
            :disabled="!canRead"
            @click="$emit('view', a.id)"
            aria-label="Ver detalle"
          >
            <Icon name="eye" size="sm" />
          </button>
        </div>

        <!-- Body card -->
        <div class="mt-3 rounded-xl border border-base-300 bg-base-200/30 p-3">
          <div class="text-xs opacity-70">Recurso ID</div>
          <div class="text-xs font-mono break-all mt-1">
            {{ a.resourceId || '—' }}
          </div>

          <div class="text-[11px] opacity-50 font-mono mt-2 break-all">
            {{ a.id }}
          </div>
        </div>

        <!-- Footer action (full width, evita cortes) -->
        <div class="mt-3">
          <button
            class="btn btn-sm btn-outline w-full"
            :disabled="!canRead"
            @click="$emit('view', a.id)"
          >
            <Icon name="eye" size="sm" />
            Ver detalle
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
