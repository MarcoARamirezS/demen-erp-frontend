<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <div class="hidden overflow-x-auto rounded-2xl border border-base-300 md:block">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wider">
          <tr>
            <th class="min-w-[380px]">Producto</th>
            <th class="min-w-[170px]">SKU</th>
            <th class="min-w-[120px]">Unidad</th>
            <th class="w-[120px] text-center">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td colspan="4" class="p-10 text-center opacity-70">
              <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
              Cargando productos…
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="items.length">
          <tr v-for="p in items" :key="p.id" class="transition hover:bg-base-200/40">
            <td>
              <div class="flex items-start gap-4">
                <div class="shrink-0">
                  <div
                    class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm"
                  >
                    <img
                      v-if="productImage(p)"
                      :src="productImage(p)!"
                      :alt="p.name || 'Producto'"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />

                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center bg-gradient-to-br from-base-200 to-base-300/60"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        class="h-8 w-8 text-base-content/40"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                        <circle cx="9" cy="10" r="1.5"></circle>
                        <path d="M21 16l-5.2-5.2a1 1 0 0 0-1.4 0L8 17"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <div
                    class="truncate text-sm font-semibold text-base-content md:text-[15px]"
                    :title="p.name"
                  >
                    {{ p.name }}
                  </div>

                  <div class="mt-1 truncate text-xs text-base-content/60">
                    {{ p.brand || 'Sin marca' }}
                  </div>

                  <div class="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      v-if="familyName(p)"
                      class="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary shadow-sm"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
                      Familia: {{ familyName(p) }}
                    </span>

                    <span
                      v-else
                      class="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-[11px] font-medium text-base-content/60 shadow-sm"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-base-content/40"></span>
                      Sin familia
                    </span>

                    <span
                      v-if="categoryName(p)"
                      class="inline-flex items-center gap-1 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] font-medium text-secondary shadow-sm"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                      Categoría: {{ categoryName(p) }}
                    </span>

                    <span
                      v-else
                      class="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-[11px] font-medium text-base-content/60 shadow-sm"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-base-content/40"></span>
                      Sin categoría
                    </span>

                    <span
                      v-if="!productImage(p)"
                      class="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-[11px] font-medium text-base-content/60 shadow-sm"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-base-content/40"></span>
                      Sin imagen
                    </span>
                  </div>
                </div>
              </div>
            </td>

            <td>
              <div
                class="inline-flex max-w-[240px] items-center rounded-xl border border-base-300 bg-base-200/60 px-3 py-2 font-mono text-xs"
                :title="p.partNumber"
              >
                <span class="truncate">{{ p.partNumber || '—' }}</span>
              </div>
            </td>

            <td>
              <span
                class="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent"
              >
                {{ p.unit }}
              </span>
            </td>

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

        <tbody v-else>
          <tr>
            <td colspan="4" class="p-10 text-center opacity-70">No hay productos registrados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 md:hidden">
      <div
        v-if="loading"
        class="flex items-center justify-center gap-2 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm opacity-70">Cargando productos…</span>
      </div>

      <div
        v-else-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 text-center opacity-70 shadow-sm"
      >
        No hay productos registrados
      </div>

      <div
        v-else
        v-for="p in items"
        :key="p.id"
        class="w-full overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex items-start gap-3">
          <div class="shrink-0">
            <div
              class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm"
            >
              <img
                v-if="productImage(p)"
                :src="productImage(p)!"
                :alt="p.name || 'Producto'"
                class="h-full w-full object-cover"
                loading="lazy"
              />

              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-base-200 to-base-300/60"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-8 w-8 text-base-content/40"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <circle cx="9" cy="10" r="1.5"></circle>
                  <path d="M21 16l-5.2-5.2a1 1 0 0 0-1.4 0L8 17"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold">{{ p.name }}</div>

            <div class="mt-1 truncate text-xs text-base-content/60">
              {{ p.brand || 'Sin marca' }}
            </div>

            <div class="mt-2">
              <div
                class="inline-flex max-w-full items-center rounded-xl border border-base-300 bg-base-200/60 px-3 py-1.5 font-mono text-[11px]"
              >
                <span class="truncate">{{ p.partNumber || '—' }}</span>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-if="familyName(p)"
                class="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary shadow-sm"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Familia: {{ familyName(p) }}
              </span>

              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-[11px] font-medium text-base-content/60 shadow-sm"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-base-content/40"></span>
                Sin familia
              </span>

              <span
                v-if="categoryName(p)"
                class="inline-flex items-center gap-1 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] font-medium text-secondary shadow-sm"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                Categoría: {{ categoryName(p) }}
              </span>

              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-[11px] font-medium text-base-content/60 shadow-sm"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-base-content/40"></span>
                Sin categoría
              </span>
            </div>

            <div class="mt-3">
              <span
                class="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent"
              >
                {{ p.unit }}
              </span>
            </div>
          </div>
        </div>

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

    <div v-if="hasMore" class="mt-4 flex justify-center">
      <UiButton size="sm" variant="outline" :loading="loading" @click="$emit('load-more')">
        Cargar más
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'
import type { Product, ProductImage } from '~/types/product'

defineProps<{
  items: Product[]
  loading: boolean
  hasMore: boolean
}>()

defineEmits(['edit', 'delete', 'load-more'])

const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const familyMap = computed(() => {
  return new Map((familiesStore.items || []).map(item => [item.id, item.name]))
})

const categoryMap = computed(() => {
  return new Map((categoriesStore.items || []).map(item => [item.id, item.name]))
})

function familyName(product: Product): string | null {
  return familyMap.value.get(product.familyId) || null
}

function categoryName(product: Product): string | null {
  return categoryMap.value.get(product.categoryId) || null
}

function productImage(product: Product): string | null {
  if (!Array.isArray(product.images) || !product.images.length) return null

  const main = product.images.find((img: ProductImage) => img.isMain)
  return main?.url || product.images[0]?.url || null
}
</script>
