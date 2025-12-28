<!-- ~/pages/usuarios/index.vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Gestión de Usuarios</h1>
        <p class="text-sm opacity-60">Administración de accesos del sistema</p>
      </div>

      <ClientOnly>
        <UiButton icon="plus" variant="primary" :disabled="!canCreateUser" @click="openCreate">
          Nuevo usuario
        </UiButton>
      </ClientOnly>
    </div>
    <p v-if="!hasRoles" class="text-sm text-warning mt-2">
      ⚠️ Debes crear al menos un rol antes de registrar usuarios.
    </p>

    <UsersTable
      :users="store.items"
      :loading="store.loading"
      @edit="openEdit"
      @toggle="toggleUser"
      @delete="deleteUser"
    />

    <ClientOnly>
      <UserDialog
        v-model="dialogOpen"
        :mode="dialogMode"
        :model="selected"
        @submit="handleSubmit"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUsersStore } from '~/stores/users.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
import { useRolesStore } from '~/stores/roles.store'

import UsersTable from '~/components/users/UsersTable.vue'
import UserDialog from '~/components/users/UserDialog.vue'
import type { User } from '~/types/user'

definePageMeta({ layout: 'default', middleware: 'auth' })

const store = useUsersStore()
const auth = useAuthStore()
const ui = useUiStore()
const rolesStore = useRolesStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<User | null>(null)

const canCreate = computed(() => auth.hasPermission('users:create'))

const hasRoles = computed(() => rolesStore.items.length > 0)

const canCreateUser = computed(() => auth.hasPermission('users:create') && hasRoles.value)

onMounted(async () => {
  await Promise.all([store.fetch(), rolesStore.fetch()])
})

function openCreate() {
  if (!hasRoles.value) {
    ui.showToast('warning', 'No puedes crear usuarios hasta que existan roles')
    return
  }

  dialogMode.value = 'create'
  selected.value = null
  dialogOpen.value = true
}

const deleteUser = async (id: string) => {
  await store.remove(id) // o la lógica que uses
}

function openEdit(u: User) {
  dialogMode.value = 'edit'
  selected.value = u
  dialogOpen.value = true
}

async function toggleUser(u: User) {
  ui.confirm({
    title: u.activo ? 'Desactivar usuario' : 'Activar usuario',
    message: u.activo
      ? `¿Deseas desactivar a "${u.usuario}"?`
      : `¿Deseas activar a "${u.usuario}"?`,
    variant: u.activo ? 'warning' : 'success',
    onConfirm: async () => {
      await store.toggleActive(u)
      ui.showToast('success', 'Cambio aplicado')
    },
  })
}

async function handleSubmit(payload: any) {
  if (!hasRoles.value) {
    ui.showToast('warning', 'No hay roles disponibles para asignar')
    return
  }

  if (dialogMode.value === 'create') {
    await store.create(payload)
  } else if (selected.value) {
    await store.update(selected.value.id, payload)
  }

  dialogOpen.value = false
}
</script>
