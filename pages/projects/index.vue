<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

/* =========================
   SEARCH
========================= */
const search = ref('')

watch(search, async () => {
  await store.fetch({ search: search.value })
})

/* =========================
   INIT
========================= */
onMounted(() => {
  store.fetch({ search: search.value })
})

function resetSearch() {
  search.value = ''
  store.fetch()
}
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- Header Card -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Proyectos</h1>
          <p class="opacity-70 text-sm">Gestión comercial y operativa</p>
        </div>

        <!-- BUSCADOR -->
        <div class="flex flex-col gap-1 w-full md:w-[70%]">
          <div class="relative w-full">
            <span class="absolute left-3 top-3 opacity-50">
              <Icon name="search" class="h-5 w-5" />
            </span>

            <input
              v-model="search"
              type="text"
              placeholder="Buscar por número de proyecto..."
              class="input input-bordered input-md w-full pl-10"
            />
          </div>
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
      <ProjectDialog v-model="showDialog" :model="selected" @saved="store.fetch({ search })" />
    </ClientOnly>
  </div>
</template>
