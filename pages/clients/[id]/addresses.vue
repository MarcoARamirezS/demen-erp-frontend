<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useClientAddressesStore } from '~/stores/clientAddresses.store'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import ClientHeader from '~/components/clients/ClientHeader.vue'
import AddressTable from '~/components/clients/AddressTable.vue'
import AddressDialog from '~/components/clients/AddressDialog.vue'

const route = useRoute()
const auth = useAuthStore()
const addressesStore = useClientAddressesStore()
const clientsStore = useClientsStore()

const showDialog = ref(false)
const selected = ref<any | null>(null)

const clientId = computed(() => route.params.id as string)
const clientName = computed(() => clientsStore.selected?.razonSocial || 'Cliente')

onMounted(async () => {
  if (!clientsStore.selected || clientsStore.selected.id !== clientId.value) {
    await clientsStore.getById(clientId.value)
  }

  await addressesStore.fetchByClient(clientId.value)
})

async function save(payload: any) {
  if (selected.value) {
    await addressesStore.update(selected.value.id, payload)
  } else {
    await addressesStore.create({
      ...payload,
      clientId: clientId.value,
    })
  }

  selected.value = null
  showDialog.value = false
  await addressesStore.fetchByClient(clientId.value)
}
</script>

<template>
  <ClientHeader :client-id="clientId" :client-name="clientName" section="addresses" />

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
    :items="addressesStore.items"
    :loading="addressesStore.loading"
    :can-update="auth.hasPermission('client_addresses:update')"
    :can-delete="auth.hasPermission('client_addresses:delete')"
    @edit="
      a => {
        selected = a
        showDialog = true
      }
    "
    @delete="id => addressesStore.remove(id)"
  />

  <!-- 🔥 FIX CLAVE -->
  <AddressDialog
    v-if="showDialog"
    v-model="showDialog"
    :client-id="clientId"
    :existing-addresses="addressesStore.items"
    :model="selected"
    :mode="selected ? 'edit' : 'create'"
    @submit="save"
  />
</template>
