<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- HEADER -->
      <header
        class="sticky top-0 z-10 flex flex-col gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Icon name="box" class="h-6 w-6 text-primary" />
          </div>

          <div>
            <h2 class="text-xl font-bold text-primary">
              {{ mode === 'create' ? 'Nuevo producto' : 'Editar producto' }}
            </h2>
            <p class="text-sm opacity-60">Gestión de productos del sistema</p>
          </div>
        </div>

        <button class="btn btn-circle btn-ghost btn-sm" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- CONTENT -->
      <section class="flex-1 space-y-6 overflow-y-auto px-6 py-6 pb-10">
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

        <!-- DATOS GENERALES -->
        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-base-content/70">Datos generales</h3>

          <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <div data-error-field="partNumber">
              <UiInput
                v-model="form.partNumber"
                label="Número de parte *"
                placeholder="Ej: MOT-001-220V"
                :error="errors.partNumber"
              />
            </div>

            <div data-error-field="internalCode">
              <UiInput
                v-model="form.internalCode"
                label="Código interno"
                :disabled="true"
                placeholder="Se generará automáticamente"
              />
            </div>

            <div data-error-field="name">
              <UiInput
                v-model="form.name"
                label="Nombre *"
                placeholder="Ej: Motor trifásico 2 HP"
                :error="errors.name"
              />
            </div>

            <div data-error-field="brand">
              <UiInput
                v-model="form.brand"
                label="Marca"
                placeholder="Ej: Siemens, ABB, Schneider"
                :error="errors.brand"
              />
            </div>

            <div data-error-field="familyId" class="space-y-1">
              <UiSelect
                v-model="form.familyId"
                label="Familia *"
                :options="familyOptions"
                :error="errors.familyId"
                placeholder="Selecciona primero la familia del producto"
              />

              <p class="text-xs opacity-60">
                Primero selecciona la familia para poder habilitar las categorías.
              </p>

              <button
                type="button"
                class="btn btn-xs btn-ghost w-full justify-start"
                @click="openCreateFamily"
              >
                ➕ Crear nueva familia
              </button>
            </div>

            <div data-error-field="categoryId" class="space-y-1">
              <UiSelect
                :key="form.familyId || 'no-family'"
                v-model="form.categoryId"
                label="Categoría *"
                :options="categoryOptions"
                :disabled="!form.familyId || categoriesLoading"
                :error="errors.categoryId"
                placeholder="Selecciona una categoría de la familia elegida"
              />

              <p class="text-xs opacity-60">
                {{
                  !form.familyId
                    ? 'La categoría depende de la familia seleccionada.'
                    : categoriesLoading
                      ? 'Cargando categorías de la familia seleccionada...'
                      : 'Solo se muestran categorías de la familia elegida.'
                }}
              </p>

              <button
                type="button"
                class="btn btn-xs btn-ghost w-full justify-start"
                :disabled="!form.familyId || categoriesLoading"
                @click="openCreateCategory"
              >
                ➕ Crear nueva categoría
              </button>
            </div>

            <div data-error-field="unit">
              <UiSelect
                v-model="form.unit"
                label="Unidad *"
                :options="unitOptions"
                :error="errors.unit"
                placeholder="Selecciona la unidad de medida"
              />
            </div>

            <div data-error-field="location">
              <UiInput
                v-model="form.location"
                label="Ubicación"
                placeholder="Ej: Rack A-01 / Pasillo 3 / Almacén general"
                :error="errors.location"
              />
            </div>

            <div class="md:col-span-2" data-error-field="description">
              <UiInput
                v-model="form.description"
                label="Descripción"
                type="textarea"
                placeholder="Describe el producto, sus características o especificaciones principales"
                :error="errors.description"
              />
            </div>

            <div class="md:col-span-2" data-error-field="notes">
              <UiInput
                v-model="form.notes"
                label="Notas"
                type="textarea"
                placeholder="Agrega observaciones internas, recomendaciones de uso o datos relevantes"
                :error="errors.notes"
              />
            </div>

            <div class="md:col-span-2" data-error-field="tags">
              <UiInput
                v-model="tagsInput"
                label="Etiquetas"
                placeholder="Ej: cable, industrial, 220v, refacción"
                :error="errors.tags"
              />
              <p class="mt-1 text-xs opacity-60">
                Separa las etiquetas por comas para facilitar búsquedas y filtros.
              </p>
            </div>
          </div>
        </section>

        <!-- INVENTARIO -->
        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-base-content/70">Inventario</h3>

          <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
            <div data-error-field="stockOnHand">
              <UiInput
                v-model="form.stockOnHand"
                type="number"
                label="Stock actual"
                placeholder="Ej: 25"
                :error="errors.stockOnHand"
              />
            </div>

            <div data-error-field="stockMin">
              <UiInput
                v-model="form.stockMin"
                type="number"
                label="Stock mínimo"
                placeholder="Ej: 5"
                :error="errors.stockMin"
              />
            </div>

            <div data-error-field="stockMax">
              <UiInput
                v-model="form.stockMax"
                type="number"
                label="Stock máximo"
                placeholder="Ej: 100"
                :error="errors.stockMax"
              />
            </div>

            <div class="rounded-xl border border-base-300 bg-base-100 p-4">
              <label class="flex cursor-pointer items-center gap-3">
                <input
                  v-model="form.active"
                  type="checkbox"
                  class="checkbox checkbox-primary checkbox-sm"
                />
                <div>
                  <p class="text-sm font-medium">Producto activo</p>
                  <p class="text-xs opacity-60">Disponible para operar en el sistema.</p>
                </div>
              </label>
            </div>
          </div>
        </section>

        <!-- IMÁGENES -->
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-base-content/70">Imágenes del producto</h3>

          <div data-error-field="images">
            <input
              :key="fileInputKey"
              type="file"
              multiple
              accept="image/*"
              class="file-input file-input-bordered w-full"
              @change="onSelectImages"
            />

            <p class="text-xs opacity-60">
              Selecciona una o varias imágenes del producto. La primera imagen nueva se mostrará
              como principal.
            </p>

            <div v-if="existingImages.length" class="mt-4">
              <div class="mb-2 text-xs opacity-70">Imágenes actuales</div>

              <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div
                  v-for="img in existingImages"
                  :key="img.publicId"
                  class="relative overflow-hidden rounded-xl border border-base-300"
                >
                  <img :src="img.secureUrl || img.url" class="h-32 w-full object-cover" />

                  <span v-if="img.isMain" class="badge badge-primary absolute left-2 top-2">
                    Principal
                  </span>
                </div>
              </div>
            </div>

            <div v-if="previews.length" class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div
                v-for="(img, i) in previews"
                :key="i"
                class="group relative overflow-hidden rounded-xl border border-base-300"
              >
                <img :src="img" class="h-32 w-full object-cover" />

                <span v-if="i === 0" class="badge badge-primary absolute left-2 top-2">
                  Principal
                </span>

                <button
                  type="button"
                  class="btn btn-circle btn-error btn-xs absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                  @click="removeImage(i)"
                >
                  ✕
                </button>
              </div>
            </div>

            <div v-if="uploadHint" class="mt-2 text-xs opacity-70">
              {{ uploadHint }}
            </div>
          </div>
        </section>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 sm:flex-row"
      >
        <UiButton variant="ghost" type="button" :disabled="saving" @click="open = false">
          Cancelar
        </UiButton>

        <UiButton variant="primary" :loading="saving" :disabled="saving" @click="submit">
          Guardar
        </UiButton>
      </footer>

      <ClientOnly>
        <ProductFamilyDialog
          v-if="familyDialogOpen"
          v-model="familyDialogOpen"
          mode="create"
          @submit="handleFamilyCreated"
        />

        <ProductCategoryDialog
          v-if="categoryDialogOpen"
          v-model="categoryDialogOpen"
          mode="create"
          :family-id="form.familyId"
          @submit="handleCategoryCreated"
        />
      </ClientOnly>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import UiButton from '~/components/ui/UiButton.vue'
