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
const clientDialogMode = ref<'create' | 'edit'>('create')

/* =========================
   CLIENT SEARCH
========================= */

const clientSearch = ref('')
let clientSearchTimer: ReturnType<typeof setTimeout> | null = null

function clearClientSearchTimer() {
  if (clientSearchTimer) {
    clearTimeout(clientSearchTimer)
    clientSearchTimer = null
  }
}

async function searchClients(search = '') {
  clientsStore.cursor = null
  await clientsStore.fetch(20, search)
}

function handleClientSearch(value: string) {
  clientSearch.value = String(value || '')
    .trim()
    .toUpperCase()

  clearClientSearchTimer()

  clientSearchTimer = setTimeout(async () => {
    if (!open.value) return
    await searchClients(clientSearch.value)
  }, 300)
}

/* =========================
   OPTIONS
========================= */

function getClientLabel(client: any) {
  return (
    String(client?.razonSocial || client?.nombreComercial || client?.name || 'Cliente').trim() ||
    'Cliente'
  )
}

function getClientImage(client: any) {
  return client?.logo?.secureUrl || client?.logo?.url || ''
}

const selectedClientDetail = ref<any | null>(null)

const currentClient = computed<any | null>(() => {
  if (selectedClientDetail.value?.id === form.clientId) return selectedClientDetail.value
  return clientsStore.items.find(c => c.id === form.clientId) || null
})

const clientOptions = computed(() => {
  const options = clientsStore.items.map(c => ({
    label: getClientLabel(c),
    value: c.id,
    image: getClientImage(c) || undefined,
  }))

  if (currentClient.value?.id && !options.some(option => option.value === currentClient.value.id)) {
    options.unshift({
      label: getClientLabel(currentClient.value),
      value: currentClient.value.id,
      image: getClientImage(currentClient.value) || undefined,
    })
  }

  return options
})

const branchOptions = computed(() =>
  addressesStore.items.map(a => ({
    label: (a as any).nombre,
    value: a.id,
  }))
)

/* =========================
   CLIENTE ACTUAL / PERSONAS
========================= */

function normalizeClientPeople(client: any) {
  const raw =
    (Array.isArray(client?.contacts) && client.contacts) ||
    (Array.isArray(client?.contactos) && client.contactos) ||
    (Array.isArray(client?.users) && client.users) ||
    (Array.isArray(client?.usuarios) && client.usuarios) ||
    []

  const mapped = raw
    .map((person: any, index: number) => {
      const name = String(
        person?.name ?? person?.nombre ?? person?.fullName ?? person?.nombreCompleto ?? ''
      ).trim()

      const role = String(person?.role ?? person?.puesto ?? person?.position ?? '').trim()

      const email = String(person?.email ?? '').trim()
      const phone = String(person?.phone ?? person?.telefono ?? '').trim()

      const labelBase = name || email || phone || `Usuario ${index + 1}`
      const detail = role || email || phone
      const label = detail ? `${labelBase} / ${detail}` : labelBase

      const value = name || email || phone || String(person?.id ?? person?.uid ?? index)

      return {
        label,
        value,
      }
    })
    .filter((item: any) => !!item.value)

  return mapped.filter(
    (item: any, index: number, arr: any[]) =>
      arr.findIndex(entry => entry.value === item.value) === index
  )
}

const visitPersonOptionsBase = computed(() => normalizeClientPeople(currentClient.value))

const visitPersonOptions = computed(() => {
  const options = [...visitPersonOptionsBase.value]

  if (
    form.personaAQuienVisita &&
    !options.some(option => option.value === form.personaAQuienVisita)
  ) {
    options.unshift({
      label: `Actual: ${form.personaAQuienVisita}`,
      value: form.personaAQuienVisita,
    })
  }

  return options
})

const hasVisitPeople = computed(() => visitPersonOptionsBase.value.length > 0)

const clientDialogModel = computed(() => {
  if (clientDialogMode.value !== 'edit') return null
  return currentClient.value ?? null
})

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
  selectedClientDetail.value = null
}

