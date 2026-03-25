<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Productos</h1>
          <p class="mt-1 text-sm opacity-60">Catálogo general de productos</p>
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

      <div
        class="flex flex-col gap-3 rounded-2xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 lg:flex-row lg:items-end"
      >
        <div class="w-full lg:w-[32%]">
          <label class="mb-1 block text-xs opacity-70">Buscar</label>

          <UiInput
            :model-value="search"
            size="sm"
            placeholder="Producto, número de parte o marca..."
            class="w-full"
            @update:model-value="updateSearch"
          >
            <template #prefix>
              <Icon name="search" size="sm" />
            </template>
          </UiInput>
        </div>

        <div class="w-full lg:w-[20%]">
          <label class="mb-1 block text-xs opacity-70">Estado</label>

          <UiSelect
            v-model="activeFilter"
            size="sm"
            class="w-full"
            :options="activeFilterOptions"
            placeholder="Todos"
          />
        </div>

        <div class="w-full lg:w-[20%]">
          <label class="mb-1 block text-xs opacity-70">Familia</label>

          <UiSelect
            v-model="selectedFamilyId"
            size="sm"
            class="w-full"
            placeholder="Todas las familias"
            :options="familyOptions"
          />
        </div>

        <div class="w-full lg:w-[20%]">
          <label class="mb-1 block text-xs opacity-70">Categoría</label>

          <UiSelect
            v-model="selectedCategoryId"
            size="sm"
            class="w-full"
            :disabled="!selectedFamilyId"
            placeholder="Todas las categorías"
            :options="categoryOptions"
          />
        </div>

        <div class="flex w-full items-end lg:w-[8%]">
          <UiButton size="sm" variant="outline" class="w-full" @click="clearFilters">
            Limpiar
          </UiButton>
        </div>
      </div>
    </div>

    <ProductsTable
      :items="filteredItems"
      :loading="store.loading || relationsLoading"
      :has-more="store.hasMore"
      @edit="openEdit"
      @delete="confirmDelete"
      @toggle-active="handleToggleActive"
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
import { computed, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useProductsStore } from '~/stores/products.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'
import ProductsTable from '~/components/products/ProductsTable.vue'
import ProductDialog from '~/components/products/ProductDialog.vue'
import type { Product } from '~/types/product'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'products:list',
})

const store = useProductsStore()
const auth = useAuthStore()
const ui = useUiStore()
const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const relationsLoading = ref(false)

const search = ref('')
const activeFilter = ref<string>('')
const selectedFamilyId = ref('')
const selectedCategoryId = ref('')

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<Product | null>(null)

const activeFilterOptions = [
  { label: 'Todos', value: '' },
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' },
]

async function handleToggleActive(item: Product) {
  const willActivate = !item.active

  const confirmed = await ui.confirm({
    title: willActivate ? 'Activar producto' : 'Desactivar producto',
    message: willActivate
      ? `¿Deseas activar el producto "${item.name}"?`
      : `¿Deseas desactivar el producto "${item.name}"?`,
    confirmText: willActivate ? 'Activar' : 'Desactivar',
    cancelText: 'Cancelar',
    variant: willActivate ? 'info' : 'warning',
  })

  if (!confirmed) return

  try {
    await store.update(item.id, { active: willActivate })
    ui.showToast(
      'success',
      willActivate ? 'Producto activado correctamente' : 'Producto desactivado correctamente'
    )
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo actualizar el producto'
    )
  }
}

