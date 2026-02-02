<template>
  <UiDialog v-model="open" size="xl">
    <template #title>
      {{ mode === 'create' ? 'Nuevo proveedor' : 'Editar proveedor' }}
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UiInput v-model="form.code" label="Código" />
      <UiInput v-model="form.name" label="Nombre comercial" />

      <UiInput v-model="form.legalName" label="Razón social" />
      <UiInput v-model="form.rfc" label="RFC" />

      <UiInput v-model="form.email" label="Email" />
      <UiInput v-model="form.phone" label="Teléfono" />

      <UiInput v-model="form.website" label="Sitio web" />

      <UiInput v-model.number="form.paymentTermsDays" label="Días de crédito" type="number" />

      <UiSelect v-model="form.defaultCurrency" label="Moneda" :options="['MXN', 'USD']" />

      <UiTextarea v-model="form.notes" label="Notas" class="md:col-span-2" />
    </div>

    <template #footer>
      <UiButton variant="ghost" @click="open = false"> Cancelar </UiButton>
      <UiButton variant="primary" @click="submit"> Guardar </UiButton>
    </template>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { Supplier } from '~/types/supplier'

/* =========================
   PROPS
========================= */
const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model: Supplier | null
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
  code: '',
  name: '',
  legalName: '',
  rfc: '',
  email: '',
  phone: '',
  website: '',
  paymentTermsDays: 0,
  defaultCurrency: 'MXN',
  notes: '',
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
