<script setup lang="ts">
import type { InventoryMovementType, InventoryStockStatus } from '~/types/inventory'
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  mode: 'stock' | 'movements'
  search: string
  movementType?: InventoryMovementType | ''
  stockStatus?: InventoryStockStatus | ''
  canCreate?: boolean
}>()

defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:movementType', value: InventoryMovementType | ''): void
  (e: 'update:stockStatus', value: InventoryStockStatus | ''): void
  (e: 'create'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
    <div
      class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_auto_auto] xl:items-end"
    >
      <!-- BUSCAR -->
      <label class="form-control w-full">
        <div class="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Buscar
        </div>

        <label class="input input-bordered flex items-center gap-2">
          <Icon name="search" class="h-4 w-4 opacity-60" />
          <input
            :value="search"
            type="text"
            class="grow"
            :placeholder="
              mode === 'stock'
                ? 'Buscar por producto o número de parte...'
                : 'Buscar por producto, parte o motivo...'
            "
            @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          />
        </label>
      </label>

      <!-- FILTRO -->
      <label v-if="mode === 'movements'" class="form-control w-full">
        <div class="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Tipo
        </div>

        <select
          class="select select-bordered w-full"
          :value="movementType || ''"
          @change="
            $emit(
              'update:movementType',
              (($event.target as HTMLSelectElement).value || '') as InventoryMovementType | ''
            )
          "
        >
          <option value="">Todos</option>
          <option value="IN">Entradas</option>
          <option value="OUT">Salidas</option>
          <option value="ADJUST">Ajustes</option>
        </select>
      </label>

      <label v-else class="form-control w-full">
        <div class="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Estado de stock
        </div>

        <select
          class="select select-bordered w-full"
          :value="stockStatus || ''"
          @change="
            $emit(
              'update:stockStatus',
              (($event.target as HTMLSelectElement).value || '') as InventoryStockStatus | ''
            )
          "
        >
          <option value="">Todos</option>
          <option value="OK">Disponible</option>
          <option value="LOW">Stock bajo</option>
          <option value="OUT">Sin existencias</option>
        </select>
      </label>

      <!-- LIMPIAR -->
      <div class="w-full xl:w-auto">
        <div
          class="mb-1 text-xs font-semibold uppercase tracking-wide text-transparent select-none"
        >
          Acción
        </div>

        <button class="btn btn-outline w-full xl:w-auto" @click="$emit('reset')">
          <Icon name="rotate-ccw" class="h-4 w-4" />
          Limpiar
        </button>
      </div>

      <!-- NUEVO -->
      <div v-if="canCreate" class="w-full xl:w-auto">
        <div
          class="mb-1 text-xs font-semibold uppercase tracking-wide text-transparent select-none"
        >
          Acción
        </div>

        <button class="btn btn-primary w-full xl:w-auto" @click="$emit('create')">
          <Icon name="plus" class="h-4 w-4" />
          Nuevo movimiento
        </button>
      </div>
    </div>
  </div>
</template>
