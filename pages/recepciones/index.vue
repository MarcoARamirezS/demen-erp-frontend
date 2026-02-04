<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRecepcionesStore } from '~/stores/recepciones.store'
import RecepcionDialog from '~/components/recepciones/RecepcionDialog.vue'

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'recepciones:list',
})

const store = useRecepcionesStore()
const openDialog = ref(false)

onMounted(() => store.fetch())
</script>

<template>
  <div class="space-y-4">
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6 flex justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold">Recepciones</h1>
        <p class="text-sm opacity-70">Entradas por compra</p>
      </div>
      <UiButton icon="plus" size="sm" @click="openDialog = true"> Nueva recepción </UiButton>
    </div>

    <div class="rounded-xl border bg-base-100 p-4 shadow">
      <div v-if="store.items.length === 0" class="text-center opacity-60 py-8">
        No existen recepciones
      </div>

      <ul v-else class="space-y-2">
        <li v-for="r in store.items" :key="r.id" class="border p-3 rounded-lg">
          <div class="font-semibold">Proveedor: {{ r.supplierId }}</div>
          <div class="text-xs opacity-60">
            {{ new Date(r.createdAt?.toDate?.() ?? r.createdAt).toLocaleString() }}
          </div>
        </li>
      </ul>
    </div>

    <ClientOnly>
      <RecepcionDialog v-model="openDialog" @submit="store.create" />
    </ClientOnly>
  </div>
</template>
