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
            {{ supplier?.name || 'Proveedor' }}
          </h1>
          <p class="text-sm opacity-60">
            {{ supplier?.legalName || '—' }}
          </p>
        </div>

        <ClientOnly>
          <UiButton
            v-if="auth.hasPermission('supplier_products:create')"
            icon="plus"
            variant="primary"
            size="sm"
            @click="openAssignProduct"
          >
            Agregar producto
          </UiButton>
        </ClientOnly>
      </div>
    </div>

    <!-- =========================
         INFO PROVEEDOR
    ========================== -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="rounded-xl border border-base-300 bg-base-100 p-4">
        <p class="text-xs opacity-60">RFC</p>
        <p class="font-medium">{{ supplier?.rfc || '—' }}</p>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-4">
        <p class="text-xs opacity-60">Moneda por defecto</p>
        <p class="font-medium">{{ supplier?.defaultCurrency }}</p>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-4">
        <p class="text-xs opacity-60">Crédito</p>
        <p class="font-medium">{{ supplier?.paymentTermsDays }} días</p>
      </div>
    </div>

    <!-- =========================
         PRODUCTOS DEL PROVEEDOR
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

import { useSuppliersStore } from '~/stores/suppliers.store'
import { useSupplierProductsStore } from '~/stores/supplier-products.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import SupplierProductsTable from '~/components/supplier-products/SupplierProductTable.vue'
import SupplierProductDialog from '~/components/supplier-products/SupplierProductDialog.vue'

import type { SupplierProduct } from '~/types/supplier-product'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'suppliers:read',
})

const route = useRoute()
const supplierId = route.params.id as string

const suppliersStore = useSuppliersStore()
const supplierProductsStore = useSupplierProductsStore()
const auth = useAuthStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogModel = ref<Partial<SupplierProduct> | null>(null)

const supplier = computed(
  () => suppliersStore.items.find(s => s.id === supplierId) || suppliersStore.selected
)

onMounted(async () => {
  await Promise.all([
    suppliersStore.get(supplierId),
    supplierProductsStore.reset(),
    supplierProductsStore.fetch({ supplierId }),
  ])
})

function openAssignProduct() {
  dialogMode.value = 'create'
  dialogModel.value = { supplierId }
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
    ui.showToast('success', 'Producto asignado al proveedor')
  } else {
    await supplierProductsStore.update(payload.id, payload)
    ui.showToast('success', 'Relación actualizada')
  }
}

function loadMore() {
  supplierProductsStore.fetchMore({ supplierId })
}

function remove(item: SupplierProduct) {
  ui.confirm({
    title: 'Eliminar producto',
    message: '¿Eliminar este producto del proveedor?',
    variant: 'danger',
    onConfirm: async () => {
      await supplierProductsStore.remove(item.id)
      ui.showToast('success', 'Relación eliminada')
    },
  })
}
</script>
