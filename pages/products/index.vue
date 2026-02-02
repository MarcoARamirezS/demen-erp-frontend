<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Productos</h1>
        <p class="text-sm opacity-60">Catálogo general de productos</p>
      </div>

      <ClientOnly>
        <UiButton
          v-if="auth.hasPermission('products:create')"
          icon="plus"
          variant="primary"
          @click="openCreate"
        >
          Nuevo producto
        </UiButton>
      </ClientOnly>
    </div>

    <ProductsTable
      :items="store.items"
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
import { onMounted, ref } from 'vue'
import { useProductsStore } from '~/stores/products.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
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

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<Product | null>(null)

onMounted(() => {
  store.reset()
  store.fetch()
})

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

async function handleSubmit(payload: any) {
  if (dialogMode.value === 'create') {
    await store.create(payload)
  } else if (selected.value) {
    await store.update(selected.value.id, payload)
  }
  dialogOpen.value = false
}
</script>
