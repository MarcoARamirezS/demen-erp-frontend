<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { Project } from '@/types/project'
import { useProjectsStore } from '@/stores/projects'
import { useClientsStore } from '@/stores/clients.store'
import { useClientAddressesStore } from '@/stores/clientAddresses.store'

const props = defineProps<{
  modelValue: boolean
  model?: Project | null
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const projectsStore = useProjectsStore()
const clientsStore = useClientsStore()
const addressesStore = useClientAddressesStore()

const showClientDialog = ref(false)
const showAddressDialog = ref(false)

const selectedImages = ref<File[]>([])
const previews = ref<string[]>([])

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  selectedImages.value = Array.from(files)
  previews.value = selectedImages.value.map(file => URL.createObjectURL(file))
}

const form = ref({
  clientId: '',
  branchId: '',
  plantaCliente: '',
  objetivoFuncionalCliente: '',
  personaAQuienVisita: '',
  fecha: '',
})

watch(
  () => props.model,
  val => {
    if (val) {
      form.value = {
        clientId: val.clientId ?? '',
        branchId: val.branchId ?? '',
        plantaCliente: val.plantaCliente ?? '',
        objetivoFuncionalCliente: val.objetivoFuncionalCliente ?? '',
        personaAQuienVisita: val.personaAQuienVisita ?? '',
        fecha: val.fecha ?? '',
      }
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (!clientsStore.items.length) {
    await clientsStore.fetch(100)
  }
})

/* =========================
   🔥 FIX IMPORTANTE AQUÍ
========================= */
watch(
  () => form.value.clientId,
  async (val, oldVal) => {
    if (!val) {
      addressesStore.items = []
      return
    }

    await addressesStore.fetchByClient(val)

    // 🔥 SOLO limpiar branchId si el cliente cambió manualmente
    if (oldVal && oldVal !== val) {
      form.value.branchId = ''
    }
  }
)

async function save() {
  let savedProject

  if (props.model?.id) {
    savedProject = await projectsStore.update(props.model.id, form.value)
  } else {
    savedProject = await projectsStore.create(form.value)
  }

  if (selectedImages.value.length && savedProject?.id) {
    await projectsStore.uploadImages(savedProject.id, selectedImages.value)
  }

  emit('saved')
  open.value = false
}
</script>

<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <!-- HEADER -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="text-lg font-semibold truncate">
        {{ props.model?.id ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
      </h2>
      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">✕</button>
    </div>

    <!-- CONTENT -->
    <div class="px-6 py-5 overflow-auto space-y-5" style="max-height: calc(90vh - 160px)">
      <!-- CLIENTE -->
      <UiSelect v-model="form.clientId" label="Cliente">
        <option value="" disabled>Selecciona un cliente</option>
        <option v-for="c in clientsStore.items" :key="c.id" :value="c.id">
          {{ c.razonSocial || c.nombreComercial }}
        </option>
      </UiSelect>

      <!-- SUCURSAL -->
      <UiSelect v-model="form.branchId" label="Sucursal" :disabled="!form.clientId">
        <option value="" disabled>Selecciona una sucursal</option>
        <option v-for="a in addressesStore.items" :key="a.id" :value="a.id">
          {{ a.nombre }}
        </option>
      </UiSelect>

      <UiInput v-model="form.plantaCliente" label="Planta Cliente" />
      <UiInput v-model="form.objetivoFuncionalCliente" label="Objetivo Funcional" />
      <UiInput v-model="form.personaAQuienVisita" label="Persona a quien visita" />
      <UiInput v-model="form.fecha" type="date" label="Fecha" />

      <!-- 📸 IMÁGENES -->
      <div>
        <label class="label">
          <span class="label-text">Imágenes del proyecto</span>
        </label>

        <input
          type="file"
          multiple
          class="file-input file-input-bordered w-full"
          @change="onFileChange"
        />

        <!-- PREVIEWS -->
        <div v-if="previews.length" class="grid grid-cols-3 gap-3 mt-4">
          <img
            v-for="(p, i) in previews"
            :key="i"
            :src="p"
            class="rounded-xl border border-base-300 h-28 object-cover"
          />
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div
      class="sticky bottom-0 flex justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" @click="open = false">Cancelar</UiButton>
      <UiButton variant="primary" @click="save">Guardar</UiButton>
    </div>
  </UiDialog>
</template>
