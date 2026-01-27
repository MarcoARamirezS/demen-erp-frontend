<template>
  <UiDialog v-model="open" size="xl" :hide-close="true" class="max-h-[90vh]">
    <!-- =========================
         HEADER (STICKY)
    ========================== -->
    <header
      class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-base-300 bg-base-200 px-5 py-4"
    >
      <div class="flex items-start gap-4 min-w-0">
        <div class="rounded-full bg-primary/10 p-3 shrink-0">
          <Icon :name="headerIcon" />
        </div>

        <div class="min-w-0">
          <h2 class="font-semibold text-base truncate">
            {{ model?.resource }} · {{ model?.action }}
          </h2>
          <p class="text-xs opacity-60">
            {{ model ? formatDateTime(model.createdAt) : '' }}
          </p>
          <p class="text-[10px] opacity-40 font-mono truncate">
            {{ model?.id }}
          </p>
        </div>
      </div>

      <!-- CLOSE -->
      <button class="btn btn-sm btn-circle btn-ghost" @click="open = false" aria-label="Cerrar">
        <Icon name="close" />
      </button>
    </header>

    <!-- =========================
         CONTENT (SCROLL)
    ========================== -->
    <section class="overflow-y-auto px-5 py-6 space-y-6 max-h-[calc(90vh-160px)]">
      <!-- LOADING -->
      <div v-if="loading" class="text-center opacity-70 py-10">Cargando detalle…</div>

      <!-- CONTENT -->
      <template v-else-if="model">
        <!-- GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- ACTOR -->
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

          <!-- RESOURCE ID -->
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
      </template>

      <!-- EMPTY -->
      <div v-else class="text-center opacity-70 py-10">No hay información para mostrar.</div>
    </section>

    <!-- =========================
         FOOTER (STICKY)
    ========================== -->
    <footer
      class="sticky bottom-0 z-10 flex justify-end border-t border-base-300 bg-base-200 px-5 py-4"
    >
      <UiButton variant="outline" @click="open = false"> Cerrar </UiButton>
    </footer>
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
