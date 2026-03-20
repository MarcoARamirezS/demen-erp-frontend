<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <header
        class="sticky top-0 z-10 flex flex-col gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Icon name="users" class="h-6 w-6 text-primary" />
          </div>

          <div>
            <h2 class="text-xl font-bold text-primary">
              {{ mode === 'create' ? 'Nuevo cliente' : 'Editar cliente' }}
            </h2>

            <p class="text-sm opacity-60">Gestión de clientes del sistema</p>
          </div>
        </div>

        <button class="btn btn-circle btn-ghost btn-sm" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <section class="flex-1 space-y-8 overflow-y-auto px-6 py-6 pb-10">
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

        <form class="space-y-8" @submit.prevent="submit">
          <section class="space-y-4">
            <h3 class="text-sm font-semibold text-base-content/70">Datos generales</h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div data-error-field="tipo">
                <label class="label text-sm">
                  <span class="label-text">Tipo de cliente *</span>
                </label>

                <select
                  v-model="form.tipo"
                  class="select w-full"
                  :class="errors.tipo ? 'select-error' : 'select-bordered'"
                >
                  <option value="empresa">Empresa</option>
                  <option value="persona">Persona</option>
                </select>

                <p class="mt-1 text-xs opacity-60">
                  Selecciona si el cliente es una empresa o una persona física.
                </p>

                <p v-if="errors.tipo" class="mt-1 text-xs text-error">
                  {{ errors.tipo }}
                </p>
              </div>

              <div data-error-field="razonSocial">
                <UiInput
                  v-model="form.razonSocial"
                  label="Razón social *"
                  placeholder="Ej: Comercializadora del Bajío S.A. de C.V."
                  :error="errors.razonSocial"
                />
              </div>

              <div data-error-field="nombreComercial">
                <UiInput
                  v-model="form.nombreComercial"
                  label="Nombre comercial *"
                  placeholder="Ej: Comercializadora del Bajío"
                  :error="errors.nombreComercial"
                />
              </div>

              <div data-error-field="rfc">
                <UiInput
                  v-model="form.rfc"
                  label="RFC"
                  placeholder="Ej: ABC123456T89"
                  :error="errors.rfc"
                />
              </div>

              <div data-error-field="email">
                <UiInput
                  v-model="form.email"
                  label="Email"
                  placeholder="Ej: compras@empresa.com"
                  :error="errors.email"
                />
              </div>

              <div data-error-field="telefono">
                <UiInput
                  v-model="form.telefono"
                  label="Teléfono"
                  placeholder="Ej: 4641234567"
                  :error="errors.telefono"
                />
              </div>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-base-300 bg-base-200/40 p-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 class="text-sm font-semibold">Usuarios de contacto</h3>
                <p class="mt-1 text-xs opacity-60">
                  Agrega uno o varios usuarios relacionados con este cliente.
                </p>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-primary"
                :disabled="form.usuarios.length >= MAX_USUARIOS"
                @click="addUsuario"
              >
                <Icon name="plus" class="h-4 w-4" />
                <span>Agregar usuario</span>
              </button>
            </div>

            <p class="text-xs opacity-60">
              {{ form.usuarios.length }} / {{ MAX_USUARIOS }} usuarios capturados
            </p>

            <div
              v-if="!form.usuarios.length"
              class="rounded-2xl border border-dashed border-base-300 bg-base-100 p-5 text-sm opacity-70"
            >
              Aún no hay usuarios capturados para este cliente.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(usuario, index) in form.usuarios"
                :key="usuario.localId"
                class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
              >
                <div class="mb-4 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="rounded-full bg-primary/10 p-2">
                      <Icon name="users" class="h-4 w-4 text-primary" />
                    </div>

                    <div>
                      <p class="font-semibold">Usuario {{ index + 1 }}</p>
                      <p class="text-xs opacity-60">Contacto del cliente</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="btn btn-circle btn-sm btn-ghost text-error"
                    @click="removeUsuario(index)"
                  >
                    <Icon name="x" />
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div :data-error-field="`usuarios.${index}.nombre`">
                    <UiInput
                      v-model="usuario.nombre"
                      label="Nombre *"
                      placeholder="Ej: Juan Pérez"
                      :error="errors[`usuarios.${index}.nombre`]"
                    />
                  </div>

                  <div :data-error-field="`usuarios.${index}.puesto`">
                    <UiInput
                      v-model="usuario.puesto"
                      label="Puesto"
                      placeholder="Ej: Jefe de compras"
                      :error="errors[`usuarios.${index}.puesto`]"
                    />
                  </div>

                  <div :data-error-field="`usuarios.${index}.email`">
                    <UiInput
                      v-model="usuario.email"
                      label="Email"
                      placeholder="Ej: juan.perez@empresa.com"
                      :error="errors[`usuarios.${index}.email`]"
                    />
                  </div>

                  <div :data-error-field="`usuarios.${index}.telefono`">
                    <UiInput
                      v-model="usuario.telefono"
                      label="Teléfono"
                      placeholder="Ej: 4641234567"
                      :error="errors[`usuarios.${index}.telefono`]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-base-300 bg-base-200/40 p-5">
            <h3 class="text-sm font-semibold">Información financiera</h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div data-error-field="diasCredito">
                <UiInput
                  v-model="form.diasCredito"
                  label="Días de crédito"
                  type="number"
                  placeholder="Ej: 30"
                  :error="errors.diasCredito"
                />
              </div>

              <div data-error-field="limiteCredito">
                <UiInput
                  v-model="form.limiteCredito"
                  label="Límite de crédito"
                  type="number"
                  placeholder="Ej: 50000"
                  :error="errors.limiteCredito"
                />
              </div>

              <div data-error-field="condicionPago">
                <label class="label text-sm">
                  <span class="label-text">Condición de pago</span>
                </label>

                <select
                  v-model="form.condicionPago"
                  class="select w-full"
                  :class="errors.condicionPago ? 'select-error' : 'select-bordered'"
                >
                  <option value="0">Contado</option>
                  <option value="7">7 días</option>
                  <option value="15">15 días</option>
                  <option value="30">30 días</option>
                  <option value="45">45 días</option>
                  <option value="60">60 días</option>
                  <option value="90">90 días</option>
                </select>

                <p class="mt-1 text-xs opacity-60">
                  Selecciona el plazo habitual acordado con el cliente.
                </p>

                <p v-if="errors.condicionPago" class="mt-1 text-xs text-error">
                  {{ errors.condicionPago }}
                </p>
              </div>
            </div>
          </section>

          <section class="space-y-4">
            <h3 class="text-sm font-semibold text-base-content/70">Cumplimiento</h3>

            <div class="flex flex-col gap-4 md:flex-row">
              <UiToggle v-model="form.aplicaRepse" label="Aplica REPSE" />
              <UiToggle
                v-model="form.aplicaPortalFacturacion"
                label="Aplica portal de facturación"
              />
            </div>
          </section>

          <section class="space-y-4">
            <h3 class="text-sm font-semibold text-base-content/70">Información fiscal</h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div data-error-field="clasificacionFiscal">
                <label class="label text-sm">
                  <span class="label-text">Clasificación fiscal</span>
                </label>

                <select
                  v-model="form.clasificacionFiscal"
                  class="select w-full"
                  :class="errors.clasificacionFiscal ? 'select-error' : 'select-bordered'"
                >
                  <option value="">Seleccionar</option>
                  <option v-for="o in CLASIFICACION_FISCAL_OPTIONS" :key="o.value" :value="o.value">
                    {{ o.label }}
                  </option>
                </select>

                <p class="mt-1 text-xs opacity-60">
                  Elige la clasificación fiscal que mejor describa al cliente.
                </p>

                <p v-if="errors.clasificacionFiscal" class="mt-1 text-xs text-error">
                  {{ errors.clasificacionFiscal }}
                </p>
              </div>

              <div data-error-field="regimenFiscal">
                <label class="label text-sm">
                  <span class="label-text">Régimen fiscal</span>
                </label>

                <select
                  v-model="form.regimenFiscal"
                  class="select w-full"
                  :class="errors.regimenFiscal ? 'select-error' : 'select-bordered'"
                >
                  <option value="">Seleccionar</option>
                  <option v-for="o in REGIMEN_FISCAL_OPTIONS" :key="o.value" :value="o.value">
                    {{ o.label }}
                  </option>
                </select>

                <p class="mt-1 text-xs opacity-60">
                  Selecciona el régimen fiscal registrado ante el SAT.
                </p>

                <p v-if="errors.regimenFiscal" class="mt-1 text-xs text-error">
                  {{ errors.regimenFiscal }}
                </p>
              </div>

              <div data-error-field="usoCfdiDefault">
                <label class="label text-sm">
                  <span class="label-text">Uso CFDI default</span>
                </label>

                <select
                  v-model="form.usoCfdiDefault"
                  class="select w-full"
                  :class="errors.usoCfdiDefault ? 'select-error' : 'select-bordered'"
                >
                  <option value="">Seleccionar</option>
                  <option v-for="o in USO_CFDI_OPTIONS" :key="o.value" :value="o.value">
                    {{ o.label }}
                  </option>
                </select>

                <p class="mt-1 text-xs opacity-60">
                  Define el uso CFDI más común para este cliente.
                </p>

                <p v-if="errors.usoCfdiDefault" class="mt-1 text-xs text-error">
                  {{ errors.usoCfdiDefault }}
                </p>
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-sm font-semibold text-base-content/70">Comentarios</h3>

            <div data-error-field="comentarios">
              <textarea
                v-model="form.comentarios"
                maxlength="2000"
                placeholder="Ej: Cliente con crédito autorizado, requiere portal de facturación y atención los martes."
                :class="[
                  'textarea min-h-[120px] w-full',
                  errors.comentarios ? 'textarea-error' : 'textarea-bordered',
                ]"
              />

              <p class="mt-1 text-xs opacity-60">
                Agrega observaciones relevantes para ventas, crédito o facturación.
              </p>

              <p v-if="errors.comentarios" class="mt-1 text-xs text-error">
                {{ errors.comentarios }}
              </p>

              <div class="mt-1 text-right text-xs opacity-50">
                {{ form.comentarios?.length || 0 }} / 2000
              </div>
            </div>
          </section>
        </form>
      </section>

      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] md:flex-row"
      >
        <UiButton
          variant="ghost"
          type="button"
          class="w-full md:w-auto"
          :disabled="saving"
          @click="open = false"
        >
          Cancelar
        </UiButton>

        <UiButton
          variant="primary"
          class="w-full md:w-auto"
          :loading="saving"
          :disabled="saving"
          @click="submit"
        >
          Guardar
        </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiToggle from '~/components/ui/UiToggle.vue'
