<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Proveedores</h1>
          <p class="mt-1 text-sm opacity-60">Catálogo de proveedores del sistema</p>
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

      <div
        class="flex flex-col gap-3 rounded-2xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 lg:flex-row lg:items-end"
      >
        <div class="w-full lg:w-[40%]">
          <label class="mb-1 block text-xs opacity-70">Buscar proveedor</label>

          <UiInput
            :model-value="search"
            size="sm"
            placeholder="NOMBRE, RFC, CÓDIGO, EMAIL..."
            class="w-full uppercase"
            @update:model-value="handleSearchInput"
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
      @remove="confirmDelete"
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

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'suppliers:list',
})

const store = useSuppliersStore()
const auth = useAuthStore()
const ui = useUiStore()

const search = ref('')
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<Supplier | null>(null)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function handleSearchInput(value: string | number) {
  search.value = store.normalizeSearch(String(value ?? ''))
}

watch(search, value => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(async () => {
    try {
      store.setSearch(value)
      await store.fetch()
    } catch (error: any) {
      ui.showToast(
        'error',
        error?.data?.message || error?.message || 'No se pudo cargar la lista de proveedores'
      )
    }
  }, 250)
})

onMounted(async () => {
  try {
    store.reset()
    await store.fetch()
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo cargar la lista de proveedores'
    )
  }
})

async function loadMore() {
  if (store.loading || !store.hasMore) return

  try {
    await store.fetchMore()
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo cargar más proveedores'
    )
  }
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

async function confirmDelete(item: Supplier) {
  const confirmed = await ui.confirm({
    title: 'Eliminar proveedor',
    message: `¿Eliminar el proveedor "${item.name}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
  })

  if (!confirmed) return

  try {
    await store.remove(item.id)
    ui.showToast('success', 'Proveedor eliminado correctamente')
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo eliminar el proveedor'
    )
  }
}

async function handleSubmit(payload: any) {
  try {
    if (dialogMode.value === 'create') {
      const created = await store.create(payload)
      ui.showToast('success', `Proveedor creado correctamente: ${created?.code || ''}`.trim())
    } else if (selected.value) {
      await store.update(selected.value.id, payload)
      ui.showToast('success', 'Proveedor actualizado correctamente')
    }

    dialogOpen.value = false
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo guardar el proveedor'
    )
  }
}
</script>
