<template>
  <UiDialog v-model="open" size="xl" :title="mode === 'create' ? 'Crear rol' : 'Editar rol'">
    <form class="space-y-6" @submit.prevent="submit">
      <!-- =========================
           DATOS BÁSICOS
      ========================== -->
      <UiInput v-model="form.name" label="Nombre del rol *" />
      <UiInput v-model="form.description" label="Descripción" />

      <!-- =========================
           PERMISOS
      ========================== -->
      <section class="space-y-4">
        <h3 class="font-semibold text-primary">Permisos</h3>

        <UiInput
          v-model="search"
          size="sm"
          placeholder="Buscar permiso (ventas, proyectos, eliminar...)"
        />

        <div class="flex flex-wrap gap-2">
          <UiButton size="sm" variant="outline" type="button" @click="toggleAllPermissions">
            Seleccionar todos
          </UiButton>
        </div>

        <!-- TABS -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="resource in filteredResources"
            :key="resource"
            type="button"
            class="flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition"
            :class="
              activeTab === resource
                ? 'bg-primary/10 text-primary border-primary'
                : 'bg-base-200 border-base-300 hover:bg-base-300'
            "
            @click="activeTab = resource"
          >
            <Icon :name="resourceIcons[resource] || DEFAULT_ICON" size="sm" />
            {{ resourceLabels[resource] ?? resource }}

            <span class="rounded-full bg-base-100 px-2 py-0.5 text-xs">
              {{ selectedCount(resource) }}/{{ permissionsByResource[resource]?.length ?? 0 }}
            </span>
          </button>
        </div>

        <!-- PERMISOS -->
        <div
          v-if="activePermissions.length"
          class="rounded-xl border border-base-300 bg-base-100 p-4"
        >
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-sm font-semibold uppercase text-primary">
              {{ resourceLabels[activeTab] ?? activeTab }}
            </h4>

            <UiButton size="xs" variant="ghost" type="button" @click="toggleAllActiveTab">
              Seleccionar todos
            </UiButton>
          </div>

          <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
            <UiCheckbox
              v-for="p in activePermissions"
              :key="p.code"
              v-model="form.permissionCodes"
              :value="p.code"
              :label="actionLabels[p.action] ?? p.action"
            />
          </div>
        </div>
      </section>

      <!-- =========================
           RESUMEN
      ========================== -->
      <section v-if="form.permissionCodes.length" class="space-y-2">
        <h4 class="text-sm font-semibold text-secondary">Resumen de permisos</h4>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="code in form.permissionCodes"
            :key="code"
            class="badge badge-secondary badge-outline text-xs"
          >
            {{ formatPermissionChip(code) }}
          </span>
        </div>
      </section>

      <!-- =========================
           ACCIONES
      ========================== -->
      <div class="flex justify-end gap-3 border-t pt-4">
        <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

        <UiButton variant="primary" type="submit"> Guardar </UiButton>
      </div>
    </form>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiButton from '~/components/ui/UiButton.vue'

import { usePermissionsStore } from '~/stores/permissions.store'
import { useUiStore } from '~/stores/ui.store'
import type { Role, CreateRoleDto } from '~/types/role'

/* =========================
   CONSTANTES
========================= */
const DEFAULT_ICON = 'circle'

/* =========================
   PROPS / EMITS
========================= */
const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: Role | null
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

/* =========================
   STORES
========================= */
const permissionsStore = usePermissionsStore()
const ui = useUiStore()

/* =========================
   STATE
========================= */
const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const form = ref<Partial<CreateRoleDto>>({
  name: '',
  description: '',
  permissionCodes: [],
  active: true,
})

const search = ref('')
const activeTab = ref('')

/* =========================
   NORMALIZACIÓN DE RESOURCE
========================= */
function normalizeResource(resource: string) {
  const map: Record<string, string> = {
    projects: 'proyectos',
    project_versions: 'versiones',
    project_photos: 'fotos',
    // Proveedores / Productos
    suppliers: 'proveedores',
    supplier_products: 'proveedor_productos',
    products: 'productos',
  }
  return map[resource] ?? resource
}

