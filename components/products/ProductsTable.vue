<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <table class="table w-full hidden md:table">
      <thead class="bg-base-200 text-xs uppercase">
        <tr>
          <th>Producto</th>
          <th>SKU</th>
          <th>Unidad</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in items" :key="p.id" class="hover">
          <td>
            <div class="font-medium">{{ p.name }}</div>
            <div class="text-xs opacity-60">{{ p.brand }}</div>

            <!-- 🔹 FIX: Familia / Categoría -->
            <div class="flex gap-1 mt-1">
              <span v-if="p.familyId" class="badge badge-outline text-xs">
                {{ p.familyId }}
              </span>
              <span v-if="p.categoryId" class="badge badge-ghost text-xs">
                {{ p.categoryId }}
              </span>
            </div>
          </td>

          <td class="font-mono text-sm">{{ p.sku }}</td>
          <td class="text-sm uppercase">{{ p.unit }}</td>
          <td class="text-right space-x-2">
            <UiButton size="sm" variant="ghost" icon="edit" @click="$emit('edit', p)" />
            <UiButton size="sm" variant="ghost" icon="trash" @click="$emit('delete', p)" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- =========================
         MOBILE
    ========================== -->
    <div class="md:hidden space-y-3">
      <div
        v-for="p in items"
        :key="p.id"
        class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div class="font-semibold">{{ p.name }}</div>
        <div class="text-xs opacity-60 mb-1">{{ p.sku }}</div>

        <!-- 🔹 FIX: Familia / Categoría (mobile) -->
        <div class="flex flex-wrap gap-1 mb-2">
          <span v-if="p.familyId" class="badge badge-outline text-xs">
            {{ p.familyId }}
          </span>
          <span v-if="p.categoryId" class="badge badge-ghost text-xs">
            {{ p.categoryId }}
          </span>
        </div>

        <div class="flex justify-end gap-2">
          <UiButton size="sm" variant="ghost" icon="edit" @click="$emit('edit', p)" />
          <UiButton size="sm" variant="ghost" icon="trash" @click="$emit('delete', p)" />
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
