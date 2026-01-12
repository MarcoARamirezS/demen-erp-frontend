<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'
import type { Client, CreateClientDto } from '~/types/client'

const props = defineProps<{
  modelValue: boolean
  model?: Client | null
  mode: 'create' | 'edit'
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const ui = useUiStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const form = ref<CreateClientDto>({
  razonSocial: '',
  nombreComercial: '',
  rfc: '',
  email: '',
  telefono: '',
  activo: true,
})

watch(
  () => props.model,
  v => {
    if (v) {
      form.value = {
        razonSocial: v.razonSocial,
        nombreComercial: v.nombreComercial,
        rfc: v.rfc,
        email: v.email,
        telefono: v.telefono,
        activo: v.activo,
      }
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.razonSocial) {
    ui.showToast('warning', 'La razón social es obligatoria')
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
    :title="mode === 'create' ? 'Nuevo cliente' : 'Editar cliente'"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <UiInput v-model="form.razonSocial" label="Razón social *" />
      <UiInput v-model="form.nombreComercial" label="Nombre comercial" />
      <UiInput v-model="form.rfc" label="RFC" />
      <UiInput v-model="form.email" label="Email" />
      <UiInput v-model="form.telefono" label="Teléfono" />

      <div class="flex justify-end gap-3 pt-4 border-t">
        <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>
        <UiButton variant="primary" type="submit"> Guardar </UiButton>
      </div>
    </form>
  </UiDialog>
</template>
