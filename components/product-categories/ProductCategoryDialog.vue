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
              {{ mode === 'create' ? 'Nueva categoría' : 'Editar categoría' }}
            </h2>

            <p class="text-xs opacity-60">Gestión de categorías de productos</p>
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

          <UiSelect
            v-model="form.familyId"
            label="Familia"
            placeholder="Seleccionar familia"
            :options="familyOptions"
          />

          <UiInput v-model="form.name" label="Nombre de la categoría" />

          <UiInput v-model="form.code" label="Código" placeholder="Ej: ACCESORIOS" />
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
import { reactive, watch, computed, onMounted } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: any
  familyId?: string
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const familiesStore = useProductFamiliesStore()

const families = computed(() => familiesStore.items)

const familyOptions = computed(() => {
  return families.value.map(f => ({
    label: f.name,
    value: f.id,
  }))
})

const form = reactive({
  name: '',
  code: '',
  familyId: '',
})

onMounted(async () => {
  if (!familiesStore.items.length) {
    await familiesStore.fetch()
  }

  if (props.familyId) {
    form.familyId = props.familyId
  }
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
        familyId: v.familyId ?? props.familyId ?? '',
      })
    } else {
      form.name = ''
      form.code = ''
      form.familyId = props.familyId || ''
    }
  },
  { immediate: true }
)

/* =========================
   SUBMIT
========================= */
function submit() {
  if (!form.name.trim() || !form.familyId) return
  if (!form.code.trim()) return

  emit('submit', {
    name: form.name.trim(),
    code: form.code.trim().toUpperCase(),
    familyId: form.familyId,
  })

  open.value = false
}
</script>
