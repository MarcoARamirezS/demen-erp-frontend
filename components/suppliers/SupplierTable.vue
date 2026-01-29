<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import type { Supplier } from '~/types/supplier'

const props = defineProps<{
  items: Supplier[]
  loading?: boolean
  canDelete?: boolean
}>()

defineEmits<{ (e: 'delete', id: string): void }>()

const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filtered = computed(() =>
  props.items.filter(s =>
    `${s.razonSocial} ${s.nombreComercial ?? ''}`.toLowerCase().includes(search.value.toLowerCase())
  )
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / itemsPerPage.value))
)

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filtered.value.slice(start, start + itemsPerPage.value)
})

watch(search, () => (currentPage.value = 1))
</script>

<template>
  <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- FILTER -->
    <div class="mb-4 flex items-center gap-3 rounded-xl border bg-base-200 p-4">
      <input
        v-model="search"
        class="input input-sm input-bordered w-full md:w-80"
        placeholder="Buscar proveedor…"
      />
    </div>

    <!-- TABLE -->
    <div class="overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Proveedor</th>
            <th>Contacto</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-8 text-center">Cargando…</td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="s in paginated" :key="s.id" class="hover:bg-base-200/40">
            <td>
              <div class="font-semibold">{{ s.razonSocial }}</div>
              <div class="text-xs opacity-60">{{ s.nombreComercial }}</div>
            </td>
            <td class="text-sm opacity-70">
              {{ s.email || s.telefono || '—' }}
            </td>
            <td class="text-center">
              <span class="badge" :class="s.activo ? 'badge-success' : 'badge-error'">
                {{ s.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-center">
              <button
                v-if="canDelete"
                class="btn btn-circle btn-sm btn-ghost text-error"
                @click="$emit('delete', s.id)"
              >
                <Icon name="trash" size="sm" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
