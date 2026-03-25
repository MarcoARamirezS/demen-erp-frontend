<template>
  <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <div
      v-if="loading && !items.length"
      class="flex items-center justify-center rounded-2xl border border-base-300 bg-base-100 p-10"
    >
      <span class="loading loading-spinner loading-md mr-3" />
      <span class="text-sm opacity-70">Cargando productos...</span>
    </div>

    <template v-else>
      <!-- DESKTOP -->
      <div class="hidden overflow-x-auto rounded-2xl border border-base-300 md:block">
        <table class="table w-full">
          <thead class="bg-base-200 text-xs uppercase tracking-wider text-base-content/70">
            <tr>
              <th>Imagen</th>
              <th>Producto</th>
              <th>Núm. parte</th>
              <th>Marca</th>
              <th>Estado</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody v-if="items.length">
            <tr v-for="item in items" :key="item.id" class="transition hover:bg-base-200/40">
              <td class="align-top">
                <div
                  class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-200/40"
                >
                  <img
                    v-if="firstImage(item)"
                    :src="firstImage(item)"
                    alt="Producto"
                    class="h-full w-full object-cover"
                  />
                  <Icon v-else name="box" size="sm" class="text-base-content/40" />
                </div>
              </td>

              <td class="align-top">
                <div class="flex min-w-0 flex-col">
                  <span class="truncate font-semibold text-base-content" :title="item.name">
                    {{ item.name }}
                  </span>

                  <span
                    v-if="item.internalCode"
                    class="truncate text-xs text-base-content/60"
                    :title="item.internalCode"
                  >
                    {{ item.internalCode }}
                  </span>
                </div>
              </td>

              <td class="align-top">
                <span class="font-mono text-sm">
                  {{ item.partNumber || '—' }}
                </span>
              </td>

              <td class="align-top">
                <span class="text-sm">
                  {{ item.brand || '—' }}
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
                No existen productos registrados
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
          <div class="flex gap-3 px-4 py-4">
            <div
              class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-200/40"
            >
              <img
                v-if="firstImage(item)"
                :src="firstImage(item)"
                alt="Producto"
                class="h-full w-full object-cover"
              />
              <Icon v-else name="box" size="sm" class="text-base-content/40" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-bold text-base-content" :title="item.name">
                {{ item.name }}
              </div>

              <div class="mt-1 text-xs text-base-content/60">
                {{ item.internalCode || 'Sin código interno' }}
              </div>

              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span class="badge badge-outline">
                  {{ item.partNumber || 'Sin número de parte' }}
                </span>

                <span
                  class="badge badge-outline"
                  :class="item.active ? 'badge-success' : 'badge-error'"
                >
                  {{ item.active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="mt-2 text-xs text-base-content/60">Marca: {{ item.brand || '—' }}</div>
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
          No existen productos registrados
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
import type { Product } from '~/types/product'
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'

defineProps<{
  items: Product[]
  loading: boolean
  hasMore: boolean
}>()

defineEmits<{
  (e: 'edit', item: Product): void
  (e: 'delete', item: Product): void
  (e: 'toggle-active', item: Product): void
  (e: 'load-more'): void
}>()

function firstImage(item: Product) {
  const image = Array.isArray(item.images) ? item.images[0] : null
  return image?.secureUrl || image?.url || ''
}
</script>
