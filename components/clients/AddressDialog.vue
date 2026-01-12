<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'
import type { ClientAddress, CreateClientAddressDto } from '~/types/client-address'

const props = defineProps<{
  modelValue: boolean
  clientId: string
  model?: ClientAddress | null
  mode: 'create' | 'edit'
  existingAddresses: ClientAddress[]
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const ui = useUiStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const alreadyFiscal = computed(() =>
  props.existingAddresses.some(a => a.esFiscal && a.id !== props.model?.id)
)

const alreadyEnvio = computed(() =>
  props.existingAddresses.some(a => a.esEnvio && a.id !== props.model?.id)
)

const form = ref<CreateClientAddressDto>({
  clientId: props.clientId,
  calle: '',
  ciudad: '',
  estado: '',
  pais: 'México',
  esFiscal: false,
  esEnvio: false,
  activo: true,
})

watch(
  () => props.model,
  v => {
    if (v) {
      form.value = { ...v }
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.calle || !form.value.ciudad || !form.value.estado) {
    ui.showToast('warning', 'Completa los campos obligatorios')
    return
  }

  if (form.value.esFiscal && alreadyFiscal.value) {
    ui.showToast('warning', 'Ya existe una dirección fiscal')
    return
  }

  if (form.value.esEnvio && alreadyEnvio.value) {
    ui.showToast('warning', 'Ya existe una dirección de envío')
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
    :title="mode === 'create' ? 'Nueva dirección' : 'Editar dirección'"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <UiInput v-model="form.calle" label="Calle *" />
      <UiInput v-model="form.ciudad" label="Ciudad *" />
      <UiInput v-model="form.estado" label="Estado *" />
      <UiInput v-model="form.pais" label="País" />

      <div class="flex gap-6 pt-2">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="form.esFiscal" class="checkbox checkbox-primary" />
          <span>Dirección fiscal</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="form.esEnvio" class="checkbox checkbox-success" />
          <span>Dirección de envío</span>
        </label>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t">
        <UiButton variant="ghost" type="button" @click="open = false">Cancelar</UiButton>
        <UiButton variant="primary" type="submit">Guardar</UiButton>
      </div>
    </form>
  </UiDialog>
</template>
