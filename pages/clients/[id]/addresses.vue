<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useClientAddressesStore } from '~/stores/clientAddresses.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import ClientHeader from '~/components/clients/ClientHeader.vue'
import AddressTable from '~/components/clients/AddressTable.vue'
import AddressDialog from '~/components/clients/AddressDialog.vue'

const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()
const store = useClientAddressesStore()

const showDialog = ref(false)
const selected = ref(null)

const clientId = route.params.id as string

onMounted(() => {
  store.fetchByClient(clientId)
})

async function save(payload: any) {
  if (selected.value) {
    await store.update(selected.value.id, payload)
  } else {
    await store.create(payload)
  }

  selected.value = null
  await store.fetchByClient(clientId)
}

async function remove(id: string) {
  const ok = await ui.confirm({
    title: 'Eliminar dirección',
    message: 'Esta acción desactivará la dirección. ¿Deseas continuar?',
    confirmText: 'Eliminar',
    variant: 'danger',
  })

  if (!ok) return

  await store.remove(id)
  await store.fetchByClient(clientId)
}
</script>

<template>
  <ClientHeader clientName="Direcciones del cliente" />

  <div class="flex justify-end mb-4">
    <UiButton
      v-if="auth.hasPermission('client_addresses:create')"
      size="sm"
      @click="showDialog = true"
    >
      Nueva dirección
    </UiButton>
  </div>

  <AddressTable
    :items="store.items"
    :loading="store.loading"
    :can-update="auth.hasPermission('client_addresses:update')"
    :can-delete="auth.hasPermission('client_addresses:delete')"
    @edit="
      v => {
        selected = v
        showDialog = true
      }
    "
    @delete="remove"
  />

  <AddressDialog
    v-model="showDialog"
    :client-id="clientId"
    :existing-addresses="store.items"
    :model="selected"
    :mode="selected ? 'edit' : 'create'"
    @submit="save"
  />
</template>
