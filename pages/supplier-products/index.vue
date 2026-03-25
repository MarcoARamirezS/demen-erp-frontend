<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold">Proveedores por producto</h1>
        <p class="text-sm opacity-60">Relación comercial entre productos y proveedores</p>
      </div>

      <div class="flex items-center gap-2">
        <ClientOnly>
          <UiButton
            variant="outline"
            size="sm"
            icon="refresh-cw"
            :disabled="store.loading"
            @click="refresh"
          >
            Recargar
          </UiButton>
        </ClientOnly>

        <ClientOnly>
          <UiButton
            v-if="auth.hasPermission('supplier_products:create')"
            icon="plus"
            variant="primary"
            size="sm"
            @click="openCreate"
          >
            Asignar proveedor
          </UiButton>
        </ClientOnly>
      </div>
    </div>

    <!-- Table -->
    <SupplierProductTable
      :items="resolvedItems"
      :loading="store.loading"
      @edit="openEdit"
      @delete="remove"
      @toggle-active="handleToggleActive"
    />

    <!-- Dialog -->
    <ClientOnly>
      <SupplierProductDialog
        v-model="dialogOpen"
        :mode="dialogMode"
        :model="selected"
        :suppliers="suppliersStore.items"
        :products="productsStore.items"
        :on-submit="handleSubmit"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSupplierProductsStore } from '~/stores/supplier-products.store'
import { useSuppliersStore } from '~/stores/suppliers.store'
import { useProductsStore } from '~/stores/products.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import SupplierProductTable from '~/components/supplier-products/SupplierProductTable.vue'
import SupplierProductDialog from '~/components/supplier-products/SupplierProductDialog.vue'
import UiButton from '~/components/ui/UiButton.vue'

import type { SupplierProduct } from '~/types/supplier-product'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'supplier_products:list',
})

const store = useSupplierProductsStore()
const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()
const auth = useAuthStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<SupplierProduct | null>(null)

const resolvedItems = computed(() => {
  return (store.items || []).map((item: any) => {
    const supplier = suppliersStore.items.find((s: any) => s.id === item.supplierId) || null

    const product = productsStore.items.find((p: any) => p.id === item.productId) || null

    return {
      ...item,
      supplier,
      product,
      supplierName: supplier?.name || supplier?.legalName || '',
      supplierCode: supplier?.code || '',
      productName: product?.name || '',
      productPartNumber: product?.partNumber || '',
    }
  })
})

async function loadSupportCatalogs() {
  await Promise.all([suppliersStore.fetch(100), productsStore.fetch(100)])
}

onMounted(async () => {
  try {
    store.reset()
    await Promise.all([store.fetch(), loadSupportCatalogs()])
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo cargar la información'
    )
  }
})

function openCreate() {
  dialogMode.value = 'create'
  selected.value = null
  dialogOpen.value = true
}

function openEdit(item: SupplierProduct) {
  dialogMode.value = 'edit'
  selected.value = item
  dialogOpen.value = true
}

async function handleSubmit(payload: any) {
  try {
    if (dialogMode.value === 'create') {
      await store.create(payload)
      ui.showToast('success', 'Proveedor asignado correctamente')
    } else if (selected.value) {
      await store.update(selected.value.id, payload)
      ui.showToast('success', 'Relación actualizada correctamente')
    }

    dialogOpen.value = false

    await Promise.all([
      store.refreshLastQuery ? store.refreshLastQuery() : store.fetch(),
      loadSupportCatalogs(),
    ])
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo guardar la relación'
    )
    throw error
  }
}

async function handleToggleActive(item: SupplierProduct) {
  const willActivate = item.active === false

  const confirmed = await ui.confirm({
    title: willActivate ? 'Activar relación' : 'Desactivar relación',
    message: willActivate
      ? '¿Deseas activar esta relación proveedor-producto?'
      : '¿Deseas desactivar esta relación proveedor-producto?',
    confirmText: willActivate ? 'Activar' : 'Desactivar',
    cancelText: 'Cancelar',
    variant: willActivate ? 'info' : 'warning',
  })

  if (!confirmed) return

  try {
    await store.update(item.id, { active: willActivate })

    ui.showToast(
      'success',
      willActivate ? 'Relación activada correctamente' : 'Relación desactivada correctamente'
    )

    await Promise.all([
      store.refreshLastQuery ? store.refreshLastQuery() : store.fetch(),
      loadSupportCatalogs(),
    ])
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo actualizar la relación'
    )
  }
}

async function refresh() {
  try {
    await Promise.all([
      store.refreshLastQuery ? store.refreshLastQuery() : store.fetch(),
      loadSupportCatalogs(),
    ])
    ui.showToast('success', 'Listado actualizado')
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo actualizar el listado'
    )
  }
}

async function remove(item: SupplierProduct) {
  const confirmed = await ui.confirm({
    title: 'Eliminar relación',
    message: '¿Deseas eliminar esta relación proveedor-producto?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'danger',
  })

  if (!confirmed) return

  try {
    await store.remove(item.id)
    ui.showToast('success', 'Relación eliminada correctamente')

    await Promise.all([
      store.refreshLastQuery ? store.refreshLastQuery() : store.fetch(),
      loadSupportCatalogs(),
    ])
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo eliminar la relación'
    )
  }
}
</script>
