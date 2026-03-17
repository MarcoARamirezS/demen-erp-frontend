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
      <section class="flex-1 overflow-y-auto px-6 py-6 pb-10 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <UiInput v-model="form.partNumber" label="Número de parte *" :error="errors.partNumber" />

          <UiInput
            v-model="form.internalCode"
            label="Código interno"
            :disabled="true"
            placeholder="Se generará automáticamente"
          />

          <UiInput v-model="form.name" label="Nombre *" :error="errors.name" />
          <UiInput v-model="form.brand" label="Marca" :error="errors.brand" />

          <!-- FAMILIA -->
          <div class="space-y-1">
            <UiSelect
              v-model="form.familyId"
              label="Familia *"
              :options="familyOptions"
              :error="errors.familyId"
              placeholder="Selecciona una familia"
            />

            <button
              type="button"
              class="btn btn-xs btn-ghost w-full justify-start"
              @click="openCreateFamily"
            >
              ➕ Crear nueva familia
            </button>
          </div>

          <!-- CATEGORÍA -->
          <div class="space-y-1">
            <UiSelect
              v-model="form.categoryId"
              label="Categoría *"
              :options="categoryOptions"
              :disabled="!form.familyId"
              :error="errors.categoryId"
              placeholder="Selecciona una categoría"
            />

            <button
              type="button"
              class="btn btn-xs btn-ghost w-full justify-start"
              :disabled="!form.familyId"
              @click="openCreateCategory"
            >
              ➕ Crear nueva categoría
            </button>
          </div>

          <UiSelect
            v-model="form.unit"
            label="Unidad *"
            :options="unitOptions"
            :error="errors.unit"
          />

          <UiInput
            v-model="form.description"
            label="Descripción"
            type="textarea"
            class="md:col-span-2"
            :error="errors.description"
          />

          <!-- IMÁGENES -->
          <div class="md:col-span-2">
            <label class="label">
              <span class="label-text font-medium">Imágenes del producto</span>
            </label>

            <input
              :key="fileInputKey"
              type="file"
              multiple
              accept="image/*"
              class="file-input file-input-bordered w-full"
              @change="onSelectImages"
            />

            <!-- EXISTENTES -->
            <div v-if="existingImages.length" class="mt-4">
              <div class="text-xs opacity-70 mb-2">Imágenes actuales</div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div
                  v-for="img in existingImages"
                  :key="img.publicId"
                  class="relative rounded-xl border border-base-300 overflow-hidden"
                >
                  <img :src="img.secureUrl || img.url" class="object-cover h-32 w-full" />

                  <span v-if="img.isMain" class="badge badge-primary absolute top-2 left-2">
                    Principal
                  </span>
                </div>
              </div>
            </div>

            <!-- NUEVAS -->
            <div v-if="previews.length" class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div
                v-for="(img, i) in previews"
                :key="i"
                class="relative rounded-xl border border-base-300 overflow-hidden group"
              >
                <img :src="img" class="object-cover h-32 w-full" />

                <span v-if="i === 0" class="badge badge-primary absolute top-2 left-2">
                  Principal
                </span>

                <button
                  type="button"
                  class="btn btn-xs btn-circle btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
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
        </div>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
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
import { reactive, watch, computed, ref, onMounted } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'
import { useProductsStore } from '~/stores/products.store'
import { useUiStore } from '~/stores/ui.store'

const ui = useUiStore()

type Mode = 'create' | 'edit'

const props = defineProps<{
  modelValue: boolean
  mode: Mode
  model?: any
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const productsStore = useProductsStore()
const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const families = computed(() => familiesStore.items)
const categories = computed(() => categoriesStore.items)

const errors = reactive({
  partNumber: false,
  name: false,
  brand: false,
  description: false,
  unit: false,
  familyId: false,
  categoryId: false,
})

const familyOptions = computed(() => families.value.map(f => ({ label: f.name, value: f.id })))

const categoryOptions = computed(() => categories.value.map(c => ({ label: c.name, value: c.id })))

const unitOptions = [
  { label: 'm', value: 'm' },
  { label: 'pz', value: 'pz' },
  { label: 'kg', value: 'kg' },
  { label: 'lt', value: 'lt' },
]

onMounted(async () => {
  if (!familiesStore.items.length) {
    await familiesStore.fetch()
  }
})

const familyDialogOpen = ref(false)
const categoryDialogOpen = ref(false)

function openCreateFamily() {
  familyDialogOpen.value = true
}

function openCreateCategory() {
  if (!form.familyId) return
  categoryDialogOpen.value = true
}

async function handleFamilyCreated(payload: any) {
  const family = await familiesStore.create(payload)
  await familiesStore.fetch()
  form.familyId = family.id
}

async function handleCategoryCreated(payload: any) {
  const category = await categoriesStore.create({
    ...payload,
    familyId: form.familyId,
  })
  await categoriesStore.fetchByFamily(form.familyId)
  form.categoryId = category.id
}

const form = reactive({
  partNumber: '',
  internalCode: '',
  name: '',
  description: '',
  brand: '',
  unit: 'pz',
  familyId: '',
  categoryId: '',
})

const selectedImages = ref<File[]>([])
const previews = ref<string[]>([])
const saving = ref(false)
const fileInputKey = ref(0)

const existingImages = computed(() => props.model?.images ?? [])

const uploadHint = computed(() => {
  if (!selectedImages.value.length) return ''
  return `Se subirán ${selectedImages.value.length} imagen(es) al guardar.`
})

function onSelectImages(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files) return

  const newFiles = Array.from(files)
  selectedImages.value = [...selectedImages.value, ...newFiles]

  newFiles.forEach(file => previews.value.push(URL.createObjectURL(file)))

  fileInputKey.value++
}

function removeImage(index: number) {
  URL.revokeObjectURL(previews.value[index])
  selectedImages.value.splice(index, 1)
  previews.value.splice(index, 1)
}

async function submit() {
  Object.keys(errors).forEach(k => (errors[k] = false))

  if (!form.partNumber) {
    errors.partNumber = true
    return ui.showToast('warning', 'El número de parte es obligatorio')
  }

  if (!form.name || form.name.length < 2) {
    errors.name = true
    return ui.showToast('warning', 'El nombre debe tener al menos 2 caracteres')
  }

  if (form.brand.length > 120) {
    errors.brand = true
    return ui.showToast('warning', 'La marca no puede exceder 120 caracteres')
  }

  if (form.description.length > 2000) {
    errors.description = true
    return ui.showToast('warning', 'La descripción es demasiado larga')
  }

  if (!form.unit) {
    errors.unit = true
    return ui.showToast('warning', 'Debes seleccionar una unidad')
  }

  if (!form.familyId) {
    errors.familyId = true
    return ui.showToast('warning', 'Debes seleccionar una familia')
  }

  if (!form.categoryId) {
    errors.categoryId = true
    return ui.showToast('warning', 'Debes seleccionar una categoría')
  }

  saving.value = true

  try {
    let saved

    if (props.mode === 'create') {
      const { internalCode, ...payload } = form
      saved = await productsStore.create(payload)
    } else {
      saved = await productsStore.update(props.model.id, { ...form })
    }

    if (selectedImages.value.length) {
      await productsStore.uploadImages(saved.id, selectedImages.value)
    }

    ui.showToast('success', 'Producto guardado correctamente')

    emit('submit')
    open.value = false
  } finally {
    saving.value = false
  }
}
</script>
