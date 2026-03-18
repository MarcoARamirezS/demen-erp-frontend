<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { Project } from '@/types/project'
import { useProjectsStore } from '@/stores/projects'
import { useClientsStore } from '@/stores/clients.store'
import { useClientAddressesStore } from '@/stores/clientAddresses.store'
import { useUiStore } from '~/stores/ui.store'

import ClientDialog from '~/components/clients/ClientDialog.vue'
import AddressDialog from '~/components/clients/AddressDialog.vue'

const props = defineProps<{
  modelValue: boolean
  model?: Project | null
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const projectsStore = useProjectsStore()
const clientsStore = useClientsStore()
const addressesStore = useClientAddressesStore()
const ui = useUiStore()

/* =========================
   DIALOGS AUXILIARES
========================= */

const showClientDialog = ref(false)
const showAddressDialog = ref(false)

/* =========================
   OPTIONS
========================= */

const clientOptions = computed(() =>
  clientsStore.items.map(c => ({
    label: c.razonSocial || c.nombreComercial,
    value: c.id,
  }))
)

const branchOptions = computed(() =>
  addressesStore.items.map(a => ({
    label: a.nombre,
    value: a.id,
  }))
)

/* =========================
   IMÁGENES
========================= */

const selectedImages = ref<File[]>([])
const previews = ref<string[]>([])

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  selectedImages.value = Array.from(files)
  previews.value = selectedImages.value.map(file => URL.createObjectURL(file))
}

/* =========================
   FORM
========================= */

const form = ref({
  clientId: '',
  branchId: '',
  plantaCliente: '',
  objetivoFuncionalCliente: '',
  personaAQuienVisita: '',
  fecha: '',
})

/* =========================
   ERRORS
========================= */

const errors = ref({
  clientId: false,
  branchId: false,
})

/* =========================
   WATCH MODEL
========================= */

watch(
  () => props.model,
  async val => {
    if (val) {
      form.value = {
        clientId: val.clientId ?? '',
        branchId: val.branchId ?? '',
        plantaCliente: val.plantaCliente ?? '',
        objetivoFuncionalCliente: val.objetivoFuncionalCliente ?? '',
        personaAQuienVisita: val.personaAQuienVisita ?? '',
        fecha: val.fecha ?? '',
      }

      if (val.clientId) {
        await addressesStore.fetchByClient(val.clientId)
      }
    } else {
      form.value = {
        clientId: '',
        branchId: '',
        plantaCliente: '',
        objetivoFuncionalCliente: '',
        personaAQuienVisita: '',
        fecha: '',
      }

      addressesStore.items = []
    }
  },
  { immediate: true }
)

/* =========================
   LOAD CLIENTS
========================= */

onMounted(async () => {
  if (!clientsStore.items.length) {
    await clientsStore.fetch(100)
  }
})

/* =========================
   CLIENT CHANGE
========================= */

watch(
  () => form.value.clientId,
  async (val, oldVal) => {
    if (!val) {
      addressesStore.items = []
      return
    }

    await addressesStore.fetchByClient(val)

    if (oldVal && oldVal !== val) {
      form.value.branchId = ''
    }
  }
)

/* =========================
   CLIENT CREATED
========================= */

async function clientSaved() {
  await clientsStore.fetch(100)

  const lastClient = clientsStore.items.at(-1)

  if (lastClient) {
    form.value.clientId = lastClient.id
    await addressesStore.fetchByClient(lastClient.id)
  }

  showClientDialog.value = false
}

/* =========================
   ADDRESS CREATED
========================= */

async function addressSaved() {
  if (!form.value.clientId) return

  await addressesStore.fetchByClient(form.value.clientId)

  const lastAddress = addressesStore.items.at(-1)

  if (lastAddress) {
    form.value.branchId = lastAddress.id
  }

  showAddressDialog.value = false
}

/* =========================
   SAVE
========================= */

