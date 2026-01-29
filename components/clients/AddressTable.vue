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
  <div
    class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg space-y-4"
  >
    <!-- DESKTOP TABLE -->
    <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th class="text-center">Tipo</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-8 text-center opacity-70">Cargando direcciones…</td>
          </tr>
        </tbody>

        <tbody v-else-if="items.length">
          <tr v-for="a in items" :key="a.id" class="hover:bg-base-200/40">
            <td>
              <div class="font-semibold">{{ a.nombre || a.calle }}</div>
              <div class="text-xs opacity-60">
                {{ a.calle }}
                <span v-if="a.colonia"> · {{ a.colonia }}</span>
                <span v-if="a.codigoPostal"> · {{ a.codigoPostal }}</span>
              </div>
            </td>

            <td>{{ a.ciudad }}, {{ a.estado }}</td>

            <td class="text-center">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  a.esPrincipal ? 'bg-primary/15 text-primary' : 'bg-base-200 text-base-content/60'
                "
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :class="a.esPrincipal ? 'bg-primary' : 'bg-base-content/40'"
                />
                {{ a.esPrincipal ? 'Principal' : 'Secundaria' }}
              </span>
            </td>

            <td class="text-center">
              <div class="flex items-center justify-center gap-2">
                <div v-if="canUpdate" class="tooltip" data-tip="Editar">
                  <button
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost"
                    @click="$emit('edit', a)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div v-if="canDelete" class="tooltip" data-tip="Eliminar">
                  <button
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-error"
                    @click="$emit('delete', a.id)"
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

    <!-- MOBILE CARDS -->
    <div class="md:hidden space-y-4">
      <div
        v-for="a in items"
        :key="a.id"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm space-y-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="font-semibold truncate">{{ a.nombre || a.calle }}</div>
            <div class="text-xs opacity-60 truncate">{{ a.calle }} {{ a.numero }}</div>
            <div class="text-xs opacity-60">{{ a.ciudad }}, {{ a.estado }}</div>
          </div>

          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shrink-0"
            :class="
              a.esPrincipal ? 'bg-primary/15 text-primary' : 'bg-base-200 text-base-content/60'
            "
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="a.esPrincipal ? 'bg-primary' : 'bg-base-content/40'"
            />
            {{ a.esPrincipal ? 'Principal' : 'Secundaria' }}
          </span>
        </div>

        <div class="flex justify-end gap-2">
          <button
            v-if="canUpdate"
            class="btn btn-circle btn-sm btn-ghost"
            @click="$emit('edit', a)"
          >
            <Icon name="edit" size="sm" />
          </button>

          <button
            v-if="canDelete"
            class="btn btn-circle btn-sm btn-ghost text-error"
            @click="$emit('delete', a.id)"
          >
            <Icon name="trash" size="sm" />
          </button>
        </div>
      </div>

      <div
        v-if="!loading && !items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 text-center opacity-70"
      >
        <Icon name="map-pin" size="lg" />
        <p class="mt-2 text-sm">Este cliente no tiene direcciones registradas</p>
      </div>
    </div>
  </div>
</template>
