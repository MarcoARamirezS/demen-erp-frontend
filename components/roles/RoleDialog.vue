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

        <!-- Buscador -->
        <UiInput
          v-model="search"
          size="sm"
          placeholder="Buscar permiso (ventas, usuarios, eliminar...)"
        />

        <!-- Acciones globales -->
        <div class="flex flex-wrap gap-2">
          <UiButton size="sm" variant="outline" type="button" @click="toggleAllPermissions">
            Seleccionar todos
          </UiButton>
        </div>

        <!-- Tabs por recurso -->
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
            <Icon name="shield" size="sm" />
            {{ resourceLabels[resource] ?? resource }}

            <span class="rounded-full bg-base-100 px-2 py-0.5 text-xs">
              {{ selectedCount(resource) }}/{{ permissionsByResource[resource]?.length ?? 0 }}
            </span>
          </button>
        </div>

        <!-- Permisos del tab activo -->
        <div
          v-if="activePermissions.length"
          class="rounded-xl border border-base-300 bg-base-100 p-4"
        >
          <div class="mb-3 flex justify-between items-center">
            <h4 class="font-semibold uppercase text-sm text-primary">
              {{ resourceLabels[activeTab] ?? activeTab }}
            </h4>

            <UiButton size="xs" variant="ghost" type="button" @click="toggleAllActiveTab">
              Seleccionar todos
            </UiButton>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
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
        <h4 class="text-sm font-semibold text-secondary">Resumen de permisos asignados</h4>

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
      <div class="flex justify-end gap-3 pt-4 border-t">
        <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>
        <UiButton variant="primary" type="submit"> Guardar </UiButton>
      </div>
    </form>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiButton from '~/components/ui/UiButton.vue'

import { usePermissionsStore } from '~/stores/permissions.store'
import { useUiStore } from '~/stores/ui.store'
import type { Role, CreateRoleDto } from '~/types/role'

/* =========================
   PROPS / EMITS
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
   DIALOG STATE
========================= */
const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

/* =========================
   INIT GUARD
========================= */
const initialized = ref(false)

/* =========================
   FORM
========================= */
const form = ref<Partial<CreateRoleDto>>({
  name: '',
  description: '',
  permissionCodes: [],
  active: true,
})

/* =========================
   FILTERS / TABS
========================= */
const search = ref('')
const activeTab = ref('')

/* =========================
   LABELS
========================= */
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
  projects: 'Projects',
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
}

/* =========================
   ✅ FIX REAL AQUÍ
   USAR TODOS LOS PERMISOS,
   NO activePermissions
========================= */
const safePermissions = computed(() =>
  Array.isArray(permissionsStore.items) ? permissionsStore.items : []
)

/* =========================
   GROUP BY RESOURCE
========================= */
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
    (resourceLabels[a] ?? a).localeCompare(resourceLabels[b] ?? b)
  )
)

const activePermissions = computed(() => permissionsByResource.value[activeTab.value] ?? [])

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
  () => props.model,
  v => {
    form.value = v
      ? { ...v, permissionCodes: [...(v.permissionCodes ?? [])] }
      : { name: '', description: '', permissionCodes: [], active: true }
  },
  { immediate: true }
)

/* =========================
   HELPERS
========================= */
function selectedCount(resource: string) {
  return (
    permissionsByResource.value[resource]?.filter(p => form.value.permissionCodes?.includes(p.code))
      .length ?? 0
  )
}

function toggleAllPermissions() {
  const codes = safePermissions.value.map(p => p.code)
  form.value.permissionCodes = form.value.permissionCodes?.length === codes.length ? [] : [...codes]
}

function toggleAllActiveTab() {
  const codes = activePermissions.value.map(p => p.code)
  const set = new Set(form.value.permissionCodes)
  const allSelected = codes.every(c => set.has(c))

  codes.forEach(c => (allSelected ? set.delete(c) : set.add(c)))
  form.value.permissionCodes = Array.from(set)
}

function formatPermissionChip(code: string) {
  const [resource, action] = code.split(':')
  return `${resourceLabels[resource] ?? resource} · ${actionLabels[action] ?? action}`
}

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
