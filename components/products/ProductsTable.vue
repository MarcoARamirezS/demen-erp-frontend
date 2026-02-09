<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th class="min-w-[280px]">Producto</th>
            <th class="min-w-[160px]">SKU</th>
            <th class="min-w-[120px]">Unidad</th>
            <th class="w-[120px] text-center">Acciones</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando productos…
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else-if="items.length">
          <tr v-for="p in items" :key="p.id" class="hover:bg-base-200/40 transition">
            <!-- Producto -->
            <td>
              <div class="font-semibold truncate max-w-[420px]" :title="p.name">
                {{ p.name }}
              </div>

              <div class="text-xs opacity-60 truncate max-w-[420px]">
                {{ p.brand || '—' }}
              </div>

              <!-- Family / Category -->
              <div class="flex flex-wrap gap-1 mt-1">
                <span v-if="familyName(p.familyId)" class="badge badge-outline text-xs">
                  {{ familyName(p.familyId) }}
                </span>

                <span v-if="categoryName(p.categoryId)" class="badge badge-ghost text-xs">
                  {{ categoryName(p.categoryId) }}
                </span>
              </div>
            </td>

            <!-- SKU -->
            <td class="font-mono text-xs truncate max-w-[240px]" :title="p.sku">
              {{ p.sku }}
            </td>

            <!-- Unidad -->
            <td class="uppercase text-sm">
              {{ p.unit }}
            </td>

            <!-- Acciones -->
            <td class="text-center">
              <div class="flex items-center justify-center gap-1">
                <div class="tooltip" data-tip="Editar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-primary"
                    @click="$emit('edit', p)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>

                <div class="tooltip" data-tip="Eliminar">
                  <button
                    class="btn btn-circle btn-sm btn-ghost text-error"
                    @click="$emit('delete', p)"
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
            <td colspan="4" class="p-10 text-center opacity-70">No hay productos registrados</td>
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
        <span class="text-sm opacity-70">Cargando productos…</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        No hay productos registrados
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="p in items"
        :key="p.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm overflow-hidden"
      >
        <!-- Header -->
        <div class="font-semibold truncate">
          {{ p.name }}
        </div>

        <div class="text-xs opacity-60 mt-1 truncate">
          {{ p.sku }}
        </div>

        <div class="mt-2 flex flex-wrap gap-1">
          <span v-if="familyName(p.familyId)" class="badge badge-outline text-xs">
            {{ familyName(p.familyId) }}
          </span>

          <span v-if="categoryName(p.categoryId)" class="badge badge-ghost text-xs">
            {{ categoryName(p.categoryId) }}
          </span>
        </div>

        <div class="mt-2 text-sm">
          <span class="opacity-60">Unidad:</span>
          {{ p.unit }}
        </div>

        <!-- Actions -->
        <div class="mt-4 flex gap-2">
          <button class="btn btn-sm btn-outline flex-1" @click="$emit('edit', p)">
            <Icon name="edit" size="sm" />
            Editar
          </button>

          <button class="btn btn-sm btn-outline btn-error flex-1" @click="$emit('delete', p)">
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
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'

defineProps<{
  items: any[]
  loading: boolean
  hasMore: boolean
}>()

defineEmits(['edit', 'delete', 'load-more'])

const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

function familyName(id?: string) {
  return familiesStore.items.find(f => f.id === id)?.name
}

function categoryName(id?: string) {
  return categoriesStore.items.find(c => c.id === id)?.name
}
</script>
