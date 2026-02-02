<template>
  <div class="space-y-6">
    <!-- =========================
         HEADER
    ========================== -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Proveedores por producto</h1>
        <p class="text-sm opacity-60">Relación comercial entre productos y proveedores</p>
      </div>

      <ClientOnly>
        <UiButton
          v-if="auth.hasPermission('supplier_products:create')"
          icon="plus"
          variant="primary"
          @click="openCreate"
        >
          Asignar proveedor
        </UiButton>
      </ClientOnly>
    </div>

    <!-- =========================
         TABLE
    ========================== -->
    <SupplierProductsTable
      :items="store.items"
      :loading="store.loading"
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

import SupplierProductsTable from '~/components/supplier-products/SupplierProductsTable.vue'
import SupplierProductDialog from '~/components/supplier-products/SupplierProductDialog.vue'

import type { SupplierProduct } from '~/types/supplier-product'

definePageMeta({
  layout: 'default',
  middleware: ['auth', ['permission', 'supplier_products:list']],
})

const store = useSupplierProductsStore()
const auth = useAuthStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<SupplierProduct | null>(null)

onMounted(() => store.fetch())

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
