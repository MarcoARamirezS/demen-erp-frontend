<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <details class="mb-4 rounded-2xl border border-base-300 bg-base-200/60 p-3 md:hidden">
      <summary class="flex cursor-pointer items-center justify-between text-sm font-medium">
        <span>Filtros</span>
        <span class="text-xs opacity-60">Toca para abrir</span>
      </summary>

      <div class="mt-3 space-y-3">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar acción, recurso, actor o descripción..."
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

    <div
      class="mb-4 hidden items-end gap-3 rounded-2xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 md:flex"
    >
      <div class="min-w-[260px] flex-1">
        <label class="mb-1 block text-xs opacity-70">Buscar</label>
        <input
          v-model="search"
          type="text"
          placeholder="Acción, recurso, actor, descripción..."
          class="input input-sm input-bordered w-full"
        />
      </div>

      <div class="w-56">
        <label class="mb-1 block text-xs opacity-70">Recurso</label>
        <select v-model="resourceFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todos</option>
          <option v-for="r in resourceOptions" :key="r" :value="r">
            {{ prettyResource(r) }}
          </option>
        </select>
      </div>

      <div class="w-52">
        <label class="mb-1 block text-xs opacity-70">Acción</label>
        <select v-model="actionFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todas</option>
          <option v-for="a in actionOptions" :key="a" :value="a">
            {{ prettyAction(a) }}
          </option>
        </select>
      </div>

      <div class="w-40">
        <label class="mb-1 block text-xs opacity-70">Por página</label>
        <select v-model.number="itemsPerPage" class="select select-sm select-bordered w-full">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>

      <button class="btn btn-sm btn-outline" @click="resetFilters">Limpiar</button>
    </div>

    <div class="hidden overflow-x-auto rounded-2xl border border-base-300 md:block">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th class="min-w-[190px]">Fecha</th>
            <th class="min-w-[220px]">Operación</th>
            <th class="min-w-[170px]">Recurso</th>
            <th class="min-w-[220px]">Actor</th>
            <th class="min-w-[420px]">Descripción</th>
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
            <td class="align-top">
              <div class="font-medium whitespace-nowrap">{{ formatDateTime(a.createdAt) }}</div>
              <div class="max-w-[260px] truncate font-mono text-xs opacity-60" :title="a.id">
                {{ a.id }}
              </div>
            </td>

            <td class="align-top">
              <div
                class="inline-flex max-w-[190px] rounded-full border px-3 py-1 text-xs font-semibold leading-tight"
                :class="operationPillClass(a.action)"
                :title="a.actionLabel || prettyAction(a.action)"
              >
                <span class="break-words whitespace-normal">
                  {{ a.actionLabel || prettyAction(a.action) }}
                </span>
              </div>
            </td>

            <td
              class="align-top truncate max-w-[260px]"
              :title="a.resourceLabel || prettyResource(a.resource)"
            >
              {{ a.resourceLabel || prettyResource(a.resource) }}
            </td>

            <td class="align-top max-w-[280px] truncate" :title="actorText(a)">
              {{ actorText(a) }}
            </td>

            <td class="align-top">
              <div class="space-y-2">
                <div
                  class="max-w-[460px] truncate font-medium text-base-content"
                  :title="a.description || '—'"
                >
                  {{ a.description || 'Sin descripción enriquecida' }}
                </div>

                <div v-if="a.entityLabel || a.resourceId" class="flex flex-wrap gap-2">
                  <span
                    v-if="a.entityLabel"
                    class="inline-flex max-w-[230px] truncate rounded-full border border-base-300 bg-base-100 px-3 py-1 text-xs"
                    :title="a.entityLabel"
                  >
                    {{ a.entityLabel }}
                  </span>

                  <span
                    v-if="a.resourceId && a.resourceId !== a.entityLabel"
                    class="inline-flex max-w-[190px] truncate rounded-full border border-base-300 bg-base-100 px-3 py-1 font-mono text-xs"
                    :title="a.resourceId"
                  >
                    {{ truncateText(a.resourceId, 20) }}
                  </span>
                </div>
              </div>
            </td>

            <td class="align-top text-center">
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

    <div class="space-y-3 md:hidden">
      <div
        v-if="loading"
        class="flex items-center justify-center gap-2 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando...</span>
      </div>

      <div
        v-else-if="!paginated.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 text-center opacity-70 shadow-sm"
      >
        No hay resultados
      </div>

      <div
        v-else
        v-for="a in paginated"
        :key="a.id"
        class="w-full overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold leading-tight"
                :class="operationPillClass(a.action)"
              >
                {{ a.actionLabel || prettyAction(a.action) }}
              </span>

              <span class="text-xs opacity-60">
                {{ formatDateTime(a.createdAt) }}
              </span>
            </div>

            <div
              class="mt-2 truncate text-sm font-semibold"
              :title="a.resourceLabel || prettyResource(a.resource)"
            >
              {{ a.resourceLabel || prettyResource(a.resource) }}
            </div>

            <div class="mt-1 truncate text-xs opacity-70" :title="actorText(a)">
              {{ actorText(a) }}
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

        <div class="mt-3 rounded-xl border border-base-300 bg-base-200/30 p-3">
          <div class="text-xs font-medium text-base-content/60">Descripción</div>
          <div class="mt-1 text-sm text-base-content/85">
            {{ a.description || 'Sin descripción enriquecida' }}
          </div>

          <div v-if="a.entityLabel || a.resourceId" class="mt-3 flex flex-wrap gap-2">
            <span
              v-if="a.entityLabel"
              class="inline-flex max-w-[220px] truncate rounded-full border border-base-300 bg-base-100 px-3 py-1 text-xs"
              :title="a.entityLabel"
            >
              {{ a.entityLabel }}
            </span>

            <span
              v-if="a.resourceId && a.resourceId !== a.entityLabel"
              class="inline-flex max-w-[180px] truncate rounded-full border border-base-300 bg-base-100 px-3 py-1 font-mono text-xs"
              :title="a.resourceId"
            >
              {{ truncateText(a.resourceId, 18) }}
            </span>
          </div>

          <div class="mt-3 text-[11px] font-mono opacity-50 break-all">
            {{ a.id }}
          </div>
        </div>

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

    <div class="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p class="text-xs opacity-70">
        Mostrando <span class="font-medium">{{ filtered.length ? startIndex + 1 : 0 }}</span
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

    <div v-if="hasMore" class="mt-4 flex justify-center">
      <button class="btn btn-sm btn-outline" :disabled="loading" @click="$emit('load-more')">
        Cargar más
      </button>
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
  hasMore?: boolean
}>()

