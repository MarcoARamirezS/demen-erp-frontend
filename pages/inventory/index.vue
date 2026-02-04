<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useInventoryStore } from '~/stores/inventory.store'
import { useAuthStore } from '~/stores/auth.store'
import InventoryTable from '~/components/inventory/InventoryTable.vue'
import InventoryMovementDialog from '~/components/inventory/InventoryMovementDialog.vue'

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
    <!-- HEADER CARD -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Inventario</h1>
          <p class="opacity-70 text-sm">Control de entradas, salidas y ajustes</p>
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
