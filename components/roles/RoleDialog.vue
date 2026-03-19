<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- =====================================================
           HEADER
      ====================================================== -->
      <header
        class="sticky top-0 z-10 flex items-start gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <div class="rounded-full bg-primary/10 p-3 shrink-0">
          <Icon name="shield" />
        </div>

        <div class="min-w-0 flex-1">
          <h2 class="font-semibold text-lg truncate text-primary">
            {{ mode === 'create' ? 'Crear rol' : 'Editar rol' }}
          </h2>
          <p class="text-xs opacity-60 truncate">Gestión de permisos del sistema</p>
        </div>

        <button class="btn btn-circle btn-sm btn-ghost shrink-0" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- =====================================================
           CONTENT
      ====================================================== -->
      <section class="flex-1 overflow-y-auto px-6 py-6 space-y-8">
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

        <!-- =========================
             DATOS
        ========================== -->
        <section class="space-y-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            Datos generales
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-error-field="name">
              <UiInput
                v-model="form.name"
                label="Nombre del rol *"
                placeholder="Ej: Administrador de compras, Supervisor de almacén, Capturista"
                :error="errors.name"
              />
            </div>

            <div data-error-field="description">
              <UiInput
                v-model="form.description"
                label="Descripción"
                placeholder="Describe qué puede hacer este rol dentro del sistema"
                :error="errors.description"
              />
              <p class="mt-1 text-xs opacity-60">
                Usa una descripción breve y clara para identificar su alcance.
              </p>
              <div class="mt-1 text-right text-xs opacity-50">
                {{ form.description.length }} / 300
              </div>
            </div>
          </div>
        </section>

        <!-- =========================
             PERMISOS
        ========================== -->
        <section class="space-y-4">
          <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                Permisos
              </h3>
              <p class="mt-1 text-sm opacity-60">
                Selecciona los permisos que tendrá asignado este rol
              </p>
            </div>

            <UiButton size="sm" variant="outline" type="button" @click="toggleAllPermissions">
              {{ allPermissionsSelected ? 'Quitar todos' : 'Seleccionar todos' }}
            </UiButton>
          </div>

          <!-- SEARCH -->
          <div class="max-w-md">
            <UiInput
              v-model="search"
              size="sm"
              placeholder="Buscar permiso por módulo o acción, ej: usuarios, eliminar, compras"
            />
            <p class="mt-1 text-xs opacity-60">
              Filtra permisos por nombre del recurso o por acción.
            </p>
          </div>

          <!-- RECURSOS -->
          <section class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <div class="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Recursos
              </div>

              <div class="text-xs opacity-60">{{ filteredResources.length }} módulos</div>
            </div>

            <div class="rounded-xl border border-base-300 bg-base-200/30 p-3">
              <div
                class="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3"
              >
                <button
                  v-for="resource in filteredResources"
                  :key="resource"
                  type="button"
                  class="group flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition"
                  :class="
                    activeTab === resource
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-base-300 bg-base-100 hover:border-primary/30 hover:bg-base-100'
                  "
                  @click="activeTab = resource"
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <div
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      :class="
                        activeTab === resource
                          ? 'bg-primary/15 text-primary'
                          : 'bg-base-200 text-base-content/60'
                      "
                    >
                      <Icon name="shield" size="sm" />
                    </div>

                    <div class="min-w-0">
                      <div class="truncate text-sm font-medium">
                        {{ normalizedLabel(resource) }}
                      </div>

                      <div class="text-[11px] opacity-50">
                        {{ permissionsByResource[resource]?.length ?? 0 }} permisos
                      </div>
                    </div>
                  </div>

                  <div
                    class="ml-3 shrink-0 rounded-full px-2 py-1 text-xs font-medium"
                    :class="
                      activeTab === resource
                        ? 'bg-primary/15 text-primary'
                        : 'bg-base-200 text-base-content/70'
                    "
                  >
                    {{ selectedCount(resource) }}/{{ permissionsByResource[resource]?.length ?? 0 }}
                  </div>
                </button>
              </div>
            </div>
          </section>

          <!-- PERMISOS DEL TAB ACTIVO -->
          <div
            v-if="activePermissions.length"
            class="rounded-xl border border-base-300 bg-base-100 p-4"
          >
            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 class="font-semibold uppercase text-sm text-primary">
                  {{ normalizedLabel(activeTab) }}
                </h4>
                <p class="text-xs opacity-60 mt-1">
                  {{ selectedCount(activeTab) }} de {{ activePermissions.length }} permisos
                  seleccionados
                </p>
                <p class="text-xs opacity-50 mt-1">
                  Marca solo las acciones que este rol debe poder ejecutar en este módulo.
                </p>
              </div>

              <UiButton size="xs" variant="ghost" type="button" @click="toggleAllActiveTab">
                {{ allActiveTabSelected ? 'Quitar todos' : 'Seleccionar todos' }}
              </UiButton>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <UiCheckbox
                v-for="p in activePermissions"
                :key="p.code"
                v-model="form.permissionCodes"
                :value="p.code"
                :label="actionLabels[p.action] ?? p.action"
              />
            </div>
          </div>

          <div
            v-else
            class="rounded-xl border border-dashed border-base-300 bg-base-100 p-6 text-center text-sm opacity-60"
          >
            No hay permisos para mostrar con los filtros actuales.
          </div>
        </section>

        <!-- =========================
             RESUMEN
        ========================== -->
        <section v-if="form.permissionCodes.length" class="space-y-3">
          <h4 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            Resumen de permisos asignados
          </h4>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="code in form.permissionCodes"
              :key="code"
              class="badge badge-outline badge-primary text-xs"
            >
              {{ formatPermissionChip(code) }}
            </span>
          </div>
        </section>
      </section>

      <!-- =====================================================
           FOOTER
      ====================================================== -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <UiButton variant="ghost" type="button" class="w-full sm:w-auto" @click="open = false">
          Cancelar
        </UiButton>

        <UiButton variant="primary" type="button" class="w-full sm:w-auto" @click="submit">
          Guardar
        </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, nextTick } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiButton from '~/components/ui/UiButton.vue'

