<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectVersionsStore } from '~/stores/projectVersions.store'
import { useAuthStore } from '~/stores/auth.store'
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'

const props = defineProps<{
  projectId: string
}>()

const versions = useProjectVersionsStore()
const auth = useAuthStore()
const ui = useUiStore()

const showCreate = ref(false)
const descripcion = ref('')

onMounted(async () => {
  versions.reset()
  await versions.fetchByProject(props.projectId)
})

/* =========================
   CREATE VERSION
========================= */
async function createVersion() {
  if (!descripcion.value.trim()) {
    ui.showToast('warning', 'La descripción es obligatoria')
    return
  }

  await versions.create({
    projectId: props.projectId,
    descripcion: descripcion.value,
  })

  descripcion.value = ''
  showCreate.value = false
}

/* =========================
   SET CURRENT
========================= */
async function setCurrent(id: string) {
  const ok = await ui.confirm({
    title: 'Marcar versión vigente',
    message: 'Esta versión será la vigente del proyecto.',
    confirmText: 'Confirmar',
  })

  if (!ok) return

  await versions.setCurrent(id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- =========================
         HEADER
    ========================= -->
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold">Versiones del proyecto</h3>
        <p class="text-sm opacity-60">Historial de versiones (A, B, C…)</p>
      </div>

      <UiButton
        v-if="auth.hasPermission('project_versions:create')"
        size="sm"
        variant="primary"
        @click="showCreate = !showCreate"
      >
        <Icon name="plus" size="sm" />
        Nueva versión
      </UiButton>
    </div>

    <!-- =========================
         CREATE FORM
    ========================= -->
    <div
      v-if="showCreate"
      class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm space-y-3"
    >
      <div class="text-sm font-medium">Crear versión {{ versions.nextVersionLetter }}</div>

      <textarea
        v-model="descripcion"
        class="textarea textarea-bordered w-full"
        rows="3"
        placeholder="Descripción de la versión"
      />

      <div class="flex justify-end gap-2">
        <UiButton size="sm" variant="ghost" @click="showCreate = false"> Cancelar </UiButton>
        <UiButton size="sm" variant="primary" @click="createVersion"> Guardar </UiButton>
      </div>
    </div>

    <!-- =========================
         TABLE
    ========================= -->
    <div class="rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <table class="table w-full text-sm">
        <thead class="bg-base-200 text-xs uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3">Versión</th>
            <th class="px-4 py-3">Descripción</th>
            <th class="px-4 py-3 text-center">Estado</th>
            <th class="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>

        <!-- LOADING -->
        <tbody v-if="versions.loading">
          <tr>
            <td colspan="4" class="p-8 text-center opacity-70">Cargando versiones…</td>
          </tr>
        </tbody>

        <!-- ROWS -->
        <tbody v-else-if="versions.items.length" class="divide-y divide-base-300">
          <tr v-for="v in versions.items" :key="v.id" class="transition hover:bg-base-200/40">
            <td class="px-4 py-3 font-semibold">
              {{ v.version }}
            </td>

            <td class="px-4 py-3">
              {{ v.descripcion }}
            </td>

            <td class="px-4 py-3 text-center">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  v.esActual ? 'bg-success/15 text-success' : 'bg-base-200 text-base-content/60'
                "
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :class="v.esActual ? 'bg-success' : 'bg-base-content/40'"
                />
                {{ v.esActual ? 'Vigente' : 'Histórica' }}
              </span>
            </td>

            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  v-if="!v.esActual && auth.hasPermission('project_versions:set_current')"
                  type="button"
                  class="btn btn-circle btn-sm btn-ghost text-primary hover:bg-primary/10"
                  data-tip="Marcar como vigente"
                  @click="setCurrent(v.id)"
                >
                  <Icon name="check" size="sm" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- EMPTY -->
        <tbody v-else>
          <tr>
            <td colspan="4" class="p-10 text-center opacity-60">No hay versiones registradas</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
