<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'

const props = defineProps<{
  items: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'view', id: string): void
  (e: 'delete', id: string): void
}>()

/* =========================
   STATE
========================= */
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

/* =========================
   HELPERS
========================= */
function formatDate(ts?: { _seconds: number }) {
  if (!ts?._seconds) return '—'
  return new Date(ts._seconds * 1000).toLocaleDateString()
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    EN_AUTORIZACION: 'En autorización',
    AUTORIZADO: 'Autorizado',
    CANCELADO: 'Cancelado',
  }
  return status ? map[status] || status : '—'
}

/* =========================
   FILTER
========================= */
const filtered = computed(() => {
  const term = search.value.toLowerCase()
  return props.items.filter(
    p => !term || p.id.toLowerCase().includes(term) || p.activeVersion?.toLowerCase().includes(term)
  )
})

/* =========================
   PAGINATION
========================= */
const paginated = computed(() =>
  filtered.value.slice(
    (currentPage.value - 1) * itemsPerPage.value,
    currentPage.value * itemsPerPage.value
  )
)

watch(search, () => (currentPage.value = 1))
</script>

<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- FILTRO -->
    <input
      v-model="search"
      placeholder="Buscar por ID o versión..."
      class="input input-sm input-bordered mb-4 w-full md:w-80"
    />

    <!-- TABLA -->
    <div class="overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Fecha</th>
            <th>Proyecto</th>
            <th class="text-center">Versión</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="5" class="p-8 text-center">Cargando…</td>
          </tr>
        </tbody>

        <tbody v-else-if="paginated.length">
          <tr v-for="p in paginated" :key="p.id">
            <td>{{ formatDate(p.createdAt) }}</td>
            <td class="px-4 py-3">
              <!-- Descripción -->
              <p class="font-medium leading-tight">
                {{ p.descripcion || 'Proyecto sin descripción' }}
              </p>

              <!-- Cliente + Dirección -->
              <p class="text-xs opacity-70">
                {{ p.client?.razonSocial }}
                <span v-if="p.address?.label"> · {{ p.address.label }}</span>
              </p>
            </td>

            <td class="text-center">
              <span class="badge badge-outline badge-primary">
                {{ p.activeVersion || '—' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="p.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
              >
                <span class="h-2 w-2 rounded-full" :class="p.activo ? 'bg-success' : 'bg-error'" />
                {{ statusLabel(p.status) }}
              </span>
            </td>
            <td class="text-center">
              <button class="btn btn-circle btn-sm btn-ghost" @click="emit('view', p.id)">
                <Icon name="eye" size="sm" />
              </button>

              <button
                class="btn btn-circle btn-sm btn-ghost text-error"
                @click="emit('delete', p.id)"
              >
                <Icon name="trash" size="sm" />
              </button>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="5" class="p-8 text-center">Sin registros</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
