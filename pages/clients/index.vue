<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import ClientTable from '~/components/clients/ClientTable.vue'
import ClientDialog from '~/components/clients/ClientDialog.vue'
import type { Client, CreateClientDto } from '~/types/client'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'clients:list',
})

const clients = useClientsStore()
const auth = useAuthStore()

const openDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedClient = ref<Client | null>(null)

function openCreateDialog() {
  dialogMode.value = 'create'
  selectedClient.value = null
  openDialog.value = true
}

function openEditDialog(client: Client) {
  dialogMode.value = 'edit'
  selectedClient.value = client
  openDialog.value = true
}

watch(openDialog, isOpen => {
  if (!isOpen && dialogMode.value === 'edit') {
    selectedClient.value = null
  }
})

async function handleSubmit(payload: CreateClientDto) {
  let saved: Client

  if (dialogMode.value === 'edit' && selectedClient.value?.id) {
    saved = await clients.update(selectedClient.value.id, payload)
  } else {
    saved = await clients.create(payload)
  }

  selectedClient.value = null
  return saved
}

onMounted(async () => {
  while (!auth.initialized) {
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  clients.reset()
  await clients.fetch(10)
})
</script>

<template>
  <div class="space-y-6">
    <header
      class="flex flex-col gap-4 rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-5 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold">Clientes</h1>
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

    <ClientTable @edit="openEditDialog" />

    <ClientDialog
      v-model="openDialog"
      :mode="dialogMode"
      :model="selectedClient"
      :on-submit="handleSubmit"
    />
  </div>
</template>
