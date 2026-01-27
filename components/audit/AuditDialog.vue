<template>
  <UiDialog v-model="open" size="xl">
    <div class="flex flex-col max-h-[85vh]">
      <!-- =========================
           HEADER (FULL WIDTH + CLOSE)
      ========================== -->
      <div class="sticky top-0 z-20 -mx-6 bg-base-200 border-b border-base-300 shadow-sm">
        <div class="flex items-start gap-4 px-6 py-4">
          <!-- ICON -->
          <div class="rounded-full bg-primary/15 p-3 shrink-0">
            <Icon :name="headerIcon" />
          </div>

          <!-- TITLE -->
          <div class="min-w-0 flex-1">
            <h2 class="font-semibold text-lg truncate">
              {{ model?.resource }} · {{ model?.action }}
            </h2>

            <p class="text-sm opacity-70">
              {{ formatDateTime(model?.createdAt) }}
            </p>

            <p class="text-xs opacity-50 font-mono break-all">
              {{ model?.id }}
            </p>
          </div>

          <!-- CLOSE BUTTON -->
          <button
            class="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:bg-base-300 shrink-0"
            aria-label="Cerrar"
            @click="open = false"
          >
            <Icon name="close" />
          </button>
        </div>
      </div>

      <!-- =========================
           CONTENT (SCROLL)
      ========================== -->
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        <div v-if="loading" class="py-10 text-center opacity-70">Cargando detalle...</div>

        <div v-else-if="model" class="space-y-6">
          <!-- GRID -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="rounded-xl border border-base-300 bg-base-100 p-4 space-y-1">
              <div class="text-xs uppercase opacity-60">Actor</div>

              <div v-if="actorNombre" class="font-medium">
                {{ actorNombre }}
              </div>

              <div v-if="actorUsuario" class="text-sm opacity-70">@{{ actorUsuario }}</div>

              <div v-if="actorId" class="text-xs opacity-50 break-all">ID: {{ actorId }}</div>

              <div v-if="!actorNombre && !actorUsuario" class="text-sm opacity-60 italic">
                Sistema
              </div>
            </div>

            <div class="rounded-xl border border-base-300 bg-base-100 p-4">
              <div class="text-xs uppercase opacity-60 mb-1">Recurso ID</div>

              <div class="font-medium break-all">
                {{ model.resourceId || '—' }}
              </div>
            </div>
          </div>

          <!-- META -->
          <section class="space-y-2">
            <h3 class="font-semibold text-primary flex items-center gap-2">
              <Icon name="code" size="sm" />
              Meta (JSON)
            </h3>

            <div class="rounded-xl border border-base-300 bg-base-100 p-4">
              <pre class="text-xs whitespace-pre-wrap break-words"
                >{{ prettyMeta }}
              </pre>
            </div>
          </section>
        </div>

        <div v-else class="py-10 text-center opacity-70">No hay información para mostrar.</div>
      </div>

      <!-- =========================
           FOOTER (FULL WIDTH)
      ========================== -->
      <div class="sticky bottom-0 z-20 -mx-6 bg-base-200 border-t border-base-300 shadow-inner">
        <div class="flex justify-end px-6 py-4">
          <UiButton variant="ghost" @click="open = false"> Cerrar </UiButton>
        </div>
      </div>
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

const headerIcon = computed(() => (props.model?.resource === 'auth' ? 'lock' : 'clipboard'))
</script>
