<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'
import { useAuthStore } from '~/stores/auth.store'
import { useProjectVersionsStore } from '~/stores/projectVersions.store'
import { useProjectPhotosStore } from '~/stores/projectPhotos.store'

const props = defineProps<{
  projectId: string
}>()

const ui = useUiStore()
const auth = useAuthStore()
const versionsStore = useProjectVersionsStore()
const photosStore = useProjectPhotosStore()

const selectedVersionId = ref<string | null>(null)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

/* =========================
   INIT
========================= */
onMounted(async () => {
  await versionsStore.fetchByProject(props.projectId)

  const current = versionsStore.items.find(v => v.esActual)
  if (current) {
    selectedVersionId.value = current.id
  }
})

/* =========================
   WATCH VERSION
========================= */
watch(selectedVersionId, async v => {
  if (!v) return
  await photosStore.fetch(props.projectId, v)
})

/* =========================
   ACTIONS
========================= */
function triggerUpload() {
  fileInput.value?.click()
}

async function handleUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !selectedVersionId.value) return

  uploading.value = true
  try {
    await photosStore.upload({
      file,
      projectId: props.projectId,
      versionId: selectedVersionId.value,
      source: 'web',
    })

    await photosStore.fetch(props.projectId, selectedVersionId.value)
    ui.showToast('success', 'Foto subida correctamente')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function removePhoto(id: string) {
  const ok = await ui.confirm({
    title: 'Eliminar foto',
    message: 'Esta acción eliminará la foto permanentemente. ¿Deseas continuar?',
    confirmText: 'Eliminar',
    variant: 'danger',
  })

  if (!ok || !selectedVersionId.value) return

  await photosStore.remove(id)
  await photosStore.fetch(props.projectId, selectedVersionId.value)
  ui.showToast('success', 'Foto eliminada')
}

/* =========================
   COMPUTED
========================= */
const canUpload = computed(
  () => auth.hasPermission('project_photos:create') && selectedVersionId.value
)

const canDelete = computed(() => auth.hasPermission('project_photos:delete'))
</script>

<template>
  <div class="space-y-6">
    <!-- =======================
         HEADER
    ======================== -->
    <div
      class="flex flex-col gap-4 rounded-xl border border-base-300 bg-gradient-to-r from-base-200 to-base-100 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <!-- Version selector -->
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium opacity-70">Versión:</span>

        <select v-model="selectedVersionId" class="select select-sm select-bordered min-w-[180px]">
          <option disabled value="">Selecciona versión</option>
          <option v-for="v in versionsStore.items" :key="v.id" :value="v.id">
            {{ v.version }} — {{ v.esActual ? 'Vigente' : 'Histórica' }}
          </option>
        </select>
      </div>

      <!-- Upload -->
      <div v-if="canUpload">
        <UiButton size="sm" variant="primary" :loading="uploading" @click="triggerUpload">
          <Icon name="upload" size="sm" />
          Subir foto
        </UiButton>

        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleUpload" />
      </div>
    </div>

    <!-- =======================
         GRID
    ======================== -->
    <div v-if="photosStore.loading" class="p-12 text-center opacity-70">Cargando fotos…</div>

    <div
      v-else-if="photosStore.items.length"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      <div
        v-for="p in photosStore.items"
        :key="p.id"
        class="group relative overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm"
      >
        <img
          :src="p.secureUrl || p.url"
          class="h-48 w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />

        <!-- Overlay -->
        <div
          class="absolute inset-0 flex items-end justify-between bg-black/40 p-2 opacity-0 transition group-hover:opacity-100"
        >
          <span class="text-xs text-white truncate">
            {{ p.originalName }}
          </span>

          <button
            v-if="canDelete"
            type="button"
            class="btn btn-circle btn-xs btn-ghost text-error hover:bg-error/20"
            data-tip="Eliminar"
            @click="removePhoto(p.id)"
          >
            <Icon name="trash" size="sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- =======================
         EMPTY
    ======================== -->
    <div
      v-else
      class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-base-300 p-12 text-base-content/60"
    >
      <Icon name="photo" size="lg" />
      <p class="text-sm">No hay fotos para esta versión</p>
    </div>
  </div>
</template>