function hydrateForm(model?: Project | null) {
  clearErrors()
  resetImages()

  if (!model) {
    Object.assign(form, getDefaultForm())
    addressesStore.items = []
    selectedClientDetail.value = null
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
  const target = wrapper?.querySelector(
    'input, textarea, select, button, [tabindex]'
  ) as HTMLElement | null

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

async function ensureClientsLoaded(force = false) {
  if (force || !clientsStore.items.length) {
    await searchClients('')
  }
}

async function loadAddressesByClient(clientId: string) {
  if (!clientId) {
    addressesStore.items = []
    return
  }

  await addressesStore.fetchByClient(clientId)
}

async function loadClientDetail(clientId: string) {
  if (!clientId) {
    selectedClientDetail.value = null
    return
  }

  try {
    const fullClient = await clientsStore.getById(clientId)
    selectedClientDetail.value = fullClient ?? null
  } catch {
    selectedClientDetail.value = clientsStore.items.find(c => c.id === clientId) || null
  }
}

/* =========================
   ACTIONS
========================= */

function openCreateClientDialog() {
  clientDialogMode.value = 'create'
  showClientDialog.value = true
}

function openEditClientUsersDialog() {
  if (!form.clientId) {
    ui.showToast('warning', 'Primero debes seleccionar un cliente')
    return
  }

  clientDialogMode.value = 'edit'
  showClientDialog.value = true
}

/* =========================
   LIFECYCLE
========================= */

onMounted(async () => {
  await ensureClientsLoaded()

  if (props.modelValue && props.model?.clientId) {
    await Promise.all([
      loadAddressesByClient(props.model.clientId),
      loadClientDetail(props.model.clientId),
    ])
  }
})

onBeforeUnmount(() => {
  revokePreviews()
  clearClientSearchTimer()
})

/* =========================
   WATCH OPEN/CLOSE
========================= */

watch(
  () => props.modelValue,
  async isOpen => {
    if (isOpen) {
      clientSearch.value = ''
      await ensureClientsLoaded(true)
      hydrateForm(props.model ?? null)

      if (props.model?.clientId) {
        await Promise.all([
          loadAddressesByClient(props.model.clientId),
          loadClientDetail(props.model.clientId),
        ])
      } else {
        addressesStore.items = []
        selectedClientDetail.value = null
      }
    } else {
      clearErrors()
      resetImages()
      clearClientSearchTimer()
      clientSearch.value = ''
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
      await Promise.all([loadAddressesByClient(val.clientId), loadClientDetail(val.clientId)])
    } else {
      addressesStore.items = []
      selectedClientDetail.value = null
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
      selectedClientDetail.value = null
      form.branchId = ''
      form.personaAQuienVisita = ''
      return
    }

    await Promise.all([loadAddressesByClient(val), loadClientDetail(val)])

    if (oldVal && oldVal !== val) {
      form.branchId = ''
      form.personaAQuienVisita = ''
    }
  }
)

/* =========================
   CLIENT CREATED / UPDATED
========================= */

async function handleClientSubmit(payload: any) {
  try {
    const isEdit = clientDialogMode.value === 'edit' && !!currentClient.value?.id

    const savedClient = isEdit
      ? await clientsStore.update(currentClient.value.id, payload)
      : await clientsStore.create(payload)

    const newClientId =
      savedClient?.id ||
      clientsStore.items.find(
        c =>
          (c as any).rfc === payload?.rfc &&
          ((c as any).razonSocial === payload?.razonSocial ||
            (c as any).nombreComercial === payload?.nombreComercial)
      )?.id ||
      clientsStore.items[0]?.id ||
      ''

    if (newClientId) {
      form.clientId = newClientId

      if (!isEdit) {
        form.branchId = ''
      }

      await Promise.all([loadAddressesByClient(newClientId), loadClientDetail(newClientId)])

      ui.showToast(
        'success',
        isEdit ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente'
      )
    }

    showClientDialog.value = false
    return savedClient
  } catch {
    ui.showToast(
      'error',
      clientDialogMode.value === 'edit'
        ? 'No fue posible actualizar el cliente'
        : 'No fue posible crear el cliente'
    )
    throw new Error('No fue posible guardar el cliente')
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
      addressesStore.items.find(a => (a as any).nombre === payload?.nombre)?.id ||
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
      <section class="flex-1 space-y-6 overflow-y-auto px-6 py-6 pb-10">
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
              :loading="clientsStore.loading"
              searchable
              search-placeholder="Escribe para buscar clientes..."
              empty-text="No se encontraron clientes"
              placeholder="Selecciona el cliente al que pertenece el proyecto"
              @search="handleClientSearch"
            />
            <p class="mt-1 text-xs opacity-60">
              Busca por razón social o nombre comercial. Primero elige el cliente para poder cargar
              sus sucursales y contactos disponibles.
            </p>
          </div>

          <button
            class="btn btn-circle btn-outline btn-sm mb-1"
            type="button"
            @click="openCreateClientDialog"
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

        <!-- PERSONA A QUIEN VISITA -->
        <div data-error-field="personaAQuienVisita" class="space-y-2">
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <UiSelect
                v-if="form.clientId && hasVisitPeople"
                v-model="form.personaAQuienVisita"
                label="Persona a quien visita"
                :options="visitPersonOptions"
                placeholder="Selecciona una persona registrada del cliente"
              />

              <UiInput
                v-else
                v-model="form.personaAQuienVisita"
                label="Persona a quien visita"
                :disabled="!!form.clientId"
                :readonly="!!form.clientId"
                :placeholder="
                  form.clientId
                    ? 'Este cliente aún no tiene usuarios/contactos registrados'
                    : 'Primero selecciona un cliente'
                "
              />

              <p v-if="!form.clientId" class="mt-1 text-xs opacity-60">
                Primero selecciona un cliente para mostrar sus usuarios/contactos.
              </p>

              <p v-else-if="hasVisitPeople" class="mt-1 text-xs opacity-60">
                Se muestran los usuarios/contactos registrados del cliente seleccionado.
              </p>

              <p v-else class="mt-1 text-xs opacity-60">
                Este cliente no tiene usuarios/contactos registrados. Agrégalos para poder
                seleccionarlos aquí.
              </p>
            </div>

            <UiButton
              v-if="form.clientId"
              variant="outline"
              icon="plus"
              class="mb-1"
              @click="openEditClientUsersDialog"
            >
              Agregar usuario
            </UiButton>
          </div>

          <div
            v-if="form.clientId"
            class="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 text-xs opacity-70"
          >
            Puedes agregar un nuevo usuario/contacto para este cliente aunque ya existan registros.
          </div>
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

        <!-- IMÁGENES
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
        -->
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
    <ClientDialog
      v-model="showClientDialog"
      :mode="clientDialogMode"
      :model="clientDialogModel"
      @submit="handleClientSubmit"
    />
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
