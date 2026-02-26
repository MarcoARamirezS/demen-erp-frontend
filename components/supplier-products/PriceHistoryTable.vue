<template>
  <div class="w-full animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         HEADER
    ========================== -->
    <div class="mb-4 flex items-center justify-between">
      <h4 class="font-semibold text-sm">Historial de precios</h4>
    </div>

    <!-- =========================
         DESKTOP TABLE (md+)
    ========================== -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase">
          <tr>
            <th class="min-w-[160px]">Desde</th>
            <th class="min-w-[160px]">Precio</th>
            <th class="min-w-[120px]">Moneda</th>
          </tr>
        </thead>

        <!-- Empty -->
        <tbody v-if="!items.length">
          <tr>
            <td colspan="3" class="p-8 text-center opacity-70">No hay historial de precios</td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else>
          <tr v-for="h in items" :key="h.id" class="hover:bg-base-200/40 transition">
            <td class="text-xs whitespace-nowrap">
              {{ h.effectiveDateISO ? new Date(h.effectiveDateISO).toLocaleDateString() : '-' }}
            </td>

            <td class="font-mono">
              {{
                new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: h.currency || 'MXN',
                }).format(h.price)
              }}
            </td>

            <td>
              {{ h.currency }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
         MOBILE CARDS (<md)
    ========================== -->
    <div class="md:hidden space-y-3">
      <!-- Empty -->
      <div
        v-if="!items.length"
        class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm text-center opacity-70"
      >
        No hay historial de precios
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="h in items"
        :key="h.id"
        class="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm overflow-hidden"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs opacity-70">Desde</div>
          <div class="text-xs font-medium">
            {{ h.effectiveDateISO ? new Date(h.effectiveDateISO).toLocaleDateString() : '-' }}
          </div>
        </div>

        <div class="mt-3 rounded-xl border border-base-300 bg-base-200/30 p-3">
          <div class="text-xs opacity-60">Precio</div>
          <div class="font-mono text-sm mt-1">
            {{
              new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: h.currency || 'MXN',
              }).format(h.price)
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: any[] }>()
</script>
