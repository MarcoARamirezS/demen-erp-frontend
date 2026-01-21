<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'

import { useAuthStore } from '~/stores/auth.store'
import { useProjectsStore } from '~/stores/projects.store'
import { useProjectVersionsStore } from '~/stores/projectVersions.store'

import ProjectDialog from '~/components/projects/ProjectDialog.vue'
import ProjectVersions from '~/components/projects/ProjectVersions.vue'
import ProjectPhotos from '~/components/projects/ProjectPhotos.vue'

const route = useRoute()
const auth = useAuthStore()
const projectsStore = useProjectsStore()
const versionsStore = useProjectVersionsStore()

const projectId = route.params.id as string

/* =========================
   UI STATE
========================= */
const activeTab = ref<'info' | 'versions' | 'photos'>('info')
const showEditDialog = ref(false)

/* =========================
   INIT
========================= */
onMounted(async () => {
  await projectsStore.getById(projectId)
})

/* =========================
   LAZY LOAD
========================= */
watch(activeTab, async tab => {
  if (tab === 'versions' && !versionsStore.loadedFor(projectId)) {
    await versionsStore.fetchByProject(projectId)
  }
})

/* =========================
   COMPUTED
========================= */
const project = computed(() => projectsStore.selected)

const canEdit = computed(() => auth.hasPermission('projects:update'))
</script>

<template>
  <div v-if="project" class="space-y-6">
    <!-- =======================
         HEADER / BREADCRUMB
    ======================== -->
    <div class="space-y-2">
      <nav class="flex items-center gap-2 text-sm text-base-content/60">
        <NuxtLink to="/projects" class="flex items-center gap-1 hover:text-primary">
          <Icon name="briefcase" size="sm" />
          Proyectos
        </NuxtLink>

        <Icon name="chevron-right" size="sm" />

        <span class="font-medium text-base-content">
          {{ project.descripcion }}
        </span>
      </nav>

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Proyecto</h1>
          <p class="text-sm opacity-60">
            Versión vigente: <strong>{{ project.versionActual }}</strong>
          </p>
        </div>

        <UiButton v-if="canEdit" size="sm" variant="primary" @click="showEditDialog = true">
          Editar proyecto
        </UiButton>
      </div>
    </div>

    <!-- =======================
         TABS
    ======================== -->
    <div class="tabs tabs-boxed">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'info' }"
        @click="activeTab = 'info'"
      >
        Información
      </button>

      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'versions' }"
        @click="activeTab = 'versions'"
      >
        Versiones
      </button>

      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'photos' }"
        @click="activeTab = 'photos'"
      >
        Fotos
      </button>
    </div>

    <!-- =======================
         TAB CONTENT
    ======================== -->
    <!-- INFO -->
    <div
      v-if="activeTab === 'info'"
      class="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <span class="text-xs opacity-60">Cliente</span>
          <div class="font-medium">{{ project.clientId }}</div>
        </div>

        <div>
          <span class="text-xs opacity-60">Fecha de levantamiento</span>
          <div class="font-medium">{{ project.fechaLevantamiento }}</div>
        </div>

        <div class="md:col-span-2">
          <span class="text-xs opacity-60">Descripción</span>
          <div class="font-medium">
            {{ project.descripcion }}
          </div>
        </div>

        <div>
          <span class="text-xs opacity-60">Estado</span>
          <div>
            <span
              class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              :class="project.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
            >
              <span
                class="h-2 w-2 rounded-full"
                :class="project.activo ? 'bg-success' : 'bg-error'"
              />
              {{ project.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- VERSIONS -->
    <ProjectVersions v-if="activeTab === 'versions'" :project-id="projectId" />

    <!-- PHOTOS -->
    <ProjectPhotos v-if="activeTab === 'photos'" :project-id="projectId" />

    <!-- =======================
         EDIT DIALOG
    ======================== -->
    <ProjectDialog
      v-model="showEditDialog"
      mode="edit"
      :model="project"
      @submit="projectsStore.update(project.id, $event)"
    />
  </div>

  <!-- =======================
       LOADING
  ======================== -->
  <div v-else class="p-12 text-center opacity-70">Cargando proyecto…</div>
</template>