import { useUiStore } from '~/stores/ui.store'
import type { Client, ClientUsuario, CreateClientDto } from '~/types/client'

type ClientTipo = 'empresa' | 'persona'
type CondicionPago = '0' | '7' | '15' | '30' | '45' | '60' | '90'

type ClientUsuarioForm = {
  localId: string
  nombre: string
  puesto: string
  email: string
  telefono: string
}

type ClientForm = {
  tipo: ClientTipo
  razonSocial: string
  nombreComercial: string
  rfc: string
  email: string
  telefono: string
  usuarios: ClientUsuarioForm[]
  diasCredito: number | string
  limiteCredito: number | string
  condicionPago: CondicionPago
  clasificacionFiscal: string
  regimenFiscal: string
  usoCfdiDefault: string
  aplicaRepse: boolean
  aplicaPortalFacturacion: boolean
  comentarios: string
  activo: boolean
}

const props = defineProps<{
  modelValue: boolean
  model?: Client | null
  mode: 'create' | 'edit'
  onSubmit: (payload: CreateClientDto) => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const ui = useUiStore()

const COUNTRY_CODE = '+52'
const MAX_USUARIOS = 100
const saving = ref(false)

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

function createEmptyUsuario(): ClientUsuarioForm {
  return {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nombre: '',
    puesto: '',
    email: '',
    telefono: '',
  }
}

function getDefaultForm(): ClientForm {
  return {
    tipo: 'empresa',
    razonSocial: '',
    nombreComercial: '',
    rfc: '',
    email: '',
    telefono: '',
    usuarios: [],
    diasCredito: 0,
    limiteCredito: 0,
    condicionPago: '30',
    clasificacionFiscal: '',
    regimenFiscal: '',
    usoCfdiDefault: '',
    aplicaRepse: false,
    aplicaPortalFacturacion: false,
    comentarios: '',
    activo: true,
  }
}

const form = reactive<ClientForm>(getDefaultForm())
const errors = reactive<Record<string, string>>({})

const REGIMEN_FISCAL_OPTIONS = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados' },
  { value: '606', label: '606 - Arrendamiento' },
  { value: '607', label: '607 - Régimen de Enajenación de Bienes' },
  { value: '608', label: '608 - Demás ingresos' },
  { value: '610', label: '610 - Residentes en el Extranjero sin EP' },
  { value: '611', label: '611 - Ingresos por Dividendos' },
  { value: '612', label: '612 - Personas Físicas con Actividades Empresariales' },
  { value: '614', label: '614 - Ingresos por intereses' },
  { value: '615', label: '615 - Régimen de los ingresos por obtención de premios' },
  { value: '616', label: '616 - Sin obligaciones fiscales' },
  { value: '620', label: '620 - Sociedades Cooperativas de Producción' },
  { value: '621', label: '621 - Incorporación Fiscal' },
  { value: '622', label: '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza' },
]