import { usePermissionsStore } from '~/stores/permissions.store'
import { useUiStore } from '~/stores/ui.store'
import type { Role, CreateRoleDto } from '~/types/role'

type RoleDialogForm = {
  name: string
  description: string
  permissionCodes: string[]
  active: boolean
}

/* =========================
   PROPS
========================= */
const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: Role | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: Partial<CreateRoleDto>): void
}>()

/* =========================
   STORES
========================= */
const permissionsStore = usePermissionsStore()
const ui = useUiStore()

/* =========================
   DIALOG
========================= */
const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

/* =========================
   FORM
========================= */
function getDefaultForm(): RoleDialogForm {
  return {
    name: '',
    description: '',
    permissionCodes: [],
    active: true,
  }
}

const form = reactive<RoleDialogForm>(getDefaultForm())
const errors = reactive<Record<string, string>>({})

const search = ref('')
const activeTab = ref('')
const initialized = ref(false)

/* =========================
   LABELS
========================= */
const fieldLabels: Record<string, string> = {
  name: 'Nombre del rol',
  description: 'Descripción',
}

const resourceLabels: Record<string, string> = {
  users: 'Usuarios',
  roles: 'Roles',
  permissions: 'Permisos',
  clients: 'Clientes',
  client_addresses: 'Direcciones de clientes',
  suppliers: 'Proveedores',
  supplier_products: 'Proveedor · Producto',
  products: 'Productos',
  product_families: 'Familias de productos',
  product_categories: 'Categorías de productos',
  inventory: 'Inventario',
  recepciones: 'Recepciones',
  audit: 'Auditoría',
  ventas: 'Ventas',
  reportes: 'Reportes',
  proyectos: 'Proyectos',
  inventarios: 'Inventarios',
  ingenieria: 'Ingeniería',
  cxc: 'Cuentas por cobrar',
  contabilidad: 'Contabilidad',
  compras: 'Compras',
  projects: 'Proyectos',
  project_requirements: 'Levantamientos',
  purchases: 'Compras',
  notifications: 'Notificaciones',
  project_versions: 'Versiones de proyecto',
  project_photos: 'Fotos de proyecto',
}

const actionLabels: Record<string, string> = {
  create: 'Crear',
  read: 'Ver',
  list: 'Listar',
  update: 'Actualizar',
  delete: 'Eliminar',
  set_current: 'Seleccionar vigente',
  submit: 'Enviar',
  stats: 'Estadísticas',
  change_status: 'Cambiar estado',
}

/* =========================
   ERRORS
========================= */
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

