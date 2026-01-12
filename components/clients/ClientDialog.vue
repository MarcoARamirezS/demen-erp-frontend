<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'
import type { Client, CreateClientDto, ClientTipo } from '~/types/client'

const props = defineProps<{
  modelValue: boolean
  model?: Client | null
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: CreateClientDto): void
}>()

const ui = useUiStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

/* =========================
   FORM
========================= */
const form = ref<CreateClientDto>({
  tipo: 'empresa',
  razonSocial: '',
  nombreComercial: '',
  rfc: 'XAXX010101000',
  email: '',
  telefono: '',
  activo: true,
})

const countryCode = ref('+52')

/* =========================
   VALIDATIONS
========================= */
const RFC_REGEX = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})?$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidRFC(rfc: string) {
  return RFC_REGEX.test(rfc.toUpperCase())
}

function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email)
}

function isValidPhone(phone: string) {
  return /^\d{10}$/.test(phone)
}

/* =========================
   WATCH EDIT MODE
========================= */
watch(
  () => props.model,
  v => {
    if (v) {
      form.value = {
        tipo: v.tipo,
        razonSocial: v.razonSocial,
        nombreComercial: v.nombreComercial ?? '',
        rfc: v.rfc ?? 'XAXX010101000',
        email: v.email ?? '',
        telefono: v.telefono?.replace('+52', '') ?? '',
        activo: v.activo,
      }
    }
  },
  { immediate: true }
)

/* =========================
   SUBMIT
========================= */
function submit() {
  if (!form.value.razonSocial) {
    ui.showToast('warning', 'La razón social es obligatoria')
    return
  }

  if (form.value.rfc && !isValidRFC(form.value.rfc)) {
    ui.showToast('warning', 'RFC inválido')
    return
  }

  if (form.value.email && !isValidEmail(form.value.email)) {
    ui.showToast('warning', 'Correo electrónico inválido')
    return
  }

  if (form.value.telefono && !isValidPhone(form.value.telefono)) {
    ui.showToast('warning', 'El teléfono debe tener 10 dígitos')
    return
  }

  emit('submit', {
    ...form.value,
    rfc: form.value.rfc.toUpperCase(),
    telefono: form.value.telefono ? `${countryCode.value}${form.value.telefono}` : '',
  })

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
      <!-- =========================
           DATOS GENERALES
      ========================== -->
      <UiInput v-model="form.razonSocial" label="Razón social *" />

      <UiInput v-model="form.nombreComercial" label="Nombre comercial" />

      <UiInput v-model="form.rfc" label="RFC" placeholder="XAXX010101000" />
      <p class="text-xs text-base-content/50">RFC genérico permitido para pruebas en México</p>

      <UiInput v-model="form.email" label="Email" />

      <!-- TIPO -->
      <div>
        <label class="label text-sm">
          <span class="label-text">Tipo de cliente</span>
        </label>

        <select v-model="form.tipo" class="select select-bordered w-full">
          <option value="empresa">Empresa</option>
          <option value="persona">Persona física</option>
        </select>
      </div>

      <!-- =========================
           TELÉFONO
      ========================== -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <!-- País -->
        <div>
          <label class="label text-sm">
            <span class="label-text">País</span>
          </label>

          <select v-model="countryCode" class="select select-bordered w-full h-[42px]">
            <option value="+52">🇲🇽 México (+52)</option>
          </select>
        </div>

        <!-- Teléfono -->
        <div class="md:col-span-2">
          <UiInput v-model="form.telefono" label="Teléfono" placeholder="10 dígitos" />
        </div>
      </div>

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
