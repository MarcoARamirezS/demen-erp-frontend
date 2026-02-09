<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th class="min-w-[260px]">Proveedor</th>
            <th class="min-w-[220px]">Contacto</th>
            <th class="min-w-[200px]">Condiciones</th>
            <th class="w-[120px] text-center">Acciones</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando proveedores…
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else-if="items.length">
          <tr v-for="s in items" :key="s.id" class="hover:bg-base-200/40 transition">
            <!-- Proveedor -->
            <td>
              <div class="font-semibold truncate max-w-[420px]" :title="s.name">
                {{ s.name }}
              </div>
              <div class="text-xs opacity-60 truncate max-w-[420px]">
                {{ s.code }}
              </div>
            </td>

            <!-- Contacto -->
            <td class="text-sm truncate max-w-[260px]">
              <div>{{ s.email || '—' }}</div>
              <div class="text-xs opacity-60">{{ s.phone || '' }}</div>
            </td>

            <!-- Condiciones -->
            <td class="text-sm">{{ s.paymentTermsDays }} días · {{ s.defaultCurrency }}</td>

            <!-- Acciones -->
            <td class="text-center">
              <div class="flex items-center justify-center gap-1">
                <div class="tooltip" data-tip="Editar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="$emit('edit', s)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div class="tooltip" data-tip="Eliminar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-error"
                    @click="$emit('delete', s)"
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
            <td colspan="4" class="p-10 text-center opacity-70">No hay proveedores registrados</td>
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
        <span class="text-sm opacity-70">Cargando proveedores…</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        No hay proveedores registrados
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="s in items"
        :key="s.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm overflow-hidden"
      >
        <div class="font-semibold truncate">
          {{ s.name }}
        </div>

        <div class="text-xs opacity-60 truncate mt-1">
          {{ s.code }}
        </div>

        <div class="mt-3 space-y-1 text-sm">
          <div>
            <span class="opacity-60">Email:</span>
            {{ s.email || '—' }}
          </div>

          <div v-if="s.phone">
            <span class="opacity-60">Tel:</span>
            {{ s.phone }}
          </div>

          <div>
            <span class="opacity-60">Condiciones:</span>
            {{ s.paymentTermsDays }} días · {{ s.defaultCurrency }}
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex gap-2">
          <button class="btn btn-sm btn-outline flex-1" @click="$emit('edit', s)">
            <Icon name="edit" size="sm" />
            Editar
          </button>

          <button class="btn btn-sm btn-outline btn-error flex-1" @click="$emit('delete', s)">
            <Icon name="trash" size="sm" />
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- =========================
         LOAD MORE
    ========================== -->
    <div v-if="hasMore" class="mt-4 flex justify-center">
      <UiButton size="sm" variant="outline" :loading="loading" @click="$emit('load-more')">
        Cargar más
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: any[]
  loading: boolean
  hasMore: boolean
}>()

defineEmits(['edit', 'delete', 'load-more'])
</script>