const USO_CFDI_OPTIONS = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobiliario y equipo de oficina' },
  { value: 'I03', label: 'I03 - Equipo de transporte' },
  { value: 'I04', label: 'I04 - Equipo de cómputo y accesorios' },
  { value: 'I05', label: 'I05 - Dados, troqueles, moldes, matrices' },
  { value: 'I06', label: 'I06 - Comunicaciones telefónicas' },
  { value: 'I07', label: 'I07 - Comunicaciones satelitales' },
  { value: 'I08', label: 'I08 - Otra maquinaria y equipo' },
  { value: 'D01', label: 'D01 - Honorarios médicos' },
  { value: 'D02', label: 'D02 - Gastos médicos por incapacidad' },
  { value: 'D03', label: 'D03 - Gastos funerales' },
  { value: 'P01', label: 'P01 - Por definir' },
]

const CLASIFICACION_FISCAL_OPTIONS = [
  { value: 'nacional', label: 'Nacional' },
  { value: 'extranjero', label: 'Extranjero' },
  { value: 'gran_contribuyente', label: 'Gran Contribuyente' },
  { value: 'pymes', label: 'PYME' },
  { value: 'persona_fisica', label: 'Persona Física' },
  { value: 'persona_moral', label: 'Persona Moral' },
  { value: 'exportador', label: 'Exportador' },
  { value: 'importador', label: 'Importador' },
  { value: 'retencion_iva', label: 'Sujeto a Retención IVA' },
  { value: 'retencion_isr', label: 'Sujeto a Retención ISR' },
  { value: 'sector_publico', label: 'Sector Público' },
  { value: 'sector_privado', label: 'Sector Privado' },
  { value: 'regimen_confianza', label: 'Régimen Simplificado Confianza' },
  { value: 'maquiladora', label: 'Maquiladora' },
  { value: 'sin_obligaciones', label: 'Sin obligaciones fiscales' },
]

