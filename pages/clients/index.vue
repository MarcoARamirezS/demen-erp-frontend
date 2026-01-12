<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import ClientTable from '~/components/clients/ClientTable.vue'
import ClientDialog from '~/components/clients/ClientDialog.vue'

const clients = useClientsStore()
const auth = useAuthStore()

const openDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

function openCreateDialog() {
  dialogMode.value = 'create'
  openDialog.value = true
}

onMounted(() => {
  clients.fetch()
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold">Clientes</h1>
        <p class="text-sm text-base-content/60">Gestión de clientes del sistema</p>
      </div>

      <UiButton
        v-if="auth.hasPermission('clients:create')"
        variant="primary"
        @click="openCreateDialog"
      >
        Nuevo cliente
      </UiButton>
    </header>

    <ClientTable />

    <ClientDialog v-model="openDialog" :mode="dialogMode" />
  </div>
</template>
