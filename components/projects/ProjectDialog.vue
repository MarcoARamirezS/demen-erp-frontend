<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiSelectSearch from '~/components/ui/UiSelectSearch.vue'

import ClientDialog from '~/components/clients/ClientDialog.vue'

import { useUiStore } from '~/stores/ui.store'
import { useClientsStore } from '~/stores/clients.store'
import type { Project } from '~/types/project.types'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: Project | null
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const ui = useUiStore()
const clientsStore = useClientsStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const showClientDialog = ref(false)

const form = ref({
  clientId: '',
  fechaLevantamiento: '',
  descripcion: '',
})

if (!clientsStore.items.length) {
  clientsStore.fetch(100)
}

const clientOptions = computed(() =>
  clientsStore.items.map(c => ({
    value: c.id,
    label: c.razonSocial,
  }))
)

watch(
  () => props.model,
  v => {
    if (!v) return
    form.value = {
      clientId: v.clientId,
      fechaLevantamiento: v.fechaLevantamiento,
      descripcion: v.descripcion,
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.clientId) {
    ui.showToast('warning', 'Selecciona un cliente')
    return
  }
  if (!form.value.fechaLevantamiento) {
    ui.showToast('warning', 'La fecha es obligatoria')
    return
  }
  if (!form.value.descripcion.trim()) {
    ui.showToast('warning', 'La descripción es obligatoria')
    return
  }

  emit('submit', { ...form.value })
  open.value = false
}

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
    <form class="space-y-5" @submit.prevent="submit">
      <!-- CLIENTE -->
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

      <!-- FECHA -->
      <UiInput v-model="form.fechaLevantamiento" type="date" label="Fecha de levantamiento *" />

      <!-- DESCRIPCIÓN -->
      <UiInput
        v-model="form.descripcion"
        label="Descripción del proyecto *"
        placeholder="Ej. Proyecto remodelación sucursal norte"
      />

      <!-- ACTIONS -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

        <UiButton variant="primary" type="submit">
          {{ mode === 'create' ? 'Crear proyecto' : 'Guardar cambios' }}
        </UiButton>
      </div>
    </form>

    <!-- CLIENT DIALOG -->
    <ClientDialog v-model="showClientDialog" mode="create" @created="onClientCreated" />
  </UiDialog>
</template>