const REGIMEN_FISCAL_VALUES = new Set(REGIMEN_FISCAL_OPTIONS.map(item => item.value))
const USO_CFDI_VALUES = new Set(USO_CFDI_OPTIONS.map(item => item.value))
const CLASIFICACION_FISCAL_VALUES = new Set(CLASIFICACION_FISCAL_OPTIONS.map(item => item.value))

const fieldLabels: Record<string, string> = {
  tipo: 'Tipo de cliente',
  razonSocial: 'Razón social',
  nombreComercial: 'Nombre comercial',
  rfc: 'RFC',
  email: 'Email',
  telefono: 'Teléfono',
  diasCredito: 'Días de crédito',
  limiteCredito: 'Límite de crédito',
  condicionPago: 'Condición de pago',
  clasificacionFiscal: 'Clasificación fiscal',
  regimenFiscal: 'Régimen fiscal',
  usoCfdiDefault: 'Uso CFDI default',
  comentarios: 'Comentarios',
  usuarios: 'Usuarios',
  nombre: 'Nombre',
  puesto: 'Puesto',
}

function getErrorLabel(key: string) {
  if (key.startsWith('usuarios.')) {
    const parts = key.split('.')
    const index = Number(parts[1] || 0)
    const field = parts[2] || 'nombre'
    const fieldLabel = fieldLabels[field] || field
    return `Usuario ${index + 1} · ${fieldLabel}`
  }

  return fieldLabels[key] || key
}

