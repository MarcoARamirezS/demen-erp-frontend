<script setup lang="ts">
import { ref, computed, watch, reactive, nextTick } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import Icon from '~/components/ui/Icon.vue'
import { useUiStore } from '~/stores/ui.store'
import type { ClientAddress, CreateClientAddressDto } from '~/types/client-address'

/* =========================
   PROPS
========================= */

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    clienteId: string
    existingAddresses?: ClientAddress[]
    model?: ClientAddress | null
    mode: 'create' | 'edit'
  }>(),
  {
    existingAddresses: () => [],
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
   FORM
========================= */

function getInitialForm(): CreateClientAddressDto {
  return {
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
  }
}

const form = ref<CreateClientAddressDto>(getInitialForm())

/* =========================
   ERRORS
========================= */

const errors = reactive<Record<string, string>>({})

const fieldLabels: Record<string, string> = {
  clienteId: 'Cliente',
  nombre: 'Nombre de la dirección',
  calle: 'Calle',
  numero: 'Número',
  colonia: 'Colonia',
  ciudad: 'Ciudad',
  estado: 'Estado',
  pais: 'País',
  codigoPostal: 'Código postal',
  contactoNombre: 'Nombre de contacto',
  contactoTelefono: 'Teléfono de contacto',
  contactoEmail: 'Email de contacto',
}

const errorSummary = computed(() =>
  Object.entries(errors)
    .filter(([, message]) => !!message)
    .map(([key, message]) => ({
      key,
      label: fieldLabels[key] || key,
      message,
    }))
)

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function resetForm() {
  form.value = getInitialForm()
  clearErrors()
}

/* =========================
   REGEX
========================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* =========================
   HELPERS
========================= */

function optionalString(value?: string | null) {
  const clean = String(value ?? '').trim()
  return clean ? clean : undefined
}

async function focusFirstErrorField() {
  const firstKey = Object.keys(errors).find(key => errors[key])
  if (!firstKey) return

  await nextTick()

  const wrapper = document.querySelector(`[data-error-field="${firstKey}"]`)
  const target = wrapper?.querySelector('input, textarea, select, button') as HTMLElement | null

  if (wrapper) {
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (target?.focus) {
    target.focus()
  }
}

/* =========================
   WATCH EDIT / CREATE MODE
========================= */

watch(
  () => [props.modelValue, props.model, props.clienteId] as const,
  ([isOpen, model]) => {
    if (!isOpen) return

    clearErrors()

    if (model) {
      form.value = {
        clienteId: props.clienteId,
        nombre: model.nombre || '',
        calle: model.calle || '',
        numero: model.numero || '',
        colonia: model.colonia || '',
        ciudad: model.ciudad || '',
        estado: model.estado || '',
        pais: model.pais || 'México',
        codigoPostal: model.codigoPostal || '',
        contactoNombre: model.contactoNombre || '',
        contactoTelefono: model.contactoTelefono || '',
        contactoEmail: model.contactoEmail || '',
        esPrincipal: model.esPrincipal ?? false,
        activo: model.activo ?? true,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

/* =========================
   SUBMIT
========================= */

async function submit() {
  clearErrors()

  const clienteId = props.clienteId?.trim()
  const nombre = form.value.nombre?.trim()
  const calle = form.value.calle?.trim()
  const numero = form.value.numero?.trim()
  const colonia = form.value.colonia?.trim()
  const ciudad = form.value.ciudad?.trim()
  const estado = form.value.estado?.trim()
  const pais = form.value.pais?.trim() || 'México'
  const codigoPostal = form.value.codigoPostal?.trim()

  const contactoNombre = form.value.contactoNombre?.trim()
  const contactoTelefono = form.value.contactoTelefono?.trim()
  const contactoEmail = form.value.contactoEmail?.trim()

  if (!clienteId || clienteId.length < 10) {
    errors.clienteId = 'El cliente asociado no es válido'
  }

  if (!nombre) {
    errors.nombre = 'El nombre de la dirección es obligatorio'
  } else if (nombre.length < 2) {
    errors.nombre = 'Debe tener al menos 2 caracteres'
  }

  if (!calle) {
    errors.calle = 'La calle es obligatoria'
  }

  if (!ciudad) {
    errors.ciudad = 'La ciudad es obligatoria'
  }

  if (!estado) {
    errors.estado = 'El estado es obligatorio'
  }

  if (contactoEmail && !EMAIL_REGEX.test(contactoEmail)) {
    errors.contactoEmail = 'El correo de contacto es inválido'
  }

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${fieldLabels[key] || key}: ${message}`)
    await focusFirstErrorField()
    return
  }

  emit('submit', {
    clienteId,
    nombre,
    calle,
    numero: optionalString(numero),
    colonia: optionalString(colonia),
    ciudad,
    estado,
    pais,
    codigoPostal: optionalString(codigoPostal),
    contactoNombre: optionalString(contactoNombre),
    contactoTelefono: optionalString(contactoTelefono),
    contactoEmail: optionalString(contactoEmail),
    esPrincipal: form.value.esPrincipal ?? false,
    activo: form.value.activo ?? true,
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
      <section class="flex-1 space-y-6 overflow-y-auto px-6 py-6 pb-10">
        <!-- ALERTA DE VALIDACIÓN -->
        <div
          v-if="errorSummary.length"
          class="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm"
        >
          <div class="flex items-start gap-3">
            <Icon name="alert-triangle" class="mt-0.5 h-5 w-5 text-error" />

            <div class="flex-1">
              <p class="font-semibold text-error">Revisa los siguientes campos:</p>

              <ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/80">
                <li v-for="item in errorSummary" :key="item.key">
                  <span class="font-medium">{{ item.label }}:</span>
                  {{ item.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <form class="space-y-6" @submit.prevent="submit">
          <div data-error-field="nombre">
            <UiInput
              v-model="form.nombre"
              label="Nombre de la dirección *"
              placeholder="Ej: Sucursal Centro, Planta Salamanca, Oficina León"
              :error="errors.nombre"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div data-error-field="calle">
              <UiInput
                v-model="form.calle"
                label="Calle *"
                placeholder="Ej: Av. Insurgentes Sur"
                :error="errors.calle"
              />
            </div>

            <div data-error-field="numero">
              <UiInput v-model="form.numero" label="Número" placeholder="Ej: 125, Int. 4, Lote 8" />
            </div>
          </div>

          <div data-error-field="colonia">
            <UiInput
              v-model="form.colonia"
              label="Colonia"
              placeholder="Ej: Centro, Jardines del Valle, Industrial"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div data-error-field="ciudad">
              <UiInput
                v-model="form.ciudad"
                label="Ciudad *"
                placeholder="Ej: Salamanca"
                :error="errors.ciudad"
              />
            </div>

            <div data-error-field="estado">
              <UiInput
                v-model="form.estado"
                label="Estado *"
                placeholder="Ej: Guanajuato"
                :error="errors.estado"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div data-error-field="pais">
              <UiInput v-model="form.pais" label="País" placeholder="Ej: México" />
            </div>

            <div data-error-field="codigoPostal">
              <UiInput v-model="form.codigoPostal" label="Código postal" placeholder="Ej: 36700" />
            </div>
          </div>

          <div class="rounded-xl border border-base-300 bg-base-100 p-4">
            <label class="flex cursor-pointer items-center gap-3">
              <input
                v-model="form.esPrincipal"
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
              />
              <div>
                <p class="text-sm font-medium">Marcar como dirección principal</p>
                <p class="text-xs opacity-60">
                  Actívala si esta será la dirección principal del cliente.
                </p>
              </div>
            </label>
          </div>

          <div class="space-y-4 border-t border-base-300 pt-4">
            <h3 class="text-sm font-semibold text-base-content/70">Contacto en esta dirección</h3>

            <div data-error-field="contactoNombre">
              <UiInput
                v-model="form.contactoNombre"
                label="Nombre contacto"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div data-error-field="contactoTelefono">
              <UiInput
                v-model="form.contactoTelefono"
                label="Teléfono contacto"
                placeholder="Ej: 4641234567"
              />
            </div>

            <div data-error-field="contactoEmail">
              <UiInput
                v-model="form.contactoEmail"
                label="Email contacto"
                placeholder="Ej: recepcion@sucursal.com"
                :error="errors.contactoEmail"
              />
            </div>
          </div>
        </form>
      </section>

      <!-- =====================================================
           FOOTER
      ====================================================== -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] md:flex-row"
      >
        <UiButton variant="ghost" type="button" class="w-full md:w-auto" @click="open = false">
          Cancelar
        </UiButton>

        <UiButton variant="primary" class="w-full md:w-auto" @click="submit"> Guardar </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>
