<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiToggle from '~/components/ui/UiToggle.vue'
import { useUiStore } from '~/stores/ui.store'
import type { Client, CreateClientDto } from '~/types/client'

const errors = ref({
  razonSocial: false,
  rfc: false,
  email: false,
  telefono: false,
})

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

  // 🔵 FINANCIERO
  diasCredito: 0,
  limiteCredito: 0,
  condicionPago: '30',

  // 🔵 FISCAL
  clasificacionFiscal: '',
  regimenFiscal: '',
  usoCfdiDefault: '',

  // 🔵 CUMPLIMIENTO
  aplicaRepse: false,
  aplicaPortalFacturacion: false,

  // 🔵 ADMIN
  comentarios: '',

  activo: true,
})

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

        diasCredito: v.diasCredito ?? 0,
        limiteCredito: v.limiteCredito ?? 0,
        condicionPago: v.condicionPago ?? '30',

        clasificacionFiscal: v.clasificacionFiscal ?? '',
        regimenFiscal: v.regimenFiscal ?? '',
        usoCfdiDefault: v.usoCfdiDefault ?? '',

        aplicaRepse: !!v.aplicaRepse,
        aplicaPortalFacturacion: !!v.aplicaPortalFacturacion,

        comentarios: v.comentarios ?? '',

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
    razonSocial: false,
    rfc: false,
    email: false,
    telefono: false,
  }

  if (!form.value.razonSocial) {
    errors.value.razonSocial = true
    ui.showToast('warning', 'La razón social es obligatoria')
    return
  }

  if (form.value.rfc && !isValidRFC(form.value.rfc)) {
    errors.value.rfc = true
    ui.showToast('warning', 'RFC inválido')
    return
  }

  if (form.value.email && !isValidEmail(form.value.email)) {
    errors.value.email = true
    ui.showToast('warning', 'Correo electrónico inválido')
    return
  }

  if (form.value.telefono && !isValidPhone(form.value.telefono)) {
    errors.value.telefono = true
    ui.showToast('warning', 'El teléfono debe tener 10 dígitos')
    return
  }

  emit('submit', {
    ...form.value,
    diasCredito: Number(form.value.diasCredito),
    limiteCredito: Number(form.value.limiteCredito),
    rfc: form.value.rfc.toUpperCase(),
    telefono: form.value.telefono ? `${countryCode.value}${form.value.telefono}` : '',
  })

  open.value = false
}
</script>

<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <!-- HEADER -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="font-semibold text-lg">
        {{ mode === 'create' ? 'Nuevo cliente' : 'Editar cliente' }}
      </h2>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- CONTENT -->
    <div class="px-6 py-5 overflow-auto space-y-6" style="max-height: calc(90vh - 160px)">
      <form class="space-y-6" @submit.prevent="submit">
        <!-- =========================
             DATOS GENERALES
        ========================== -->
        <div class="space-y-4">
          <UiInput v-model="form.razonSocial" label="Razón social *" :error="errors.razonSocial" />
          <UiInput v-model="form.nombreComercial" label="Nombre comercial" />
          <UiInput v-model="form.rfc" label="RFC" :error="errors.rfc" />
          <UiInput v-model="form.email" label="Email" :error="errors.email" />
        </div>

        <!-- =========================
             FINANCIERO
        ========================== -->
        <div class="border-t pt-6 space-y-4">
          <h3 class="font-semibold text-sm">Información financiera</h3>

          <UiInput v-model="form.diasCredito" label="Días de crédito" type="number" />
          <UiInput v-model="form.limiteCredito" label="Límite de crédito" type="number" />

          <div>
            <label class="label text-sm">
              <span class="label-text">Condición de pago</span>
            </label>
            <select v-model="form.condicionPago" class="select select-bordered w-full">
              <option value="30">30 días</option>
              <option value="45">45 días</option>
              <option value="60">60 días</option>
              <option value="90">90 días</option>
            </select>
          </div>
        </div>

        <!-- =========================
             CUMPLIMIENTO
        ========================== -->
        <div class="border-t pt-6 space-y-4">
          <h3 class="font-semibold text-sm">Cumplimiento</h3>

          <UiToggle v-model="form.aplicaRepse" label="Aplica REPSE" />
          <UiToggle v-model="form.aplicaPortalFacturacion" label="Aplica portal de facturación" />
        </div>

        <!-- =========================
             FISCAL
        ========================== -->
        <div class="border-t pt-6 space-y-4">
          <h3 class="font-semibold text-sm">Información fiscal</h3>

          <!-- CLASIFICACIÓN FISCAL -->
          <div>
            <label class="label text-sm">
              <span class="label-text">Clasificación fiscal</span>
            </label>
            <select v-model="form.clasificacionFiscal" class="select select-bordered w-full">
              <option value="">Seleccionar</option>
              <option v-for="o in CLASIFICACION_FISCAL_OPTIONS" :key="o.value" :value="o.value">
                {{ o.label }}
              </option>
            </select>
          </div>

          <!-- RÉGIMEN FISCAL -->
          <div>
            <label class="label text-sm">
              <span class="label-text">Régimen fiscal</span>
            </label>
            <select v-model="form.regimenFiscal" class="select select-bordered w-full">
              <option value="">Seleccionar</option>
              <option v-for="o in REGIMEN_FISCAL_OPTIONS" :key="o.value" :value="o.value">
                {{ o.label }}
              </option>
            </select>
          </div>

          <!-- USO CFDI -->
          <div>
            <label class="label text-sm">
              <span class="label-text">Uso CFDI default</span>
            </label>
            <select v-model="form.usoCfdiDefault" class="select select-bordered w-full">
              <option value="">Seleccionar</option>
              <option v-for="o in USO_CFDI_OPTIONS" :key="o.value" :value="o.value">
                {{ o.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- =========================
             COMENTARIOS
        ========================== -->
        <div class="border-t pt-6 space-y-4">
          <h3 class="font-semibold text-sm">Comentarios</h3>

          <textarea
            v-model="form.comentarios"
            maxlength="2000"
            class="textarea textarea-bordered w-full min-h-[120px]"
          />

          <div class="text-xs text-right opacity-50">
            {{ form.comentarios?.length || 0 }} / 2000
          </div>
        </div>
      </form>
    </div>

    <!-- FOOTER -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton variant="primary" type="submit" @click="submit"> Guardar </UiButton>
    </div>
  </UiDialog>
</template>