import ProductFamilyDialog from '~/components/product-families/ProductFamilyDialog.vue'
import ProductCategoryDialog from '~/components/product-categories/ProductCategoryDialog.vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'
import { useProductsStore } from '~/stores/products.store'
import { useUiStore } from '~/stores/ui.store'

type Mode = 'create' | 'edit'

type ProductForm = {
  partNumber: string
  internalCode: string
  name: string
  description: string
  brand: string
  unit: string
  notes: string
  familyId: string
  categoryId: string
  active: boolean
  stockOnHand: number | string
  stockMin: number | string
  stockMax: number | string
  location: string
}

const props = defineProps<{
  modelValue: boolean
  mode: Mode
  model?: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit'): void
}>()

const ui = useUiStore()
const productsStore = useProductsStore()
const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const families = computed(() => familiesStore.items)
const categories = computed(() => categoriesStore.items)

const familyOptions = computed(() =>
  families.value.map(f => ({
    label: f.name,
    value: f.id,
  }))
)

const filteredCategories = computed(() => {
  if (!form.familyId) return []

  return categories.value.filter(
    category => String(category.familyId ?? '') === String(form.familyId)
  )
})

const categoryOptions = computed(() =>
  filteredCategories.value.map(category => ({
    label: category.name,
    value: category.id,
  }))
)

