<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import ClientTable from '~/components/clients/ClientTable.vue'
import ClientDialog from '~/components/clients/ClientDialog.vue'
import type { CreateClientDto } from '~/types/client'

definePageMeta({ layout: 'default', middleware: 'auth' })

const clients = useClientsStore()
const auth = useAuthStore()
const ui = useUiStore()

const openDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

const canList = computed(() => auth.hasPermission('clients:list'))
const canCreate = computed(() => auth.hasPermission('clients:create'))
const canRead = computed(() => auth.hasPermission('clients:read'))

onMounted(async () => {
  if (!canList.value) {
    ui.showToast('warning', 'No tienes permiso para ver Clientes')
    return
  }
  await refresh()
})

async function refresh() {
  clients.reset()
  await clients.fetch(10)
}

function openCreateDialog() {
  dialogMode.value = 'create'
  openDialog.value = true
}

/* =========================
   SAVE
========================= */
async function handleSubmit(payload: CreateClientDto) {
  try {
    await clients.create(payload)
    openDialog.value = false
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- =========================
         HEADER CARD (Audit Style)
    ========================== -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-5"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Clientes</h1>
          <p class="text-sm opacity-70">Gestión de clientes del sistema</p>
        </div>

        <ClientOnly>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <UiButton
              icon="refresh"
              variant="outline"
              size="sm"
              :disabled="clients.loading"
              @click="refresh"
            >
              Recargar
            </UiButton>

            <UiButton v-if="canCreate" variant="primary" size="sm" @click="openCreateDialog">
              Nuevo cliente
            </UiButton>
          </div>
        </ClientOnly>
      </div>
    </div>

    <!-- =========================
         TABLE
    ========================== -->
    <ClientTable :items="clients.items" :loading="clients.loading" :can-read="canRead" />

    <!-- =========================
         DIALOG
    ========================== -->
    <ClientOnly>
      <ClientDialog v-model="openDialog" :mode="dialogMode" @submit="handleSubmit" />
    </ClientOnly>
  </div>
</template>