const errorSummary = computed(() =>
  Object.entries(errors)
    .filter(([, message]) => !!message)
    .map(([key, message]) => ({
      key,
      label: getErrorLabel(key),
      message,
    }))
)

const RFC_REGEX = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidRFC(rfc: string) {
  return RFC_REGEX.test(rfc.toUpperCase())
}

function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email)
}

function isValidPhone(phoneDigits: string) {
  return /^\d{10}$/.test(phoneDigits)
}

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function normalizeUsuarios(usuarios?: ClientUsuario[] | null): ClientUsuarioForm[] {
  if (!Array.isArray(usuarios) || !usuarios.length) return []

  return usuarios.map(usuario => ({
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nombre: usuario.nombre ?? '',
    puesto: usuario.puesto ?? '',
    email: usuario.email ?? '',
    telefono: (usuario.telefono ?? '').replace(/^\+52/, '').replace(/\D/g, ''),
  }))
}

function hydrateForm(client?: Client | null) {
  clearErrors()

  if (!client) {
    Object.assign(form, getDefaultForm())
    return
  }

  Object.assign(form, {
    ...getDefaultForm(),
    tipo: (client.tipo as ClientTipo) || 'empresa',
    razonSocial: client.razonSocial ?? '',
    nombreComercial: client.nombreComercial ?? '',
    rfc: client.rfc ?? '',
    email: client.email ?? '',
    telefono: (client.telefono ?? '').replace(/^\+52/, '').replace(/\D/g, ''),
    usuarios: normalizeUsuarios(client.usuarios),
    diasCredito: client.diasCredito ?? 0,
    limiteCredito: client.limiteCredito ?? 0,
    condicionPago: (client.condicionPago as CondicionPago) ?? '30',
    clasificacionFiscal: client.clasificacionFiscal ?? '',
    regimenFiscal: client.regimenFiscal ?? '',
    usoCfdiDefault: client.usoCfdiDefault ?? '',
    aplicaRepse: !!client.aplicaRepse,
    aplicaPortalFacturacion: !!client.aplicaPortalFacturacion,
    comentarios: client.comentarios ?? '',
    activo: client.activo ?? true,
  })
}

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      if (props.mode === 'edit' && props.model) {
        hydrateForm(props.model)
      } else {
        hydrateForm(null)
      }
    } else {
      clearErrors()
      saving.value = false
    }
  },
  { immediate: true }
)

watch(
  () => props.model,
  value => {
    if (props.modelValue && props.mode === 'edit') {
      hydrateForm(value)
    }
  },
  { deep: true }
)

function optionalString(value?: string | null) {
  const clean = String(value ?? '').trim()
  return clean ? clean : undefined
}

function addUsuario() {
  if (form.usuarios.length >= MAX_USUARIOS) {
    ui.showToast('warning', `Solo puedes agregar hasta ${MAX_USUARIOS} usuarios`)
    return
  }

  form.usuarios.push(createEmptyUsuario())
}