const unitOptions = [
  { label: 'm', value: 'm' },
  { label: 'pz', value: 'pz' },
  { label: 'kg', value: 'kg' },
  { label: 'lt', value: 'lt' },
]

const fieldLabels: Record<string, string> = {
  partNumber: 'Número de parte',
  name: 'Nombre',
  description: 'Descripción',
  brand: 'Marca',
  unit: 'Unidad',
  notes: 'Notas',
  tags: 'Etiquetas',
  familyId: 'Familia',
  categoryId: 'Categoría',
  stockOnHand: 'Stock actual',
  stockMin: 'Stock mínimo',
  stockMax: 'Stock máximo',
  location: 'Ubicación',
}

function getDefaultForm(): ProductForm {
  return {
    partNumber: '',
    internalCode: '',
    name: '',
    description: '',
    brand: '',
    unit: 'pz',
    notes: '',
    familyId: '',
    categoryId: '',
    active: true,
    stockOnHand: 0,
    stockMin: 0,
    stockMax: 0,
    location: '',
  }
}

const form = reactive<ProductForm>(getDefaultForm())
const tagsInput = ref('')

const errors = reactive<Record<string, string>>({})

const errorSummary = computed(() =>
  Object.entries(errors)
    .filter(([, message]) => !!message)
    .map(([key, message]) => ({
      key,
      label: fieldLabels[key] || key,
      message,
    }))
)

const familyDialogOpen = ref(false)
const categoryDialogOpen = ref(false)
const hydrating = ref(false)
const categoriesLoading = ref(false)
const categoriesRequestToken = ref(0)

const selectedImages = ref<File[]>([])
const previews = ref<string[]>([])
const saving = ref(false)
const fileInputKey = ref(0)

const existingImages = computed(() => {
  if (!open.value || props.mode !== 'edit') return []
  return props.model?.images ?? []
})

const uploadHint = computed(() => {
  if (!selectedImages.value.length) return ''
  return `Se subirán ${selectedImages.value.length} imagen(es) al guardar.`
})

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function revokePreviews() {
  previews.value.forEach(url => URL.revokeObjectURL(url))
  previews.value = []
}

function resetSelectedImages() {
  revokePreviews()
  selectedImages.value = []
  fileInputKey.value++
}

function buildInternalCode(source: string) {
  return source
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
    .substring(0, 24)
}

function optionalString(value?: string | null) {
  const clean = String(value ?? '').trim()
  return clean ? clean : undefined
}

function parseTags(value: string) {
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
}

function resetFormState() {
  Object.assign(form, getDefaultForm())
  tagsInput.value = ''
  clearErrors()
  resetSelectedImages()
  familyDialogOpen.value = false
  categoryDialogOpen.value = false
}

async function ensureFamiliesLoaded() {
  if (!familiesStore.items.length) {
    await familiesStore.fetch()
  }
}

