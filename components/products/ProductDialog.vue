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
            type="file"
            multiple
            accept="image/*"
            class="file-input file-input-bordered w-full"
            @change="onSelectImages"
          />

          <!-- (Opcional) imágenes ya guardadas del producto -->
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

          <!-- previews de nuevas imágenes seleccionadas -->
          <div v-if="previews.length" class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div
              v-for="(img, i) in previews"
              :key="i"
              class="relative rounded-xl border border-base-300 overflow-hidden"
            >
              <img :src="img" class="object-cover h-32 w-full" />
              <span v-if="i === 0" class="badge badge-primary absolute top-2 left-2">
                Principal
              </span>
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

    <!-- QUICK CREATE -->
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
import { useProductsStore } from '~/stores/products.store' // <-- AJUSTA si tu store se llama distinto

import ProductFamilyDialog from '~/components/product-families/ProductFamilyDialog.vue'
import ProductCategoryDialog from '~/components/product-categories/ProductCategoryDialog.vue'

type Mode = 'create' | 'edit'

type ProductImage = {
  publicId: string
  url: string
  secureUrl?: string
  width?: number
  height?: number
  format?: string
  bytes?: number
  isMain?: boolean
  order?: number
}

const props = defineProps<{
  modelValue: boolean
  mode: Mode
  model?: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', saved?: any): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

/* =========================
   API + STORES
========================= */
const productsStore = useProductsStore()
const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const families = computed(() => familiesStore.items)
const categories = computed(() => categoriesStore.items)

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
   IMAGES (NEW SELECTION)
========================= */
const selectedImages = ref<File[]>([])
const previews = ref<string[]>([])
const saving = ref(false)

const existingImages = computed<ProductImage[]>(() => {
  const imgs = (props.model?.images ?? []) as ProductImage[]
  return Array.isArray(imgs) ? imgs : []
})

const uploadHint = computed(() => {
  if (!selectedImages.value.length) return ''
  return `Se subirán ${selectedImages.value.length} imagen(es) al guardar.`
})

function onSelectImages(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  // limpiar previews anteriores (evitar leaks)
  previews.value.forEach(url => URL.revokeObjectURL(url))

  selectedImages.value = Array.from(files)
  previews.value = selectedImages.value.map(f => URL.createObjectURL(f))
}

/* =========================
   QUICK CREATE
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

  categoriesStore.clear()
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
   LIFECYCLE
========================= */
onMounted(async () => {
  await familiesStore.fetch()
  if (form.familyId) await categoriesStore.fetchByFamily(form.familyId)
})

watch(
  () => form.familyId,
  async familyId => {
    form.categoryId = ''
    if (familyId) await categoriesStore.fetchByFamily(familyId)
    else categoriesStore.clear()
  }
)

watch(
  () => props.model,
  async v => {
    if (!v) return

    // 1️⃣ Asignar primero campos simples
    form.partNumber = v.partNumber ?? ''
    form.internalCode = v.internalCode ?? ''
    form.name = v.name ?? ''
    form.description = v.description ?? ''
    form.brand = v.brand ?? ''
    form.unit = v.unit ?? 'pz'
    form.familyId = v.familyId ?? ''

    // 2️⃣ Cargar categorías si existe familia
    if (v.familyId) {
      await categoriesStore.fetchByFamily(v.familyId)
    } else {
      categoriesStore.clear()
    }

    // 3️⃣ Ahora sí asignar categoría (cuando ya existen opciones)
    form.categoryId = v.categoryId ?? ''

    clearSelectedImages()
  },
  { immediate: true }
)

watch(
  () => open.value,
  v => {
    // al cerrar, limpiar selección y previews
    if (!v) clearSelectedImages()
  }
)

function clearSelectedImages() {
  previews.value.forEach(url => URL.revokeObjectURL(url))
  previews.value = []
  selectedImages.value = []
}

/* =========================
   SUBMIT (ONE SINGLE VERSION)
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

    // 🔥 Subir imágenes si existen
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
