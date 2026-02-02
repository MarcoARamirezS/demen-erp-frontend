<template>
  <UiDialog v-model="open" size="xl">
    <template #title>
      {{ mode === 'create' ? 'Nuevo producto' : 'Editar producto' }}
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UiInput v-model="form.sku" label="SKU" />
      <UiInput v-model="form.internalCode" label="Código interno" />

      <UiInput v-model="form.name" label="Nombre" />
      <UiInput v-model="form.brand" label="Marca" />

      <UiSelect v-model="form.unit" label="Unidad" :options="['m', 'pz', 'kg', 'lt']" />

      <UiInput v-model="form.category" label="Categoría" />

      <UiTextarea v-model="form.description" label="Descripción" class="md:col-span-2" />
    </div>

    <template #footer>
      <UiButton variant="ghost" @click="open = false"> Cancelar </UiButton>
      <UiButton variant="primary" @click="submit"> Guardar </UiButton>
    </template>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { Product } from '~/types/product'

/* =========================
   PROPS
========================= */
const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model: Product | null
}>()

/* =========================
   EMITS
========================= */
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: any): void
}>()

/* =========================
   v-model PROXY (CLAVE)
========================= */
const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

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
  category: '',
  active: true,
})

/* =========================
   SYNC EDIT MODE
========================= */
watch(
  () => props.model,
  v => {
    if (v) Object.assign(form, v)
  },
  { immediate: true }
)

/* =========================
   SUBMIT
========================= */
function submit() {
  emit('submit', { ...form })
  open.value = false
}
</script>
