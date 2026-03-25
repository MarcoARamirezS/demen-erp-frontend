<template>
  <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- MOBILE FILTER SUMMARY / LOAD -->
    <div
      v-if="loading && !items.length"
      class="flex items-center justify-center rounded-2xl border border-base-300 bg-base-100 p-10"
    >
      <span class="loading loading-spinner loading-md mr-3" />
      <span class="text-sm opacity-70">Cargando proveedores...</span>
    </div>

    <template v-else>
      <!-- DESKTOP -->
      <div class="hidden overflow-x-auto rounded-2xl border border-base-300 md:block">
        <table class="table w-full">
          <thead class="bg-base-200 text-xs uppercase tracking-wider text-base-content/70">
            <tr>
              <th>Código</th>
              <th>Proveedor</th>
              <th>Contacto</th>
              <th>RFC</th>
              <th>Estado</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody v-if="items.length">
            <tr v-for="item in items" :key="item.id" class="transition hover:bg-base-200/40">
              <td class="align-top">
                <div class="flex min-w-0 flex-col">
                  <span class="font-semibold text-base-content">
                    {{ item.code || '—' }}
                  </span>
                </div>
              </td>

              <td class="align-top">
                <div class="flex min-w-0 flex-col">
                  <span class="truncate font-semibold text-base-content" :title="item.name">
                    {{ item.name }}
                  </span>

                  <span
                    v-if="item.legalName"
                    class="truncate text-xs text-base-content/60"
                    :title="item.legalName"
                  >
                    {{ item.legalName }}
                  </span>
                </div>
              </td>

              <td class="align-top">
                <div class="flex min-w-0 flex-col">
                  <span
                    class="truncate text-sm text-base-content"
                    :title="item.email || item.phone || '—'"
                  >
                    {{ item.email || item.phone || '—' }}
                  </span>

                  <span
                    v-if="item.phone && item.email"
                    class="truncate text-xs text-base-content/60"
                    :title="item.phone"
                  >
                    {{ item.phone }}
                  </span>
                </div>
              </td>

              <td class="align-top">
                <span class="font-mono text-sm">
                  {{ item.rfc || '—' }}
                </span>
              </td>

              <td class="align-top">
                <span
                  class="badge badge-sm border font-semibold"
                  :class="
                    item.active
                      ? 'border-success bg-success text-success-content'
                      : 'border-error bg-error text-error-content'
                  "
                >
                  {{ item.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>

              <td class="align-top">
                <div class="flex items-center justify-center gap-2">
                  <div class="tooltip" data-tip="Editar">
                    <button
                      type="button"
                      class="btn btn-circle btn-sm btn-ghost text-primary"
                      @click="$emit('edit', item)"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                  </div>

                  <div class="tooltip" :data-tip="item.active ? 'Desactivar' : 'Activar'">
                    <button
                      type="button"
                      class="btn btn-circle btn-sm btn-ghost"
                      :class="item.active ? 'text-warning' : 'text-success'"
                      @click="$emit('toggle-active', item)"
                    >
                      <Icon :name="item.active ? 'ban' : 'check-circle'" size="sm" />
                    </button>
                  </div>

                  <div class="tooltip" data-tip="Eliminar">
                    <button
                      type="button"
                      class="btn btn-circle btn-sm btn-ghost text-error"
                      @click="$emit('delete', item)"
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
              <td colspan="6" class="p-10 text-center text-sm opacity-70">
                No existen proveedores registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE -->
      <div class="space-y-3 md:hidden">
        <div
          v-for="item in items"
          :key="item.id"
          class="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3 border-b border-base-300 px-4 py-3">
            <div class="min-w-0">
              <div class="truncate text-sm font-bold text-base-content" :title="item.name">
                {{ item.name }}
              </div>

              <div class="mt-1 text-xs text-base-content/60">
                {{ item.code || 'Sin código' }}
              </div>
            </div>

            <span
              class="badge badge-outline whitespace-nowrap"
              :class="item.active ? 'badge-success' : 'badge-error'"
            >
              {{ item.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="space-y-2 px-4 py-3 text-sm">
            <div class="flex flex-col">
              <span class="text-xs font-medium uppercase text-base-content/50">Razón social</span>
              <span class="truncate text-base-content" :title="item.legalName || '—'">
                {{ item.legalName || '—' }}
              </span>
            </div>

            <div class="flex flex-col">
              <span class="text-xs font-medium uppercase text-base-content/50">Contacto</span>
              <span class="truncate text-base-content" :title="item.email || item.phone || '—'">
                {{ item.email || item.phone || '—' }}
              </span>
            </div>

            <div class="flex flex-col">
              <span class="text-xs font-medium uppercase text-base-content/50">RFC</span>
              <span class="font-mono text-base-content">
                {{ item.rfc || '—' }}
              </span>
            </div>
          </div>

          <div class="border-t border-base-300 px-4 py-3">
            <div class="grid grid-cols-3 gap-2">
              <button type="button" class="btn btn-sm btn-outline" @click="$emit('edit', item)">
                <Icon name="edit" size="sm" />
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline"
                :class="item.active ? 'text-warning' : 'text-success'"
                @click="$emit('toggle-active', item)"
              >
                <Icon :name="item.active ? 'ban' : 'check-circle'" size="sm" />
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline text-error"
                @click="$emit('delete', item)"
              >
                <Icon name="trash" size="sm" />
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="!items.length && !loading"
          class="rounded-2xl border border-base-300 bg-base-100 p-10 text-center text-sm opacity-70 shadow-sm"
        >
          No existen proveedores registrados
        </div>
      </div>

      <!-- LOAD MORE -->
      <div v-if="hasMore" class="mt-4 flex justify-center">
        <UiButton
          variant="outline"
          size="sm"
          :loading="loading"
          :disabled="loading"
          @click="$emit('load-more')"
        >
          Cargar más
        </UiButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Supplier } from '~/types/supplier'
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'

defineProps<{
  items: Supplier[]
  loading: boolean
  hasMore: boolean
}>()

defineEmits<{
  (e: 'edit', item: Supplier): void
  (e: 'delete', item: Supplier): void
  (e: 'toggle-active', item: Supplier): void
  (e: 'load-more'): void
}>()
</script>
