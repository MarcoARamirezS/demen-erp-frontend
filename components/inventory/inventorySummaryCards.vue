<script setup lang="ts">
import type { InventorySummary } from '~/types/inventory'
import Icon from '~/components/ui/Icon.vue'

defineProps<{
  summary: InventorySummary
  loading?: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            Productos
          </p>
          <p class="mt-2 text-2xl font-bold">
            {{ loading ? '...' : summary.totalProducts }}
          </p>
        </div>

        <div class="rounded-xl bg-primary/10 p-3 text-primary">
          <Icon name="boxes" class="h-5 w-5" />
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            Stock bajo
          </p>
          <p class="mt-2 text-2xl font-bold text-warning">
            {{ loading ? '...' : summary.lowStockProducts }}
          </p>
        </div>

        <div class="rounded-xl bg-warning/10 p-3 text-warning">
          <Icon name="triangle-alert" class="h-5 w-5" />
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            Sin existencias
          </p>
          <p class="mt-2 text-2xl font-bold text-error">
            {{ loading ? '...' : summary.outOfStockProducts }}
          </p>
        </div>

        <div class="rounded-xl bg-error/10 p-3 text-error">
          <Icon name="package-x" class="h-5 w-5" />
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            Movimientos hoy
          </p>
          <p class="mt-2 text-2xl font-bold text-info">
            {{ loading ? '...' : summary.movementsToday }}
          </p>
        </div>

        <div class="rounded-xl bg-info/10 p-3 text-info">
          <Icon name="activity" class="h-5 w-5" />
        </div>
      </div>
    </div>
  </div>
</template>
