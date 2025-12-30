<!-- ~/components/audit/AuditTable.vue -->
<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- Filtros -->
    <div
      class="mb-4 flex flex-col gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <!-- Buscar -->
        <div class="relative w-full md:w-80">
          <span class="pointer-events-none absolute left-3 top-2.5 opacity-50">
            <Icon name="search" class="h-4 w-4" />
          </span>

          <input
            v-model="search"
            type="text"
            placeholder="Buscar (acción, recurso, usuario, id)..."
            class="input input-sm input-bordered w-full pl-9"
          />
        </div>

        <!-- Recurso -->
        <select v-model="resourceFilter" class="select select-sm select-bordered w-full md:w-56">
          <option value="all">Todos los recursos</option>
          <option v-for="r in resourceOptions" :key="r" :value="r">
            {{ prettyResource(r) }}
          </option>
        </select>

        <!-- Acción -->
        <select v-model="actionFilter" class="select select-sm select-bordered w-full md:w-48">
          <option value="all">Todas las acciones</option>
          <option v-for="a in actionOptions" :key="a" :value="a">
            {{ prettyAction(a) }}
          </option>
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

    <!-- Tabla -->
    <div class="overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3">Fecha</th>
            <th class="px-4 py-3">Acción</th>
            <th class="px-4 py-3">Recurso</th>
            <th class="px-4 py-3">Actor</th>
            <th class="px-4 py-3">Recurso ID</th>
            <th class="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="6" class="p-8 text-center opacity-70">Cargando auditoría...</td>
          </tr>
        </tbody>

        <tbody v-else-if="paginated.length" class="divide-y divide-base-300">
          <tr v-for="a in paginated" :key="a.id" class="transition hover:bg-base-200/40">
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="font-medium">{{ formatDateTime(a.createdAt) }}</div>
              <div class="text-xs opacity-60">ID: {{ a.id }}</div>
            </td>

            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="actionTone(a.action)"
              >
                <Icon :name="actionIcon(a.action)" class="h-4 w-4" />
                {{ prettyAction(a.action) }}
              </span>
            </td>

            <td class="px-4 py-3">
              <span class="badge badge-outline">
                {{ prettyResource(a.resource) }}
              </span>
            </td>

            <td class="px-4 py-3">
              <span class="font-medium">
                {{ a.actorUserId ? a.actorUserId : 'Sistema' }}
              </span>
            </td>

            <td class="px-4 py-3">
              <span class="text-xs opacity-70">
                {{ a.resourceId || '—' }}
              </span>
            </td>

            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <div
                  class="tooltip"
                  :data-tip="canRead ? 'Ver detalle' : 'Sin permiso (audit:read)'"
                >
                  <button
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-primary hover:bg-primary/10"
                    :disabled="!canRead"
                    @click="$emit('view', a.id)"
                  >
                    <Icon name="eye" size="sm" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="6" class="p-8 text-center opacity-70">
              No hay resultados con los filtros actuales.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
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

      <!-- Load more (cursor) -->
      <div class="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button class="btn btn-sm" type="button" @click="$emit('refresh')">
          <Icon name="refresh-cw" class="h-4 w-4" />
          Recargar
        </button>

        <button
          class="btn btn-sm btn-outline"
          type="button"
          :disabled="loading || !hasMore"
          @click="$emit('load-more')"
        >
          <Icon name="plus" class="h-4 w-4" />
          Cargar más
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import type { AuditLog } from '~/types/audit'
import { formatDateTime } from '~/utils/dates'

const props = defineProps<{
  items: AuditLog[]
  loading?: boolean
  canRead?: boolean
  hasMore?: boolean
}>()

defineEmits<{
  (e: 'view', id: string): void
  (e: 'refresh'): void
  (e: 'load-more'): void
}>()

const search = ref('')
const resourceFilter = ref<'all' | string>('all')
const actionFilter = ref<'all' | string>('all')

const currentPage = ref(1)
const itemsPerPage = ref(10)

const safeItems = computed(() => (props.items ?? []).filter(Boolean))

const resourceOptions = computed(() => {
  const set = new Set<string>()
  for (const a of safeItems.value) if (a.resource) set.add(a.resource)
  return Array.from(set).sort((x, y) => x.localeCompare(y))
})

const actionOptions = computed(() => {
  const set = new Set<string>()
  for (const a of safeItems.value) if (a.action) set.add(a.action)
  return Array.from(set).sort((x, y) => x.localeCompare(y))
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  return safeItems.value.filter(a => {
    const text = `${a.id} ${a.action} ${a.resource} ${a.actorUserId ?? ''} ${
      a.resourceId ?? ''
    }`.toLowerCase()

    const matchesSearch = !term || text.includes(term)
    const matchesResource =
      resourceFilter.value === 'all' ? true : a.resource === resourceFilter.value
    const matchesAction = actionFilter.value === 'all' ? true : a.action === actionFilter.value

    return matchesSearch && matchesResource && matchesAction
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
  resourceFilter.value = 'all'
  actionFilter.value = 'all'
  currentPage.value = 1
}

watch([search, resourceFilter, actionFilter, itemsPerPage], () => {
  currentPage.value = 1
})

/* =========================
   UI Helpers (badges/icons)
========================= */
const actionMap: Record<string, string> = {
  create: 'Crear',
  read: 'Ver',
  list: 'Listar',
  update: 'Actualizar',
  delete: 'Eliminar',
  login: 'Login',
  logout: 'Logout',
}

const resourceMap: Record<string, string> = {
  users: 'Usuarios',
  roles: 'Roles',
  permissions: 'Permisos',
  audit: 'Auditoría',
  ventas: 'Ventas',
  proyectos: 'Proyectos',
  compras: 'Compras',
  inventarios: 'Inventarios',
  ingenieria: 'Ingeniería',
  cxc: 'Cuentas por cobrar',
  contabilidad: 'Contabilidad',
  reportes: 'Reportes',
}

const prettyAction = (a: string) => actionMap[a] ?? a
const prettyResource = (r: string) => resourceMap[r] ?? r

const actionIcon = (a: string) => {
  if (a === 'create') return 'plus'
  if (a === 'update') return 'edit'
  if (a === 'delete') return 'trash'
  if (a === 'read') return 'eye'
  if (a === 'list') return 'list'
  if (a === 'login') return 'log-in'
  if (a === 'logout') return 'log-out'
  return 'activity'
}

const actionTone = (a: string) => {
  if (a === 'delete') return 'bg-error/15 text-error'
  if (a === 'update') return 'bg-warning/15 text-warning'
  if (a === 'create') return 'bg-success/15 text-success'
  if (a === 'read' || a === 'list') return 'bg-info/15 text-info'
  return 'bg-base-200 text-base-content'
}
</script>
