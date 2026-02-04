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
    <SupplierProductsTable
      :items="store.items"
      :loading="store.loading"
      :has-more="store.hasMore"
      @edit="openEdit"
      @delete="remove"
      @load-more="loadMore"
    />

    <!-- Dialog -->
    <ClientOnly>
      <SupplierProductDialog
        v-model="dialogOpen"
        :mode="dialogMode"
        :model="selected"
        @submit="handleSubmit"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupplierProductsStore } from '~/stores/supplier-products.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import SupplierProductsTable from '~/components/supplier-products/SupplierProductTable.vue'
import SupplierProductDialog from '~/components/supplier-products/SupplierProductDialog.vue'

import type { SupplierProduct } from '~/types/supplier-product'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'supplier_products:list',
})

const store = useSupplierProductsStore()
const auth = useAuthStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<SupplierProduct | null>(null)

onMounted(async () => {
  store.reset()
  await store.fetch()
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
  if (dialogMode.value === 'create') {
    await store.create(payload)
    ui.showToast('success', 'Proveedor asignado')
  } else if (selected.value) {
    await store.update(selected.value.id, payload)
    ui.showToast('success', 'Relación actualizada')
  }
}

function refresh() {
  store.refreshLastQuery()
  ui.showToast('success', 'Listado actualizado')
}

function loadMore() {
  store.fetchMore(store.lastQuery)
}

async function remove(item: SupplierProduct) {
  ui.confirm({
    title: 'Eliminar relación',
    message: '¿Deseas eliminar esta relación proveedor-producto?',
    variant: 'danger',
    onConfirm: async () => {
      await store.remove(item.id)
      ui.showToast('success', 'Relación eliminada')
    },
  })
}
</script>
