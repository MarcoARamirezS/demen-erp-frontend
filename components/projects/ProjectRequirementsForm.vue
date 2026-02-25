<template>
  <div class="space-y-8">
    <!-- ================= TABLERO ================= -->
    <UiSection title="Tablero">
      <UiRadioGroup v-model="local.tableroTipo" :options="radioTablero" />

      <UiInput
        v-if="local.tableroTipo === 'otros'"
        v-model="local.tableroTipoOtros"
        placeholder="Especificar"
      />

      <UiCheckboxGroup
        label="Ubicación"
        v-model="local.ubicacion"
        v-model:other="local.ubicacionOtros"
        :options="['Interior', 'Exterior']"
      />

      <UiCheckboxGroup
        label="Tipo de tablero"
        v-model="local.tipoTablero"
        v-model:other="local.tipoTableroOtros"
        :options="['Control', 'Distribución', 'Seguridad']"
      />

      <UiInput v-model="local.dimensiones" label="Dimensiones aproximadas" />

      <UiCheckboxGroup
        label="Voltaje"
        v-model="local.voltaje"
        v-model:other="local.voltajeOtros"
        :options="['120vca', '220vca', '440vca']"
      />
    </UiSection>

    <!-- ================= AUTOMATIZACIÓN ================= -->
    <UiSection title="Automatización">
      <UiCheckboxGroup
        label="Sistema a automatizar"
        v-model="local.sistema"
        v-model:other="local.sistemaOtros"
        :options="['Motores', 'Bombas', 'Extractores', 'Cortinas']"
      />

      <UiCheckboxGroup
        label="Tipo de controlador"
        v-model="local.controlador"
        v-model:other="local.controladorOtros"
        :options="['PLC', 'HMI']"
      />

      <UiInput v-model="local.cantidadSenales" label="Cantidad de señales (DI/DO/AI/AO)" />

      <UiSelect
        v-model="local.tipoComunicacion"
        label="Tipo de comunicación"
        :options="selectComunicacion"
      />

      <UiInput
        v-if="local.tipoComunicacion === 'Otro'"
        v-model="local.tipoComunicacionOtro"
        placeholder="Especificar tipo de comunicación"
      />

      <UiTextarea v-model="local.sensores" label="Sensores y actuadores" />
      <UiTextarea v-model="local.anotacionesTablero" label="Anotaciones generales (tablero)" />
    </UiSection>

    <!-- ================= TUBERÍA ================= -->
    <UiSection title="Tubería">
      <UiCheckboxGroup
        label="Tipo de tubo"
        v-model="local.tipoTubo"
        v-model:other="local.tipoTuboOtros"
        :options="['Pared delgada', 'Pared gruesa', 'Inoxidable']"
      />

      <UiCheckboxGroup
        label="Medida del tubo"
        v-model="local.medidaTubo"
        v-model:other="local.medidaTuboOtros"
        :options="['1/2', '3/4', '1']"
      />

      <UiInput v-model="local.cantidadTubos" label="Cantidad de tubos" type="number" />
      <UiInput v-model="local.conduitLR" label="Conduits LR" type="number" />
      <UiInput v-model="local.conduitLL" label="Conduits LL" type="number" />
      <UiInput v-model="local.conduitLB" label="Conduits LB" type="number" />
      <UiInput v-model="local.conduitT" label="Conduits T" type="number" />
      <UiTextarea v-model="local.accesorios" label="Accesorios adicionales" />
      <UiInput v-model="local.alturaInstalacion" label="Altura de instalación" />
    </UiSection>

    <!-- ================= CABLEADO ================= -->
    <UiSection title="Cableado">
      <UiCheckboxGroup
        label="Calibre de cable"
        v-model="local.calibre"
        v-model:other="local.calibreOtros"
        :options="['14 awg', '12 awg', '10 awg']"
      />

      <UiInput v-model="local.metrosCable" label="Metros de cable" type="number" />

      <UiCheckboxGroup
        label="Color de cable"
        v-model="local.colorCable"
        v-model:other="local.colorCableOtros"
        :options="['Negro', 'Blanco', 'Tierra']"
      />
    </UiSection>

    <!-- ================= OPERATIVO ================= -->
    <UiSection title="Operativo">
      <UiRadioGroup
        v-model="local.plataforma"
        :options="[
          { label: 'Articulada', value: 'Articulada' },
          { label: 'Tijera', value: 'Tijera' },
          { label: 'Personal', value: 'Personal' },
        ]"
      />

      <UiTextarea v-model="local.anotacionesElectricas" label="Anotaciones generales (eléctrico)" />
      <UiTextarea v-model="local.descripcionFuncional" label="Descripción funcional detallada" />
    </UiSection>

    <!-- ================= IMÁGENES ================= -->
    <UiSection title="Evidencia fotográfica">
      <div class="space-y-4">
        <input
          type="file"
          multiple
          accept="image/*"
          class="file-input file-input-bordered w-full"
          @change="onFilesSelected"
        />

        <div v-if="local.imagenes.length" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="(img, index) in local.imagenes" :key="index" class="relative group">
            <img
              :src="getPreview(img)"
              class="rounded-lg border border-base-300 object-cover h-32 w-full"
            />

            <button
              type="button"
              class="absolute top-2 right-2 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition"
              @click="removeImage(index)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </UiSection>

    <!-- BOTÓN GUARDAR -->
    <div class="flex justify-end">
      <UiButton variant="primary" :loading="saving" @click="emitSave"> Guardar </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps({
  model: {
    type: Object,
    default: () => ({}),
  },
  saving: Boolean,
})

