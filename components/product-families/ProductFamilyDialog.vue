<template>
  <UiDialog v-model="open" size="sm">
    <header class="border-b border-base-300 px-6 py-4">
      <h2 class="text-lg font-semibold">
        {{ mode === 'create' ? 'Nueva familia' : 'Editar familia' }}
      </h2>
    </header>

    <div class="p-6">
      <UiInput v-model="form.name" label="Nombre de la familia" autofocus />
    </div>

    <footer class="border-t border-base-300 px-6 py-4 flex justify-end gap-2">
      <UiButton variant="ghost" @click="open = false">Cancelar</UiButton>
      <UiButton variant="primary" @click="submit">Guardar</UiButton>
    </footer>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: any
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const form = reactive({
  name: '',
})

watch(
  () => props.model,
  v => {
    if (v) Object.assign(form, v)
    else form.name = ''
  },
  { immediate: true }
)

function submit() {
  if (!form.name.trim()) return
  emit('submit', { ...form })
  open.value = false
}
</script>
