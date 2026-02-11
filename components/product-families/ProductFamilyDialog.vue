<template>
  <UiDialog v-model="open" size="sm" hide-header hide-close>
    <!-- =========================
         HEADER (STICKY)
    ========================== -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="text-lg font-semibold">
        {{ mode === 'create' ? 'Nueva familia' : 'Editar familia' }}
      </h2>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- =========================
         CONTENT (SCROLL)
    ========================== -->
    <div class="px-6 py-5 overflow-auto space-y-4" style="max-height: calc(90vh - 160px)">
      <UiInput v-model="form.name" label="Nombre de la familia" autofocus />

      <!-- 🔥 NUEVO CAMPO CODE -->
      <UiInput v-model="form.code" label="Código" placeholder="Ej: ELECTRONICA" />
    </div>

    <!-- =========================
         FOOTER (STICKY)
    ========================== -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton variant="primary" @click="submit"> Guardar </UiButton>
    </div>
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
  code: '',
})

/* =========================
   🔥 AUTOGENERAR CÓDIGO
   Solo en modo create
========================= */
watch(
  () => form.name,
  val => {
    if (props.mode === 'create') {
      form.code =
        val
          ?.toUpperCase()
          .replace(/\s+/g, '_')
          .replace(/[^A-Z0-9_]/g, '')
          .substring(0, 20) || ''
    }
  }
)

/* =========================
   EDIT MODE
========================= */
watch(
  () => props.model,
  v => {
    if (v) {
      Object.assign(form, {
        name: v.name ?? '',
        code: v.code ?? '',
      })
    } else {
      form.name = ''
      form.code = ''
    }
  },
  { immediate: true }
)

/* =========================
   SUBMIT
========================= */
function submit() {
  if (!form.name.trim()) return
  if (!form.code.trim()) return

  emit('submit', {
    name: form.name.trim(),
    code: form.code.trim().toUpperCase(),
  })

  open.value = false
}
</script>
