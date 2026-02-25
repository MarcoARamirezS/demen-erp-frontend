<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth.store'

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'projects:read',
})

const store = useProjectsStore()
const auth = useAuthStore()

const showDialog = ref(false)
const selected = ref(null)

onMounted(() => {
  store.fetch()
})
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- Header Card -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Proyectos</h1>
          <p class="opacity-70 text-sm">Gestión comercial y operativa</p>
        </div>

        <!-- 🔥 IMPORTANTE: envolver en ClientOnly -->
        <ClientOnly>
          <UiButton v-if="auth.hasPermission('projects:create')" @click="showDialog = true">
            Nuevo Proyecto
          </UiButton>
        </ClientOnly>
      </div>
    </div>

    <ProjectsTable
      :items="store.items"
      :loading="store.loading"
      @edit="
        p => {
          selected = p
          showDialog = true
        }
      "
      @delete="store.remove"
      @changeStatus="store.changeStatus"
      @requirements="p => $router.push(`/projects/${p.id}/requirements`)"
    />

    <ClientOnly>
      <ProjectDialog v-model="showDialog" :model="selected" @saved="store.fetch" />
    </ClientOnly>
  </div>
</template>
