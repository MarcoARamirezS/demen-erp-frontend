<template>
  <UiDialog v-model="open" size="sm" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- =====================================================
           HEADER
      ====================================================== -->
      <header
        class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-full bg-primary/10 p-2">
            <Icon name="layers" class="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 class="text-base font-semibold text-primary">
              {{ mode === 'create' ? 'Nueva familia' : 'Editar familia' }}
            </h2>

            <p class="text-xs opacity-60">Gestión de familias de productos</p>
          </div>
        </div>

        <button class="btn btn-circle btn-ghost btn-sm" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- =====================================================
           CONTENT
      ====================================================== -->
      <section class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <!-- DATOS -->
        <div class="space-y-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            Datos generales
          </h3>

          <UiInput v-model="form.name" label="Nombre de la familia" autofocus />

          <UiInput v-model="form.code" label="Código" placeholder="Ej: ELECTRONICA" />
        </div>
      </section>

      <!-- =====================================================
           FOOTER
      ====================================================== -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <UiButton variant="ghost" type="button" class="w-full sm:w-auto" @click="open = false">
          Cancelar
        </UiButton>

        <UiButton variant="primary" class="w-full sm:w-auto" @click="submit"> Guardar </UiButton>
      </footer>
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
   AUTOGENERAR CÓDIGO
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
