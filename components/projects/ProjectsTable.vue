<script setup lang="ts">
import type { Project } from '@/types/project'
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  items: Project[]
  loading: boolean
}>()

defineEmits(['edit', 'delete', 'changeStatus', 'requirements'])

const statusColor = (status: string) => {
  switch (status) {
    case 'AUTH_PENDING':
      return 'badge-warning'
    case 'AUTHORIZED':
      return 'badge-info'
    case 'IN_EXECUTION':
      return 'badge-primary'
    case 'COMPLETED':
      return 'badge-success'
    case 'NOT_ASSIGNED':
      return 'badge-error'
    case 'IN_QUOTATION':
      return 'badge-accent'
    default:
      return 'badge-ghost'
  }
}
</script>

<template>
  <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wider">
          <tr>
            <th class="w-[90px]">Imagen</th>
            <th class="min-w-[120px]">Número</th>
            <th class="min-w-[260px]">Cliente / Sucursal</th>
            <th class="min-w-[140px]">Fecha</th>
            <th class="min-w-[160px] text-center">Estado</th>
            <th class="w-[140px] text-center">Acciones</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr>
            <td colspan="6" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2"></span>
              Cargando proyectos...
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else-if="items.length">
          <tr v-for="p in items" :key="p.id" class="hover:bg-base-200/40 transition">
            <!-- Imagen -->
            <td>
              <img
                v-if="p.images?.length"
                :src="p.images[0].secureUrl"
                class="w-12 h-12 rounded-xl object-cover border border-base-300"
              />

              <div v-else class="w-12 h-12 rounded-xl border border-base-300 bg-base-200/40" />
            </td>

            <!-- Número -->
            <td class="font-medium">
              {{ p.projectNumber }}
            </td>

            <!-- Cliente -->
            <td>
              <div class="font-medium truncate max-w-[300px]">
                {{ p.client?.name ?? '—' }}
              </div>

              <div class="text-xs opacity-60 truncate max-w-[300px]">
                {{ p.branch?.name ?? '—' }}
              </div>
            </td>

            <!-- Fecha -->
            <td>
              {{ p.fecha }}
            </td>

            <!-- Estado -->
            <td class="text-center">
              <span class="badge badge-sm badge-outline" :class="statusColor(p.status)">
                {{ p.status }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="text-center">
              <div class="flex justify-center gap-2">
                <div class="tooltip" data-tip="Editar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="$emit('edit', p)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div class="tooltip" data-tip="Levantamiento">
                  <button
                    class="btn btn-circle btn-sm btn-accent"
                    @click="$emit('requirements', p)"
                  >
                    <Icon name="clipboard" size="sm" />
                  </button>
                </div>

                <div class="tooltip" data-tip="Eliminar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-error"
                    @click="$emit('delete', p.id)"
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
            <td colspan="6" class="p-10 text-center opacity-70">
              No existen proyectos registrados
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
         MOBILE CARDS
    ========================== -->
    <div class="md:hidden space-y-3">
      <!-- Loading -->
      <div
        v-if="loading"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center justify-center gap-2"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando proyectos...</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        No existen proyectos registrados
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="p in items"
        :key="p.id"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex gap-3">
          <img
            v-if="p.images?.length"
            :src="p.images[0].secureUrl"
            class="w-14 h-14 rounded-xl object-cover border border-base-300"
          />

          <div v-else class="w-14 h-14 rounded-xl border border-base-300 bg-base-200/40" />

          <div class="flex-1 min-w-0">
            <div class="font-semibold truncate">
              {{ p.projectNumber }}
            </div>

            <div class="text-sm truncate">
              {{ p.client?.name ?? '—' }}
            </div>

            <div class="text-xs opacity-60 truncate">
              {{ p.branch?.name ?? '—' }}
            </div>

            <div class="text-xs opacity-60 mt-1">
              {{ p.fecha }}
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
          <span class="badge badge-sm badge-outline" :class="statusColor(p.status)">
            {{ p.status }}
          </span>

          <div class="flex gap-2">
            <button class="btn btn-circle btn-sm btn-outline" @click="$emit('edit', p)">
              <Icon name="edit" size="sm" />
            </button>

            <button class="btn btn-circle btn-sm btn-accent" @click="$emit('requirements', p)">
              <Icon name="clipboard" size="sm" />
            </button>

            <button class="btn btn-circle btn-sm btn-error" @click="$emit('delete', p.id)">
              <Icon name="trash" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