async function loadCategoriesByFamily(familyId: string) {
  if (!familyId) return

  const requestToken = ++categoriesRequestToken.value
  categoriesLoading.value = true

  try {
    await categoriesStore.fetchByFamily(familyId)
  } finally {
    if (requestToken === categoriesRequestToken.value) {
      categoriesLoading.value = false
    }
  }
}

async function hydrateForm(model?: any) {
  clearErrors()
  resetSelectedImages()
  familyDialogOpen.value = false
  categoryDialogOpen.value = false

  hydrating.value = true

  try {
    if (!model || props.mode !== 'edit') {
      Object.assign(form, getDefaultForm())
      tagsInput.value = ''
      return
    }

    const next = {
      ...getDefaultForm(),
      partNumber: model.partNumber ?? '',
      internalCode: model.internalCode ?? buildInternalCode(model.partNumber ?? model.name ?? ''),
      name: model.name ?? '',
      description: model.description ?? '',
      brand: model.brand ?? '',
      unit: model.unit ?? 'pz',
      notes: model.notes ?? '',
      familyId: model.familyId ?? '',
      categoryId: '',
      active: model.active ?? true,
      stockOnHand: model.stockOnHand ?? 0,
      stockMin: model.stockMin ?? 0,
      stockMax: model.stockMax ?? 0,
      location: model.location ?? '',
    }

    Object.assign(form, next)
    tagsInput.value = Array.isArray(model.tags) ? model.tags.join(', ') : ''

    if (next.familyId) {
      await loadCategoriesByFamily(next.familyId)
    }

    const hydratedCategoryId = String(model.categoryId ?? '')
    form.categoryId = filteredCategories.value.some(category => category.id === hydratedCategoryId)
      ? hydratedCategoryId
      : ''
  } finally {
    hydrating.value = false
  }
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

function openCreateFamily() {
  familyDialogOpen.value = true
}

function openCreateCategory() {
  if (!form.familyId) {
    ui.showToast('warning', 'Primero debes seleccionar una familia')
    return
  }

  categoryDialogOpen.value = true
}

async function handleFamilyCreated(payload: any) {
  const family = await familiesStore.create(payload)
  await familiesStore.fetch()

  const familyId = family?.id || ''

  form.familyId = familyId
  form.categoryId = ''
  await loadCategoriesByFamily(familyId)

  familyDialogOpen.value = false
}

async function handleCategoryCreated(payload: any) {
  const category = await categoriesStore.create({
    ...payload,
    familyId: form.familyId,
  })

  await loadCategoriesByFamily(form.familyId)

  const createdCategoryId = String(category?.id ?? '')
  form.categoryId = filteredCategories.value.some(item => item.id === createdCategoryId)
    ? createdCategoryId
    : ''

  categoryDialogOpen.value = false
}

function onSelectImages(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files) return

  const newFiles = Array.from(files)
  selectedImages.value = [...selectedImages.value, ...newFiles]

  newFiles.forEach(file => {
    previews.value.push(URL.createObjectURL(file))
  })

  fileInputKey.value++
}

function removeImage(index: number) {
  URL.revokeObjectURL(previews.value[index])
  selectedImages.value.splice(index, 1)
  previews.value.splice(index, 1)
}

onMounted(async () => {
  await ensureFamiliesLoaded()
})

onBeforeUnmount(() => {
  revokePreviews()
})

watch(
  () => form.partNumber,
  value => {
    if (props.mode === 'create') {
      form.internalCode = buildInternalCode(value || form.name)
    }
  }
)

watch(
  () => form.name,
  value => {
    if (props.mode === 'create' && !form.partNumber) {
      form.internalCode = buildInternalCode(value)
    }
  }
)

watch(
  () => form.familyId,
  async (newFamilyId, oldFamilyId) => {
    if (hydrating.value) return

    if (!newFamilyId) {
      form.categoryId = ''
      return
    }

    if (oldFamilyId !== newFamilyId) {
      form.categoryId = ''
    }

    await loadCategoriesByFamily(newFamilyId)

    if (
      form.categoryId &&
      !filteredCategories.value.some(category => category.id === form.categoryId)
    ) {
      form.categoryId = ''
    }
  }
)

