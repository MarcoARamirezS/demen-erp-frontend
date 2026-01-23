<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo } from '#app'

import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiSelectSearch from '~/components/ui/UiSelectSearch.vue'

import ClientDialog from '~/components/clients/ClientDialog.vue'

import { useUiStore } from '~/stores/ui.store'
import { useClientsStore } from '~/stores/clients.store'
import { useClientAddressesStore } from '~/stores/clientAddresses.store'

import type { Project } from '~/types/project.types'

/* =========================
   PROPS / EMITS
========================= */
const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: Project | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (
    e: 'submit',
    payload: {
      clientId: string
      clientAddressId: string
      fechaLevantamiento: string
      descripcion: string
    }
  ): void
}>()

/* =========================
   STORES
========================= */
const ui = useUiStore()
const clientsStore = useClientsStore()
const addressesStore = useClientAddressesStore()

/* =========================
   DIALOG STATE
========================= */
const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const showClientDialog = ref(false)

/* =========================
   FORM
========================= */
const form = ref({
  clientId: '',
  clientAddressId: '',
  fechaLevantamiento: '',
  descripcion: '',
})

/* =========================
   LOAD CLIENTS
========================= */
if (!clientsStore.items.length) {
  clientsStore.fetch(100)
}

/* =========================
   OPTIONS
========================= */
const clientOptions = computed(() =>
  clientsStore.items.map(c => ({
    value: c.id,
    label: c.razonSocial,
  }))
)

const addressOptions = computed(() =>
  addressesStore.items.map(a => ({
    value: a.id,
    label: `${a.nombre || a.calle} · ${a.ciudad}, ${a.estado}`,
  }))
)

/* =========================
   WATCH CLIENT → LOAD ADDRESSES
========================= */
watch(
  () => form.value.clientId,
  async clientId => {
    if (!clientId) {
      addressesStore.reset()
      form.value.clientAddressId = ''
      return
    }

    await addressesStore.fetchByClient(clientId)
    form.value.clientAddressId = ''
  }
)

/* =========================
   EDIT MODE
========================= */
watch(
  () => props.model,
  async v => {
    if (!v) return

    form.value = {
      clientId: v.clientId,
      clientAddressId: v.clientAddressId,
      fechaLevantamiento: v.fechaLevantamiento,
      descripcion: v.descripcion,
    }

    await addressesStore.fetchByClient(v.clientId)
  },
  { immediate: true }
)

/* =========================
   SUBMIT
========================= */
function submit() {
  if (!form.value.clientId) {
    ui.showToast('warning', 'Selecciona un cliente')
    return
  }

  if (!form.value.clientAddressId) {
    ui.showToast('warning', 'Selecciona una dirección del cliente')
    return
  }

  if (!form.value.fechaLevantamiento) {
    ui.showToast('warning', 'La fecha de levantamiento es obligatoria')
    return
  }

  if (!form.value.descripcion.trim()) {
    ui.showToast('warning', 'La descripción es obligatoria')
    return
  }

  emit('submit', { ...form.value })
  open.value = false
}

/* =========================
   CLIENT CREATED
========================= */
async function onClientCreated(clientId: string) {
  await clientsStore.fetch(100)
  form.value.clientId = clientId
  showClientDialog.value = false
}
</script>

<template>
  <UiDialog
    v-model="open"
    size="lg"
    :title="mode === 'create' ? 'Nuevo proyecto' : 'Editar proyecto'"
  >
    <form class="space-y-6" @submit.prevent="submit">
      <!-- =========================
           CLIENTE
      ========================== -->
      <div class="space-y-2">
        <UiSelectSearch
          v-model="form.clientId"
          :items="clientOptions"
          label="Cliente *"
          placeholder="Buscar cliente..."
        />

        <UiButton size="xs" variant="ghost" type="button" @click="showClientDialog = true">
          + Nuevo cliente
        </UiButton>
      </div>

      <!-- =========================
           DIRECCIÓN
      ========================== -->
      <div class="space-y-2">
        <UiSelectSearch
          v-model="form.clientAddressId"
          :items="addressOptions"
          label="Dirección del cliente *"
          placeholder="Selecciona una dirección..."
          :disabled="!form.clientId"
        />

        <p v-if="form.clientId && !addressOptions.length" class="text-xs text-warning">
          Este cliente no tiene direcciones registradas.
        </p>

        <UiButton
          v-if="form.clientId"
          size="xs"
          variant="ghost"
          type="button"
          @click="navigateTo(`/clients/${form.clientId}/addresses`)"
        >
          + Agregar dirección
        </UiButton>
      </div>

      <!-- =========================
           FECHA
      ========================== -->
      <UiInput v-model="form.fechaLevantamiento" type="date" label="Fecha de levantamiento *" />

      <!-- =========================
           DESCRIPCIÓN
      ========================== -->
      <UiInput
        v-model="form.descripcion"
        label="Descripción del proyecto *"
        placeholder="Ej. Proyecto remodelación sucursal norte"
      />

      <!-- =========================
           ACTIONS
      ========================== -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

        <UiButton
          variant="primary"
          type="submit"
          :disabled="!form.clientId || !form.clientAddressId"
        >
          {{ mode === 'create' ? 'Crear proyecto' : 'Guardar cambios' }}
        </UiButton>
      </div>
    </form>

    <!-- =========================
         CLIENT DIALOG
    ========================== -->
    <ClientDialog v-model="showClientDialog" mode="create" @created="onClientCreated" />
  </UiDialog>
</template>
