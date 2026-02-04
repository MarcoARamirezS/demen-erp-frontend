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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="rounded-xl border border-base-300 bg-base-100 p-4">
        <p class="text-xs opacity-60">Marca</p>
        <p class="font-medium">{{ product?.brand || '—' }}</p>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-4">
        <p class="text-xs opacity-60">Categoría</p>
        <p class="font-medium">{{ product?.category || '—' }}</p>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-4">
        <p class="text-xs opacity-60">Unidad</p>
        <p class="font-medium uppercase">{{ product?.unit }}</p>
      </div>
    </div>

    <div
      v-if="suggestedSupplierProduct"
      class="rounded-xl border border-success/30 bg-success/5 p-4"
    >
      <p class="text-xs opacity-70">Costo sugerido</p>

      <p class="text-2xl font-bold text-success">
        {{ suggestedSupplierProduct.currentPrice }}
        {{ suggestedSupplierProduct.currency }}
      </p>

      <p class="text-xs opacity-60">
        Proveedor:
        <span class="font-medium">
          {{ suggestedSupplierProduct.supplierId }}
        </span>
        <span v-if="suggestedSupplierProduct.preferred" class="badge badge-success ml-2">
          Preferido
        </span>
      </p>
    </div>

    <!-- =========================
         PROVEEDORES DEL PRODUCTO
    ========================== -->
    <SupplierProductsTable
      :items="supplierProductsStore.items"
      :loading="supplierProductsStore.loading"
      :has-more="supplierProductsStore.hasMore"
      @edit="openEdit"
      @delete="remove"
      @load-more="loadMore"
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
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useProductsStore } from '~/stores/products.store'
import { useSupplierProductsStore } from '~/stores/supplier-products.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import SupplierProductsTable from '~/components/supplier-products/SupplierProductTable.vue'
import SupplierProductDialog from '~/components/supplier-products/SupplierProductDialog.vue'

import type { SupplierProduct } from '~/types/supplier-product'

const suggestedSupplierProduct = computed(() => {
  return suggestedCost(supplierProductsStore.items)
})

function suggestedCost(list: SupplierProduct[]) {
  const active = list.filter(i => i.active)

  if (!active.length) return null

  const preferred = active.find(i => i.preferred)
  if (preferred) return preferred

  return [...active].sort((a, b) => a.currentPrice - b.currentPrice)[0]
}

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

const product = computed(
  () => productsStore.items.find(p => p.id === productId) || productsStore.selected
)

onMounted(async () => {
  await Promise.all([
    productsStore.get(productId),
    supplierProductsStore.reset(),
    supplierProductsStore.fetch({ productId }),
  ])
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
    ui.showToast('success', 'Proveedor asignado al producto')
  } else {
    await supplierProductsStore.update(payload.id, payload)
    ui.showToast('success', 'Relación actualizada')
  }
}

function loadMore() {
  supplierProductsStore.fetchMore({ productId })
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
