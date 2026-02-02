<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Proveedores</h1>
        <p class="text-sm opacity-60">Catálogo de proveedores del sistema</p>
      </div>

      <ClientOnly>
        <UiButton
          v-if="auth.hasPermission('suppliers:create')"
          icon="plus"
          variant="primary"
          @click="openCreate"
        >
          Nuevo proveedor
        </UiButton>
      </ClientOnly>
    </div>

    <SuppliersTable
      :items="store.items"
      :loading="store.loading"
      :has-more="store.hasMore"
      @edit="openEdit"
      @delete="confirmDelete"
      @load-more="loadMore"
    />

    <ClientOnly>
      <SupplierDialog
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
import { useSuppliersStore } from '~/stores/suppliers.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
import SuppliersTable from '~/components/suppliers/SuppliersTable.vue'
import SupplierDialog from '~/components/suppliers/SupplierDialog.vue'
import type { Supplier } from '~/types/supplier'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'suppliers:list',
})

const store = useSuppliersStore()
const auth = useAuthStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<Supplier | null>(null)

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

function openEdit(item: Supplier) {
  dialogMode.value = 'edit'
  selected.value = item
  dialogOpen.value = true
}

function confirmDelete(item: Supplier) {
  ui.confirm({
    title: 'Eliminar proveedor',
    message: `¿Eliminar el proveedor "${item.name}"?`,
    variant: 'danger',
    onConfirm: async () => {
      await store.remove(item.id)
      ui.showToast('success', 'Proveedor eliminado')
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
