<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'
import type { Supplier, CreateSupplierDto } from '~/types/supplier'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: Supplier | null
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const ui = useUiStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const form = ref<CreateSupplierDto>({
  name: '',
  rfc: '',
  email: '',
  phone: '',
  active: true,
})

watch(
  () => props.model,
  v => {
    form.value = v
      ? {
          name: v.name,
          rfc: v.rfc,
          email: v.email,
          phone: v.phone,
          active: v.active,
        }
      : { name: '', rfc: '', email: '', phone: '', active: true }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.name) {
    ui.showToast('warning', 'El nombre del proveedor es obligatorio')
    return
  }

  emit('submit', form.value)
  open.value = false
}
</script>

<template>
  <UiDialog
    v-model="open"
    size="lg"
    :title="mode === 'create' ? 'Nuevo proveedor' : 'Editar proveedor'"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <UiInput v-model="form.name" label="Nombre / Razón social *" />
      <UiInput v-model="form.rfc" label="RFC" />
      <UiInput v-model="form.email" label="Correo" />
      <UiInput v-model="form.phone" label="Teléfono" />

      <div class="flex justify-end gap-3 border-t pt-4">
        <UiButton variant="ghost" type="button" @click="open = false">Cancelar</UiButton>
        <UiButton variant="primary" type="submit">Guardar</UiButton>
      </div>
    </form>
  </UiDialog>
</template>