/* =========================
   NORMALIZADOR
========================= */
const normalizedLabel = (resource: string) => {
  if (resourceLabels[resource]) return resourceLabels[resource]
  return resource.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/* =========================
   PERMISSIONS
========================= */
const safePermissions = computed(() =>
  Array.isArray(permissionsStore.items) ? permissionsStore.items : []
)

const permissionsByResource = computed(() => {
  const map: Record<string, any[]> = {}

  for (const p of safePermissions.value) {
    const text = `${p.resource} ${p.action} ${p.code}`.toLowerCase()

    if (search.value && !text.includes(search.value.toLowerCase())) continue

    if (!map[p.resource]) map[p.resource] = []
    map[p.resource].push(p)
  }

  return map
})

const filteredResources = computed(() =>
  Object.keys(permissionsByResource.value).sort((a, b) =>
    normalizedLabel(a).localeCompare(normalizedLabel(b))
  )
)

const activePermissions = computed(() => permissionsByResource.value[activeTab.value] ?? [])

const allPermissionsSelected = computed(() => {
  const allCodes = [...new Set(safePermissions.value.map(p => p.code))]
  if (!allCodes.length) return false
  return allCodes.every(code => form.permissionCodes.includes(code))
})

const allActiveTabSelected = computed(() => {
  const codes = activePermissions.value.map(p => p.code)
  if (!codes.length) return false
  return codes.every(code => form.permissionCodes.includes(code))
})

/* =========================
   WATCHERS
========================= */
watch(
  () => permissionsStore.items,
  perms => {
    if (!open.value || initialized.value) return
    if (!Array.isArray(perms) || !perms.length) return

    activeTab.value = Object.keys(permissionsByResource.value)[0] ?? ''
    initialized.value = true
  },
  { immediate: true }
)

watch(
  () => filteredResources.value,
  resources => {
    if (!resources.length) {
      activeTab.value = ''
      return
    }

    if (!resources.includes(activeTab.value)) {
      activeTab.value = resources[0]
    }
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  isOpen => {
    if (!isOpen) {
      clearErrors()
      return
    }

    search.value = ''
    initialized.value = false
  },
  { immediate: true }
)

watch(
  () => props.model,
  v => {
    clearErrors()

    const next = v
      ? {
          name: v.name ?? '',
          description: v.description ?? '',
          permissionCodes: [...(v.permissionCodes ?? [])],
          active: v.active ?? true,
        }
      : getDefaultForm()

    form.name = next.name
    form.description = next.description
    form.permissionCodes = next.permissionCodes
    form.active = next.active
  },
  { immediate: true }
)

/* =========================
   HELPERS
========================= */
function selectedCount(resource: string) {
  return (
    permissionsByResource.value[resource]?.filter(p => form.permissionCodes.includes(p.code))
      .length ?? 0
  )
}

function toggleAllPermissions() {
  const codes = [...new Set(safePermissions.value.map(p => p.code))]
  form.permissionCodes = allPermissionsSelected.value ? [] : [...codes]
}

function toggleAllActiveTab() {
  const codes = activePermissions.value.map(p => p.code)
  const set = new Set(form.permissionCodes)

  if (allActiveTabSelected.value) {
    codes.forEach(code => set.delete(code))
  } else {
    codes.forEach(code => set.add(code))
  }

  form.permissionCodes = Array.from(set)
}

function formatPermissionChip(code: string) {
  const [resource = '', action = code] = code.split(':')
  if (!resource) return code
  return `${normalizedLabel(resource)} · ${actionLabels[action] ?? action}`
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
   SUBMIT
========================= */
async function submit() {
  clearErrors()

  const name = form.name.trim()
  const description = form.description.trim()
  const permissionCodes = [...new Set(form.permissionCodes)]

  if (!name) {
    errors.name = 'El nombre del rol es obligatorio'
  } else if (name.length < 2) {
    errors.name = 'Debe tener al menos 2 caracteres'
  } else if (name.length > 80) {
    errors.name = 'No puede exceder 80 caracteres'
  }

  if (description.length > 300) {
    errors.description = 'No puede exceder 300 caracteres'
  }

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${fieldLabels[key] || key}: ${message}`)
    await focusFirstErrorField()
    return
  }

  emit('submit', {
    name,
    description: description || '',
    permissionCodes,
    active: !!form.active,
  })
}
</script>
