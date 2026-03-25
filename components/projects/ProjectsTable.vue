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

const getProjectImage = (project: Project) => {
  const firstImage = Array.isArray(project.images) ? project.images[0] : null
  return firstImage?.secureUrl || firstImage?.url || ''
}

const getClientLogo = (project: Project) => {
  return project.client?.logo?.secureUrl || project.client?.logo?.url || ''
}

const getProjectName = (project: Project) => {
  const candidates = [
    (project as any)?.name,
    (project as any)?.projectName,
    (project as any)?.nombre,
    (project as any)?.title,
    (project as any)?.titulo,
    (project as any)?.objetivoFuncionalCliente,
  ]

  const found = candidates.find(value => typeof value === 'string' && value.trim().length > 0)
  return found?.trim() || 'Sin nombre del proyecto'
}
</script>

<template>
  <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <div class="hidden overflow-x-auto rounded-xl border border-base-300 md:block">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wider">
          <tr>
            <th class="w-[90px]">Imagen</th>
            <th class="min-w-[300px]">Proyecto</th>
            <th class="min-w-[260px]">Cliente / Sucursal</th>
            <th class="min-w-[140px]">Fecha</th>
            <th class="min-w-[190px] text-center">Estado</th>
            <th class="w-[140px] text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="6" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2"></span>
              Cargando proyectos...
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="items.length">
          <tr v-for="p in items" :key="p.id" class="transition hover:bg-base-200/40">
            <td>
              <img
                v-if="getProjectImage(p)"
                :src="getProjectImage(p)"
                class="h-12 w-12 rounded-xl border border-base-300 object-cover"
                alt="Imagen del proyecto"
              />

              <div
                v-else-if="getClientLogo(p)"
                class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-100 p-1"
              >
                <img
                  :src="getClientLogo(p)"
                  class="h-full w-full object-contain"
                  alt="Logo del cliente"
                />
              </div>

              <div
                v-else
                class="flex h-12 w-12 items-center justify-center rounded-xl border border-base-300 bg-base-200/40"
              >
                <Icon name="building" size="sm" class="text-base-content/40" />
              </div>
            </td>

            <td>
              <div class="flex min-w-0 flex-col gap-2 py-1">
                <div
                  class="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary shadow-sm"
                >
                  <Icon name="hash" size="xs" />
                  <span class="tracking-wide">{{ p.projectNumber || '—' }}</span>
                </div>

                <div class="min-w-0">
                  <p
                    class="max-w-[340px] whitespace-normal break-words text-sm font-bold leading-snug text-base-content"
                    :title="getProjectName(p)"
                  >
                    {{ getProjectName(p) }}
                  </p>
                </div>
              </div>
            </td>

            <td>
              <div class="flex min-w-0 flex-col gap-1 py-1">
                <span
                  class="max-w-[300px] truncate text-sm font-bold text-base-content"
                  :title="p.client?.name ?? '—'"
                >
                  {{ p.client?.name ?? '—' }}
                </span>

                <span
                  class="max-w-[300px] truncate text-xs text-base-content/60"
                  :title="p.branch?.name ?? '—'"
                >
                  <span class="font-medium">Sucursal:</span>
                  {{ p.branch?.name ?? '—' }}
                </span>
              </div>
            </td>

            <td>
              {{ p.fecha }}
            </td>

            <td class="text-center">
              <span
                class="badge badge-sm border font-semibold p-6"
                :class="statusColor(p.status || '')"
              >
                {{ statusLabel(p.status || '') }}
              </span>
            </td>

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

        <tbody v-else>
          <tr>
            <td colspan="6" class="p-10 text-center opacity-70">
              No existen proyectos registrados
            </td>
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
        <span class="text-sm opacity-70">Cargando proyectos...</span>
      </div>

      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 text-center opacity-70 shadow-sm"
      >
        No existen proyectos registrados
      </div>

      <div
        v-else
        v-for="p in items"
        :key="p.id"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex gap-3">
          <img
            v-if="getProjectImage(p)"
            :src="getProjectImage(p)"
            class="h-14 w-14 rounded-xl border border-base-300 object-cover"
            alt="Imagen del proyecto"
          />

          <div
            v-else-if="getClientLogo(p)"
            class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-100 p-1"
          >
            <img
              :src="getClientLogo(p)"
              class="h-full w-full object-contain"
              alt="Logo del cliente"
            />
          </div>

          <div
            v-else
            class="flex h-14 w-14 items-center justify-center rounded-xl border border-base-300 bg-base-200/40"
          >
            <Icon name="building" size="sm" class="text-base-content/40" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex min-w-0 flex-col gap-2">
              <div
                class="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold text-primary shadow-sm"
              >
                <Icon name="hash" size="xs" />
                <span>{{ p.projectNumber || '—' }}</span>
              </div>

              <div
                class="whitespace-normal break-words text-sm font-bold leading-snug text-base-content"
                :title="getProjectName(p)"
              >
                {{ getProjectName(p) }}
              </div>

              <div class="pt-1">
                <div class="truncate text-sm font-medium text-base-content">
                  {{ p.client?.name ?? '—' }}
                </div>

                <div class="truncate text-xs text-base-content/60">
                  <span class="font-medium">Sucursal:</span>
                  {{ p.branch?.name ?? '—' }}
                </div>

                <div class="mt-2 text-xs opacity-60">
                  {{ p.fecha }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between gap-3">
          <span class="badge border font-semibold" :class="statusColor(p.status || '')">
            {{ statusLabel(p.status || '') }}
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
