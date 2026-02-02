<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <table class="table w-full hidden md:table">
      <thead class="bg-base-200 text-xs uppercase">
        <tr>
          <th>Proveedor</th>
          <th>Contacto</th>
          <th>Condiciones</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in items" :key="s.id" class="hover">
          <td>
            <div class="font-medium">{{ s.name }}</div>
            <div class="text-xs opacity-60">{{ s.code }}</div>
          </td>
          <td class="text-sm">
            {{ s.email || '—' }}<br />
            {{ s.phone || '' }}
          </td>
          <td class="text-sm">{{ s.paymentTermsDays }} días · {{ s.defaultCurrency }}</td>
          <td class="text-right space-x-2">
            <UiButton size="sm" variant="ghost" icon="edit" @click="$emit('edit', s)" />
            <UiButton size="sm" variant="ghost" icon="trash" @click="$emit('delete', s)" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile cards -->
    <div class="md:hidden space-y-3">
      <div
        v-for="s in items"
        :key="s.id"
        class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="font-semibold">{{ s.name }}</div>
        <div class="text-xs opacity-60 mb-2">{{ s.code }}</div>

        <div class="flex justify-end gap-2">
          <UiButton size="sm" variant="ghost" icon="edit" @click="$emit('edit', s)" />
          <UiButton size="sm" variant="ghost" icon="trash" @click="$emit('delete', s)" />
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-center" v-if="hasMore">
      <UiButton size="sm" variant="outline" :loading="loading" @click="$emit('load-more')">
        Cargar más
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: any[]
  loading: boolean
  hasMore: boolean
}>()

defineEmits(['edit', 'delete', 'load-more'])
</script>
