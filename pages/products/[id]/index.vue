<template>
  <div class="space-y-6">
    <!-- =========================
         HEADER
    ========================== -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold">
            {{ product?.name || 'Producto' }}
          </h1>
          <p class="text-sm opacity-60">SKU: {{ product?.sku }}</p>
        </div>

        <ClientOnly>
          <UiButton
            v-if="auth.hasPermission('supplier_products:create')"
            icon="plus"
            variant="primary"
            size="sm"
            @click="openAssignSupplier"
          >
            Agregar proveedor
          </UiButton>
        </ClientOnly>
      </div>
    </div>

    <!-- =========================
         INFO PRODUCTO
    ========================== -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="rounded-xl border border-base-300 bg-base-100 p-4">
        <p class="text-xs opacity-60">Marca</p>
        <p class="font-medium">{{ product?.brand || '-' }}</p>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-4">
        <p class="text-xs opacity-60">Categoría</p>
        <p class="font-medium">{{ product?.category || '-' }}</p>
      </div>
    </div>

    <!-- =========================
         PROVEEDORES DEL PRODUCTO
    ========================== -->
    <SupplierProductsTable
      :items="supplierProducts"
      :loading="supplierProductsStore.loading"
      @edit="openEdit"
      @delete="remove"
    />

    <!-- =========================
         DIALOG
    ========================== -->
    <ClientOnly>
      <SupplierProductDialog
        v-model="dialogOpen"
        :mode="dialogMode"
        :model="dialogModel"
        @submit="handleSubmit"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

import { useProductsStore } from '~/stores/products.store'
import { useSupplierProductsStore } from '~/stores/supplier-products.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import SupplierProductsTable from '~/components/supplier-products/SupplierProductsTable.vue'
import SupplierProductDialog from '~/components/supplier-products/SupplierProductDialog.vue'

import type { SupplierProduct } from '~/types/supplier-product'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'products:read',
})

const route = useRoute()
const productId = route.params.id as string

const productsStore = useProductsStore()
const supplierProductsStore = useSupplierProductsStore()
const auth = useAuthStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogModel = ref<Partial<SupplierProduct> | null>(null)

const product = computed(() => productsStore.selected)

const supplierProducts = computed(() =>
  supplierProductsStore.items.filter(i => i.productId === productId)
)

onMounted(async () => {
  await Promise.all([productsStore.get(productId), supplierProductsStore.fetch({ productId })])
})

onBeforeUnmount(() => {
  productsStore.clearSelected()
})

function openAssignSupplier() {
  dialogMode.value = 'create'
  dialogModel.value = { productId }
  dialogOpen.value = true
}

function openEdit(item: SupplierProduct) {
  dialogMode.value = 'edit'
  dialogModel.value = item
  dialogOpen.value = true
}

async function handleSubmit(payload: any) {
  if (dialogMode.value === 'create') {
    await supplierProductsStore.create(payload)
    ui.showToast('success', 'Proveedor asignado')
  } else {
    await supplierProductsStore.update(payload.id, payload)
    ui.showToast('success', 'Relación actualizada')
  }
}

function remove(item: SupplierProduct) {
  ui.confirm({
    title: 'Eliminar proveedor',
    message: '¿Eliminar este proveedor del producto?',
    variant: 'danger',
    onConfirm: async () => {
      await supplierProductsStore.remove(item.id)
      ui.showToast('success', 'Relación eliminada')
    },
  })
}
</script>
