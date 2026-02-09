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
  <UiDialog v-model="open" size="lg" hide-header hide-close>
    <!-- =========================
         HEADER (STICKY)
    ========================== -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="font-semibold text-lg">
        {{ mode === 'create' ? 'Nueva dirección' : 'Editar dirección' }}
      </h2>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- =========================
         CONTENT (SCROLL)
    ========================== -->
    <div class="px-6 py-5 overflow-auto" style="max-height: calc(90vh - 160px)">
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
      </form>
    </div>

    <!-- =========================
         FOOTER (STICKY)
    ========================== -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton variant="primary" type="submit" @click="submit"> Guardar </UiButton>
    </div>
  </UiDialog>
</template>
