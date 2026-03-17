<template>
  <div
    class="animate-fadeIn space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg"
  >
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold">Historial de precios</h4>
    </div>

    <!-- ===============================
    DESKTOP TABLE (md+)
    ================================ -->

    <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wider">
          <tr>
            <th class="min-w-[160px]">Desde</th>
            <th class="min-w-[160px]">Precio</th>
            <th class="min-w-[120px]">Moneda</th>
          </tr>
        </thead>

        <!-- EMPTY -->

        <tbody v-if="!items.length">
          <tr>
            <td colspan="3" class="p-10 text-center opacity-70">No hay historial de precios</td>
          </tr>
        </tbody>

        <!-- ROWS -->

        <tbody v-else>
          <tr v-for="h in items" :key="h.id" class="hover:bg-base-200/40 transition">
            <!-- FECHA -->

            <td class="text-xs whitespace-nowrap">
              {{ formatDate(h.effectiveDateISO) }}
            </td>

            <!-- PRECIO -->

            <td class="font-mono whitespace-nowrap">
              {{ formatCurrency(h.price, h.currency) }}
            </td>

            <!-- MONEDA -->

            <td class="uppercase">
              {{ h.currency }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===============================
    MOBILE CARDS (<md)
    ================================ -->

    <div class="md:hidden space-y-3">
      <!-- EMPTY -->

      <div
        v-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        No hay historial de precios
      </div>

      <!-- CARDS -->

      <div
        v-else
        v-for="h in items"
        :key="h.id"
        class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <!-- HEADER -->

        <div class="flex items-center justify-between text-xs">
          <span class="opacity-60"> Desde </span>

          <span class="font-medium">
            {{ formatDate(h.effectiveDateISO) }}
          </span>
        </div>

        <!-- PRICE CARD -->

        <div class="mt-3 rounded-xl border border-base-300 bg-base-200/30 p-3">
          <div class="text-xs opacity-60">Precio</div>

          <div class="mt-1 font-mono text-sm">
            {{ formatCurrency(h.price, h.currency) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: any[]
}>()

function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

function formatCurrency(value: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(value)
}
</script>