function reindexUsuarioErrors() {
  const entries = Object.entries(errors)
  clearErrors()

  for (const [key, value] of entries) {
    if (!key.startsWith('usuarios.')) {
      errors[key] = value
      continue
    }

    const match = key.match(/^usuarios\.(\d+)\.(.+)$/)
    if (!match) continue

    const originalIndex = Number(match[1])
    const field = match[2]

    if (originalIndex >= form.usuarios.length) continue

    errors[`usuarios.${originalIndex}.${field}`] = value
  }
}

function removeUsuario(index: number) {
  form.usuarios.splice(index, 1)
  reindexUsuarioErrors()
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

async function submit() {
  if (saving.value) return

  clearErrors()

  const tipo = form.tipo
  const razonSocial = form.razonSocial.trim()
  const nombreComercial = form.nombreComercial.trim()
  const rfc = form.rfc.trim().toUpperCase()
  const email = form.email.trim().toLowerCase()
  const telefonoDigits = form.telefono.replace(/\D/g, '')
  const diasCredito = Number(form.diasCredito)
  const limiteCredito = Number(form.limiteCredito)
  const condicionPago = form.condicionPago
  const clasificacionFiscal = form.clasificacionFiscal.trim()
  const regimenFiscal = form.regimenFiscal.trim()
  const usoCfdiDefault = form.usoCfdiDefault.trim()
  const comentarios = form.comentarios.trim()

  const usuariosConIndice = form.usuarios.map((usuario, index) => ({
    index,
    nombre: usuario.nombre.trim(),
    puesto: usuario.puesto.trim(),
    email: usuario.email.trim().toLowerCase(),
    telefonoDigits: usuario.telefono.replace(/\D/g, ''),
  }))

  const usuariosNormalizados = usuariosConIndice.filter(
    usuario => !!usuario.nombre || !!usuario.puesto || !!usuario.email || !!usuario.telefonoDigits
  )

  if (!['empresa', 'persona'].includes(tipo)) {
    errors.tipo = 'Selecciona un tipo válido'
  }

  if (!razonSocial) {
    errors.razonSocial = 'La razón social es obligatoria'
  } else if (razonSocial.length < 2) {
    errors.razonSocial = 'Debe tener al menos 2 caracteres'
  } else if (razonSocial.length > 150) {
    errors.razonSocial = 'No puede exceder 150 caracteres'
  }

  if (!nombreComercial) {
    errors.nombreComercial = 'El nombre comercial es obligatorio'
  } else if (nombreComercial.length < 2) {
    errors.nombreComercial = 'Debe tener al menos 2 caracteres'
  } else if (nombreComercial.length > 120) {
    errors.nombreComercial = 'No puede exceder 120 caracteres'
  }

  if (rfc) {
    if (rfc.length < 12 || rfc.length > 13) {
      errors.rfc = 'Debe tener entre 12 y 13 caracteres'
    } else if (!isValidRFC(rfc)) {
      errors.rfc = 'El formato del RFC es inválido'
    }
  }

  if (email && !isValidEmail(email)) {
    errors.email = 'El correo electrónico es inválido'
  }

  if (telefonoDigits && !isValidPhone(telefonoDigits)) {
    errors.telefono = 'Debe contener exactamente 10 dígitos'
  }

  if (usuariosNormalizados.length > MAX_USUARIOS) {
    errors.usuarios = `No puedes registrar más de ${MAX_USUARIOS} usuarios`
  }

  const seenEmails = new Map<string, number>()

  usuariosNormalizados.forEach(usuario => {
    const originalIndex = usuario.index

    if (!usuario.nombre) {
      errors[`usuarios.${originalIndex}.nombre`] = 'El nombre es obligatorio'
    } else if (usuario.nombre.length < 2) {
      errors[`usuarios.${originalIndex}.nombre`] = 'Debe tener al menos 2 caracteres'
    } else if (usuario.nombre.length > 120) {
      errors[`usuarios.${originalIndex}.nombre`] = 'No puede exceder 120 caracteres'
    }

    if (usuario.puesto.length > 120) {
      errors[`usuarios.${originalIndex}.puesto`] = 'No puede exceder 120 caracteres'
    }

    if (usuario.email && !isValidEmail(usuario.email)) {
      errors[`usuarios.${originalIndex}.email`] = 'El correo electrónico es inválido'
    }

    if (usuario.email) {
      if (seenEmails.has(usuario.email)) {
        errors[`usuarios.${originalIndex}.email`] = 'El correo está duplicado'
      } else {
        seenEmails.set(usuario.email, originalIndex)
      }
    }

    if (usuario.telefonoDigits && !isValidPhone(usuario.telefonoDigits)) {
      errors[`usuarios.${originalIndex}.telefono`] = 'Debe contener exactamente 10 dígitos'
    }
  })

  if (Number.isNaN(diasCredito) || !Number.isInteger(diasCredito)) {
    errors.diasCredito = 'Debe ser un número entero'
  } else if (diasCredito < 0 || diasCredito > 365) {
    errors.diasCredito = 'Debe estar entre 0 y 365'
  }

  if (Number.isNaN(limiteCredito)) {
    errors.limiteCredito = 'Debe ser un número válido'
  } else if (limiteCredito < 0) {
    errors.limiteCredito = 'No puede ser negativo'
  }

  if (!['0', '7', '15', '30', '45', '60', '90'].includes(condicionPago)) {
    errors.condicionPago = 'Selecciona una condición de pago válida'
  }

  if (clasificacionFiscal.length > 120) {
    errors.clasificacionFiscal = 'No puede exceder 120 caracteres'
  } else if (clasificacionFiscal && !CLASIFICACION_FISCAL_VALUES.has(clasificacionFiscal)) {
    errors.clasificacionFiscal = 'Selecciona una clasificación fiscal válida'
  }

  if (regimenFiscal.length > 120) {
    errors.regimenFiscal = 'No puede exceder 120 caracteres'
  } else if (regimenFiscal && !REGIMEN_FISCAL_VALUES.has(regimenFiscal)) {
    errors.regimenFiscal = 'Selecciona un régimen fiscal válido'
  }

  if (usoCfdiDefault.length > 120) {
    errors.usoCfdiDefault = 'No puede exceder 120 caracteres'
  } else if (usoCfdiDefault && !USO_CFDI_VALUES.has(usoCfdiDefault)) {
    errors.usoCfdiDefault = 'Selecciona un uso CFDI válido'
  }

  if (comentarios.length > 2000) {
    errors.comentarios = 'No puede exceder 2000 caracteres'
  }

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${getErrorLabel(key)}: ${message}`)
    await focusFirstErrorField()
    return
  }

  const usuariosPayload: ClientUsuario[] = usuariosNormalizados.map(usuario => ({
    nombre: usuario.nombre,
    puesto: optionalString(usuario.puesto),
    email: optionalString(usuario.email),
    telefono: usuario.telefonoDigits ? `${COUNTRY_CODE}${usuario.telefonoDigits}` : undefined,
  }))

  const payload: CreateClientDto = {
    tipo,
    razonSocial,
    nombreComercial,
    diasCredito,
    limiteCredito,
    condicionPago,
    aplicaRepse: !!form.aplicaRepse,
    aplicaPortalFacturacion: !!form.aplicaPortalFacturacion,
    activo: !!form.activo,
    rfc: optionalString(rfc),
    email: optionalString(email),
    telefono: telefonoDigits ? `${COUNTRY_CODE}${telefonoDigits}` : undefined,
    usuarios: usuariosPayload,
    clasificacionFiscal: optionalString(clasificacionFiscal),
    regimenFiscal: optionalString(regimenFiscal),
    usoCfdiDefault: optionalString(usoCfdiDefault),
    comentarios: optionalString(comentarios),
  }

  try {
    saving.value = true
    await props.onSubmit(payload)
    clearErrors()
    open.value = false
  } catch (error) {
    console.error(error)
  } finally {
    saving.value = false
  }
}
</script>
