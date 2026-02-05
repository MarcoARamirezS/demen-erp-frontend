<template>
  <UiDialog v-model="open" size="xl">
    <header class="border-b border-base-300 px-6 py-4">
      <h2 class="text-lg font-semibold">
        {{ mode === 'create' ? 'Nuevo producto' : 'Editar producto' }}
      </h2>
    </header>

    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      <UiInput v-model="form.sku" label="SKU" />
      <UiInput v-model="form.internalCode" label="Código interno" />

      <UiInput v-model="form.name" label="Nombre" />
      <UiInput v-model="form.brand" label="Marca" />

      <!-- 🔹 NUEVO: FAMILIA -->
      <UiSelect v-model="form.familyId" label="Familia">
        <UiOption v-for="f in families" :key="f.id" :value="f.id">
          {{ f.name }}
        </UiOption>
      </UiSelect>

      <!-- 🔹 NUEVO: CATEGORÍA DEPENDIENTE -->
      <UiSelect v-model="form.categoryId" label="Categoría" :disabled="!form.familyId">
        <UiOption v-for="c in categories" :key="c.id" :value="c.id">
          {{ c.name }}
        </UiOption>
      </UiSelect>

      <UiSelect v-model="form.unit" label="Unidad">
        <UiOption value="m">m</UiOption>
        <UiOption value="pz">pz</UiOption>
        <UiOption value="kg">kg</UiOption>
        <UiOption value="lt">lt</UiOption>
      </UiSelect>

      <!-- 🔹 EXISTENTE (lo dejamos) -->
      <UiInput v-model="form.category" label="Categoría (texto)" />

      <UiInput
        v-model="form.description"
        label="Descripción"
        type="textarea"
        class="md:col-span-2"
      />
    </div>

    <footer class="border-t border-base-300 px-6 py-4 flex justify-end gap-2">
      <UiButton variant="ghost" @click="open = false">Cancelar</UiButton>
      <UiButton variant="primary" @click="submit">Guardar</UiButton>
    </footer>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, onMounted } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'

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

const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()

const families = computed(() => familiesStore.items)
const categories = computed(() => categoriesStore.items)

const form = reactive({
  sku: '',
  internalCode: '',
  name: '',
  description: '',
  brand: '',
  unit: 'pz',

  // 🔹 NUEVO
  familyId: '',
  categoryId: '',

  // 🔹 EXISTENTE
  category: '',

  active: true,
})

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

function submit() {
  emit('submit', { ...form })
  open.value = false
}
</script>
