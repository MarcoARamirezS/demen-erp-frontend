<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { navigateTo } from '#app'

import { useProjectsStore } from '~/stores/projects.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import ProjectTable from '~/components/projects/ProjectTable.vue'
import ProjectDialog from '~/components/projects/ProjectDialog.vue'

const projects = useProjectsStore()
const auth = useAuthStore()
const ui = useUiStore()

const openDialog = ref(false)

/* =======================
   FETCH
======================= */
onMounted(async () => {
  projects.reset()
  await projects.fetch()
})

/* =======================
   ACTIONS
======================= */
function openCreate() {
  openDialog.value = true
}

function viewProject(id: string) {
  navigateTo(`/projects/${id}`)
}

async function deleteProject(id: string) {
  const ok = await ui.confirm({
    title: 'Dar de baja proyecto',
    message: 'El proyecto quedará inactivo. ¿Deseas continuar?',
    confirmText: 'Dar de baja',
    confirmVariant: 'danger',
  })

  if (!ok) return
  await projects.remove(id)
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Proyectos</h1>
        <p class="text-sm opacity-70">Gestión de proyectos</p>
      </div>

      <UiButton v-if="auth.hasPermission('projects:create')" @click="openCreate">
        Nuevo proyecto
      </UiButton>
    </header>

    <ProjectTable
      :items="projects.items"
      :loading="projects.loading"
      @view="viewProject"
      @delete="deleteProject"
    />

    <ProjectDialog v-model="openDialog" mode="create" @submit="projects.create" />
  </div>
</template>
