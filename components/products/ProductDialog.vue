<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <!-- HEADER -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="text-lg font-semibold truncate">
        {{ mode === 'create' ? 'Nuevo producto' : 'Editar producto' }}
      </h2>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- CONTENT -->
    <div class="px-6 py-5 overflow-auto" style="max-height: calc(90vh - 160px)">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <UiInput v-model="form.partNumber" label="Número de parte" />
        <UiInput
          v-model="form.internalCode"
          label="Código interno"
          :disabled="true"
          placeholder="Se generará automáticamente"
        />

        <UiInput v-model="form.name" label="Nombre" />
        <UiInput v-model="form.brand" label="Marca" />

        <!-- FAMILIA -->
        <div class="space-y-1">
          <UiSelect v-model="form.familyId" label="Familia">
            <UiOption v-for="f in families" :key="f.id" :value="f.id">
              {{ f.name }}
            </UiOption>
          </UiSelect>

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
          <UiSelect v-model="form.categoryId" label="Categoría" :disabled="!form.familyId">
            <UiOption v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }}
            </UiOption>
          </UiSelect>

          <button
            type="button"
            class="btn btn-xs btn-ghost w-full justify-start"
            :disabled="!form.familyId"
            @click="openCreateCategory"
          >
            ➕ Crear nueva categoría
          </button>
        </div>

        <UiSelect v-model="form.unit" label="Unidad">
          <UiOption value="m">m</UiOption>
          <UiOption value="pz">pz</UiOption>
          <UiOption value="kg">kg</UiOption>
          <UiOption value="lt">lt</UiOption>
        </UiSelect>

        <UiInput
          v-model="form.description"
          label="Descripción"
          type="textarea"
          class="md:col-span-2"
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

          <!-- Imágenes existentes -->
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

          <!-- NUEVAS PREVIEWS -->
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
    </div>

    <!-- FOOTER -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" type="button" :disabled="saving" @click="open = false">
        Cancelar
      </UiButton>

      <UiButton variant="primary" :loading="saving" :disabled="saving" @click="submit">
        Guardar
      </UiButton>
    </div>

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
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, onMounted, ref } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'
import { useProductsStore } from '~/stores/products.store'

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

/* =========================
   STORES
========================= */
const productsStore = useProductsStore()
const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const families = computed(() => familiesStore.items)
const categories = computed(() => categoriesStore.items)

/* =========================
   QUICK CREATE (🔥 FALTABA)
========================= */
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

/* =========================
   FORM
========================= */
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

/* =========================
   IMAGES
========================= */
const selectedImages = ref<File[]>([])
const previews = ref<string[]>([])
const saving = ref(false)
const fileInputKey = ref(0)

/* 🔥 EXISTING IMAGES */
const existingImages = computed(() => {
  const imgs = props.model?.images ?? []
  return Array.isArray(imgs) ? imgs : []
})

/* 🔥 UPLOAD HINT (FALTABA) */
const uploadHint = computed(() => {
  if (!selectedImages.value.length) return ''
  return `Se subirán ${selectedImages.value.length} imagen(es) al guardar.`
})

function onSelectImages(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || !files.length) return

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

function clearSelectedImages() {
  previews.value.forEach(url => URL.revokeObjectURL(url))
  previews.value = []
  selectedImages.value = []
}

/* =========================
   SUBMIT
========================= */
async function submit() {
  if (saving.value) return
  saving.value = true

  try {
    let saved: any

    if (props.mode === 'create') {
      const { internalCode, ...payload } = form
      saved = await productsStore.create(payload)
    } else {
      saved = await productsStore.update(props.model.id, { ...form })
    }

    if (selectedImages.value.length) {
      await productsStore.uploadImages(saved.id, selectedImages.value)
    }

    emit('submit')
    open.value = false
  } finally {
    saving.value = false
  }
}
</script>
