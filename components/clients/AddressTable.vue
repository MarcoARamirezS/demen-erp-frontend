<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'
import type { ClientAddress } from '~/types/client-address'

defineProps<{
  items: ClientAddress[]
  loading?: boolean
  canUpdate?: boolean
  canDelete?: boolean
}>()

defineEmits<{
  (e: 'edit', address: ClientAddress): void
  (e: 'delete', id: string): void
}>()
</script>

<template>
  <div class="rounded-xl border border-base-300 bg-base-100 shadow-sm">
    <table class="table w-full text-sm">
      <!-- =======================
           HEADER
      ======================== -->
      <thead class="bg-base-200 text-xs uppercase tracking-wide text-base-content/70">
        <tr>
          <th class="px-4 py-3">Dirección</th>
          <th class="px-4 py-3">Ciudad</th>
          <th class="px-4 py-3 text-center">Tipo</th>
          <th class="px-4 py-3 text-center">Acciones</th>
        </tr>
      </thead>

      <!-- =======================
           LOADING
      ======================== -->
      <tbody v-if="loading">
        <tr>
          <td colspan="4" class="p-8 text-center opacity-70">Cargando direcciones…</td>
        </tr>
      </tbody>

      <!-- =======================
           ROWS
      ======================== -->
      <tbody v-else-if="items.length" class="divide-y divide-base-300">
        <tr v-for="a in items" :key="a.id" class="transition hover:bg-base-200/40">
          <!-- Dirección -->
          <td class="px-4 py-3">
            <div class="font-semibold">
              {{ a.nombre || a.calle }}
            </div>
            <div class="text-xs opacity-60">
              {{ a.calle }}
              <span v-if="a.colonia"> · {{ a.colonia }}</span>
              <span v-if="a.codigoPostal"> · {{ a.codigoPostal }}</span>
            </div>
          </td>

          <!-- Ciudad -->
          <td class="px-4 py-3">{{ a.ciudad }}, {{ a.estado }}</td>

          <!-- Flags -->
          <td class="px-4 py-3 text-center">
            <div class="flex justify-center gap-2">
              <span
                v-if="a.esPrincipal"
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-primary/15 text-primary"
              >
                <span class="h-2 w-2 rounded-full bg-primary" />
                Principal
              </span>

              <span
                v-else
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-base-200 text-base-content/60"
              >
                <span class="h-2 w-2 rounded-full bg-base-content/40" />
                Secundaria
              </span>
            </div>
          </td>

          <!-- Acciones -->
          <td class="px-4 py-3 text-center">
            <div class="flex items-center justify-center gap-2">
              <button
                v-if="canUpdate"
                type="button"
                class="btn btn-circle btn-sm btn-ghost text-primary hover:bg-primary/10"
                data-tip="Editar"
                @click="$emit('edit', a)"
              >
                <Icon name="edit" size="sm" />
              </button>

              <button
                v-if="canDelete"
                type="button"
                class="btn btn-circle btn-sm btn-ghost text-error hover:bg-error/10"
                data-tip="Eliminar"
                @click="$emit('delete', a.id)"
              >
                <Icon name="trash" size="sm" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>

      <!-- =======================
           EMPTY
      ======================== -->
      <tbody v-else>
        <tr>
          <td colspan="4" class="p-10 text-center opacity-70">
            <div class="flex flex-col items-center gap-3">
              <Icon name="map-pin" size="lg" />
              <p class="text-sm">Este cliente no tiene direcciones registradas</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
