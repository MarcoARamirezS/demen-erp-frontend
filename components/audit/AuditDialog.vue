<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <header
        class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <div class="flex min-w-0 items-start gap-4">
          <div class="shrink-0 rounded-full bg-primary/10 p-3">
            <Icon name="shield" />
          </div>

          <div class="min-w-0">
            <h2 class="flex flex-wrap items-center gap-2 text-lg font-semibold text-base-content">
              <span
                class="badge badge-outline badge-sm font-mono"
                :class="actionTone(model?.action)"
              >
                {{ model?.actionLabel || model?.action || 'Sin acción' }}
              </span>

              <span class="truncate text-base-content/70">
                {{ model?.resourceLabel || model?.resource || 'Recurso no disponible' }}
              </span>
            </h2>

            <p class="truncate text-xs text-base-content/60">
              {{ model?.createdAt ? formatDateTime(model.createdAt) : 'Fecha no disponible' }}
              <span v-if="model?.id" class="font-mono"> · {{ model.id }}</span>
            </p>
          </div>
        </div>

        <button class="btn btn-circle btn-sm btn-ghost shrink-0" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <section class="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <div v-if="loading" class="py-10 text-center text-base-content/70">
          <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
          Cargando detalle…
        </div>

        <div v-else-if="model" class="space-y-6">
          <div
            v-if="missingFields.length"
            class="rounded-2xl border border-warning/25 bg-warning/10 p-4 text-sm"
          >
            <div class="flex items-start gap-3">
              <Icon name="alert-triangle" class="mt-0.5 h-5 w-5 shrink-0 text-warning" />

              <div class="flex-1">
                <p class="font-semibold text-warning">Este registro de auditoría está incompleto</p>

                <ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/80">
                  <li v-for="item in missingFields" :key="item.key">
                    <span class="font-medium">{{ item.label }}:</span>
                    {{ item.message }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <section class="space-y-3">
            <h3 class="flex items-center gap-2 font-semibold text-primary">
              <Icon name="info" size="sm" />
              Qué ocurrió
            </h3>

            <div class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
              <p class="text-base font-semibold text-base-content">
                {{ mainDescription }}
              </p>

              <div
                v-if="model.entityLabel || showDistinctResourceId"
                class="mt-3 flex flex-wrap gap-2"
              >
                <span v-if="model.entityLabel" class="badge badge-outline">
                  {{ model.entityLabel }}
                </span>

                <span v-if="showDistinctResourceId" class="badge badge-outline font-mono">
                  ID: {{ model.resourceId }}
                </span>
              </div>

              <ul
                v-if="model.highlights?.length"
                class="mt-4 list-disc space-y-1 pl-5 text-sm text-base-content/75"
              >
                <li v-for="(item, index) in model.highlights" :key="`${index}-${item}`">
                  {{ item }}
                </li>
              </ul>
            </div>
          </section>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div
              class="space-y-2 rounded-xl border bg-base-100 p-4 shadow-sm"
              :class="actorCardClass"
            >
              <div class="text-xs uppercase tracking-wide text-base-content/60">Actor</div>

              <div v-if="actorNombre" class="font-medium text-base-content">
                {{ actorNombre }}
              </div>

              <div v-if="actorUsuario" class="text-sm text-base-content/70">
                @{{ actorUsuario }}
              </div>

              <div v-if="actorId" class="break-all text-xs text-base-content/50">
                ID: {{ actorId }}
              </div>

              <div
                v-if="!actorNombre && !actorUsuario && !actorId"
                class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-base-content/75"
              >
                No hay información del actor. El evento pudo haber sido generado por el sistema o el
                dato no fue registrado.
              </div>
            </div>

            <div
              class="space-y-2 rounded-xl border bg-base-100 p-4 shadow-sm"
              :class="resourceCardClass"
            >
              <div class="text-xs uppercase tracking-wide text-base-content/60">Recurso</div>

              <div
                v-if="model.resourceLabel || model.resource"
                class="font-medium text-base-content"
              >
                {{ model.resourceLabel || model.resource }}
              </div>

              <div
                v-if="model.entityLabel"
                class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2 text-sm text-base-content/85"
              >
                {{ model.entityLabel }}
              </div>

              <div
                v-if="showDistinctResourceId"
                class="break-all rounded-lg border border-base-300 bg-base-200/40 px-3 py-2 text-sm font-mono text-base-content/75"
              >
                {{ model.resourceId }}
              </div>

              <div
                v-if="!model.resourceId"
                class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-base-content/75"
              >
                Este registro no incluye un identificador del recurso.
              </div>
            </div>
          </div>

          <section class="space-y-3">
            <h3 class="flex items-center gap-2 font-semibold text-primary">
              <Icon name="clipboard" size="sm" />
              Resumen del evento
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div
                class="space-y-2 rounded-xl border bg-base-100 p-4 shadow-sm"
                :class="simpleFieldClass(!!model.action)"
              >
                <div class="text-xs uppercase tracking-wide text-base-content/60">Acción</div>
                <div v-if="model.action" class="break-words font-medium text-base-content">
                  {{ model.actionLabel || model.action }}
                </div>
                <div
                  v-else
                  class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-base-content/75"
                >
                  No se registró la acción.
                </div>
              </div>

              <div
                class="space-y-2 rounded-xl border bg-base-100 p-4 shadow-sm"
                :class="simpleFieldClass(!!model.resource)"
              >
                <div class="text-xs uppercase tracking-wide text-base-content/60">Recurso</div>
                <div v-if="model.resource" class="break-words font-medium text-base-content">
                  {{ model.resourceLabel || model.resource }}
                </div>
                <div
                  v-else
                  class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-base-content/75"
                >
                  No se registró el recurso.
                </div>
              </div>

              <div
                class="space-y-2 rounded-xl border bg-base-100 p-4 shadow-sm"
                :class="simpleFieldClass(!!model.createdAt)"
              >
                <div class="text-xs uppercase tracking-wide text-base-content/60">Fecha</div>
                <div v-if="model.createdAt" class="break-words font-medium text-base-content">
                  {{ formatDateTime(model.createdAt) }}
                </div>
                <div
                  v-else
                  class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-base-content/75"
                >
                  No se registró la fecha del evento.
                </div>
              </div>
            </div>
          </section>

          <section v-if="computedChanges.length" class="space-y-3">
            <h3 class="flex items-center gap-2 font-semibold text-primary">
              <Icon name="edit" size="sm" />
              Cambios detectados
            </h3>

            <div class="space-y-3">
              <div
                v-for="change in computedChanges"
                :key="change.field"
                class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
              >
                <div class="mb-3 text-sm font-semibold text-base-content">
                  {{ change.label || change.field }}
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="rounded-lg border border-base-300 bg-base-200/40 p-3">
                    <div class="mb-1 text-xs uppercase tracking-wide text-base-content/50">
                      Antes
                    </div>
                    <div class="whitespace-pre-wrap break-words text-sm text-base-content/80">
                      {{ formatValue(change.before) }}
                    </div>
                  </div>

                  <div class="rounded-lg border border-base-300 bg-base-200/40 p-3">
                    <div class="mb-1 text-xs uppercase tracking-wide text-base-content/50">
                      Después
                    </div>
                    <div
                      class="whitespace-pre-wrap break-words text-sm font-medium text-base-content"
                    >
                      {{ formatValue(change.after) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="flex items-center gap-2 font-semibold text-primary">
              <Icon name="code" size="sm" />
              Meta (JSON)
            </h3>

            <div class="max-h-[300px] overflow-auto rounded-xl border p-4" :class="metaBoxClass">
              <template v-if="hasMeta">
                <pre
                  class="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-base-content"
                  >{{ prettyMeta }}</pre
                >
              </template>

              <template v-else>
                <div
                  class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-3 text-sm text-base-content/75"
                >
                  Este registro no contiene metadata adicional.
                </div>
              </template>
            </div>
          </section>
        </div>

        <div v-else class="py-10 text-center text-base-content/70">
          No hay información para mostrar.
        </div>
      </section>

      <footer
        class="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <UiButton variant="outline" @click="open = false">Cerrar</UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { formatDateTime } from '~/utils/dates'
import { useUiStore } from '~/stores/ui.store'
import type { AuditLog, AuditChange } from '~/types/audit'

const ui = useUiStore()

const props = defineProps<{
  modelValue: boolean
  model?: AuditLog | null
  loading?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'close'])

const open = computed({
  get: () => props.modelValue,
  set: v => {
    emit('update:modelValue', v)
    if (!v) emit('close')
  },
})

const actorNombre = computed(() => props.model?.actor?.nombre || null)
const actorUsuario = computed(() => props.model?.actor?.usuario || null)
const actorId = computed(() => props.model?.actor?.id || props.model?.actorUserId || null)

const hasMeta = computed(() => {
  const meta = props.model?.meta
  if (meta === null || meta === undefined) return false
  if (typeof meta === 'object') return Object.keys(meta as Record<string, unknown>).length > 0
  return String(meta).trim().length > 0
})

const prettyMeta = computed(() => {
  try {
    return JSON.stringify(props.model?.meta ?? {}, null, 2)
  } catch {
    return String(props.model?.meta ?? '')
  }
})

const mainDescription = computed(() => {
  return props.model?.description || 'No hay una descripción enriquecida para este evento.'
})

const computedChanges = computed<AuditChange[]>(() => {
  return Array.isArray(props.model?.changes) ? props.model!.changes! : []
})

const showDistinctResourceId = computed(() => {
  const entity = String(props.model?.entityLabel || '').trim()
  const resourceId = String(props.model?.resourceId || '').trim()

  if (!resourceId) return false
  if (!entity) return true

  return entity !== resourceId
})

const missingFields = computed(() => {
  if (!props.model) return []

  const items: Array<{ key: string; label: string; message: string }> = []

  if (!props.model.action) {
    items.push({
      key: 'action',
      label: 'Acción',
      message: 'No se registró la acción ejecutada.',
    })
  }

  if (!props.model.resource) {
    items.push({
      key: 'resource',
      label: 'Recurso',
      message: 'No se registró el recurso afectado.',
    })
  }

  if (!props.model.createdAt) {
    items.push({
      key: 'createdAt',
      label: 'Fecha',
      message: 'No se registró la fecha del evento.',
    })
  }

  if (!props.model.resourceId) {
    items.push({
      key: 'resourceId',
      label: 'Recurso ID',
      message: 'No se registró el identificador del recurso.',
    })
  }

  if (!actorNombre.value && !actorUsuario.value && !actorId.value) {
    items.push({
      key: 'actor',
      label: 'Actor',
      message: 'No hay datos del usuario o proceso que realizó la acción.',
    })
  }

  if (!hasMeta.value) {
    items.push({
      key: 'meta',
      label: 'Meta',
      message: 'No hay metadata adicional disponible.',
    })
  }

  return items
})

const actorCardClass = computed(() =>
  !actorNombre.value && !actorUsuario.value && !actorId.value
    ? 'border-warning/25 bg-warning/5'
    : 'border-base-300'
)

const resourceCardClass = computed(() =>
  !props.model?.resourceId ? 'border-warning/25 bg-warning/5' : 'border-base-300'
)

const metaBoxClass = computed(() =>
  !hasMeta.value ? 'border-warning/25 bg-warning/5' : 'border-base-300 bg-base-200/40'
)

function simpleFieldClass(hasValue: boolean) {
  return hasValue ? 'border-base-300' : 'border-warning/25 bg-warning/5'
}

function formatValue(value: any) {
  if (value === undefined) return 'No registrado'
  if (value === null) return 'Vacío'
  if (value === '') return 'Vacío'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const actionTone = (action?: string) => {
  const value = String(action || '').toLowerCase()

  if (!value) return 'badge-ghost'
  if (value.includes('delete') || value.includes('remove'))
    return 'border-error/30 bg-error/10 text-error'
  if (value.includes('update')) return 'border-warning/30 bg-warning/10 text-warning'
  if (value.includes('create')) return 'border-success/30 bg-success/10 text-success'
  if (value.includes('login') || value.includes('refresh') || value.includes('logout')) {
    return 'border-info/30 bg-info/10 text-info'
  }
  return 'bg-base-200 text-base-content/80'
}

watch(
  () => [props.modelValue, props.model?.id],
  ([isOpen]) => {
    if (!isOpen || !props.model || props.loading) return
    if (!missingFields.value.length) return

    const first = missingFields.value[0]
    ui.showToast('warning', `${first.label}: ${first.message}`)
  },
  { immediate: false }
)
</script>