defineEmits(['view', 'load-more', 'refresh'])

const search = ref('')
const resourceFilter = ref('all')
const actionFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filtered = computed(() =>
  (props.items || []).filter(a => {
    const text =
      `${a.action} ${a.actionLabel || ''} ${a.resource} ${a.resourceLabel || ''} ${a.actor?.nombre || ''} ${a.actor?.usuario || ''} ${a.actorUserId ?? ''} ${a.description || ''} ${a.entityLabel || ''} ${a.resourceId || ''}`.toLowerCase()

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
  Array.from(new Set((props.items || []).map(i => i.resource).filter(Boolean)))
)

const actionOptions = computed(() =>
  Array.from(new Set((props.items || []).map(i => i.action).filter(Boolean)))
)

function prettyAction(action: string) {
  const value = String(action || '').toLowerCase()

  if (value === 'login_success') return 'Inicio de sesión exitoso'
  if (value === 'refresh_success') return 'Refresh de sesión exitoso'
  if (value === 'logout' || value === 'logout_success') return 'Cierre de sesión'
  if (value.includes('create')) return 'Creación'
  if (value.includes('update')) return 'Actualización'
  if (value.includes('delete') || value.includes('remove')) return 'Eliminación'
  if (value.includes('toggle')) return 'Cambio de estado'
  if (value.includes('upload')) return 'Carga de archivo'
  if (value.includes('assign')) return 'Asignación'
  if (value.includes('submit')) return 'Envío'
  return String(action || '').replace(/[_-]+/g, ' ')
}

function prettyResource(r: string) {
  return String(r || '').toUpperCase()
}

function actorText(a: AuditLog) {
  return a.actor?.nombre || a.actor?.usuario || a.actorUserId || 'Sistema'
}

function truncateText(value: string, max = 18) {
  if (!value) return ''
  return value.length > max ? `${value.slice(0, max)}…` : value
}

function operationPillClass(action?: string) {
  const value = String(action || '').toLowerCase()

  if (value.includes('delete') || value.includes('remove')) {
    return 'border-error/40 bg-error/10 text-error'
  }

  if (value.includes('update')) {
    return 'border-warning/40 bg-warning/10 text-warning'
  }

  if (value.includes('create')) {
    return 'border-success/40 bg-success/10 text-success'
  }

  if (value.includes('login') || value.includes('refresh') || value.includes('logout')) {
    return 'border-info/40 bg-info/10 text-info'
  }

  return 'border-base-300 bg-base-200 text-base-content/80'
}
</script>
