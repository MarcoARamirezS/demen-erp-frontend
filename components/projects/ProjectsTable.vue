<script setup lang="ts">
import type { Project } from '@/types/project'

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
  <div class="rounded-2xl border border-base-300 bg-base-100 shadow-lg p-4">
    <div v-if="loading" class="text-center py-8">Cargando...</div>

    <table v-else class="table w-full">
      <thead class="bg-base-200 uppercase text-xs">
        <tr>
          <th>Imagen</th>
          <th>Número</th>
          <th>Cliente / Sucursal</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in items" :key="p.id" class="hover:bg-base-200/40">
          <!-- IMAGEN -->
          <td class="w-20">
            <img
              v-if="p.images?.length"
              :src="p.images[0].secureUrl"
              class="w-12 h-12 rounded-xl object-cover border border-base-300"
            />
            <div v-else class="w-12 h-12 rounded-xl border border-base-300 bg-base-200/40" />
          </td>

          <td class="font-medium">
            {{ p.projectNumber }}
          </td>

          <td>
            <div class="font-medium">
              {{ p.client?.name ?? '—' }}
            </div>
            <div class="text-xs opacity-60">
              {{ p.branch?.name ?? '—' }}
            </div>
          </td>

          <td>
            {{ p.fecha }}
          </td>

          <td>
            <span class="badge badge-outline" :class="statusColor(p.status)">
              {{ p.status }}
            </span>
          </td>

          <td class="flex gap-2 justify-end">
            <button class="btn btn-sm btn-ghost" @click="$emit('edit', p)">Editar</button>

            <!-- ✅ LEVANTAMIENTO -->
            <button class="btn btn-sm btn-accent" @click="$emit('requirements', p)">
              Levantamiento
            </button>

            <button class="btn btn-sm btn-error" @click="$emit('delete', p.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
