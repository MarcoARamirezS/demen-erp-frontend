<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Gestión de Roles</h1>
        <p class="text-sm opacity-60">Control de permisos del sistema</p>
      </div>

      <UiButton icon="plus" variant="primary" @click="openCreate"> Nuevo rol </UiButton>
    </div>

    <!-- Tabla (SSR SAFE) -->
    <ClientOnly>
      <RolesTable
        :roles="store.items"
        :loading="store.loading"
        @edit="openEdit"
        @delete="confirmDelete"
      />
    </ClientOnly>

    <!-- Dialog (SSR SAFE) -->
    <ClientOnly>
      <RoleDialog
        v-if="dialogOpen"
        v-model="dialogOpen"
        :mode="dialogMode"
        :model="selected"
        @submit="handleSubmit"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRolesStore } from '~/stores/roles.store'
import { useUiStore } from '~/stores/ui.store'
import type { Role } from '~/types/role'

import RolesTable from '~/components/roles/RolesTable.vue'
import RoleDialog from '~/components/roles/RoleDialog.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'roles:list',
})

const store = useRolesStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<Role | null>(null)

onMounted(() => {
  store.fetch()
})

function openCreate() {
  dialogMode.value = 'create'
  selected.value = null
  dialogOpen.value = true
}

function openEdit(role: Role) {
  dialogMode.value = 'edit'
  selected.value = role
  dialogOpen.value = true
}

function confirmDelete(role: Role) {
  ui.confirm({
    title: 'Eliminar rol',
    message: `¿Eliminar el rol "${role.name}"?`,
    variant: 'danger',
    onConfirm: async () => {
      await store.remove(role.id)
      ui.showToast('success', 'Rol eliminado')
    },
  })
}

async function handleSubmit(payload: any) {
  if (dialogMode.value === 'create') {
    await store.create(payload)
  } else if (selected.value) {
    await store.update(selected.value.id, payload)
  }

  dialogOpen.value = false
}
</script>
