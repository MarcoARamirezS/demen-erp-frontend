<template>
  <div class="rounded-xl border border-base-300 bg-base-100 p-4">
    <h4 class="font-semibold mb-3">Historial de precios</h4>

    <table class="table table-sm">
      <thead class="bg-base-200 text-xs uppercase">
        <tr>
          <th>Desde</th>
          <th>Precio</th>
          <th>Moneda</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in items" :key="h.id">
          <td class="text-xs">{{ new Date(h.validFrom).toLocaleDateString() }}</td>
          <td class="font-mono">{{ h.price }}</td>
          <td>{{ h.currency }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: any[] }>()
</script>
