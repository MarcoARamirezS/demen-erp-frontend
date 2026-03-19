<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- =====================================================
           HEADER
      ====================================================== -->
      <header
        class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <div class="flex min-w-0 items-start gap-4">
          <div class="shrink-0 rounded-full bg-primary/10 p-3">
            <Icon name="shield" />
          </div>

          <div class="min-w-0">
            <h2 class="flex items-center gap-2 text-lg font-semibold">
              <span
                class="badge badge-outline badge-sm font-mono"
                :class="actionTone(model?.action)"
              >
                {{ model?.action || 'sin acción' }}
              </span>

              <span class="truncate opacity-70">
                {{ model?.resource || 'recurso no disponible' }}
              </span>
            </h2>

            <p class="truncate text-xs opacity-60">
              {{ model?.createdAt ? formatDateTime(model.createdAt) : 'Fecha no disponible' }}
              <span v-if="model?.id" class="font-mono"> · {{ model.id }}</span>
            </p>
          </div>
        </div>

        <button class="btn btn-circle btn-sm btn-ghost shrink-0" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- =====================================================
           CONTENT
      ====================================================== -->
      <section class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <!-- LOADING -->
        <div v-if="loading" class="py-10 text-center opacity-70">
          <span class="loading loading-spinner loading-md mr-2 align-middle"></span>
          Cargando detalle…
        </div>

        <!-- DATA -->
        <div v-else-if="model" class="space-y-6">
          <!-- ALERTA RESUMEN -->
          <div
            v-if="missingFields.length"
            class="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm"
          >
            <div class="flex items-start gap-3">
              <Icon name="alert-triangle" class="mt-0.5 h-5 w-5 text-warning" />

              <div class="flex-1">
                <p class="font-semibold text-warning-content">
                  Este registro de auditoría está incompleto
                </p>

                <ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/80">
                  <li v-for="item in missingFields" :key="item.key">
                    <span class="font-medium">{{ item.label }}:</span>
                    {{ item.message }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- =========================
               CARDS INFO
          ========================== -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- ACTOR -->
            <div
              class="rounded-xl border bg-base-100 p-4 shadow-sm space-y-2"
              :class="actorCardClass"
            >
              <div class="text-xs uppercase tracking-wide opacity-60">Actor</div>

              <div v-if="actorNombre" class="font-medium">
                {{ actorNombre }}
              </div>

              <div v-if="actorUsuario" class="text-sm opacity-70">@{{ actorUsuario }}</div>

              <div v-if="actorId" class="break-all text-xs opacity-50">ID: {{ actorId }}</div>

              <div
                v-if="!actorNombre && !actorUsuario && !actorId"
                class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning-content"
              >
                No hay información del actor. El evento pudo haber sido generado por el sistema o el
                dato no fue registrado.
              </div>
            </div>

            <!-- RESOURCE -->
            <div
              class="rounded-xl border bg-base-100 p-4 shadow-sm space-y-2"
              :class="resourceCardClass"
            >
              <div class="text-xs uppercase tracking-wide opacity-60">Recurso ID</div>

              <div v-if="model.resourceId" class="break-all font-medium">
                {{ model.resourceId }}
              </div>

              <div
                v-else
                class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning-content"
              >
                Este registro no incluye un identificador del recurso.
              </div>
            </div>
          </div>

          <!-- =========================
               INFO GENERAL
          ========================== -->
          <section class="space-y-3">
            <h3 class="flex items-center gap-2 font-semibold text-primary">
              <Icon name="info" size="sm" />
              Resumen del evento
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div
                class="rounded-xl border bg-base-100 p-4 shadow-sm space-y-2"
                :class="simpleFieldClass(!!model.action)"
              >
                <div class="text-xs uppercase tracking-wide opacity-60">Acción</div>
                <div v-if="model.action" class="font-medium break-words">{{ model.action }}</div>
                <div
                  v-else
                  class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning-content"
                >
                  No se registró la acción.
                </div>
              </div>

              <div
                class="rounded-xl border bg-base-100 p-4 shadow-sm space-y-2"
                :class="simpleFieldClass(!!model.resource)"
              >
                <div class="text-xs uppercase tracking-wide opacity-60">Recurso</div>
                <div v-if="model.resource" class="font-medium break-words">
                  {{ model.resource }}
                </div>
                <div
                  v-else
                  class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning-content"
                >
                  No se registró el recurso.
                </div>
              </div>

              <div
                class="rounded-xl border bg-base-100 p-4 shadow-sm space-y-2"
                :class="simpleFieldClass(!!model.createdAt)"
              >
                <div class="text-xs uppercase tracking-wide opacity-60">Fecha</div>
                <div v-if="model.createdAt" class="font-medium break-words">
                  {{ formatDateTime(model.createdAt) }}
                </div>
                <div
                  v-else
                  class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning-content"
                >
                  No se registró la fecha del evento.
                </div>
              </div>
            </div>
          </section>

          <!-- =========================
               META JSON
          ========================== -->
          <section class="space-y-3">
            <h3 class="font-semibold text-primary flex items-center gap-2">
              <Icon name="code" size="sm" />
              Meta (JSON)
            </h3>

            <div class="rounded-xl border p-4 overflow-auto max-h-[300px]" :class="metaBoxClass">
              <template v-if="hasMeta">
                <pre
                  class="text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words"
                  >{{ prettyMeta }}</pre
                >
              </template>

              <template v-else>
                <div
                  class="rounded-lg border border-warning/20 bg-warning/10 px-3 py-3 text-sm text-warning-content"
                >
                  Este registro no contiene metadata adicional.
                </div>
              </template>
            </div>
          </section>
        </div>

        <!-- EMPTY -->
        <div v-else class="py-10 text-center opacity-70">No hay información para mostrar.</div>
      </section>

      <!-- =====================================================
           FOOTER
      ====================================================== -->
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
import type { AuditLog } from '~/types/audit'

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
    ? 'border-warning/30 bg-warning/5'
    : 'border-base-300'
)

const resourceCardClass = computed(() =>
  !props.model?.resourceId ? 'border-warning/30 bg-warning/5' : 'border-base-300'
)

const metaBoxClass = computed(() =>
  !hasMeta.value ? 'border-warning/30 bg-warning/5' : 'border-base-300 bg-base-200/40'
)

function simpleFieldClass(hasValue: boolean) {
  return hasValue ? 'border-base-300' : 'border-warning/30 bg-warning/5'
}

const actionTone = (action?: string) => {
  if (!action) return 'badge-ghost'
  if (action.includes('delete')) return 'bg-error/15 text-error'
  if (action.includes('update')) return 'bg-warning/15 text-warning'
  if (action.includes('create')) return 'bg-success/15 text-success'
  if (action.includes('login')) return 'bg-info/15 text-info'
  return 'bg-base-200'
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
