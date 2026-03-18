<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth.store'
import type { Project } from '@/types/project'

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'projects:read',
})

const store = useProjectsStore()
const auth = useAuthStore()

const showDialog = ref(false)
const selected = ref<Project | null>(null)

/* =========================
   SEARCH + SORT
========================= */
const search = ref('')
const sortBy = ref<'createdAt' | 'clientName' | 'projectNumber' | 'fecha'>('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')

function buildFilters() {
  return {
    search: search.value || undefined,
    sortBy: sortBy.value,
    sortDir: sortDir.value,
  }
}

watch(
  [search, sortBy, sortDir],
  async () => {
    await store.fetch(buildFilters())
  },
  { immediate: true }
)

/* =========================
   ACTIONS
========================= */
function resetFilters() {
  search.value = ''
  sortBy.value = 'createdAt'
  sortDir.value = 'desc'
}

function openCreateDialog() {
  selected.value = null
  showDialog.value = true
}

function openEditDialog(project: Project) {
  selected.value = project
  showDialog.value = true
}
</script>

<template>
  <div class="animate-fadeIn space-y-6">
    <!-- Header Card -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Proyectos</h1>
          <p class="text-sm opacity-70">Gestión comercial y operativa</p>
        </div>

        <!-- CONTROLES -->
        <div class="flex w-full flex-col gap-3 xl:w-[75%]">
          <!-- Buscador -->
          <div class="relative w-full">
            <span class="absolute left-3 top-3 opacity-50">
              <Icon name="search" class="h-5 w-5" />
            </span>

            <input
              v-model="search"
              type="text"
              placeholder="Buscar por número, cliente o sucursal..."
              class="input input-bordered input-md w-full pl-10"
            />
          </div>

          <!-- Ordenamiento -->
          <div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
            <select v-model="sortBy" class="select select-bordered w-full">
              <option value="createdAt">Ordenar por fecha de creación</option>
              <option value="clientName">Ordenar por cliente</option>
              <option value="projectNumber">Ordenar por número de proyecto</option>
              <option value="fecha">Ordenar por fecha de visita</option>
            </select>

            <select v-model="sortDir" class="select select-bordered w-full">
              <option value="desc">Mayor a menor</option>
              <option value="asc">Menor a mayor</option>
            </select>

            <button class="btn btn-outline" @click="resetFilters">
              <Icon name="rotate-ccw" class="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </div>

        <ClientOnly>
          <UiButton v-if="auth.hasPermission('projects:create')" @click="openCreateDialog">
            Nuevo Proyecto
          </UiButton>
        </ClientOnly>
      </div>
    </div>

    <ProjectsTable
      :items="store.items"
      :loading="store.loading"
      @edit="openEditDialog"
      @delete="store.remove"
      @changeStatus="store.changeStatus"
      @requirements="p => $router.push(`/projects/${p.id}/requirements`)"
    />

    <ClientOnly>
      <ProjectDialog v-model="showDialog" :model="selected" @saved="store.fetch(buildFilters())" />
    </ClientOnly>
  </div>
</template>
