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
        <div class="flex items-start gap-4 min-w-0">
          <div class="rounded-full bg-primary/10 p-3 shrink-0">
            <Icon name="shield" />
          </div>

          <div class="min-w-0">
            <h2 class="font-semibold text-lg flex items-center gap-2">
              <span
                class="badge badge-outline badge-sm font-mono"
                :class="actionTone(model?.action)"
              >
                {{ model?.action }}
              </span>

              <span class="opacity-70 truncate">
                {{ model?.resource }}
              </span>
            </h2>

            <p class="text-xs opacity-60 truncate">
              {{ model ? formatDateTime(model.createdAt) : '' }}
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
          <!-- =========================
               CARDS INFO
          ========================== -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- ACTOR -->
            <div class="rounded-xl border border-base-300 bg-base-100 p-4 space-y-2 shadow-sm">
              <div class="text-xs uppercase tracking-wide opacity-60">Actor</div>

              <div v-if="actorNombre" class="font-medium">
                {{ actorNombre }}
              </div>

              <div v-if="actorUsuario" class="text-sm opacity-70">@{{ actorUsuario }}</div>

              <div v-if="actorId" class="text-xs opacity-50 break-all">ID: {{ actorId }}</div>

              <div v-if="!actorNombre && !actorUsuario" class="text-sm opacity-60 italic">
                Sistema
              </div>
            </div>

            <!-- RESOURCE -->
            <div class="rounded-xl border border-base-300 bg-base-100 p-4 space-y-2 shadow-sm">
              <div class="text-xs uppercase tracking-wide opacity-60">Recurso ID</div>

              <div class="font-medium break-all">
                {{ model.resourceId || '—' }}
              </div>
            </div>
          </div>

          <!-- =========================
               META JSON
          ========================== -->
          <section class="space-y-3">
            <h3 class="font-semibold text-primary flex items-center gap-2">
              <Icon name="code" size="sm" />
              Meta (JSON)
            </h3>

            <div
              class="rounded-xl border border-base-300 bg-base-200/40 p-4 overflow-auto max-h-[300px]"
            >
              <pre class="text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words">{{
                prettyMeta
              }}</pre>
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
        <UiButton variant="outline" @click="open = false"> Cerrar </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { formatDateTime } from '~/utils/dates'
import type { AuditLog } from '~/types/audit'

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

const prettyMeta = computed(() => {
  try {
    return JSON.stringify(props.model?.meta ?? {}, null, 2)
  } catch {
    return String(props.model?.meta ?? '')
  }
})

const actionTone = (action?: string) => {
  if (!action) return 'badge-ghost'
  if (action.includes('delete')) return 'bg-error/15 text-error'
  if (action.includes('update')) return 'bg-warning/15 text-warning'
  if (action.includes('create')) return 'bg-success/15 text-success'
  if (action.includes('login')) return 'bg-info/15 text-info'
  return 'bg-base-200'
}
</script>
