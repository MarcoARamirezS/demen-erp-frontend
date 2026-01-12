<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'
import type { ClientAddress, CreateClientAddressDto } from '~/types/client-address'

const props = defineProps<{
  modelValue: boolean
  clienteId: string
  model?: ClientAddress | null
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: CreateClientAddressDto): void
}>()

const ui = useUiStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const form = ref<CreateClientAddressDto>({
  clienteId: props.clienteId,
  nombre: '',
  calle: '',
  ciudad: '',
  estado: '',
  pais: 'México',
  activo: true,
})

watch(
  () => props.model,
  v => {
    if (v) {
      form.value = {
        clienteId: props.clienteId,
        nombre: v.nombre,
        calle: v.calle,
        numero: v.numero,
        colonia: v.colonia,
        ciudad: v.ciudad,
        estado: v.estado,
        pais: v.pais,
        codigoPostal: v.codigoPostal,
        contactoNombre: v.contactoNombre,
        contactoTelefono: v.contactoTelefono,
        contactoEmail: v.contactoEmail,
        esPrincipal: v.esPrincipal,
        activo: v.activo,
      }
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.nombre || !form.value.calle || !form.value.ciudad || !form.value.estado) {
    ui.showToast('warning', 'Completa los campos obligatorios')
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
      <UiInput
        v-model="form.nombre"
        label="Nombre de la dirección *"
        placeholder="Sucursal Centro"
      />

      <UiInput v-model="form.calle" label="Calle *" />
      <UiInput v-model="form.ciudad" label="Ciudad *" />
      <UiInput v-model="form.estado" label="Estado *" />
      <UiInput v-model="form.pais" label="País" />

      <div class="flex justify-end gap-3 pt-4 border-t">
        <UiButton variant="ghost" type="button" @click="open = false">Cancelar</UiButton>
        <UiButton variant="primary" type="submit">Guardar</UiButton>
      </div>
    </form>
  </UiDialog>
</template>
