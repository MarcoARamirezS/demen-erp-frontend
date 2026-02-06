<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Familias de productos</h1>
          <p class="text-sm opacity-60">Catálogo maestro de clasificación</p>
        </div>

        <ClientOnly>
          <UiButton
            v-if="auth.hasPermission('product_families:create')"
            icon="plus"
            variant="primary"
            @click="openCreate"
          >
            Nueva familia
          </UiButton>
        </ClientOnly>
      </div>
    </div>

    <!-- TABLE -->
    <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
      <table class="table w-full">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th>Nombre</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="f in store.items" :key="f.id" class="hover">
            <td class="font-medium">
              {{ f.name }}
            </td>

            <td class="text-right space-x-2">
              <UiButton size="sm" variant="ghost" icon="edit" @click="openEdit(f)" />
              <UiButton size="sm" variant="ghost" icon="trash" @click="confirmDelete(f)" />
            </td>
          </tr>

          <tr v-if="!store.items.length && !store.loading">
            <td colspan="2" class="text-center text-sm opacity-60 py-6">
              No hay familias registradas
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- DIALOG -->
    <ClientOnly>
      <ProductFamilyDialog
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
import { ref, onMounted } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import ProductFamilyDialog from '~/components/product-families/ProductFamilyDialog.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'product_families:list',
})

const store = useProductFamiliesStore()
const auth = useAuthStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<any | null>(null)

onMounted(() => {
  store.fetch()
})

function openCreate() {
  dialogMode.value = 'create'
  selected.value = null
  dialogOpen.value = true
}

function openEdit(item: any) {
  dialogMode.value = 'edit'
  selected.value = item
  dialogOpen.value = true
}

function confirmDelete(item: any) {
  ui.confirm({
    title: 'Eliminar familia',
    message: `¿Eliminar la familia "${item.name}"?`,
    variant: 'danger',
    onConfirm: async () => {
      await store.remove(item.id)
      ui.showToast('success', 'Familia eliminada')
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
