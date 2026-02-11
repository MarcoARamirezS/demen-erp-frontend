<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold">Productos</h1>
        <p class="text-sm opacity-60">Catálogo general de productos</p>
      </div>

      <div class="flex flex-wrap gap-2 items-center">
        <!-- FAMILIA -->
        <UiSelect v-model="selectedFamilyId" size="sm" class="min-w-[180px]">
          <UiOption value="">Todas las familias</UiOption>
          <UiOption v-for="f in familiesStore.items" :key="f.id" :value="f.id">
            {{ f.name }}
          </UiOption>
        </UiSelect>

        <!-- CATEGORÍA -->
        <UiSelect
          v-model="selectedCategoryId"
          size="sm"
          class="min-w-[180px]"
          :disabled="!selectedFamilyId"
        >
          <UiOption value="">Todas las categorías</UiOption>
          <UiOption v-for="c in categoriesStore.items" :key="c.id" :value="c.id">
            {{ c.name }}
          </UiOption>
        </UiSelect>

        <!-- LIMPIAR -->
        <UiButton size="sm" variant="outline" @click="clearFilters"> Limpiar </UiButton>

        <!-- NUEVO -->
        <ClientOnly>
          <UiButton
            v-if="auth.hasPermission('products:create')"
            icon="plus"
            variant="primary"
            size="sm"
            @click="openCreate"
          >
            Nuevo
          </UiButton>
        </ClientOnly>
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
import { onMounted, ref, computed } from 'vue'
import { useProductsStore } from '~/stores/products.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'

import ProductsTable from '~/components/products/ProductsTable.vue'
import ProductDialog from '~/components/products/ProductDialog.vue'
const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const selectedFamilyId = ref<string>('')
const selectedCategoryId = ref<string>('')

import type { Product } from '~/types/product'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'products:list',
})

const store = useProductsStore()
const auth = useAuthStore()
const ui = useUiStore()

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

const filteredItems = computed(() => {
  return store.items.filter(p => {
    if (selectedFamilyId.value && p.familyId !== selectedFamilyId.value) {
      return false
    }
    if (selectedCategoryId.value && p.categoryId !== selectedCategoryId.value) {
      return false
    }
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
  selected.value = item
  dialogOpen.value = true
}

function confirmDelete(item: Product) {
  ui.confirm({
    title: 'Eliminar producto',
    message: `¿Eliminar el producto "${item.name}"?`,
    variant: 'danger',
    onConfirm: async () => {
      await store.remove(item.id)
      ui.showToast('success', 'Producto eliminado')
    },
  })
}

async function handleSubmit() {
  dialogOpen.value = false
  ui.showToast(
    'success',
    dialogMode.value === 'create' ? 'Producto creado' : 'Producto actualizado'
  )
}
</script>
