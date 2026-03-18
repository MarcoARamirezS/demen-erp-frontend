<script setup lang="ts">
import type { Project } from '@/types/project'
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  items: Project[]
  loading: boolean
}>()

defineEmits(['edit', 'delete', 'changeStatus', 'requirements'])

const statusLabel = (status: string) => {
  switch (status) {
    case 'AUTH_PENDING':
      return 'Pendiente de autorización'
    case 'AUTHORIZED':
      return 'Autorizado'
    case 'IN_EXECUTION':
      return 'En ejecución'
    case 'COMPLETED':
      return 'Completado'
    case 'NOT_ASSIGNED':
      return 'No asignado'
    case 'IN_QUOTATION':
      return 'En cotización'
    default:
      return status || 'Sin estado'
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case 'AUTH_PENDING':
      return 'border-warning bg-warning text-warning-content shadow-sm'
    case 'AUTHORIZED':
      return 'border-info bg-info text-info-content shadow-sm'
    case 'IN_EXECUTION':
      return 'border-primary bg-primary text-primary-content shadow-sm'
    case 'COMPLETED':
      return 'border-success bg-success text-success-content shadow-sm'
    case 'NOT_ASSIGNED':
      return 'border-error bg-error text-error-content shadow-sm'
    case 'IN_QUOTATION':
      return 'border-accent bg-accent text-accent-content shadow-sm'
    default:
      return 'border-base-300 bg-base-200 text-base-content shadow-sm'
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
            <th class="min-w-[160px]">Número</th>
            <th class="min-w-[280px]">Cliente / Sucursal</th>
            <th class="min-w-[140px]">Fecha</th>
            <th class="min-w-[190px] text-center">Estado</th>
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
          <tr v-for="p in items" :key="p.id" class="transition hover:bg-base-200/40">
            <!-- Imagen -->
            <td>
              <img
                v-if="p.images?.length"
                :src="p.images[0].secureUrl"
                class="h-12 w-12 rounded-xl border border-base-300 object-cover"
              />

              <div v-else class="h-12 w-12 rounded-xl border border-base-300 bg-base-200/40" />
            </td>

            <!-- Número -->
            <td>
              <div class="flex flex-col gap-1">
                <span
                  class="text-[11px] font-semibold uppercase tracking-wide text-base-content/50"
                >
                  Proyecto
                </span>

                <div
                  class="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary shadow-sm"
                >
                  <Icon name="hash" size="xs" />
                  <span class="tracking-wide">{{ p.projectNumber }}</span>
                </div>
              </div>
            </td>

            <!-- Cliente -->
            <td>
              <div class="flex flex-col gap-1">
                <span
                  class="text-[11px] font-semibold uppercase tracking-wide text-base-content/50"
                >
                  Cliente
                </span>

                <div class="max-w-[320px] truncate text-sm font-bold text-base-content">
                  {{ p.client?.name ?? '—' }}
                </div>

                <div class="max-w-[320px] truncate text-xs text-base-content/60">
                  <span class="font-medium">Sucursal:</span>
                  {{ p.branch?.name ?? '—' }}
                </div>
              </div>
            </td>

            <!-- Fecha -->
            <td>
              {{ p.fecha }}
            </td>

            <!-- Estado -->
            <td class="text-center">
              <span class="badge badge-sm border font-semibold" :class="statusColor(p.status)">
                {{ statusLabel(p.status) }}
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
    <div class="space-y-3 md:hidden">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex items-center justify-center gap-2 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando proyectos...</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 text-center opacity-70 shadow-sm"
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
            class="h-14 w-14 rounded-xl border border-base-300 object-cover"
          />

          <div v-else class="h-14 w-14 rounded-xl border border-base-300 bg-base-200/40" />

          <div class="min-w-0 flex-1">
            <div class="mb-2">
              <span
                class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-base-content/50"
              >
                Proyecto
              </span>

              <div
                class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold text-primary shadow-sm"
              >
                <Icon name="hash" size="xs" />
                <span class="truncate">{{ p.projectNumber }}</span>
              </div>
            </div>

            <div class="mt-2">
              <span
                class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-base-content/50"
              >
                Cliente
              </span>

              <div class="truncate text-sm font-bold text-base-content">
                {{ p.client?.name ?? '—' }}
              </div>

              <div class="truncate text-xs text-base-content/60">
                <span class="font-medium">Sucursal:</span>
                {{ p.branch?.name ?? '—' }}
              </div>
            </div>

            <div class="mt-2 text-xs opacity-60">
              {{ p.fecha }}
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between gap-3">
          <span class="badge border font-semibold" :class="statusColor(p.status)">
            {{ statusLabel(p.status) }}
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
