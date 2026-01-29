<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import Icon from '~/components/ui/Icon.vue'
import { useUiStore } from '~/stores/ui.store'
import type { Client, CreateClientDto } from '~/types/client'

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

const RFC_REGEX = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})?$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidRFC = (rfc: string) => RFC_REGEX.test(rfc.toUpperCase())
const isValidEmail = (email: string) => EMAIL_REGEX.test(email)
const isValidPhone = (phone: string) => /^\d{10}$/.test(phone)

watch(
  () => props.model,
  v => {
    if (!v) return
    form.value = {
      tipo: v.tipo,
      razonSocial: v.razonSocial,
      nombreComercial: v.nombreComercial ?? '',
      rfc: v.rfc ?? 'XAXX010101000',
      email: v.email ?? '',
      telefono: v.telefono?.replace('+52', '') ?? '',
      activo: v.activo,
    }
  },
  { immediate: true }
)

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
  <UiDialog v-model="open" size="xl" :hide-close="true" class="max-h-[90vh]">
    <!-- HEADER -->
    <header
      class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-base-300 bg-base-200 px-5 py-4"
    >
      <div class="flex items-start gap-4 min-w-0">
        <div class="rounded-full bg-primary/10 p-3 shrink-0">
          <Icon name="users" />
        </div>

        <div class="min-w-0">
          <h2 class="font-semibold text-base truncate">
            {{ mode === 'create' ? 'Nuevo cliente' : 'Editar cliente' }}
          </h2>
          <p class="text-xs opacity-60">Captura los datos principales</p>
        </div>
      </div>

      <button class="btn btn-sm btn-circle btn-ghost" @click="open = false" aria-label="Cerrar">
        <Icon name="close" />
      </button>
    </header>

    <!-- CONTENT -->
    <section class="overflow-y-auto px-5 py-6 space-y-4 max-h-[calc(90vh-160px)]">
      <UiInput v-model="form.razonSocial" label="Razón social *" />
      <UiInput v-model="form.nombreComercial" label="Nombre comercial" />

      <div class="rounded-xl border border-base-300 bg-base-100 p-4 space-y-2">
        <UiInput v-model="form.rfc" label="RFC" placeholder="XAXX010101000" />
        <p class="text-xs opacity-60">RFC genérico permitido para pruebas en México</p>
      </div>

      <UiInput v-model="form.email" label="Email" />

      <div>
        <label class="label text-sm"><span class="label-text">Tipo de cliente</span></label>
        <select v-model="form.tipo" class="select select-bordered w-full">
          <option value="empresa">Empresa</option>
          <option value="persona">Persona física</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="label text-sm"><span class="label-text">País</span></label>
          <select v-model="countryCode" class="select select-bordered w-full h-[42px]">
            <option value="+52">🇲🇽 México (+52)</option>
          </select>
        </div>

        <div class="md:col-span-2">
          <UiInput v-model="form.telefono" label="Teléfono" placeholder="10 dígitos" />
        </div>
      </div>
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
