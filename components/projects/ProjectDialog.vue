<script setup lang="ts">
import { ref, watch, onMounted, computed, reactive, nextTick, onBeforeUnmount } from 'vue'
import type { Project } from '@/types/project'
import { useProjectsStore } from '@/stores/projects'
import { useClientsStore } from '@/stores/clients.store'
import { useClientAddressesStore } from '@/stores/clientAddresses.store'
import { useUiStore } from '~/stores/ui.store'

import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'

import ClientDialog from '~/components/clients/ClientDialog.vue'
import AddressDialog from '~/components/clients/AddressDialog.vue'

const props = defineProps<{
  modelValue: boolean
  model?: Project | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'saved'): void
}>()

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
const fileInputKey = ref(0)
const saving = ref(false)

function revokePreviews() {
  previews.value.forEach(url => URL.revokeObjectURL(url))
  previews.value = []
}

function resetImages() {
  revokePreviews()
  selectedImages.value = []
  fileInputKey.value++
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  revokePreviews()

  selectedImages.value = Array.from(files)
  previews.value = selectedImages.value.map(file => URL.createObjectURL(file))
  fileInputKey.value++
}

function removeImage(index: number) {
  URL.revokeObjectURL(previews.value[index])
  previews.value.splice(index, 1)
  selectedImages.value.splice(index, 1)
}

/* =========================
   FORM
========================= */

type ProjectForm = {
  clientId: string
  branchId: string
  plantaCliente: string
  objetivoFuncionalCliente: string
  personaAQuienVisita: string
  fecha: string
}

function getDefaultForm(): ProjectForm {
  return {
    clientId: '',
    branchId: '',
    plantaCliente: '',
    objetivoFuncionalCliente: '',
    personaAQuienVisita: '',
    fecha: '',
  }
}

const form = reactive<ProjectForm>(getDefaultForm())

/* =========================
   ERRORS
========================= */

const errors = reactive<Record<string, string>>({})

const fieldLabels: Record<string, string> = {
  clientId: 'Cliente',
  branchId: 'Sucursal',
  plantaCliente: 'Planta cliente',
  objetivoFuncionalCliente: 'Nombre del proyecto',
  personaAQuienVisita: 'Persona a quien visita',
  fecha: 'Fecha',
}

const errorSummary = computed(() =>
  Object.entries(errors)
    .filter(([, message]) => !!message)
    .map(([key, message]) => ({
      key,
      label: fieldLabels[key] || key,
      message,
    }))
)

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function nullableString(value?: string | null) {
  const clean = String(value ?? '').trim()
  return clean ? clean : null
}

function resetForm() {
  Object.assign(form, getDefaultForm())
  clearErrors()
  resetImages()
  addressesStore.items = []
}

function hydrateForm(model?: Project | null) {
  clearErrors()
  resetImages()

  if (!model) {
    Object.assign(form, getDefaultForm())
    addressesStore.items = []
    return
  }

  Object.assign(form, {
    clientId: model.clientId ?? '',
    branchId: model.branchId ?? '',
    plantaCliente: model.plantaCliente ?? '',
    objetivoFuncionalCliente: model.objetivoFuncionalCliente ?? '',
    personaAQuienVisita: model.personaAQuienVisita ?? '',
    fecha: model.fecha ?? '',
  })
}

