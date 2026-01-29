<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useClientAddressesStore } from '~/stores/clientAddresses.store'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import ClientHeader from '~/components/clients/ClientHeader.vue'
import AddressTable from '~/components/clients/AddressTable.vue'
import AddressDialog from '~/components/clients/AddressDialog.vue'
import type { ClientAddress, CreateClientAddressDto } from '~/types/client-address'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()

const addressesStore = useClientAddressesStore()
const clientsStore = useClientsStore()

const showDialog = ref(false)
const selected = ref<ClientAddress | null>(null)

const clientId = computed(() => route.params.id as string)
const clientName = computed(() => clientsStore.selected?.razonSocial || 'Cliente')

const canCreate = computed(() => auth.hasPermission('client_addresses:create'))
const canUpdate = computed(() => auth.hasPermission('client_addresses:update'))
const canDelete = computed(() => auth.hasPermission('client_addresses:delete'))

onMounted(async () => {
  if (!clientsStore.selected || clientsStore.selected.id !== clientId.value) {
    await clientsStore.getById(clientId.value)
  }
  await addressesStore.fetchByClient(clientId.value)
})

function openCreate() {
  selected.value = null
  showDialog.value = true
}

function openEdit(a: ClientAddress) {
  selected.value = a
  showDialog.value = true
}

async function save(payload: CreateClientAddressDto) {
  if (selected.value) {
    await addressesStore.update(selected.value.id, payload)
  } else {
    await addressesStore.create({
      ...payload,
      clienteId: clientId.value,
    } as any)
  }

  selected.value = null
  showDialog.value = false
  await addressesStore.fetchByClient(clientId.value)
}

async function remove(id: string) {
  if (!canDelete.value) return
  await addressesStore.remove(id)
  await addressesStore.fetchByClient(clientId.value)
  ui.showToast('success', 'Dirección eliminada')
}
</script>

<template>
  <div class="space-y-6">
    <ClientHeader :client-id="clientId" :client-name="clientName" section="addresses" />

    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-5"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold">Direcciones</h2>
          <p class="text-sm opacity-70">Administra las direcciones del cliente</p>
        </div>

        <ClientOnly>
          <UiButton v-if="canCreate" variant="outline" size="sm" @click="openCreate">
            Nueva dirección
          </UiButton>
        </ClientOnly>
      </div>
    </div>

    <AddressTable
      :items="addressesStore.items"
      :loading="addressesStore.loading"
      :can-update="canUpdate"
      :can-delete="canDelete"
      @edit="openEdit"
      @delete="remove"
    />

    <ClientOnly>
      <AddressDialog
        v-model="showDialog"
        :client-id="clientId"
        :existing-addresses="addressesStore.items"
        :model="selected"
        :mode="selected ? 'edit' : 'create'"
        @submit="save"
      />
    </ClientOnly>
  </div>
</template>
