<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import ClientDialog from '~/components/clients/ClientDialog.vue'
import ClientHeader from '~/components/clients/ClientHeader.vue'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const clientsStore = useClientsStore()
const auth = useAuthStore()
const ui = useUiStore()

const showDialog = ref(false)

const clientId = computed(() => route.params.id as string)
const clientName = computed(() => clientsStore.selected?.razonSocial || 'Cliente')

const canRead = computed(() => auth.hasPermission('clients:read'))
const canUpdate = computed(() => auth.hasPermission('clients:update'))

onMounted(async () => {
  if (!canRead.value) {
    ui.showToast('warning', 'No tienes permiso para ver este cliente')
    return
  }
  await clientsStore.getById(clientId.value)
})
</script>

<template>
  <div class="space-y-6" v-if="clientsStore.selected">
    <ClientHeader :client-id="clientId" :client-name="clientName" section="info" />

    <div class="animate-fadeIn rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg">
      <div
        class="mb-4 flex flex-col gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 class="text-lg font-semibold">Información general</h2>
          <p class="text-sm opacity-70">Datos principales del cliente</p>
        </div>

        <ClientOnly>
          <UiButton v-if="canUpdate" variant="outline" size="sm" @click="showDialog = true">
            Editar
          </UiButton>
        </ClientOnly>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-xl border border-base-300 bg-base-100 p-4">
          <div class="text-xs uppercase opacity-60">RFC</div>
          <div class="font-medium">{{ clientsStore.selected.rfc || '—' }}</div>
        </div>

        <div class="rounded-xl border border-base-300 bg-base-100 p-4">
          <div class="text-xs uppercase opacity-60">Email</div>
          <div class="font-medium break-all">{{ clientsStore.selected.email || '—' }}</div>
        </div>

        <div class="rounded-xl border border-base-300 bg-base-100 p-4">
          <div class="text-xs uppercase opacity-60">Teléfono</div>
          <div class="font-medium">{{ clientsStore.selected.telefono || '—' }}</div>
        </div>

        <div class="rounded-xl border border-base-300 bg-base-100 p-4">
          <div class="text-xs uppercase opacity-60">Estado</div>
          <div class="font-medium">
            {{ clientsStore.selected.activo ? 'Activo' : 'Inactivo' }}
          </div>
        </div>
      </div>
    </div>

    <ClientOnly>
      <ClientDialog
        v-model="showDialog"
        mode="edit"
        :model="clientsStore.selected"
        @submit="clientsStore.update(clientsStore.selected!.id, $event)"
      />
    </ClientOnly>
  </div>
</template>
