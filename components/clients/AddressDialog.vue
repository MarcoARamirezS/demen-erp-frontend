<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'
import type { CreateClientAddressDto, ClientAddress } from '~/types/client-address'

/* =========================
   PROPS (🔥 FIX)
========================= */
const props = defineProps<{
  modelValue: boolean
  clientId: string
  mode: 'create' | 'edit'
  model?: ClientAddress | null
  existingAddresses?: ClientAddress[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: CreateClientAddressDto): void
}>()

const ui = useUiStore()

/* =========================
   DIALOG STATE
========================= */
const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

/* =========================
   FORM STATE
========================= */
const form = ref<CreateClientAddressDto>({
  clienteId: props.clientId,
  nombre: '',
  calle: '',
  numero: '',
  colonia: '',
  ciudad: '',
  estado: '',
  pais: 'México',
  codigoPostal: '',
  contactoNombre: '',
  contactoTelefono: '',
  contactoEmail: '',
  esPrincipal: false,
  activo: true,
})

/* =========================
   EDIT MODE LOAD
========================= */
watch(
  () => props.model,
  v => {
    if (!v) return

    form.value = {
      clienteId: props.clientId,
      nombre: v.nombre ?? '',
      calle: v.calle ?? '',
      numero: v.numero ?? '',
      colonia: v.colonia ?? '',
      ciudad: v.ciudad ?? '',
      estado: v.estado ?? '',
      pais: v.pais ?? 'México',
      codigoPostal: v.codigoPostal ?? '',
      contactoNombre: v.contactoNombre ?? '',
      contactoTelefono: v.contactoTelefono ?? '',
      contactoEmail: v.contactoEmail ?? '',
      esPrincipal: v.esPrincipal ?? false,
      activo: v.activo ?? true,
    }
  },
  { immediate: true }
)

/* =========================
   SUBMIT
========================= */
function submit() {
  if (!form.value.nombre || !form.value.calle || !form.value.ciudad || !form.value.estado) {
    ui.showToast('warning', 'Completa los campos obligatorios')
    return
  }

  emit('submit', { ...form.value })
  open.value = false
}
</script>

<template>
  <UiDialog
    v-model="open"
    size="lg"
    :title="mode === 'create' ? 'Nueva dirección' : 'Editar dirección'"
  >
    <form class="space-y-6" @submit.prevent="submit">
      <!-- =========================
           NOMBRE
      ========================== -->
      <UiInput
        v-model="form.nombre"
        label="Nombre de la dirección *"
        placeholder="Sucursal Centro"
      />

      <!-- =========================
           DIRECCIÓN FÍSICA
      ========================== -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-3">
          <UiInput v-model="form.calle" label="Calle *" />
        </div>

        <div>
          <UiInput v-model="form.numero" label="Número" />
        </div>
      </div>

      <UiInput v-model="form.colonia" label="Colonia" />

      <!-- =========================
           UBICACIÓN
      ========================== -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UiInput v-model="form.ciudad" label="Ciudad *" />
        <UiInput v-model="form.estado" label="Estado *" />
        <UiInput v-model="form.codigoPostal" label="Código Postal" />
      </div>

      <!-- =========================
           PAÍS
      ========================== -->
      <UiInput v-model="form.pais" label="País" />

      <!-- =========================
           ACTIONS
      ========================== -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

        <UiButton variant="primary" type="submit"> Guardar </UiButton>
      </div>
    </form>
  </UiDialog>
</template>