watch(
  () => props.modelValue,
  async isOpen => {
    if (isOpen) {
      await ensureFamiliesLoaded()
      await hydrateForm(props.mode === 'edit' ? props.model : null)
    } else {
      resetFormState()
    }
  },
  { immediate: true }
)

watch(
  () => props.model,
  async value => {
    if (!props.modelValue || props.mode !== 'edit') return
    await hydrateForm(value)
  },
  { deep: true }
)

async function submit() {
  clearErrors()

  const partNumber = form.partNumber.trim()
  const name = form.name.trim()
  const description = form.description.trim()
  const brand = form.brand.trim()
  const unit = form.unit.trim()
  const notes = form.notes.trim()
  const familyId = form.familyId.trim()
  const categoryId = form.categoryId.trim()
  const location = form.location.trim()
  const tags = parseTags(tagsInput.value)

  const stockOnHand = Number(form.stockOnHand)
  const stockMin = Number(form.stockMin)
  const stockMax = Number(form.stockMax)

  if (!partNumber) {
    errors.partNumber = 'El número de parte es obligatorio'
  } else if (partNumber.length > 80) {
    errors.partNumber = 'No puede exceder 80 caracteres'
  }

  if (!name) {
    errors.name = 'El nombre es obligatorio'
  } else if (name.length < 2) {
    errors.name = 'Debe tener al menos 2 caracteres'
  } else if (name.length > 160) {
    errors.name = 'No puede exceder 160 caracteres'
  }

  if (description.length > 2000) {
    errors.description = 'No puede exceder 2000 caracteres'
  }

  if (brand.length > 120) {
    errors.brand = 'No puede exceder 120 caracteres'
  }

  if (!unit) {
    errors.unit = 'Debes seleccionar una unidad'
  } else if (unit.length > 30) {
    errors.unit = 'No puede exceder 30 caracteres'
  }

  if (notes.length > 2000) {
    errors.notes = 'No puede exceder 2000 caracteres'
  }

  if (!familyId) {
    errors.familyId = 'Debes seleccionar una familia'
  }

  if (!categoryId) {
    errors.categoryId = 'Debes seleccionar una categoría'
  }

  if (Number.isNaN(stockOnHand) || stockOnHand < 0) {
    errors.stockOnHand = 'Debe ser un número mayor o igual a 0'
  }

  if (Number.isNaN(stockMin) || stockMin < 0) {
    errors.stockMin = 'Debe ser un número mayor o igual a 0'
  }

  if (Number.isNaN(stockMax) || stockMax < 0) {
    errors.stockMax = 'Debe ser un número mayor o igual a 0'
  }

  if (location.length > 120) {
    errors.location = 'No puede exceder 120 caracteres'
  }

  if (tags.some(tag => tag.length > 40)) {
    errors.tags = 'Cada etiqueta debe tener máximo 40 caracteres'
  }

  if (categoryId && !filteredCategories.value.some(category => category.id === categoryId)) {
    errors.categoryId = 'La categoría seleccionada no pertenece a la familia elegida'
  }

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${fieldLabels[key] || key}: ${message}`)
    await focusFirstErrorField()
    return
  }

  saving.value = true

  try {
    const payload = {
      partNumber,
      name,
      description: optionalString(description),
      brand: optionalString(brand),
      unit,
      notes: optionalString(notes),
      tags,
      familyId,
      categoryId,
      active: !!form.active,
      stockOnHand,
      stockMin,
      stockMax,
      location: optionalString(location),
    }

    let saved

    if (props.mode === 'create') {
      saved = await productsStore.create(payload)
    } else {
      saved = await productsStore.update(props.model.id, payload)
    }

    const savedId = saved?.id || props.model?.id

    if (selectedImages.value.length && savedId) {
      await productsStore.uploadImages(savedId, selectedImages.value)
    }

    ui.showToast('success', 'Producto guardado correctamente')

    emit('submit')
    open.value = false
  } finally {
    saving.value = false
  }
}
</script>
