<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <table class="table w-full hidden md:table">
      <thead class="bg-base-200 text-xs uppercase">
        <tr>
          <th>Producto</th>
          <th>SKU</th>
          <th>Unidad</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in items" :key="p.id" class="hover">
          <td>
            <div class="font-medium">{{ p.name }}</div>
            <div class="text-xs opacity-60">{{ p.brand }}</div>

            <!-- 🔹 FAMILY / CATEGORY BADGES -->
            <div class="flex gap-1 mt-1">
              <span v-if="familyName(p.familyId)" class="badge badge-outline text-xs">
                {{ familyName(p.familyId) }}
              </span>

              <span v-if="categoryName(p.categoryId)" class="badge badge-ghost text-xs">
                {{ categoryName(p.categoryId) }}
              </span>
            </div>
          </td>

          <td class="font-mono text-sm">{{ p.sku }}</td>
          <td class="text-sm uppercase">{{ p.unit }}</td>

          <td class="text-right space-x-2">
            <UiButton size="sm" variant="ghost" icon="edit" @click="$emit('edit', p)" />
            <UiButton size="sm" variant="ghost" icon="trash" @click="$emit('delete', p)" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile -->
    <div class="md:hidden space-y-3">
      <div
        v-for="p in items"
        :key="p.id"
        class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="font-semibold">{{ p.name }}</div>
        <div class="text-xs opacity-60">{{ p.sku }}</div>

        <div class="flex gap-1 mt-2">
          <span v-if="familyName(p.familyId)" class="badge badge-outline text-xs">
            {{ familyName(p.familyId) }}
          </span>

          <span v-if="categoryName(p.categoryId)" class="badge badge-ghost text-xs">
            {{ categoryName(p.categoryId) }}
          </span>
        </div>

        <div class="flex justify-end gap-2 mt-3">
          <UiButton size="sm" variant="ghost" icon="edit" @click="$emit('edit', p)" />
          <UiButton size="sm" variant="ghost" icon="trash" @click="$emit('delete', p)" />
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-center" v-if="hasMore">
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
