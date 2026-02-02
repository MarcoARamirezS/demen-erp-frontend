<script setup lang="ts">
import type { SupplierProductPrice } from '~/types/supplier-product-price'

defineProps<{
  history: SupplierProductPrice[]
}>()

function formatDate(ts: any) {
  return new Date(ts.seconds * 1000).toLocaleString()
}
</script>

<template>
  <tbody>
    <tr v-for="h in history" :key="h.id" class="hover:bg-base-200/40">
      <td>{{ formatDate(h.validFrom) }}</td>

      <td class="font-mono">{{ h.price }} {{ h.currency }}</td>

      <td class="font-mono text-xs opacity-70">{{ h.priceMXN.toFixed(2) }} MXN</td>
    </tr>
  </tbody>
</template>
