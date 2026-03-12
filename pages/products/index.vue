<template>
  <div class="space-y-6">
    <!-- =====================================================
     HEADER
===================================================== -->
    <!-- =====================================================
     HEADER
===================================================== -->
    <div class="space-y-4">
      <!-- Title -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Productos</h1>

          <p class="text-sm opacity-60 mt-1">Catálogo general de productos</p>
        </div>

        <ClientOnly>
          <UiButton
            v-if="auth.hasPermission('products:create')"
            icon="plus"
            variant="primary"
            size="sm"
            @click="openCreate"
          >
            Nuevo producto
          </UiButton>
        </ClientOnly>
      </div>

      <!-- Filters -->
      <div
        class="flex flex-col lg:flex-row lg:items-end gap-3 rounded-2xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
      >
        <!-- Search -->
        <div class="w-full lg:w-[40%]">
          <label class="text-xs opacity-70 block mb-1"> Buscar </label>

          <UiInput
            v-model="search"
            size="sm"
            placeholder="Producto, número de parte o marca..."
            class="w-full"
          >
            <template #prefix>
              <Icon name="search" size="sm" />
            </template>
          </UiInput>
        </div>

        <!-- Family -->
        <div class="w-full lg:w-[25%]">
          <label class="text-xs opacity-70 block mb-1"> Familia </label>

          <UiSelect
            v-model="selectedFamilyId"
            size="sm"
            class="w-full"
            placeholder="Todas las familias"
            :options="familyOptions"
          />
        </div>

        <!-- Category -->
        <div class="w-full lg:w-[25%]">
          <label class="text-xs opacity-70 block mb-1"> Categoría </label>

          <UiSelect
            v-model="selectedCategoryId"
            size="sm"
            class="w-full"
            :disabled="!selectedFamilyId"
            placeholder="Todas las categorías"
            :options="categoryOptions"
          />
        </div>

        <!-- Clear -->
        <div class="w-full lg:w-[10%] flex items-end">
          <UiButton size="sm" variant="outline" class="w-full" @click="clearFilters">
            Limpiar
          </UiButton>
        </div>
      </div>
    </div>

    <ProductsTable
      :items="filteredItems"
      :loading="store.loading"
      :has-more="store.hasMore"
      @edit="openEdit"
      @delete="confirmDelete"
      @load-more="loadMore"
    />

    <ClientOnly>
      <ProductDialog
        v-if="dialogOpen"
        v-model="dialogOpen"
        :mode="dialogMode"
        :model="selected"
        @submit="handleSubmit"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useProductsStore } from '~/stores/products.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'
import { useDebounceFn } from '@vueuse/core'

import ProductsTable from '~/components/products/ProductsTable.vue'
import ProductDialog from '~/components/products/ProductDialog.vue'
import type { Product } from '~/types/product'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'products:list',
})

const search = ref('')

const runSearch = useDebounceFn(async (v: string) => {
  store.setSearch(v)
  await store.fetch()
}, 400)

watch(search, runSearch)

const familyOptions = computed(() => [
  { label: 'Todas las familias', value: '' },
  ...familiesStore.items.map(f => ({
    label: f.name,
    value: f.id,
  })),
])

const categoryOptions = computed(() => [
  { label: 'Todas las categorías', value: '' },
  ...categoriesStore.items.map(c => ({
    label: c.name,
    value: c.id,
  })),
])

const store = useProductsStore()
const auth = useAuthStore()
const ui = useUiStore()
const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const selectedFamilyId = ref('')
const selectedCategoryId = ref('')

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<Product | null>(null)

onMounted(async () => {
  store.reset()
  await Promise.all([store.fetch(), familiesStore.fetch()])
})

watch(selectedFamilyId, async id => {
  selectedCategoryId.value = ''
  if (id) {
    await categoriesStore.fetchByFamily(id)
  } else {
    categoriesStore.clear()
  }
})

watch(search, async v => {
  store.setSearch(v)
  await store.fetch()
})

const filteredItems = computed(() => {
  return store.items.filter(p => {
    if (selectedFamilyId.value && p.familyId !== selectedFamilyId.value) return false
    if (selectedCategoryId.value && p.categoryId !== selectedCategoryId.value) return false
    return true
  })
})

function clearFilters() {
  selectedFamilyId.value = ''
  selectedCategoryId.value = ''
  categoriesStore.clear()
}

function loadMore() {
  store.fetch()
}

function openCreate() {
  dialogMode.value = 'create'
  selected.value = null
  dialogOpen.value = true
}

function openEdit(item: Product) {
  dialogMode.value = 'edit'
  selected.value = JSON.parse(JSON.stringify(item))
  dialogOpen.value = true
}

async function confirmDelete(item: Product) {
  const ok = await ui.confirm({
    title: 'Eliminar producto',
    message: `¿Eliminar el producto "${item.name}"?`,
  })

  if (!ok) return

  await store.remove(item.id)
  ui.showToast('success', 'Producto eliminado')
}

async function handleSubmit() {
  dialogOpen.value = false
  ui.showToast(
    'success',
    dialogMode.value === 'create' ? 'Producto creado' : 'Producto actualizado'
  )
}
</script>
