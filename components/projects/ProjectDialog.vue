<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Project } from '@/types/project'
import { useProjectsStore } from '@/stores/projects'

const props = defineProps<{
  modelValue: boolean
  model?: Project | null
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const store = useProjectsStore()

const form = ref({
  clientId: '',
  branchId: '',
  plantaCliente: '',
  objetivoFuncionalCliente: '',
  realizaLevantamiento: '',
  personaAQuienVisita: '',
  fecha: '',
})

watch(
  () => props.model,
  val => {
    if (val) form.value = { ...val }
  }
)

const save = async () => {
  if (props.model?.id) {
    await store.update(props.model.id, form.value)
  } else {
    await store.create(form.value)
  }

  emit('saved')
  emit('update:modelValue', false)
}
</script>

<template>
  <UiDialog
    :model-value="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    size="xl"
    hide-close
  >
    <!-- Header -->
    <template #header>
      <div class="p-4 bg-base-200 sticky top-0 flex justify-between items-center">
        <h3 class="font-bold">
          {{ model?.id ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
        </h3>
        <button class="btn btn-circle btn-ghost" @click="emit('update:modelValue', false)">
          ✕
        </button>
      </div>
    </template>

    <!-- Content -->
    <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <UiInput v-model="form.clientId" label="Cliente" />
      <UiInput v-model="form.branchId" label="Sucursal" />
      <UiInput v-model="form.plantaCliente" label="Planta Cliente" />
      <UiInput v-model="form.objetivoFuncionalCliente" label="Objetivo" />
      <UiInput v-model="form.personaAQuienVisita" label="Persona visita" />
      <UiInput v-model="form.fecha" type="date" label="Fecha" />
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="p-4 bg-base-200 sticky bottom-0 flex justify-end gap-2">
        <UiButton variant="outline" @click="emit('update:modelValue', false)"> Cancelar </UiButton>
        <UiButton @click="save"> Guardar </UiButton>
      </div>
    </template>
  </UiDialog>
</template>
