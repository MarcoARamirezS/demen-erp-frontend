<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- MOBILE FILTERS -->
    <details class="md:hidden rounded-xl border border-base-300 bg-base-200 p-3 mb-4">
      <summary class="cursor-pointer font-semibold text-sm flex items-center gap-2">
        <Icon name="filter" size="sm" />
        Filtros
      </summary>

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
            {{ r.toUpperCase() }}
          </option>
        </select>

        <select v-model="actionFilter" class="select select-sm select-bordered w-full">
          <option value="all">Todas las acciones</option>
          <option v-for="a in actionOptions" :key="a" :value="a">
            {{ a.toUpperCase() }}
          </option>
        </select>

        <button class="btn btn-sm w-full" @click="resetFilters">Limpiar</button>
      </div>
    </details>

    <!-- DESKTOP FILTERS -->
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
          {{ r.toUpperCase() }}
        </option>
      </select>

      <select v-model="actionFilter" class="select select-sm select-bordered w-48">
        <option value="all">Todas las acciones</option>
        <option v-for="a in actionOptions" :key="a" :value="a">
          {{ a.toUpperCase() }}
        </option>
      </select>

      <button class="btn btn-sm" @click="resetFilters">Limpiar</button>
    </div>

    <!-- DESKTOP TABLE -->
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

    <!-- MOBILE CARDS -->
    <div class="md:hidden space-y-3">
      <div
        v-for="a in paginated"
        :key="a.id"
        class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm space-y-2"
      >
        <div class="flex justify-between items-start gap-2">
          <div>
            <div class="font-semibold text-sm">{{ a.action }}</div>
            <div class="text-xs opacity-60">
              {{ formatDateTime(a.createdAt) }}
            </div>
          </div>

          <span class="badge badge-outline text-xs" :class="actionTone(a.action)">
            {{ a.action }}
          </span>
        </div>

        <div class="text-sm space-y-1">
          <div>
            <span class="opacity-60">Recurso:</span>
            {{ a.resource }}
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

        <div class="flex justify-end pt-2">
          <button class="btn btn-sm btn-outline" :disabled="!canRead" @click="$emit('view', a.id)">
            <Icon name="eye" size="sm" />
            Ver detalle
          </button>
        </div>
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

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filtered.value.slice(start, start + itemsPerPage.value)
})

watch([search, resourceFilter, actionFilter], () => {
  currentPage.value = 1
})

const resetFilters = () => {
  search.value = ''
  resourceFilter.value = 'all'
  actionFilter.value = 'all'
}

const resourceOptions = computed(() =>
  Array.from(new Set((props.items || []).map(i => i.resource)))
)

const actionOptions = computed(() => Array.from(new Set((props.items || []).map(i => i.action))))

const actionTone = (a: string) =>
  a === 'delete'
    ? 'bg-error/15 text-error'
    : a === 'update'
      ? 'bg-warning/15 text-warning'
      : a === 'create'
        ? 'bg-success/15 text-success'
        : 'bg-base-200'
</script>
