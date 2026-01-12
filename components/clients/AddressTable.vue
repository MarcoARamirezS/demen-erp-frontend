<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'
import type { ClientAddress } from '~/types/client-address'

defineProps<{
  items: ClientAddress[]
  loading?: boolean
  canUpdate?: boolean
  canDelete?: boolean
}>()

defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="rounded-xl border border-base-300 bg-base-100 shadow-sm">
    <table class="table w-full text-sm">
      <thead class="bg-base-200 text-xs uppercase">
        <tr>
          <th>Dirección</th>
          <th>Ciudad</th>
          <th>Flags</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>

      <tbody v-if="loading">
        <tr>
          <td colspan="4" class="p-6 text-center opacity-60">Cargando...</td>
        </tr>
      </tbody>

      <tbody v-else-if="items.length">
        <tr v-for="a in items" :key="a.id" class="hover:bg-base-200/40">
          <td>
            <div class="font-medium">{{ a.calle }}</div>
            <div class="text-xs opacity-60">{{ a.colonia }} · {{ a.codigoPostal }}</div>
          </td>

          <td>{{ a.ciudad }}, {{ a.estado }}</td>

          <td class="space-x-1">
            <span v-if="a.esFiscal" class="badge badge-primary badge-outline text-xs">
              Fiscal
            </span>

            <span v-if="a.esEnvio" class="badge badge-success badge-outline text-xs"> Envío </span>
          </td>

          <td class="text-center space-x-1">
            <UiButton v-if="canUpdate" size="xs" variant="ghost" @click="$emit('edit', a)">
              <Icon name="edit" size="sm" />
            </UiButton>

            <UiButton v-if="canDelete" size="xs" variant="ghost" @click="$emit('delete', a.id)">
              <Icon name="trash" size="sm" />
            </UiButton>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td colspan="4" class="p-10 text-center">
            <div class="flex flex-col items-center gap-3 opacity-70">
              <Icon name="map-pin" size="lg" />
              <p class="text-sm">Este cliente no tiene direcciones registradas</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
