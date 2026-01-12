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
            <Icon :name="resourceIcons[resource]" size="sm" />
            {{ resourceLabels[resource] }}

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
              {{ resourceLabels[activeTab] }}
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
              :label="actionLabels[p.action]"
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
   LABELS / ICONS
========================= */
const resourceLabels: Record<string, string> = {
  ventas: 'Ventas',
  users: 'Usuarios',
  roles: 'Roles',
  reportes: 'Reportes',
  proyectos: 'Proyectos',
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
}

/* =========================
   PERMISSIONS GROUPED
========================= */
const permissionsByResource = computed(() => {
  const map: Record<string, any[]> = {}

  for (const p of permissionsStore.activePermissions) {
    const text = `${p.resource} ${p.action} ${p.code}`.toLowerCase()
    if (search.value && !text.includes(search.value.toLowerCase())) continue

    if (!map[p.resource]) map[p.resource] = []
    map[p.resource].push(p)
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
  const selected = new Set(form.value.permissionCodes)
  const allSelected = codes.every(c => selected.has(c))

  codes.forEach(c => (allSelected ? selected.delete(c) : selected.add(c)))
  form.value.permissionCodes = Array.from(selected)
}

function toggleAllPermissions() {
  const allCodes = permissionsStore.activePermissions.map(p => p.code)
  form.value.permissionCodes =
    form.value.permissionCodes.length === allCodes.length ? [] : [...allCodes]
}

function formatPermissionChip(code: string) {
  const [res, act] = code.split(':')
  return `${resourceLabels[res]} · ${actionLabels[act]}`
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
