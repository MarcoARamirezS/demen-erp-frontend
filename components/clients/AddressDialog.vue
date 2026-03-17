<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'
import type { ClientAddress, CreateClientAddressDto } from '~/types/client-address'

/* =========================
   PROPS
========================= */

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    clienteId: string
    existingAddresses?: ClientAddress[] // ✅ NUEVO
    model?: ClientAddress | null
    mode: 'create' | 'edit'
  }>(),
  {
    existingAddresses: () => [], // ✅ evita undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: CreateClientAddressDto): void
}>()

const ui = useUiStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

/* =========================
   ERRORS
========================= */

const errors = ref({
  nombre: false,
  calle: false,
  ciudad: false,
  estado: false,
  contactoEmail: false,
})

/* =========================
   FORM
========================= */

const form = ref<CreateClientAddressDto>({
  clienteId: props.clienteId,
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
   REGEX
========================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* =========================
   WATCH EDIT MODE
========================= */

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

/* =========================
   SUBMIT
========================= */

function submit() {
  errors.value = {
    nombre: false,
    calle: false,
    ciudad: false,
    estado: false,
    contactoEmail: false,
  }

  const nombre = form.value.nombre?.trim()
  const calle = form.value.calle?.trim()
  const ciudad = form.value.ciudad?.trim()
  const estado = form.value.estado?.trim()
  const email = form.value.contactoEmail?.trim()

  if (!nombre || nombre.length < 2) {
    errors.value.nombre = true
    ui.showToast('warning', 'El nombre de la dirección debe tener al menos 2 caracteres')
    return
  }

  if (!calle) {
    errors.value.calle = true
    ui.showToast('warning', 'La calle es obligatoria')
    return
  }

  if (!ciudad) {
    errors.value.ciudad = true
    ui.showToast('warning', 'La ciudad es obligatoria')
    return
  }

  if (!estado) {
    errors.value.estado = true
    ui.showToast('warning', 'El estado es obligatorio')
    return
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errors.value.contactoEmail = true
    ui.showToast('warning', 'Correo de contacto inválido')
    return
  }

  emit('submit', {
    ...form.value,
    nombre,
    calle,
    ciudad,
    estado,
    contactoEmail: email || undefined,
  })

  open.value = false
}
</script>

<template>
  <UiDialog v-model="open" size="lg" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- =====================================================
           HEADER
      ====================================================== -->

      <header
        class="sticky top-0 z-10 flex flex-col gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Icon name="map-pin" class="h-6 w-6 text-primary" />
          </div>

          <div>
            <h2 class="text-xl font-bold text-primary">
              {{ mode === 'create' ? 'Nueva dirección' : 'Editar dirección' }}
            </h2>

            <p class="text-sm opacity-60">Dirección asociada al cliente</p>
          </div>
        </div>

        <button class="btn btn-circle btn-ghost btn-sm" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- =====================================================
           CONTENT
      ====================================================== -->

      <section class="flex-1 overflow-y-auto px-6 py-6 pb-10 space-y-6">
        <form class="space-y-6" @submit.prevent="submit">
          <UiInput
            v-model="form.nombre"
            label="Nombre de la dirección *"
            placeholder="Sucursal Centro"
            :error="errors.nombre"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiInput v-model="form.calle" label="Calle *" :error="errors.calle" />
            <UiInput v-model="form.numero" label="Número" />
          </div>

          <UiInput v-model="form.colonia" label="Colonia" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiInput v-model="form.ciudad" label="Ciudad *" :error="errors.ciudad" />
            <UiInput v-model="form.estado" label="Estado *" :error="errors.estado" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiInput v-model="form.pais" label="País" />
            <UiInput v-model="form.codigoPostal" label="Código postal" />
          </div>

          <div class="border-t border-base-300 pt-4 space-y-4">
            <h3 class="text-sm font-semibold text-base-content/70">Contacto en esta dirección</h3>

            <UiInput v-model="form.contactoNombre" label="Nombre contacto" />
            <UiInput v-model="form.contactoTelefono" label="Teléfono contacto" />
            <UiInput
              v-model="form.contactoEmail"
              label="Email contacto"
              :error="errors.contactoEmail"
            />
          </div>
        </form>
      </section>

      <!-- =====================================================
           FOOTER
      ====================================================== -->

      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse md:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]"
      >
        <UiButton variant="ghost" type="button" class="w-full md:w-auto" @click="open = false">
          Cancelar
        </UiButton>

        <UiButton variant="primary" class="w-full md:w-auto" @click="submit"> Guardar </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>