/* =========================
   LABELS / ICONOS
========================= */
const resourceLabels: Record<string, string> = {
  ventas: 'Ventas',
  users: 'Usuarios',
  roles: 'Roles',
  reportes: 'Reportes',

  proyectos: 'Proyectos',
  versiones: 'Versiones',
  fotos: 'Fotos',

  proveedores: 'Proveedores',
  proveedor_productos: 'Productos por proveedor',
  productos: 'Productos',

  permissions: 'Permisos',
  inventarios: 'Inventarios',
  ingenieria: 'Ingeniería',
  cxc: 'Cuentas por cobrar',
  contabilidad: 'Contabilidad',
  compras: 'Compras',
  audit: 'Auditoría',
  clients: 'Clientes',
  client_addresses: 'Direcciones de clientes',
}

const resourceIcons: Record<string, string> = {
  ventas: 'shopping-cart',
  users: 'users',
  roles: 'key',
  reportes: 'chartBar',

  proyectos: 'folder',
  versiones: 'layers',
  fotos: 'image',

  proveedores: 'truck',
  proveedor_productos: 'link',
  productos: 'box',

  permissions: 'shield',
  inventarios: 'database',
  ingenieria: 'settings',
  cxc: 'credit-card',
  contabilidad: 'calculator',
  compras: 'truck',
  audit: 'clipboard',
  clients: 'users',
  client_addresses: 'home',
}

const actionLabels: Record<string, string> = {
  create: 'Crear',
  read: 'Ver',
  list: 'Listar',
  update: 'Actualizar',
  delete: 'Eliminar',
  set_current: 'Marcar vigente',
}

/* =========================
   COMPUTEDS
========================= */
const permissionsByResource = computed(() => {
  const map: Record<string, any[]> = {}

  for (const p of permissionsStore.activePermissions) {
    const text = `${p.resource} ${p.action} ${p.code}`.toLowerCase()
    if (search.value && !text.includes(search.value.toLowerCase())) continue

    const resource = normalizeResource(p.resource)
    if (!map[resource]) map[resource] = []
    map[resource].push(p)
  }

  return map
})

const filteredResources = computed(() => Object.keys(permissionsByResource.value))
const activePermissions = computed(() => permissionsByResource.value[activeTab.value] ?? [])

/* =========================
   HELPERS
========================= */
function selectedCount(resource: string) {
  return (
    permissionsByResource.value[resource]?.filter(p => form.value.permissionCodes?.includes(p.code))
      .length ?? 0
  )
}

function toggleAllActiveTab() {
  const codes = activePermissions.value.map(p => p.code)
  const set = new Set(form.value.permissionCodes)
  const allSelected = codes.every(c => set.has(c))
  codes.forEach(c => (allSelected ? set.delete(c) : set.add(c)))
  form.value.permissionCodes = Array.from(set)
}

function toggleAllPermissions() {
  const allCodes = permissionsStore.activePermissions.map(p => p.code)
  form.value.permissionCodes =
    form.value.permissionCodes.length === allCodes.length ? [] : [...allCodes]
}

function formatPermissionChip(code: string) {
  const [res, act] = code.split(':')
  const resource = normalizeResource(res)
  return `${resourceLabels[resource] ?? resource} · ${actionLabels[act] ?? act}`
}

/* =========================
   LIFECYCLE
========================= */
onMounted(async () => {
  if (!permissionsStore.items.length) {
    await permissionsStore.fetch()
  }
  activeTab.value = filteredResources.value[0] ?? ''
})

watch(
  () => props.model,
  v => {
    form.value = v
      ? { ...v, permissionCodes: [...(v.permissionCodes ?? [])] }
      : { name: '', description: '', permissionCodes: [], active: true }
  },
  { immediate: true }
)

/* =========================
   SUBMIT
========================= */
function submit() {
  if (!form.value.name) {
    ui.showToast('warning', 'El nombre del rol es obligatorio')
    return
  }
  emit('submit', form.value)
}
</script>