async function focusFirstErrorField() {
  const firstKey = Object.keys(errors).find(key => errors[key])
  if (!firstKey) return

  await nextTick()

  const wrapper = document.querySelector(`[data-error-field="${firstKey}"]`)
  const target = wrapper?.querySelector('input, textarea, select, button') as HTMLElement | null

  if (wrapper) {
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (target?.focus) {
    target.focus()
  }
}

/* =========================
   LOADERS
========================= */

async function ensureClientsLoaded() {
  if (!clientsStore.items.length) {
    await clientsStore.fetch(100)
  }
}

async function loadAddressesByClient(clientId: string) {
  if (!clientId) {
    addressesStore.items = []
    return
  }

  await addressesStore.fetchByClient(clientId)
}

/* =========================
   LIFECYCLE
========================= */

onMounted(async () => {
  await ensureClientsLoaded()

  if (props.modelValue && props.model?.clientId) {
    await loadAddressesByClient(props.model.clientId)
  }
})

onBeforeUnmount(() => {
  revokePreviews()
})

/* =========================
   WATCH OPEN/CLOSE
========================= */

watch(
  () => props.modelValue,
  async isOpen => {
    if (isOpen) {
      await ensureClientsLoaded()
      hydrateForm(props.model ?? null)

      if (props.model?.clientId) {
        await loadAddressesByClient(props.model.clientId)
      } else {
        addressesStore.items = []
      }
    } else {
      clearErrors()
      resetImages()
    }
  },
  { immediate: true }
)

/* =========================
   WATCH MODEL
========================= */

watch(
  () => props.model,
  async val => {
    if (!props.modelValue) return

    hydrateForm(val ?? null)

    if (val?.clientId) {
      await loadAddressesByClient(val.clientId)
    } else {
      addressesStore.items = []
    }
  },
  { immediate: false }
)

/* =========================
   CLIENT CHANGE
========================= */

watch(
  () => form.clientId,
  async (val, oldVal) => {
    if (!open.value) return

    if (!val) {
      addressesStore.items = []
      form.branchId = ''
      return
    }

    await loadAddressesByClient(val)

    if (oldVal && oldVal !== val) {
      form.branchId = ''
    }
  }
)

/* =========================
   CLIENT CREATED
========================= */

async function handleClientSubmit(payload: any) {
  try {
    const created = await clientsStore.create(payload)

    const newClientId =
      created?.id ||
      clientsStore.items.find(
        c =>
          c.rfc === payload?.rfc &&
          (c.razonSocial === payload?.razonSocial || c.nombreComercial === payload?.nombreComercial)
      )?.id ||
      clientsStore.items[0]?.id ||
      ''

    if (newClientId) {
      form.clientId = newClientId
      form.branchId = ''
      await loadAddressesByClient(newClientId)
      ui.showToast('success', 'Cliente creado correctamente')
    }

    showClientDialog.value = false
  } catch {
    ui.showToast('error', 'No fue posible crear el cliente')
  }
}

/* =========================
   ADDRESS CREATED
========================= */

async function handleAddressSubmit(payload: any) {
  if (!form.clientId) {
    ui.showToast('warning', 'Primero debes seleccionar un cliente')
    return
  }

  try {
    const created = await addressesStore.create({
      ...payload,
      clienteId: form.clientId,
    })

    await loadAddressesByClient(form.clientId)

    const newAddressId =
      created?.id ||
      addressesStore.items.find(a => a.nombre === payload?.nombre)?.id ||
      addressesStore.items.at(-1)?.id ||
      ''

    if (newAddressId) {
      form.branchId = newAddressId
      ui.showToast('success', 'Sucursal creada correctamente')
    }

    showAddressDialog.value = false
  } catch {
    ui.showToast('error', 'No fue posible crear la sucursal')
  }
}

/* =========================
   SAVE
========================= */

async function save() {
  clearErrors()

  const clientId = form.clientId?.trim()
  const branchId = form.branchId?.trim()

  if (!clientId) {
    errors.clientId = 'Debes seleccionar un cliente'
  }

  if (!branchId) {
    errors.branchId = 'Debes seleccionar una sucursal'
  }

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${fieldLabels[key] || key}: ${message}`)
    await focusFirstErrorField()
    return
  }

  const payload = {
    clientId,
    branchId,
    plantaCliente: nullableString(form.plantaCliente),
    objetivoFuncionalCliente: nullableString(form.objetivoFuncionalCliente),
    personaAQuienVisita: nullableString(form.personaAQuienVisita),
    fecha: form.fecha?.trim() ? form.fecha.trim() : null,
  }

  saving.value = true

  try {
    const savedProject = props.model?.id
      ? await projectsStore.update(props.model.id, payload)
      : await projectsStore.create(payload)

    const projectId = savedProject?.id || props.model?.id

    if (selectedImages.value.length && projectId) {
      await projectsStore.uploadImages(projectId, selectedImages.value)
    }

    ui.showToast('success', 'Proyecto guardado correctamente')

    emit('saved')
    open.value = false
  } catch {
    ui.showToast('error', 'No fue posible guardar el proyecto')
  } finally {
    saving.value = false
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
        <!-- ALERTA DE VALIDACIÓN -->
        <div
          v-if="errorSummary.length"
          class="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm"
        >
          <div class="flex items-start gap-3">
            <Icon name="alert-triangle" class="mt-0.5 h-5 w-5 text-error" />

            <div class="flex-1">
              <p class="font-semibold text-error">Revisa los siguientes campos:</p>

              <ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/80">
                <li v-for="item in errorSummary" :key="item.key">
                  <span class="font-medium">{{ item.label }}:</span>
                  {{ item.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- CLIENTE -->
        <div class="flex items-end gap-2">
          <div class="flex-1" data-error-field="clientId">
            <UiSelect
              v-model="form.clientId"
              label="Cliente *"
              :options="clientOptions"
              :error="errors.clientId"
              placeholder="Selecciona el cliente al que pertenece el proyecto"
            />
            <p class="mt-1 text-xs opacity-60">
              Primero elige el cliente para poder cargar sus sucursales disponibles.
            </p>
          </div>

          <button
            class="btn btn-circle btn-outline btn-sm mb-1"
            type="button"
            @click="showClientDialog = true"
          >
            <Icon name="plus" class="h-4 w-4" />
          </button>
        </div>

        <!-- SUCURSAL -->
        <div class="flex items-end gap-2">
          <div class="flex-1" data-error-field="branchId">
            <UiSelect
              v-model="form.branchId"
              label="Sucursal *"
              :options="branchOptions"
              :error="errors.branchId"
              :disabled="!form.clientId"
              placeholder="Selecciona la sucursal o ubicación del proyecto"
            />
            <p class="mt-1 text-xs opacity-60">
              Selecciona la dirección del cliente donde se realizará el proyecto.
            </p>
          </div>

          <button
            class="btn btn-circle btn-outline btn-sm mb-1"
            type="button"
            :disabled="!form.clientId"
            @click="showAddressDialog = true"
          >
            <Icon name="plus" class="h-4 w-4" />
          </button>
        </div>

        <!-- DATOS DEL PROYECTO -->
        <div data-error-field="objetivoFuncionalCliente">
          <UiInput
            v-model="form.objetivoFuncionalCliente"
            label="Nombre del proyecto"
            placeholder="Ej: Automatización de línea 3, Tablero de control planta norte"
          />
        </div>

        <div data-error-field="personaAQuienVisita">
          <UiInput
            v-model="form.personaAQuienVisita"
            label="Persona a quien visita"
            placeholder="Ej: Ing. Juan Pérez / Supervisor de mantenimiento"
          />
        </div>

        <div data-error-field="fecha">
          <UiInput
            v-model="form.fecha"
            type="date"
            label="Fecha"
            placeholder="Selecciona la fecha programada del proyecto o visita"
          />
          <p class="mt-1 text-xs opacity-60">
            Registra la fecha estimada o acordada para la visita o ejecución.
          </p>
        </div>

        <!-- IMÁGENES -->
        <div data-error-field="images">
          <label class="label">
            <span class="label-text">Imágenes del proyecto</span>
          </label>

          <input
            :key="fileInputKey"
            type="file"
            multiple
            class="file-input file-input-bordered w-full"
            @change="onFileChange"
          />

          <p class="mt-1 text-xs opacity-60">
            Puedes adjuntar fotos del sitio, levantamiento, evidencias o referencias del proyecto.
          </p>

          <div v-if="previews.length" class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            <div
              v-for="(p, i) in previews"
              :key="i"
              class="group relative overflow-hidden rounded-xl border border-base-300"
            >
              <img :src="p" class="h-28 w-full object-cover" />

              <button
                type="button"
                class="btn btn-circle btn-error btn-xs absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                @click="removeImage(i)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] md:flex-row"
      >
        <UiButton variant="ghost" class="w-full md:w-auto" :disabled="saving" @click="open = false">
          Cancelar
        </UiButton>

        <UiButton
          variant="primary"
          class="w-full md:w-auto"
          :loading="saving"
          :disabled="saving"
          @click="save"
        >
          Guardar
        </UiButton>
      </footer>
    </div>
  </UiDialog>

  <!-- CLIENT DIALOG -->
  <ClientOnly>
    <ClientDialog v-model="showClientDialog" mode="create" @submit="handleClientSubmit" />
  </ClientOnly>

  <!-- ADDRESS DIALOG -->
  <ClientOnly>
    <AddressDialog
      v-model="showAddressDialog"
      :cliente-id="form.clientId"
      mode="create"
      @submit="handleAddressSubmit"
    />
  </ClientOnly>
</template>
