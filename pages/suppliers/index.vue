<template>
  <div class="space-y-6">
    <!-- =====================================================
     HEADER
===================================================== -->
    <div class="space-y-4">
      <!-- Title -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Proveedores</h1>

          <p class="text-sm opacity-60 mt-1">Catálogo de proveedores del sistema</p>
        </div>

        <ClientOnly>
          <UiButton
            v-if="auth.hasPermission('suppliers:create')"
            icon="plus"
            variant="primary"
            size="sm"
            @click="openCreate"
          >
            Nuevo proveedor
          </UiButton>
        </ClientOnly>
      </div>

      <!-- Search -->
      <div
        class="flex flex-col lg:flex-row lg:items-end gap-3 rounded-2xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
      >
        <div class="w-full lg:w-[40%]">
          <label class="text-xs opacity-70 block mb-1"> Buscar proveedor </label>

          <UiInput
            v-model="search"
            size="sm"
            placeholder="Nombre, RFC, código, email..."
            class="w-full"
          >
            <template #prefix>
              <Icon name="search" size="sm" />
            </template>
          </UiInput>
        </div>
      </div>
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
import { onMounted, ref, watch } from 'vue'
import { useSuppliersStore } from '~/stores/suppliers.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
import SuppliersTable from '~/components/suppliers/SuppliersTable.vue'
import SupplierDialog from '~/components/suppliers/SupplierDialog.vue'
import type { Supplier } from '~/types/supplier'
const search = ref('')

let searchTimeout: any = null

watch(search, value => {
  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(async () => {
    store.setSearch(value)
    await store.fetch()
  }, 400)
})

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
