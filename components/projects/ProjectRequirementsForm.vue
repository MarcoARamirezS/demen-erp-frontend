<template>
  <div class="space-y-5">
    <!-- HEADER / RESUMEN -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/70 to-base-100 p-4 shadow-sm"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 class="text-lg font-bold">Levantamiento de requerimientos</h3>
          <p class="text-sm opacity-70">
            Completa la información técnica por secciones para reducir el tiempo de captura.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="badge badge-outline gap-2 px-3 py-3 text-xs"
          >
            <span>{{ tab.label }}</span>
            <span class="badge badge-ghost badge-sm">{{ getSectionCount(tab.key) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TABS -->
    <div
      class="sticky top-0 z-10 rounded-2xl border border-base-300 bg-base-100/95 p-2 shadow-sm backdrop-blur"
    >
      <div class="flex gap-2 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="btn btn-sm whitespace-nowrap rounded-xl"
          :class="activeTab === tab.key ? 'btn-primary' : 'btn-ghost'"
          @click="activeTab = tab.key"
        >
          <span>{{ tab.label }}</span>
          <span class="badge badge-sm border-0 bg-base-100/70 text-base-content">
            {{ getSectionCount(tab.key) }}
          </span>
        </button>
      </div>
    </div>

    <!-- PANEL -->
    <div class="rounded-2xl border border-base-300 bg-base-100 shadow-lg">
      <div class="border-b border-base-300 px-5 py-4">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 class="text-base font-bold">{{ currentTabLabel }}</h4>
            <p class="text-sm opacity-65">{{ currentTabDescription }}</p>
          </div>

          <div class="text-xs opacity-60">Paso {{ currentStep }} de {{ tabs.length }}</div>
        </div>
      </div>

      <div class="p-5">
        <!-- ================= TABLERO ================= -->
        <div v-show="activeTab === 'tablero'" class="space-y-6">
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Configuración general</p>

              <div class="space-y-4">
                <UiRadioGroup v-model="local.tableroTipo" :options="radioTablero" />

                <UiInput
                  v-if="local.tableroTipo === 'otros'"
                  v-model="local.tableroTipoOtros"
                  label="Especificar tipo"
                  placeholder="Describe el tipo de tablero"
                />

                <UiInput
                  v-model="local.dimensiones"
                  label="Dimensiones aproximadas"
                  placeholder="Ej: 120 x 80 x 30 cm"
                />
              </div>
            </div>

            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Características eléctricas</p>

              <div class="space-y-4">
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

                <UiCheckboxGroup
                  label="Voltaje"
                  v-model="local.voltaje"
                  v-model:other="local.voltajeOtros"
                  :options="['120vca', '220vca', '440vca']"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ================= AUTOMATIZACIÓN ================= -->
        <div v-show="activeTab === 'automatizacion'" class="space-y-6">
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Control y automatización</p>

              <div class="space-y-4">
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

                <UiInput
                  v-model="local.cantidadSenales"
                  label="Cantidad de señales (DI/DO/AI/AO)"
                  placeholder="Ej: 12 DI, 8 DO, 2 AI"
                />

                <UiSelect
                  v-model="local.tipoComunicacion"
                  label="Tipo de comunicación"
                  :options="selectComunicacion"
                />

                <UiInput
                  v-if="local.tipoComunicacion === 'Otro'"
                  v-model="local.tipoComunicacionOtro"
                  label="Especificar comunicación"
                  placeholder="Especificar tipo de comunicación"
                />
              </div>
            </div>

            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Notas técnicas</p>

              <div class="space-y-4">
                <UiTextarea
                  v-model="local.sensores"
                  label="Sensores y actuadores"
                  placeholder="Describe sensores, actuadores, finales de carrera, válvulas, etc."
                />

                <UiTextarea
                  v-model="local.anotacionesTablero"
                  label="Anotaciones generales (tablero)"
                  placeholder="Observaciones generales del sistema de control"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ================= TUBERÍA ================= -->
        <div v-show="activeTab === 'tuberia'" class="space-y-6">
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Tubería y canalización</p>

              <div class="space-y-4">
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

                <UiInput
                  v-model="local.cantidadTubos"
                  label="Cantidad de tubos"
                  type="number"
                  placeholder="Ej: 8"
                />

                <UiInput
                  v-model="local.alturaInstalacion"
                  label="Altura de instalación"
                  placeholder="Ej: 3.5 m"
                />
              </div>
            </div>

            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Accesorios de canalización</p>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <UiInput
                  v-model="local.conduitLR"
                  label="Conduits LR"
                  type="number"
                  placeholder="0"
                />
                <UiInput
                  v-model="local.conduitLL"
                  label="Conduits LL"
                  type="number"
                  placeholder="0"
                />
                <UiInput
                  v-model="local.conduitLB"
                  label="Conduits LB"
                  type="number"
                  placeholder="0"
                />
                <UiInput
                  v-model="local.conduitT"
                  label="Conduits T"
                  type="number"
                  placeholder="0"
                />
              </div>

              <div class="mt-4">
                <UiTextarea
                  v-model="local.accesorios"
                  label="Accesorios adicionales"
                  placeholder="Coples, conectores, abrazaderas, soportería, etc."
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ================= CABLEADO ================= -->
        <div v-show="activeTab === 'cableado'" class="space-y-6">
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Especificación del cable</p>

              <div class="space-y-4">
                <UiCheckboxGroup
                  label="Calibre de cable"
                  v-model="local.calibre"
                  v-model:other="local.calibreOtros"
                  :options="['14 awg', '12 awg', '10 awg']"
                />

                <UiInput
                  v-model="local.metrosCable"
                  label="Metros de cable"
                  type="number"
                  placeholder="Ej: 150"
                />

                <UiCheckboxGroup
                  label="Color de cable"
                  v-model="local.colorCable"
                  v-model:other="local.colorCableOtros"
                  :options="['Negro', 'Blanco', 'Tierra']"
                />
              </div>
            </div>

            <div
              class="flex h-full flex-col justify-between rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/40 to-base-100 p-4"
            >
              <div>
                <p class="mb-2 text-sm font-semibold">Resumen rápido</p>
                <p class="text-sm opacity-70">
                  Registra aquí la selección de calibres, metros estimados y colores a utilizar.
                </p>
              </div>

              <div class="mt-4 space-y-3 text-sm">
                <div class="rounded-xl bg-base-100 p-3">
                  <span class="opacity-60">Calibres seleccionados:</span>
                  <div class="mt-1 font-medium">
                    {{ formatArray(local.calibre) || 'Sin definir' }}
                  </div>
                </div>

                <div class="rounded-xl bg-base-100 p-3">
                  <span class="opacity-60">Metros estimados:</span>
                  <div class="mt-1 font-medium">{{ local.metrosCable || 'Sin definir' }}</div>
                </div>

                <div class="rounded-xl bg-base-100 p-3">
                  <span class="opacity-60">Colores:</span>
                  <div class="mt-1 font-medium">
                    {{ formatArray(local.colorCable) || 'Sin definir' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= OPERATIVO ================= -->
        <div v-show="activeTab === 'operativo'" class="space-y-6">
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Requerimientos operativos</p>

              <div class="space-y-4">
                <UiRadioGroup
                  v-model="local.plataforma"
                  :options="[
                    { label: 'Articulada', value: 'Articulada' },
                    { label: 'Tijera', value: 'Tijera' },
                    { label: 'Personal', value: 'Personal' },
                  ]"
                />

                <UiTextarea
                  v-model="local.anotacionesElectricas"
                  label="Anotaciones generales (eléctrico)"
                  placeholder="Condiciones eléctricas, alimentación disponible, restricciones, etc."
                />
              </div>
            </div>

            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Descripción funcional</p>

              <UiTextarea
                v-model="local.descripcionFuncional"
                label="Descripción funcional detallada"
                placeholder="Describe la lógica esperada, secuencia de operación, condiciones de arranque, paro, alarmas, etc."
              />
            </div>
          </div>
        </div>

        <!-- ================= IMÁGENES ================= -->
        <div v-show="activeTab === 'evidencia'" class="space-y-6">
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Carga de evidencia</p>

              <div class="space-y-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  class="file-input file-input-bordered w-full"
                  @change="onFilesSelected"
                />

                <div class="rounded-xl bg-base-200/50 p-3 text-sm opacity-70">
                  Adjunta fotografías del tablero, trayectorias, equipos, sensores, área de trabajo
                  y cualquier detalle relevante para ingeniería e instalación.
                </div>

                <div class="stats stats-vertical border border-base-300 bg-base-100 shadow-none">
                  <div class="stat px-4 py-3">
                    <div class="stat-title">Imágenes cargadas</div>
                    <div class="stat-value text-2xl">{{ local.imagenes.length }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
              <p class="mb-3 text-sm font-semibold">Vista previa</p>

              <div
                v-if="local.imagenes.length"
                class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
              >
                <div
                  v-for="(img, index) in local.imagenes"
                  :key="`${img.name}-${index}`"
                  class="group relative overflow-hidden rounded-xl border border-base-300 bg-base-200"
                >
                  <img
                    :src="getPreview(img)"
                    class="h-32 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                  />

                  <button
                    type="button"
                    class="btn btn-circle btn-error btn-xs absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                    @click="removeImage(index)"
                  >
                    ✕
                  </button>

                  <div class="truncate px-3 py-2 text-xs opacity-70">
                    {{ img.name }}
                  </div>
                </div>
              </div>

              <div
                v-else
                class="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-200/30 text-center text-sm opacity-60"
              >
                Aún no hay imágenes cargadas
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER STICKY -->
      <div
        class="sticky bottom-0 flex flex-col gap-3 border-t border-base-300 bg-base-100/95 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between"
      >
        <div class="text-sm opacity-65">
          {{ currentTabLabel }} · {{ currentStep }} / {{ tabs.length }}
        </div>

        <div class="flex flex-col gap-2 sm:flex-row">
          <UiButton variant="ghost" :disabled="currentStep === 1" @click="goToPrevious">
            Anterior
          </UiButton>

          <UiButton v-if="currentStep < tabs.length" variant="outline" @click="goToNext">
            Siguiente
          </UiButton>

          <UiButton variant="primary" :loading="saving" @click="emitSave"> Guardar </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'

const props = defineProps({
  model: {
    type: Object,
    default: () => ({}),
  },
  saving: Boolean,
})

const emit = defineEmits(['save'])

const tabs = [
  {
    key: 'tablero',
    label: 'Tablero',
    description: 'Datos generales del tablero, ubicación, dimensiones y voltaje.',
  },
  {
    key: 'automatizacion',
    label: 'Automatización',
    description: 'Sistema a automatizar, controlador, señales y comunicación.',
  },
  {
    key: 'tuberia',
    label: 'Tubería',
    description: 'Canalización, accesorios, medidas y altura de instalación.',
  },
  {
    key: 'cableado',
    label: 'Cableado',
    description: 'Calibres, metros estimados y colores de cable.',
  },
  {
    key: 'operativo',
    label: 'Operativo',
    description: 'Plataforma requerida y descripción funcional del sistema.',
  },
  {
    key: 'evidencia',
    label: 'Evidencia',
    description: 'Carga y revisión de fotografías del sitio y equipos.',
  },
] as const

type TabKey = (typeof tabs)[number]['key']

const activeTab = ref<TabKey>('tablero')

function getDefaultLocal() {
  return {
    tableroTipo: '',
    tableroTipoOtros: '',
    ubicacion: [] as string[],
    ubicacionOtros: '',
    tipoTablero: [] as string[],
    tipoTableroOtros: '',
    dimensiones: '',
    voltaje: [] as string[],
    voltajeOtros: '',

    sistema: [] as string[],
    sistemaOtros: '',
    controlador: [] as string[],
    controladorOtros: '',
    cantidadSenales: '',
    tipoComunicacion: '',
    tipoComunicacionOtro: '',
    sensores: '',
    anotacionesTablero: '',

    tipoTubo: [] as string[],
    tipoTuboOtros: '',
    medidaTubo: [] as string[],
    medidaTuboOtros: '',
    cantidadTubos: '',
    conduitLR: '',
    conduitLL: '',
    conduitLB: '',
    conduitT: '',
    accesorios: '',
    alturaInstalacion: '',

    calibre: [] as string[],
    calibreOtros: '',
    metrosCable: '',
    colorCable: [] as string[],
    colorCableOtros: '',

    plataforma: '',
    anotacionesElectricas: '',
    descripcionFuncional: '',

    imagenes: [] as File[],
  }
}

const local = reactive({
  ...getDefaultLocal(),
  ...(props.model ?? {}),
})

watch(
  () => props.model,
  val => {
    if (!val) return
    Object.assign(local, {
      ...getDefaultLocal(),
      ...val,
    })
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

const currentStep = computed(() => tabs.findIndex(tab => tab.key === activeTab.value) + 1)

const currentTab = computed(() => tabs.find(tab => tab.key === activeTab.value) ?? tabs[0])
const currentTabLabel = computed(() => currentTab.value.label)
const currentTabDescription = computed(() => currentTab.value.description)

function goToNext() {
  const index = tabs.findIndex(tab => tab.key === activeTab.value)
  if (index < tabs.length - 1) {
    activeTab.value = tabs[index + 1].key
  }
}

function goToPrevious() {
  const index = tabs.findIndex(tab => tab.key === activeTab.value)
  if (index > 0) {
    activeTab.value = tabs[index - 1].key
  }
}

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

function formatArray(value: unknown) {
  if (!Array.isArray(value) || !value.length) return ''
  return value.join(', ')
}

function getSectionCount(section: TabKey) {
  switch (section) {
    case 'tablero':
      return countFilled([
        local.tableroTipo,
        local.tableroTipoOtros,
        local.ubicacion,
        local.ubicacionOtros,
        local.tipoTablero,
        local.tipoTableroOtros,
        local.dimensiones,
        local.voltaje,
        local.voltajeOtros,
      ])
    case 'automatizacion':
      return countFilled([
        local.sistema,
        local.sistemaOtros,
        local.controlador,
        local.controladorOtros,
        local.cantidadSenales,
        local.tipoComunicacion,
        local.tipoComunicacionOtro,
        local.sensores,
        local.anotacionesTablero,
      ])
    case 'tuberia':
      return countFilled([
        local.tipoTubo,
        local.tipoTuboOtros,
        local.medidaTubo,
        local.medidaTuboOtros,
        local.cantidadTubos,
        local.conduitLR,
        local.conduitLL,
        local.conduitLB,
        local.conduitT,
        local.accesorios,
        local.alturaInstalacion,
      ])
    case 'cableado':
      return countFilled([
        local.calibre,
        local.calibreOtros,
        local.metrosCable,
        local.colorCable,
        local.colorCableOtros,
      ])
    case 'operativo':
      return countFilled([
        local.plataforma,
        local.anotacionesElectricas,
        local.descripcionFuncional,
      ])
    case 'evidencia':
      return local.imagenes.length
    default:
      return 0
  }
}

function countFilled(values: unknown[]) {
  return values.reduce((total, value) => {
    if (Array.isArray(value)) return total + (value.length ? 1 : 0)
    return total + (String(value ?? '').trim() ? 1 : 0)
  }, 0)
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
