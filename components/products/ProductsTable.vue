<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
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
                <!-- Imagen -->
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
                      aria-label="Sin imagen"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        class="h-8 w-8 text-base-content/40"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                        <circle cx="9" cy="10" r="1.5"></circle>
                        <path d="M21 16l-5.2-5.2a1 1 0 0 0-1.4 0L8 17"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Info -->
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
                      v-else-if="shouldShowCategoryLoading(p)"
                      class="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-[11px] font-medium text-warning shadow-sm"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-warning"></span>
                      Cargando categoría...
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
                :title="p.sku"
              >
                <span class="truncate">{{ p.sku || '—' }}</span>
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

    <!-- MOBILE -->
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
                aria-label="Sin imagen"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-8 w-8 text-base-content/40"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
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
                <span class="truncate">{{ p.sku || '—' }}</span>
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
                v-else-if="shouldShowCategoryLoading(p)"
                class="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-[11px] font-medium text-warning shadow-sm"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-warning"></span>
                Cargando categoría...
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
import { computed, onMounted, watch } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'

const props = defineProps<{
  items: any[]
  loading: boolean
  hasMore: boolean
}>()

defineEmits(['edit', 'delete', 'load-more'])

const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const familyMap = computed(() => {
  return new Map((familiesStore.items || []).map((item: any) => [item.id, item.name]))
})

const categoryMap = computed(() => {
  return new Map((categoriesStore.items || []).map((item: any) => [item.id, item.name]))
})

function getInlineFamilyName(product: any): string | null {
  return product?.familyName || product?.family?.name || null
}

function getInlineCategoryName(product: any): string | null {
  return product?.categoryName || product?.category?.name || null
}

function familyName(product: any): string | null {
  return getInlineFamilyName(product) || familyMap.value.get(product?.familyId) || null
}

function categoryName(product: any): string | null {
  return getInlineCategoryName(product) || categoryMap.value.get(product?.categoryId) || null
}

function shouldShowCategoryLoading(product: any): boolean {
  if (!product?.categoryId) return false
  if (categoryName(product)) return false
  if (!product?.familyId) return false

  return !categoriesStore.wasFamilyTried?.(product.familyId)
}

async function ensureRelationsLoaded() {
  try {
    const familiesAction = (familiesStore as any).fetch
    if (!familiesStore.items?.length && typeof familiesAction === 'function') {
      await familiesAction.call(familiesStore)
    }

    const missingFamilyIds = Array.from(
      new Set(
        (props.items || [])
          .filter((item: any) => item?.familyId && item?.categoryId && !categoryName(item))
          .map((item: any) => item.familyId)
      )
    )

    if (!missingFamilyIds.length) return

    if (typeof categoriesStore.fetchManyFamilies === 'function') {
      await categoriesStore.fetchManyFamilies(missingFamilyIds)
      return
    }

    const fetchByFamily = (categoriesStore as any).fetchByFamily || (categoriesStore as any).fetch
    if (typeof fetchByFamily === 'function') {
      await Promise.allSettled(
        missingFamilyIds.map((familyId: string) => fetchByFamily.call(categoriesStore, familyId))
      )
    }
  } catch (error) {
    console.error('Error loading product relations:', error)
  }
}

onMounted(async () => {
  await ensureRelationsLoaded()
})

watch(
  () => props.items,
  async () => {
    await ensureRelationsLoaded()
  },
  { deep: true, immediate: true }
)

function productImage(product: any): string | null {
  if (!product || typeof product !== 'object') return null

  const candidates = [
    product.imageUrl,
    product.image,
    product.photoUrl,
    product.thumbnailUrl,
    product.thumbnail,
    product.previewUrl,
    Array.isArray(product.images) ? product.images[0] : null,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }

    if (
      candidate &&
      typeof candidate === 'object' &&
      typeof candidate.url === 'string' &&
      candidate.url.trim()
    ) {
      return candidate.url.trim()
    }
  }

  return null
}
</script>