function normalizeText(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

function updateSearch(value: string | number | null | undefined) {
  search.value = String(value ?? '').toUpperCase()
}

const familyOptions = computed(() => [
  { label: 'Todas las familias', value: '' },
  ...familiesStore.items.map(f => ({
    label: f.name,
    value: f.id,
  })),
])

const categoryOptions = computed(() => [
  { label: 'Todas las categorías', value: '' },
  ...categoriesStore.items
    .filter(c => !selectedFamilyId.value || c.familyId === selectedFamilyId.value)
    .map(c => ({
      label: c.name,
      value: c.id,
    })),
])

const runSearch = useDebounceFn(async (value: string) => {
  const normalized = normalizeText(value)

  store.setSearch(normalized)
  await store.fetch()
  await ensureCategoryRelations()
}, 400)

watch(search, value => {
  runSearch(value)
})

watch(activeFilter, async value => {
  try {
    store.reset()

    await useApi('/products', {
      query: {
        limit: 10,
        search: store.search || undefined,
        active: value === 'true' ? true : value === 'false' ? false : undefined,
      },
    })

    await refreshProductsWithCurrentFilters()
  } catch (error) {
    console.error('Error applying product active filter:', error)
    ui.showToast('error', 'No se pudo aplicar el filtro de estado')
  }
})

watch(selectedFamilyId, async id => {
  selectedCategoryId.value = ''

  if (id) {
    await categoriesStore.fetchByFamily(id, true)
  } else {
    await ensureCategoryRelations()
  }
})

const filteredItems = computed(() => {
  return store.items.filter((p: Product) => {
    if (activeFilter.value === 'true' && p.active !== true) return false
    if (activeFilter.value === 'false' && p.active !== false) return false
    if (selectedFamilyId.value && p.familyId !== selectedFamilyId.value) return false
    if (selectedCategoryId.value && p.categoryId !== selectedCategoryId.value) return false
    return true
  })
})

async function ensureCategoryRelations() {
  try {
    relationsLoading.value = true

    const familyIds = Array.from(
      new Set(store.items.map((item: Product) => item?.familyId).filter(Boolean))
    ) as string[]

    if (!familyIds.length) return

    await categoriesStore.fetchManyFamilies(familyIds, false)
  } catch (error) {
    console.error('Error loading category relations:', error)
  } finally {
    relationsLoading.value = false
  }
}

async function refreshProductsWithCurrentFilters() {
  store.reset()

  const res = await useApi<any>('/products', {
    query: {
      limit: 10,
      search: store.search || undefined,
      active:
        activeFilter.value === 'true' ? true : activeFilter.value === 'false' ? false : undefined,
    },
  })

  store.items = res.items ?? []
  store.cursor = res.nextCursor ?? null
  store.hasMore = !!res.nextCursor
  await ensureCategoryRelations()
}

function clearFilters() {
  search.value = ''
  activeFilter.value = ''
  selectedFamilyId.value = ''
  selectedCategoryId.value = ''

  store.setSearch('')
  refreshProductsWithCurrentFilters()
}

function loadMore() {
  store.fetch().then(() => ensureCategoryRelations())
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

async function suggestDeactivateProduct(item: Product) {
  const deactivate = await ui.confirm({
    title: 'Desactivar producto',
    message:
      `El producto "${item.name}" tiene relaciones proveedor-producto y no puede eliminarse físicamente.\n\n` +
      '¿Deseas desactivarlo para ocultarlo del uso operativo sin perder historial?',
    confirmText: 'Desactivar',
    cancelText: 'Cancelar',
    variant: 'warning',
  })

  if (!deactivate) return

  try {
    await store.update(item.id, { active: false })
    ui.showToast('success', 'Producto desactivado correctamente')
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo desactivar el producto'
    )
  }
}

async function confirmDelete(item: Product) {
  const ok = await ui.confirm({
    title: 'Eliminar producto',
    message: `¿Eliminar el producto "${item.name}"?`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'danger',
  })

  if (!ok) return

  try {
    await store.remove(item.id)
    ui.showToast('success', 'Producto eliminado')
  } catch (error: any) {
    const message = error?.data?.message || error?.message || 'No se pudo eliminar el producto'

    if (error?.data?.statusCode === 409 || error?.statusCode === 409) {
      ui.showToast('warning', message)
      await suggestDeactivateProduct(item)
      return
    }

    ui.showToast('error', message)
  }
}

async function handleSubmit() {
  dialogOpen.value = false
  ui.showToast(
    'success',
    dialogMode.value === 'create' ? 'Producto creado' : 'Producto actualizado'
  )
}

onMounted(async () => {
  store.reset()
  categoriesStore.reset()

  await Promise.all([store.fetch(), familiesStore.fetch()])
  await ensureCategoryRelations()
})
</script>
