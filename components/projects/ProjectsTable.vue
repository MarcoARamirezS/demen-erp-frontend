<script setup lang="ts">
import type { Project } from '@/types/project'

defineProps<{
  items: Project[]
  loading: boolean
}>()

const emit = defineEmits(['edit', 'delete', 'changeStatus'])

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
          <th>Número</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in items" :key="p.id" class="hover:bg-base-200/40">
          <td>{{ p.projectNumber }}</td>
          <td>{{ p.clientId }}</td>
          <td>{{ p.fecha }}</td>
          <td>
            <span class="badge badge-outline" :class="statusColor(p.status)">
              {{ p.status }}
            </span>
          </td>
          <td class="flex gap-2 justify-end">
            <button class="btn btn-sm btn-ghost" @click="$emit('edit', p)">Editar</button>
            <button class="btn btn-sm btn-error" @click="$emit('delete', p.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
