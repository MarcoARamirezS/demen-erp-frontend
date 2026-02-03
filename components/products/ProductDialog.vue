<template>
  <UiDialog v-model="open" size="xl">
    <header class="border-b border-base-300 px-6 py-4">
      <h2 class="text-lg font-semibold">
        {{ mode === 'create' ? 'Nuevo producto' : 'Editar producto' }}
      </h2>
    </header>

    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <UiInput v-model="form.sku" label="SKU" />
      <UiInput v-model="form.internalCode" label="Código interno" />

      <UiInput v-model="form.name" label="Nombre" />
      <UiInput v-model="form.brand" label="Marca" />

      <UiSelect v-model="form.unit" label="Unidad">
        <UiOption value="m">m</UiOption>
        <UiOption value="pz">pz</UiOption>
        <UiOption value="kg">kg</UiOption>
        <UiOption value="lt">lt</UiOption>
      </UiSelect>

      <UiInput v-model="form.category" label="Categoría" />

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
import { reactive, watch, computed } from 'vue'
import type { Product } from '~/types/product'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model: Product | null
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

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

watch(
  () => props.model,
  v => {
    if (v) Object.assign(form, v)
  },
  { immediate: true }
)

function submit() {
  emit('submit', { ...form })
  open.value = false
}
</script>
