<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useProjectRequirementsStore } from '@/stores/projectRequirements.store'
import { useAuthStore } from '@/stores/auth.store'

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'projects:read',
})

const route = useRoute()
const router = useRouter()

const auth = useAuthStore()
const projectsStore = useProjectsStore()
const reqStore = useProjectRequirementsStore()

const projectId = computed(() => String(route.params.id || ''))

const creating = ref(false)

onMounted(async () => {
  // opcional: traer el proyecto si quieres header completo
  await projectsStore.get(projectId.value)
  await reqStore.fetchLatest(projectId.value)
})

async function ensureDraft() {
  if (reqStore.latest) return reqStore.latest
  if (creating.value) return null
  creating.value = true
  try {
    return await reqStore.createDraft(projectId.value)
  } finally {
    creating.value = false
  }
}

async function onSubmitToPurchases() {
  const latest = await ensureDraft()
  if (!latest?.id) return

  await reqStore.submit(latest.id)
  // regreso a proyectos
  router.push('/projects')
}
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- Header Card -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h1 class="text-2xl font-bold truncate">Levantamiento de Requerimientos</h1>
          <p class="opacity-70 text-sm">
            Proyecto:
            <span class="font-medium">{{
              projectsStore.selected?.projectNumber ?? projectId
            }}</span>
          </p>
          <p class="text-xs opacity-60 mt-1">
            Estado levantamiento:
            <span class="badge badge-outline ml-2">
              {{ reqStore.latest?.status ?? 'SIN CAPTURA' }}
            </span>
          </p>
        </div>

        <ClientOnly>
          <div class="flex flex-col sm:flex-row gap-2">
            <UiButton variant="outline" @click="$router.push('/projects')">Volver</UiButton>

            <UiButton
              v-if="auth.hasPermission('projects:update')"
              variant="primary"
              :loading="reqStore.saving || creating"
              :disabled="reqStore.latest?.status === 'SUBMITTED'"
              @click="onSubmitToPurchases"
            >
              Enviar a Compras
            </UiButton>
          </div>
        </ClientOnly>
      </div>
    </div>

    <ProjectRequirementsForm
      :project-id="projectId"
      :model="reqStore.latest"
      :loading="reqStore.loading"
      :saving="reqStore.saving || creating"
      @ensureDraft="ensureDraft"
      @save="reqStore.update"
      @uploadImages="reqStore.uploadImages"
    />
  </div>
</template>
