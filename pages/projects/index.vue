<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useProjectsStore } from '~/stores/projects.store'
import ProjectDialog from '~/components/projects/ProjectDialog.vue'
import Icon from '~/components/ui/Icon.vue'

const auth = useAuthStore()
const projects = useProjectsStore()

/* =======================
   STATE
======================= */
const search = ref('')
const openDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref(null)

/* =======================
   FETCH
======================= */
onMounted(() => {
  projects.reset()
  projects.fetch()
})

/* =======================
   FILTERED (LOCAL)
======================= */
const filtered = computed(() => {
  const term = search.value.toLowerCase()
  return projects.items.filter(
    p =>
      !term ||
      p.descripcion.toLowerCase().includes(term) ||
      p.versionActual.toLowerCase().includes(term)
  )
})

/* =======================
   ACTIONS
======================= */
function openCreate() {
  dialogMode.value = 'create'
  selected.value = null
  openDialog.value = true
}

function openEdit(project: any) {
  dialogMode.value = 'edit'
  selected.value = project
  openDialog.value = true
}

async function removeProject(project: any) {
  const ok = await useUiStore().confirm({
    title: 'Eliminar proyecto',
    message: 'Esta acción desactivará el proyecto. ¿Deseas continuar?',
    confirmText: 'Eliminar',
    variant: 'danger',
  })

  if (!ok) return

  await projects.remove(project.id)
}

function goToProject(id: string) {
  navigateTo(`/projects/${id}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- =======================
         HEADER
    ======================== -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Proyectos</h1>
        <p class="text-sm text-base-content/60">
          Gestión de proyectos generados a partir de ventas
        </p>
      </div>

      <UiButton v-if="auth.hasPermission('projects:create')" variant="primary" @click="openCreate">
        Nuevo proyecto
      </UiButton>
    </header>

    <!-- =======================
         TABLE
    ======================== -->
    <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
      <!-- =======================
           FILTERS
      ======================== -->
      <div
        class="mb-4 flex flex-col gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div class="relative w-full md:w-80">
            <span class="pointer-events-none absolute left-3 top-2.5 opacity-50">
              <Icon name="search" class="h-4 w-4" />
            </span>

            <input
              v-model="search"
              type="text"
              placeholder="Buscar por descripción o versión..."
              class="input input-sm input-bordered w-full pl-9"
            />
          </div>
        </div>
      </div>

      <!-- =======================
           DESKTOP TABLE
      ======================== -->
      <div class="hidden md:block overflow-x-auto rounded-xl border border-base-300">
        <table class="table w-full text-sm">
          <thead class="bg-base-200 text-xs uppercase tracking-wide">
            <tr>
              <th class="px-4 py-3">Fecha</th>
              <th class="px-4 py-3">Descripción</th>
              <th class="px-4 py-3 text-center">Versión actual</th>
              <th class="px-4 py-3 text-center">Estado</th>
              <th class="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody v-if="projects.loading">
            <tr>
              <td colspan="5" class="p-8 text-center opacity-70">Cargando proyectos…</td>
            </tr>
          </tbody>

          <tbody v-else-if="filtered.length" class="divide-y divide-base-300">
            <tr v-for="p in filtered" :key="p.id" class="transition hover:bg-base-200/40">
              <td class="px-4 py-3">
                {{ p.fechaLevantamiento }}
              </td>

              <td class="px-4 py-3 font-medium">
                {{ p.descripcion }}
              </td>

              <td class="px-4 py-3 text-center">
                <span class="badge badge-outline badge-primary">
                  {{ p.versionActual }}
                </span>
              </td>

              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="p.activo ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
                >
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="p.activo ? 'bg-success' : 'bg-error'"
                  />
                  {{ p.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>

              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-primary hover:bg-primary/10"
                    data-tip="Ver"
                    @click="goToProject(p.id)"
                  >
                    <Icon name="eye" size="sm" />
                  </button>

                  <button
                    v-if="auth.hasPermission('projects:update')"
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-primary hover:bg-primary/10"
                    data-tip="Editar"
                    @click="openEdit(p)"
                  >
                    <Icon name="edit" size="sm" />
                  </button>

                  <button
                    v-if="auth.hasPermission('projects:delete')"
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-error hover:bg-error/10"
                    data-tip="Eliminar"
                    @click="removeProject(p)"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td colspan="5" class="p-8 text-center opacity-70">No hay proyectos registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- =======================
         DIALOG
    ======================== -->
    <ProjectDialog
      v-model="openDialog"
      :mode="dialogMode"
      :model="selected"
      @submit="projects.save"
    />
  </div>
</template>
