<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import Icon from '~/components/ui/Icon.vue'
import { useUiStore } from '~/stores/ui.store'
import type { CreateClientAddressDto, ClientAddress } from '~/types/client-address'

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

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

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

watch(
  () => props.model,
  v => {
    if (!v) {
      form.value = { ...form.value, clienteId: props.clientId }
      return
    }
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
  <UiDialog v-model="open" size="xl" :hide-close="true" class="max-h-[90vh]">
    <!-- HEADER -->
    <header
      class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-base-300 bg-base-200 px-5 py-4"
    >
      <div class="flex items-start gap-4 min-w-0">
        <div class="rounded-full bg-primary/10 p-3 shrink-0">
          <Icon name="map-pin" />
        </div>

        <div class="min-w-0">
          <h2 class="font-semibold text-base truncate">
            {{ mode === 'create' ? 'Nueva dirección' : 'Editar dirección' }}
          </h2>
          <p class="text-xs opacity-60">Datos de ubicación y contacto</p>
        </div>
      </div>

      <button class="btn btn-sm btn-circle btn-ghost" @click="open = false" aria-label="Cerrar">
        <Icon name="close" />
      </button>
    </header>

    <!-- CONTENT -->
    <section class="overflow-y-auto px-5 py-6 space-y-6 max-h-[calc(90vh-160px)]">
      <UiInput
        v-model="form.nombre"
        label="Nombre de la dirección *"
        placeholder="Sucursal Centro"
      />

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-3">
          <UiInput v-model="form.calle" label="Calle *" />
        </div>
        <div>
          <UiInput v-model="form.numero" label="Número" />
        </div>
      </div>

      <UiInput v-model="form.colonia" label="Colonia" />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UiInput v-model="form.ciudad" label="Ciudad *" />
        <UiInput v-model="form.estado" label="Estado *" />
        <UiInput v-model="form.codigoPostal" label="Código Postal" />
      </div>

      <UiInput v-model="form.pais" label="País" />
    </section>

    <!-- FOOTER -->
    <footer
      class="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-base-300 bg-base-200 px-5 py-4"
    >
      <UiButton variant="outline" type="button" @click="open = false">Cancelar</UiButton>
      <UiButton variant="primary" type="button" @click="submit">Guardar</UiButton>
    </footer>
  </UiDialog>
</template>
