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
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase text-base-content/70">
          <tr>
            <th class="min-w-[260px]">Dirección</th>
            <th class="min-w-[200px]">Ciudad</th>
            <th class="min-w-[160px] text-center">Tipo</th>
            <th class="w-[120px] text-center">Acciones</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando direcciones…
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else-if="items.length">
          <tr v-for="a in items" :key="a.id" class="hover:bg-base-200/40 transition">
            <!-- Dirección -->
            <td>
              <div class="font-semibold truncate max-w-[420px]" :title="a.nombre || a.calle">
                {{ a.nombre || a.calle }}
              </div>
              <div class="text-xs opacity-60 truncate max-w-[420px]">
                {{ a.calle }}
                <span v-if="a.colonia"> · {{ a.colonia }}</span>
                <span v-if="a.codigoPostal"> · {{ a.codigoPostal }}</span>
              </div>
            </td>

            <!-- Ciudad -->
            <td class="truncate max-w-[260px]" :title="`${a.ciudad}, ${a.estado}`">
              {{ a.ciudad }}, {{ a.estado }}
            </td>

            <!-- Tipo -->
            <td class="text-center">
              <span v-if="a.esPrincipal" class="badge badge-outline bg-primary/15 text-primary">
                Principal
              </span>
              <span v-else class="badge badge-outline bg-base-200 text-base-content/60">
                Secundaria
              </span>
            </td>

            <!-- Acciones -->
            <td class="text-center">
              <div class="flex items-center justify-center gap-1">
                <div v-if="canUpdate" class="tooltip" data-tip="Editar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="$emit('edit', a)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div v-if="canDelete" class="tooltip" data-tip="Eliminar">
                  <button
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

        <!-- Empty -->
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

    <!-- =========================
         MOBILE CARDS (<md)
    ========================== -->
    <div class="md:hidden space-y-3">
      <!-- Loading -->
      <div
        v-if="loading"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center justify-center gap-2"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando direcciones…</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        <Icon name="map-pin" size="lg" class="mx-auto mb-2" />
        <p class="text-sm">Este cliente no tiene direcciones registradas</p>
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="a in items"
        :key="a.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="font-semibold truncate">
              {{ a.nombre || a.calle }}
            </div>
            <div class="text-xs opacity-60 truncate mt-1">
              {{ a.calle }}
              <span v-if="a.colonia"> · {{ a.colonia }}</span>
              <span v-if="a.codigoPostal"> · {{ a.codigoPostal }}</span>
            </div>
          </div>

          <span
            v-if="a.esPrincipal"
            class="badge badge-outline bg-primary/15 text-primary shrink-0"
          >
            Principal
          </span>
          <span v-else class="badge badge-outline bg-base-200 text-base-content/60 shrink-0">
            Secundaria
          </span>
        </div>

        <!-- City -->
        <div class="mt-3 text-sm">
          <span class="opacity-60">Ciudad:</span>
          {{ a.ciudad }}, {{ a.estado }}
        </div>

        <!-- Actions -->
        <div class="mt-4 flex gap-2">
          <button v-if="canUpdate" class="btn btn-sm btn-outline flex-1" @click="$emit('edit', a)">
            <Icon name="edit" size="sm" />
            Editar
          </button>

          <button
            v-if="canDelete"
            class="btn btn-sm btn-outline btn-error flex-1"
            @click="$emit('delete', a.id)"
          >
            <Icon name="trash" size="sm" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
