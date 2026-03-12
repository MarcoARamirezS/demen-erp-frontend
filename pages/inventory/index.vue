<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useInventoryStore } from '~/stores/inventory.store'
import { useAuthStore } from '~/stores/auth.store'
import InventoryTable from '~/components/inventory/InventoryTable.vue'
import InventoryMovementDialog from '~/components/inventory/InventoryMovementDialog.vue'

const search = ref('')

let searchTimeout: any = null

watch(search, value => {
  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(async () => {
    const product = inventory.items.find(p =>
      p.product?.name?.toLowerCase().includes(value.toLowerCase())
    )

    inventory.setProductFilter(product?.id ?? null)

    await inventory.fetch()
  }, 400)
})

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'inventory:list',
})

const inventory = useInventoryStore()
const auth = useAuthStore()

const openDialog = ref(false)

function openCreate() {
  openDialog.value = true
}

onMounted(() => {
  inventory.reset()
  inventory.fetch()
})
</script>

<template>
  <div class="space-y-4">
    <!-- HEADER -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Inventario</h1>

          <p class="opacity-70 text-sm mt-1">Control de entradas, salidas y ajustes</p>
        </div>

        <UiButton
          v-if="auth.hasPermission('inventory:create')"
          icon="plus"
          size="sm"
          @click="openCreate"
        >
          Nuevo movimiento
        </UiButton>
      </div>

      <!-- SEARCH -->
      <div class="mt-4 flex flex-col lg:flex-row gap-3 lg:items-end">
        <div class="w-full lg:w-[40%]">
          <label class="text-xs opacity-70 block mb-1"> Buscar producto </label>

          <UiInput
            v-model="search"
            size="sm"
            placeholder="Nombre o número de parte..."
            class="w-full"
          >
            <template #prefix>
              <Icon name="search" size="sm" />
            </template>
          </UiInput>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <InventoryTable
      :items="inventory.items"
      :loading="inventory.loading"
      :cursor="inventory.cursor"
      @load-more="inventory.fetch({ cursor: inventory.cursor })"
    />

    <!-- DIALOG -->
    <ClientOnly>
      <InventoryMovementDialog v-model="openDialog" @submit="inventory.create" />
    </ClientOnly>
  </div>
</template>