async function save() {
  errors.value = {
    clientId: false,
    branchId: false,
  }

  const clientId = form.value.clientId?.trim()
  const branchId = form.value.branchId?.trim()

  if (!clientId) {
    errors.value.clientId = true
    ui.showToast('warning', 'Debes seleccionar un cliente')
    return
  }

  if (!branchId) {
    errors.value.branchId = true
    ui.showToast('warning', 'Debes seleccionar una sucursal')
    return
  }

  let savedProject

  try {
    if (props.model?.id) {
      savedProject = await projectsStore.update(props.model.id, form.value)
    } else {
      savedProject = await projectsStore.create(form.value)
    }

    if (selectedImages.value.length && savedProject?.id) {
      await projectsStore.uploadImages(savedProject.id, selectedImages.value)
    }

    ui.showToast('success', 'Proyecto guardado correctamente')

    emit('saved')
    open.value = false
  } catch (err) {
    ui.showToast('error', 'No fue posible guardar el proyecto')
  }
}
</script>

<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- HEADER -->
      <header
        class="sticky top-0 z-10 flex flex-col gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Icon name="briefcase" class="h-6 w-6 text-primary" />
          </div>

          <div>
            <h2 class="text-xl font-bold text-primary">
              {{ props.model?.id ? 'Editar proyecto' : 'Nuevo proyecto' }}
            </h2>

            <p class="text-sm opacity-60">Gestión de proyectos del sistema</p>
          </div>
        </div>

        <button class="btn btn-circle btn-ghost btn-sm" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- CONTENT -->
      <section class="flex-1 overflow-y-auto px-6 py-6 pb-10 space-y-6">
        <!-- CLIENTE -->
        <div class="flex gap-2 items-end">
          <UiSelect
            v-model="form.clientId"
            label="Cliente"
            :options="clientOptions"
            :error="errors.clientId"
            placeholder="Selecciona un cliente"
            class="flex-1"
          />

          <button
            class="btn btn-circle btn-outline btn-sm mb-1"
            type="button"
            @click="showClientDialog = true"
          >
            <Icon name="plus" class="w-4 h-4" />
          </button>
        </div>

        <!-- SUCURSAL -->
        <div class="flex gap-2 items-end">
          <UiSelect
            v-model="form.branchId"
            label="Sucursal"
            :options="branchOptions"
            :error="errors.branchId"
            :disabled="!form.clientId"
            placeholder="Selecciona una sucursal"
            class="flex-1"
          />

          <button
            class="btn btn-circle btn-outline btn-sm mb-1"
            type="button"
            :disabled="!form.clientId"
            @click="showAddressDialog = true"
          >
            <Icon name="plus" class="w-4 h-4" />
          </button>
        </div>
        <!--
        <UiInput v-model="form.plantaCliente" label="Planta Cliente" />
        -->
        <UiInput v-model="form.objetivoFuncionalCliente" label="Nombre del Proyecto" />
        <UiInput v-model="form.personaAQuienVisita" label="Persona a quien visita" />
        <UiInput v-model="form.fecha" type="date" label="Fecha" />

        <!-- IMÁGENES -->
        <div>
          <label class="label">
            <span class="label-text">Imágenes del proyecto</span>
          </label>

          <input
            type="file"
            multiple
            class="file-input file-input-bordered w-full"
            @change="onFileChange"
          />

          <div v-if="previews.length" class="grid grid-cols-3 gap-3 mt-4">
            <img
              v-for="(p, i) in previews"
              :key="i"
              :src="p"
              class="rounded-xl border border-base-300 h-28 object-cover"
            />
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse md:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]"
      >
        <UiButton variant="ghost" class="w-full md:w-auto" @click="open = false">
          Cancelar
        </UiButton>

        <UiButton variant="primary" class="w-full md:w-auto" @click="save"> Guardar </UiButton>
      </footer>
    </div>
  </UiDialog>

  <!-- CLIENT DIALOG -->
  <ClientOnly>
    <ClientDialog v-model="showClientDialog" mode="create" @submit="clientSaved" />
  </ClientOnly>

  <!-- ADDRESS DIALOG -->
  <ClientOnly>
    <AddressDialog
      v-model="showAddressDialog"
      :cliente-id="form.clientId"
      mode="create"
      @submit="addressSaved"
    />
  </ClientOnly>
</template>
