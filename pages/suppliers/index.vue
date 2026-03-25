<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Proveedores</h1>
        <p class="mt-1 text-sm opacity-60">Catálogo general de proveedores</p>
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
      class="flex flex-col gap-3 rounded-2xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 md:flex-row md:items-end"
    >
      <div class="w-full md:flex-1">
        <label class="mb-1 block text-xs opacity-70">Buscar</label>

        <UiInput
          :model-value="search"
          size="sm"
          placeholder="Código, nombre, razón social, RFC, email o teléfono..."
          class="w-full"
          @update:model-value="handleSearchInput"
        >
          <template #prefix>
            <Icon name="search" size="sm" />
          </template>
        </UiInput>
      </div>

      <div class="w-full md:w-52">
        <label class="mb-1 block text-xs opacity-70">Estado</label>

        <UiSelect
          v-model="activeFilter"
          size="sm"
          class="w-full"
          :options="activeFilterOptions"
          placeholder="Todos"
        />
      </div>

      <div class="flex w-full items-end md:w-auto">
        <UiButton size="sm" variant="outline" class="w-full md:w-auto" @click="clearFilters">
          Limpiar
        </UiButton>
      </div>
    </div>

    <SuppliersTable
      :items="store.items"
      :loading="store.loading"
      :has-more="store.hasMore"
      @edit="openEdit"
      @delete="confirmDelete"
      @toggle-active="handleToggleActive"
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
const activeFilter = ref<string>('')
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<Supplier | null>(null)

const activeFilterOptions = [
  { label: 'Todos', value: '' },
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' },
]

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

watch(activeFilter, async value => {
  try {
    if (value === 'true') {
      store.setActiveFilter(true)
    } else if (value === 'false') {
      store.setActiveFilter(false)
    } else {
      store.setActiveFilter(undefined)
    }

    await store.fetch()
  } catch (error: any) {
    ui.showToast('error', error?.data?.message || error?.message || 'No se pudo aplicar el filtro')
  }
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

async function handleToggleActive(item: Supplier) {
  const willActivate = !item.active

  const confirmed = await ui.confirm({
    title: willActivate ? 'Activar proveedor' : 'Desactivar proveedor',
    message: willActivate
      ? `¿Deseas activar el proveedor "${item.name}"?`
      : `¿Deseas desactivar el proveedor "${item.name}"?`,
    confirmText: willActivate ? 'Activar' : 'Desactivar',
    cancelText: 'Cancelar',
    variant: willActivate ? 'info' : 'warning',
  })

  if (!confirmed) return

  try {
    await store.update(item.id, { active: willActivate })
    ui.showToast(
      'success',
      willActivate ? 'Proveedor activado correctamente' : 'Proveedor desactivado correctamente'
    )
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo actualizar el proveedor'
    )
  }
}

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

async function suggestDeactivateSupplier(item: Supplier) {
  const deactivate = await ui.confirm({
    title: 'Desactivar proveedor',
    message:
      `El proveedor "${item.name}" tiene relaciones proveedor-producto y no puede eliminarse físicamente.\n\n` +
      '¿Deseas desactivarlo para ocultarlo del uso operativo sin perder historial?',
    confirmText: 'Desactivar',
    cancelText: 'Cancelar',
    variant: 'warning',
  })

  if (!deactivate) return

  try {
    await store.update(item.id, { active: false })
    ui.showToast('success', 'Proveedor desactivado correctamente')
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo desactivar el proveedor'
    )
  }
}

async function confirmDelete(item: Supplier) {
  const confirmed = await ui.confirm({
    title: 'Eliminar proveedor',
    message: `¿Eliminar el proveedor "${item.name}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'danger',
  })

  if (!confirmed) return

  try {
    await store.remove(item.id)
    ui.showToast('success', 'Proveedor eliminado correctamente')
  } catch (error: any) {
    const message = error?.data?.message || error?.message || 'No se pudo eliminar el proveedor'

    if (error?.data?.statusCode === 409 || error?.statusCode === 409) {
      ui.showToast('warning', message)
      await suggestDeactivateSupplier(item)
      return
    }

    ui.showToast('error', message)
  }
}

function clearFilters() {
  search.value = ''
  activeFilter.value = ''
  store.setSearch('')
  store.setActiveFilter(undefined)
  store.fetch()
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
