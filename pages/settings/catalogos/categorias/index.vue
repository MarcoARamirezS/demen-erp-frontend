<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Categorías de productos</h1>
          <p class="text-sm opacity-60">Catálogo dependiente de familias</p>
        </div>

        <div class="flex gap-2 items-center">
          <UiSelect v-model="selectedFamilyId" size="sm" class="min-w-[220px]">
            <UiOption value=""> Selecciona una familia </UiOption>
            <UiOption v-for="f in familiesStore.items" :key="f.id" :value="f.id">
              {{ f.name }}
            </UiOption>
          </UiSelect>

          <ClientOnly>
            <UiButton
              v-if="selectedFamilyId && auth.hasPermission('product_categories:create')"
              icon="plus"
              variant="primary"
              @click="openCreate"
            >
              Nueva categoría
            </UiButton>
          </ClientOnly>
        </div>
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
          <tr v-for="c in categoriesStore.items" :key="c.id" class="hover">
            <td class="font-medium">
              {{ c.name }}
            </td>

            <td class="text-right space-x-2">
              <UiButton size="sm" variant="ghost" icon="edit" @click="openEdit(c)" />
              <UiButton size="sm" variant="ghost" icon="trash" @click="confirmDelete(c)" />
            </td>
          </tr>

          <tr v-if="!categoriesStore.items.length && selectedFamilyId">
            <td colspan="2" class="text-center text-sm opacity-60 py-6">
              No hay categorías registradas
            </td>
          </tr>

          <tr v-if="!selectedFamilyId">
            <td colspan="2" class="text-center text-sm opacity-60 py-6">
              Selecciona una familia para ver sus categorías
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- DIALOG -->
    <ClientOnly>
      <ProductCategoryDialog
        v-if="dialogOpen"
        v-model="dialogOpen"
        :mode="dialogMode"
        :model="selected"
        :family-id="selectedFamilyId"
        @submit="handleSubmit"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import ProductCategoryDialog from '~/components/product-categories/ProductCategoryDialog.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'product_categories:list',
})

const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()
const auth = useAuthStore()
const ui = useUiStore()

const selectedFamilyId = ref<string>('')

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<any | null>(null)

onMounted(() => {
  familiesStore.fetch()
})

watch(selectedFamilyId, async id => {
  if (id) {
    await categoriesStore.fetchByFamily(id)
  } else {
    categoriesStore.clear()
  }
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
    title: 'Eliminar categoría',
    message: `¿Eliminar la categoría "${item.name}"?`,
    variant: 'danger',
    onConfirm: async () => {
      await categoriesStore.remove(item.id)
      ui.showToast('success', 'Categoría eliminada')
    },
  })
}

async function handleSubmit(payload: any) {
  if (dialogMode.value === 'create') {
    await categoriesStore.create(payload)
  } else if (selected.value) {
    await categoriesStore.update(selected.value.id, payload)
  }
  dialogOpen.value = false
}
</script>