const emit = defineEmits(['save'])

const local = reactive({
  tableroTipo: '',
  tableroTipoOtros: '',
  ubicacion: [],
  ubicacionOtros: '',
  tipoTablero: [],
  tipoTableroOtros: '',
  dimensiones: '',
  voltaje: [],
  voltajeOtros: '',

  sistema: [],
  sistemaOtros: '',
  controlador: [],
  controladorOtros: '',
  cantidadSenales: '',
  tipoComunicacion: '',
  tipoComunicacionOtro: '',
  sensores: '',
  anotacionesTablero: '',

  tipoTubo: [],
  tipoTuboOtros: '',
  medidaTubo: [],
  medidaTuboOtros: '',
  cantidadTubos: '',
  conduitLR: '',
  conduitLL: '',
  conduitLB: '',
  conduitT: '',
  accesorios: '',
  alturaInstalacion: '',

  calibre: [],
  calibreOtros: '',
  metrosCable: '',
  colorCable: [],
  colorCableOtros: '',

  plataforma: '',
  anotacionesElectricas: '',
  descripcionFuncional: '',

  imagenes: [] as File[],

  ...(props.model ?? {}),
})

watch(
  () => props.model,
  val => {
    if (!val) return
    Object.assign(local, val)
  },
  { deep: true }
)

watch(
  () => local.tableroTipo,
  val => {
    if (val !== 'otros') local.tableroTipoOtros = ''
  }
)

watch(
  () => local.tipoComunicacion,
  val => {
    if (val !== 'Otro') local.tipoComunicacionOtro = ''
  }
)

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  local.imagenes.push(...Array.from(input.files))
}

function removeImage(index: number) {
  local.imagenes.splice(index, 1)
}

function getPreview(file: File) {
  return URL.createObjectURL(file)
}

function emitSave() {
  emit('save', { ...local })
}

const radioTablero = [
  { label: 'Existente', value: 'existente' },
  { label: 'Nuevo', value: 'nuevo' },
  { label: 'Reemplazo', value: 'reemplazo' },
  { label: 'Otros', value: 'otros' },
]

const selectComunicacion = [
  'Ethernet',
  'Profinet',
  'Modbus TCP/IP',
  'Modbus RTU',
  'IO Link',
  'Ethercat',
  'PoE',
  'Otro',
]
</script>
