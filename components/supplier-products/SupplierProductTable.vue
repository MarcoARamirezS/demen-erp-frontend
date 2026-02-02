<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th>Proveedor</th>
          <th>Producto</th>
          <th>Precio</th>
          <th>MOQ</th>
          <th>Lead Time</th>
          <th>Preferido</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="sp in items" :key="sp.id">
          <td class="font-mono text-xs">{{ sp.supplierId }}</td>
          <td class="font-mono text-xs">{{ sp.productId }}</td>
          <td>{{ sp.currentPrice }} {{ sp.currency }}</td>
          <td>{{ sp.moq }}</td>
          <td>{{ sp.leadTimeDays }} días</td>
          <td>
            <span v-if="sp.preferred" class="badge badge-success">Sí</span>
            <span v-else class="badge badge-ghost">No</span>
          </td>
          <td class="text-right">
            <button class="btn btn-xs btn-ghost" @click="$emit('edit', sp)">Editar</button>
            <button class="btn btn-xs btn-ghost text-error" @click="$emit('delete', sp)">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: any[] }>()
defineEmits(['edit', 'delete'])
</script>
