<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import ClientTable from '~/components/clients/ClientTable.vue'
import ClientDialog from '~/components/clients/ClientDialog.vue'
import type { CreateClientDto } from '~/types/client'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'clients:list',
})

const clients = useClientsStore()
const auth = useAuthStore()

const openDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

function openCreateDialog() {
  dialogMode.value = 'create'
  openDialog.value = true
}

/* =========================
   SAVE HANDLER (CLAVE)
========================= */
async function handleSubmit(payload: CreateClientDto) {
  try {
    await clients.create(payload)
    openDialog.value = false
  } catch (e) {
    // El store ya debería mostrar toast si falla
    console.error(e)
  }
}

onMounted(() => {
  clients.reset()
  clients.fetch(10)
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold">Clientes</h1>
        <p class="text-sm text-base-content/60">Gestión de clientes del sistema</p>
      </div>

      <ClientOnly>
        <UiButton
          v-if="auth.hasPermission('clients:create')"
          variant="primary"
          @click="openCreateDialog"
        >
          Nuevo cliente
        </UiButton>
      </ClientOnly>
    </header>

    <ClientTable />

    <!-- 🔥 AQUÍ ESTABA EL ERROR -->
    <ClientDialog v-model="openDialog" :mode="dialogMode" @submit="handleSubmit" />
  </div>
</template>
