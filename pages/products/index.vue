<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useProductsStore } from '~/stores/products.store'
import { useUiStore } from '~/stores/ui.store'

import ProductTable from '~/components/products/ProductTable.vue'
import ProductDialog from '~/components/products/ProductDialog.vue'
import type { CreateProductDto } from '~/types/product'

definePageMeta({ layout: 'default', middleware: 'auth' })

const auth = useAuthStore()
const products = useProductsStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<any | null>(null)

const canList = computed(() => auth.hasPermission('products:list'))
const canCreate = computed(() => auth.hasPermission('products:create'))
const canRead = computed(() => auth.hasPermission('products:read'))

onMounted(async () => {
  if (!canList.value) {
    ui.showToast('warning', 'No tienes permiso para ver Productos')
    return
  }
  await refresh()
})

async function refresh() {
  products.reset()
  await products.fetch()
}

function openCreate() {
  selected.value = null
  dialogMode.value = 'create'
  dialogOpen.value = true
}

function openEdit(p: any) {
  selected.value = p
  dialogMode.value = 'edit'
  dialogOpen.value = true
}

async function submit(payload: CreateProductDto) {
  if (dialogMode.value === 'create') {
    await products.create(payload)
  } else if (selected.value) {
    await products.update(selected.value.id, payload)
  }
  dialogOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- =========================
         HEADER CARD
    ========================== -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-5"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Productos</h1>
          <p class="text-sm opacity-70">Catálogo de productos (sin inventario)</p>
        </div>

        <ClientOnly>
          <div class="flex gap-2">
            <UiButton
              icon="refresh"
              variant="outline"
              size="sm"
              :disabled="products.loading"
              @click="refresh"
            >
              Recargar
            </UiButton>

            <UiButton v-if="canCreate" variant="primary" size="sm" @click="openCreate">
              Nuevo producto
            </UiButton>
          </div>
        </ClientOnly>
      </div>
    </div>

    <!-- =========================
         TABLE
    ========================== -->
    <ProductTable
      :items="products.items"
      :loading="products.loading"
      :can-read="canRead"
      @edit="openEdit"
    />

    <!-- =========================
         DIALOG
    ========================== -->
    <ClientOnly>
      <ProductDialog v-model="dialogOpen" :mode="dialogMode" :model="selected" @submit="submit" />
    </ClientOnly>
  </div>
</template>
