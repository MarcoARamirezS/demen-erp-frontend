<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useClientAddressesStore } from '~/stores/clientAddresses.store'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
import type { ClientAddress } from '~/types/client-address'
import ClientHeader from '~/components/clients/ClientHeader.vue'
import AddressTable from '~/components/clients/AddressTable.vue'
import AddressDialog from '~/components/clients/AddressDialog.vue'

const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()
const addressesStore = useClientAddressesStore()
const clientsStore = useClientsStore()

const showDialog = ref(false)
const selected = ref<ClientAddress | null>(null)

const clientId = computed(() => route.params.id as string)
const clientName = computed(() => clientsStore.selected?.razonSocial || 'Cliente')

onMounted(async () => {
  if (!clientsStore.selected) {
    await clientsStore.getById(clientId.value)
  }

  await addressesStore.fetchByClient(clientId.value)
})

function handleEditAddress(address: ClientAddress) {
  selected.value = address
  showDialog.value = true
}

async function handleDeleteAddress(id: string) {
  const ok = window.confirm('¿Deseas eliminar esta dirección?')
  if (!ok) return

  try {
    await addressesStore.remove(id)
    await addressesStore.fetchByClient(clientId.value)
    ui.showToast('success', 'Dirección eliminada correctamente')
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo eliminar la dirección'
    )
  }
}

async function handleSetPrimaryAddress(address: ClientAddress) {
  try {
    await addressesStore.setPrimary({
      id: address.id,
      clienteId: address.clienteId,
    })

    ui.showToast('success', 'La dirección principal se actualizó correctamente')
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo actualizar la dirección principal'
    )
  }
}

async function save(payload: any) {
  try {
    if (selected.value) {
      await addressesStore.update(selected.value.id, payload)
      ui.showToast('success', 'Dirección actualizada correctamente')
    } else {
      await addressesStore.create(payload)
      ui.showToast('success', 'Dirección creada correctamente')
    }

    selected.value = null
    showDialog.value = false
    await addressesStore.fetchByClient(clientId.value)
  } catch (error: any) {
    ui.showToast(
      'error',
      error?.data?.message || error?.message || 'No se pudo guardar la dirección'
    )
  }
}

function openCreateDialog() {
  selected.value = null
  showDialog.value = true
}
</script>

<template>
  <ClientHeader :client-id="clientId" :client-name="clientName" section="addresses" />

  <div class="mb-4 flex justify-end">
    <UiButton
      v-if="auth.hasPermission('client_addresses:create')"
      size="sm"
      @click="openCreateDialog"
    >
      Nueva dirección
    </UiButton>
  </div>

  <AddressTable
    :items="addressesStore.items"
    :loading="addressesStore.loading"
    :can-update="auth.hasPermission('client_addresses:update')"
    :can-delete="auth.hasPermission('client_addresses:delete')"
    @edit="handleEditAddress"
    @delete="handleDeleteAddress"
    @set-primary="handleSetPrimaryAddress"
  />

  <AddressDialog
    v-model="showDialog"
    :cliente-id="clientId"
    :existing-addresses="addressesStore.items"
    :model="selected"
    :mode="selected ? 'edit' : 'create'"
    @submit="save"
  />
</template>
