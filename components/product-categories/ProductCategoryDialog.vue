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
        <!-- ALERTA DE VALIDACIÓN -->
        <div
          v-if="errorSummary.length"
          class="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm"
        >
          <div class="flex items-start gap-3">
            <Icon name="alert-triangle" class="mt-0.5 h-5 w-5 text-error" />

            <div class="flex-1">
              <p class="font-semibold text-error">Revisa los siguientes campos:</p>

              <ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/80">
                <li v-for="item in errorSummary" :key="item.key">
                  <span class="font-medium">{{ item.label }}:</span>
                  {{ item.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- DATOS -->
        <form class="space-y-4" @submit.prevent="submit">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            Datos generales
          </h3>

          <div data-error-field="familyId">
            <UiSelect
              v-model="form.familyId"
              label="Familia *"
              placeholder="Selecciona la familia a la que pertenecerá esta categoría"
              :options="familyOptions"
              :error="errors.familyId"
            />
            <p class="mt-1 text-xs opacity-60">
              Primero elige la familia principal para relacionar correctamente la categoría.
            </p>
          </div>

          <div data-error-field="name">
            <UiInput
              v-model="form.name"
              label="Nombre de la categoría *"
              placeholder="Ej: Accesorios, Refacciones, Herramientas"
              :error="errors.name"
            />
          </div>

          <div data-error-field="code">
            <UiInput
              v-model="form.code"
              label="Código *"
              placeholder="Ej: ACCESORIOS"
              :error="errors.code"
            />

            <p class="mt-1 text-xs opacity-60">
              En modo creación se genera automáticamente a partir del nombre, pero puedes ajustarlo
              si lo necesitas.
            </p>
          </div>
        </form>
      </section>

      <!-- =====================================================
           FOOTER
      ====================================================== -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 sm:flex-row"
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
import { reactive, watch, computed, onMounted, nextTick } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useUiStore } from '~/stores/ui.store'

type ProductCategoryForm = {
  name: string
  code: string
  familyId: string
}

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: any
  familyId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (
    e: 'submit',
    payload: {
      name: string
      code: string
      familyId: string
      activo?: boolean
    }
  ): void
}>()

const ui = useUiStore()
const familiesStore = useProductFamiliesStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const families = computed(() => familiesStore.items)

const familyOptions = computed(() =>
  families.value.map(f => ({
    label: f.name,
    value: f.id,
  }))
)

const form = reactive<ProductCategoryForm>({
  name: '',
  code: '',
  familyId: '',
})

const errors = reactive<Record<string, string>>({})

const fieldLabels: Record<string, string> = {
  familyId: 'Familia',
  name: 'Nombre de la categoría',
  code: 'Código',
}

const errorSummary = computed(() =>
  Object.entries(errors)
    .filter(([, message]) => !!message)
    .map(([key, message]) => ({
      key,
      label: fieldLabels[key] || key,
      message,
    }))
)

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function resetForm() {
  form.name = ''
  form.code = ''
  form.familyId = props.familyId || ''
  clearErrors()
}

function hydrateForm() {
  clearErrors()

  if (props.model) {
    form.name = props.model.name ?? ''
    form.code = props.model.code ?? ''
    form.familyId = props.model.familyId ?? props.familyId ?? ''
    return
  }

  resetForm()
}

async function focusFirstErrorField() {
  const firstKey = Object.keys(errors).find(key => errors[key])
  if (!firstKey) return

  await nextTick()

  const wrapper = document.querySelector(`[data-error-field="${firstKey}"]`)
  const target = wrapper?.querySelector('input, textarea, select, button') as HTMLElement | null

  if (wrapper) {
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (target?.focus) {
    target.focus()
  }
}

async function ensureFamiliesLoaded() {
  if (!familiesStore.items.length) {
    await familiesStore.fetch()
  }
}

onMounted(async () => {
  await ensureFamiliesLoaded()

  if (props.familyId && !form.familyId) {
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
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_')
          .replace(/[^A-Z0-9_]/g, '')
          .substring(0, 20) || ''
    }
  }
)

/* =========================
   OPEN / CLOSE
========================= */
watch(
  () => props.modelValue,
  async isOpen => {
    if (isOpen) {
      await ensureFamiliesLoaded()
      hydrateForm()
    } else {
      clearErrors()
    }
  },
  { immediate: true }
)

/* =========================
   EDIT MODE / FAMILY CHANGE
========================= */
watch(
  () => [props.model, props.familyId] as const,
  ([model, familyId]) => {
    if (!props.modelValue) return

    if (model) {
      hydrateForm()
      return
    }

    form.familyId = familyId || ''
  },
  { immediate: false }
)

/* =========================
   SUBMIT
========================= */
async function submit() {
  clearErrors()

  const familyId = form.familyId.trim()
  const name = form.name.trim()
  const code = form.code.trim().toUpperCase()

  if (!familyId) {
    errors.familyId = 'Debes seleccionar una familia'
  }

  if (!name) {
    errors.name = 'El nombre de la categoría es obligatorio'
  } else if (name.length < 2) {
    errors.name = 'Debe tener al menos 2 caracteres'
  }

  if (!code) {
    errors.code = 'El código es obligatorio'
  } else if (code.length < 2) {
    errors.code = 'Debe tener al menos 2 caracteres'
  }

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${fieldLabels[key] || key}: ${message}`)
    await focusFirstErrorField()
    return
  }

  emit('submit', {
    name,
    code,
    familyId,
    activo: props.model?.activo ?? true,
  })

  open.value = false
}
</script>
