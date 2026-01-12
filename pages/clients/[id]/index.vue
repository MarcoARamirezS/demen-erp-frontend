<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import ClientDialog from '~/components/clients/ClientDialog.vue'
import ClientHeader from '~/components/clients/ClientHeader.vue'

const route = useRoute()
const clientsStore = useClientsStore()
const auth = useAuthStore()

const showDialog = ref(false)

onMounted(async () => {
  await clientsStore.getById(route.params.id as string)
})
</script>

<template>
  <div v-if="clientsStore.selected">
    <ClientHeader :clientName="clientsStore.selected.razonSocial" />

    <div class="rounded-xl border bg-base-100 p-6">
      <div class="flex justify-between mb-4">
        <h2 class="font-semibold">Información general</h2>

        <UiButton v-if="auth.hasPermission('clients:update')" size="sm" @click="showDialog = true">
          Editar
        </UiButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><strong>RFC:</strong> {{ clientsStore.selected.rfc || '—' }}</div>
        <div><strong>Email:</strong> {{ clientsStore.selected.email || '—' }}</div>
        <div><strong>Teléfono:</strong> {{ clientsStore.selected.telefono || '—' }}</div>
        <div><strong>Activo:</strong> {{ clientsStore.selected.activo ? 'Sí' : 'No' }}</div>
      </div>
    </div>

    <ClientDialog
      v-model="showDialog"
      mode="edit"
      :model="clientsStore.selected"
      @submit="clientsStore.update(clientsStore.selected!.id, $event)"
    />
  </div>
</template>
