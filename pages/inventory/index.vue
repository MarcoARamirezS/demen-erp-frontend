<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useInventoryMovementsStore } from '~/stores/inventoryMovements.store'
import { useInventoryStockStore } from '~/stores/inventoryStock.store'
import InventorySummaryCards from '~/components/inventory/InventorySummaryCards.vue'
import InventoryToolbar from '~/components/inventory/InventoryToolbar.vue'
import InventoryMovementsTable from '~/components/inventory/InventoryMovementsTable.vue'
import InventoryStockTable from '~/components/inventory/InventoryStockTable.vue'
import InventoryMovementDialog from '~/components/inventory/InventoryMovementDialog.vue'

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'inventory:list',
})

const auth = useAuthStore()
const movementsStore = useInventoryMovementsStore()
const stockStore = useInventoryStockStore()

const openDialog = ref(false)
const activeTab = ref<'stock' | 'movements'>('stock')

const stockSearch = ref('')
const stockStatus = ref<'' | 'OK' | 'LOW' | 'OUT'>('')

const movementSearch = ref('')
const movementType = ref<'' | 'IN' | 'OUT' | 'ADJUST'>('')

let stockTimeout: ReturnType<typeof setTimeout> | null = null
let movementTimeout: ReturnType<typeof setTimeout> | null = null

function openCreate() {
  openDialog.value = true
}

function resetStockFilters() {
  stockSearch.value = ''
  stockStatus.value = ''
}

function resetMovementFilters() {
  movementSearch.value = ''
  movementType.value = ''
}

function syncFiltersToStores() {
  stockStore.setFilters({
    search: stockSearch.value,
    stockStatus: stockStatus.value,
  })

  movementsStore.setFilters({
    search: movementSearch.value,
    type: movementType.value,
  })
}

async function reloadInventoryData() {
  if (stockTimeout) {
    clearTimeout(stockTimeout)
    stockTimeout = null
  }

  if (movementTimeout) {
    clearTimeout(movementTimeout)
    movementTimeout = null
  }

  syncFiltersToStores()

  stockStore.reset()
  movementsStore.reset()

  await Promise.all([stockStore.fetchSummary(), stockStore.fetch(), movementsStore.fetch()])
}

watch(
  [stockSearch, stockStatus],
  () => {
    if (stockTimeout) clearTimeout(stockTimeout)

    stockTimeout = setTimeout(async () => {
      stockStore.setFilters({
        search: stockSearch.value,
        stockStatus: stockStatus.value,
      })

      await stockStore.fetch()
    }, 350)
  },
  { deep: true }
)

watch(
  [movementSearch, movementType],
  () => {
    if (movementTimeout) clearTimeout(movementTimeout)

    movementTimeout = setTimeout(async () => {
      movementsStore.setFilters({
        search: movementSearch.value,
        type: movementType.value,
      })

      await movementsStore.fetch()
    }, 350)
  },
  { deep: true }
)

onMounted(async () => {
  await reloadInventoryData()
})
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- HEADER -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6 shadow-sm"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Inventario</h1>
          <p class="mt-1 text-sm opacity-70">Existencias, movimientos y control de stock</p>
        </div>
      </div>

      <div class="mt-5">
        <InventorySummaryCards :summary="stockStore.summary" :loading="stockStore.summaryLoading" />
      </div>
    </div>

    <!-- TABS -->
    <div class="rounded-2xl border border-base-300 bg-base-100 p-2 shadow-sm">
      <div class="grid grid-cols-2 gap-2">
        <button
          class="btn"
          :class="activeTab === 'stock' ? 'btn-primary' : 'btn-ghost'"
          @click="activeTab = 'stock'"
        >
          <Icon name="boxes" class="h-4 w-4" />
          Existencias
        </button>

        <button
          class="btn"
          :class="activeTab === 'movements' ? 'btn-primary' : 'btn-ghost'"
          @click="activeTab = 'movements'"
        >
          <Icon name="arrow-left-right" class="h-4 w-4" />
          Movimientos
        </button>
      </div>
    </div>

    <!-- TOOLBAR -->
    <InventoryToolbar
      v-if="activeTab === 'stock'"
      mode="stock"
      :search="stockSearch"
      :stock-status="stockStatus"
      :can-create="auth.hasPermission('inventory:create')"
      @update:search="stockSearch = $event"
      @update:stock-status="stockStatus = $event"
      @create="openCreate"
      @reset="resetStockFilters"
    />

    <InventoryToolbar
      v-else
      mode="movements"
      :search="movementSearch"
      :movement-type="movementType"
      :can-create="auth.hasPermission('inventory:create')"
      @update:search="movementSearch = $event"
      @update:movement-type="movementType = $event"
      @create="openCreate"
      @reset="resetMovementFilters"
    />

    <!-- CONTENT -->
    <InventoryStockTable
      v-if="activeTab === 'stock'"
      :items="stockStore.items"
      :loading="stockStore.loading"
      :cursor="stockStore.cursor"
      @load-more="stockStore.fetch({ cursor: stockStore.cursor || undefined })"
    />

    <InventoryMovementsTable
      v-else
      :items="movementsStore.items"
      :loading="movementsStore.loading"
      :cursor="movementsStore.cursor"
      @load-more="movementsStore.fetch({ cursor: movementsStore.cursor || undefined })"
    />

    <!-- DIALOG -->
    <ClientOnly>
      <InventoryMovementDialog
        v-model="openDialog"
        @submit="
          async payload => {
            await movementsStore.create(payload)
            await reloadInventoryData()
          }
        "
      />
    </ClientOnly>
  </div>
</template>
