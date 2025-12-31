<template>
  <UiDialog v-model="open" size="xl" title="Detalle de auditoría">
    <!-- LOADING -->
    <div v-if="loading" class="p-6 text-center opacity-70">Cargando detalle...</div>

    <!-- CONTENT -->
    <div v-else-if="model" class="space-y-6">
      <!-- HEADER -->
      <div class="flex items-start gap-4 rounded-lg bg-base-200/60 p-4">
        <div class="rounded-full bg-primary/10 p-3">
          <Icon name="shield" />
        </div>

        <div class="min-w-0">
          <h2 class="font-semibold text-lg truncate">{{ model.resource }} · {{ model.action }}</h2>
          <p class="text-sm opacity-60">{{ formatDateTime(model.createdAt) }} · {{ model.id }}</p>
        </div>
      </div>

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

          <div v-if="!actorNombre && !actorUsuario" class="text-sm opacity-60 italic">Sistema</div>
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

      <!-- ACTIONS -->
      <div class="flex justify-end pt-4 border-t">
        <UiButton variant="ghost" @click="open = false"> Cerrar </UiButton>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-else class="p-6 text-center opacity-70">No hay información para mostrar.</div>
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

/* =========================
   ACTOR COMPUTEDS
========================= */
const actorNombre = computed(() => props.model?.actor?.nombre || null)
const actorUsuario = computed(() => props.model?.actor?.usuario || null)
const actorId = computed(() => props.model?.actor?.id || props.model?.actorUserId || null)

/* =========================
   META
========================= */
const prettyMeta = computed(() => {
  try {
    return JSON.stringify(props.model?.meta ?? {}, null, 2)
  } catch {
    return String(props.model?.meta ?? '')
  }
})
</script>
