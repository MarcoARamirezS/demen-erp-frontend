<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <!-- =========================
         HEADER (STICKY)
    ========================== -->
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

    <!-- =========================
         CONTENT (SCROLL)
    ========================== -->
    <div class="px-6 py-5 overflow-auto" style="max-height: calc(90vh - 160px)">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <UiInput v-model="form.sku" label="SKU" />
        <UiInput v-model="form.internalCode" label="Código interno" />

        <UiInput v-model="form.name" label="Nombre" />
        <UiInput v-model="form.brand" label="Marca" />

        <!-- =========================
             FAMILIA + QUICK CREATE
        ========================== -->
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

        <!-- =========================
             CATEGORÍA + QUICK CREATE
        ========================== -->
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
      </div>
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

    <!-- =========================
         QUICK CREATE DIALOGS
    ========================== -->
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

import ProductFamilyDialog from '~/components/product-families/ProductFamilyDialog.vue'
import ProductCategoryDialog from '~/components/product-categories/ProductCategoryDialog.vue'

const props = defineProps({
  modelValue: Boolean,
  mode: String,
  model: Object,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

/* =========================
   STORES
========================= */
const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const families = computed(() => familiesStore.items)
const categories = computed(() => categoriesStore.items)

/* =========================
   FORM
========================= */
const form = reactive({
  sku: '',
  internalCode: '',
  name: '',
  description: '',
  brand: '',
  unit: 'pz',

  familyId: '',
  categoryId: '',
})

/* =========================
   QUICK CREATE STATE
========================= */
const familyDialogOpen = ref(false)
const categoryDialogOpen = ref(false)

/* =========================
   LIFECYCLE
========================= */
onMounted(async () => {
  await familiesStore.fetch()

  if (form.familyId) {
    await categoriesStore.fetchByFamily(form.familyId)
  }
})

watch(
  () => form.familyId,
  async familyId => {
    form.categoryId = ''
    if (familyId) {
      await categoriesStore.fetchByFamily(familyId)
    } else {
      categoriesStore.clear()
    }
  }
)

watch(
  () => props.model,
  v => {
    if (!v) return
    Object.assign(form, v)
    if (v.familyId) {
      categoriesStore.fetchByFamily(v.familyId)
    }
  },
  { immediate: true }
)

/* =========================
   QUICK CREATE HANDLERS (FIX)
========================= */
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

  // ✅ FIX: limpiar categorías antes de asignar familia
  categoriesStore.clear()

  form.familyId = family.id
}

async function handleCategoryCreated(payload: any) {
  // ✅ FIX: forzar relación con la familia actual
  const category = await categoriesStore.create({
    ...payload,
    familyId: form.familyId,
  })

  await categoriesStore.fetchByFamily(form.familyId)
  form.categoryId = category.id
}

/* =========================
   SUBMIT
========================= */
function submit() {
  emit('submit', { ...form })
  open.value = false
}
</script>
