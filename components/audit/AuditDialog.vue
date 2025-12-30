<!-- ~/components/audit/AuditDialog.vue -->
<template>
  <UiDialog v-model="open" size="xl" title="Detalle de auditoría">
    <div v-if="loading" class="p-6 text-center opacity-70">Cargando detalle...</div>

    <div v-else-if="model" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start gap-4 rounded-lg bg-base-200/60 p-4">
        <div class="rounded-full bg-primary/10 p-3">
          <Icon name="shield" />
        </div>
        <div class="min-w-0">
          <h2 class="font-semibold text-lg">{{ model.resource }} · {{ model.action }}</h2>
          <p class="text-sm text-base-content/60">{{ dateLabel }} · ID: {{ model.id }}</p>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="rounded-xl border border-base-300 bg-base-100 p-4">
          <div class="text-xs uppercase opacity-60 mb-2">Actor</div>
          <div class="font-medium">{{ model.actorUserId || 'Sistema' }}</div>
        </div>

        <div class="rounded-xl border border-base-300 bg-base-100 p-4">
          <div class="text-xs uppercase opacity-60 mb-2">Recurso ID</div>
          <div class="font-medium">{{ model.resourceId || '—' }}</div>
        </div>

        <div class="rounded-xl border border-base-300 bg-base-100 p-4">
          <div class="text-xs uppercase opacity-60 mb-2">Recurso</div>
          <div class="font-medium">{{ model.resource }}</div>
        </div>

        <div class="rounded-xl border border-base-300 bg-base-100 p-4">
          <div class="text-xs uppercase opacity-60 mb-2">Acción</div>
          <div class="font-medium">{{ model.action }}</div>
        </div>
      </div>

      <!-- Meta -->
      <section class="space-y-2">
        <h3 class="font-semibold text-primary flex items-center gap-2">
          <Icon name="code" size="sm" />
          Meta (JSON)
        </h3>

        <div class="rounded-xl border border-base-300 bg-base-100 p-4">
          <pre class="text-xs whitespace-pre-wrap break-words">{{ prettyMeta }}</pre>
        </div>
      </section>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <UiButton variant="ghost" type="button" @click="open = false">Cerrar</UiButton>
      </div>
    </div>

    <div v-else class="p-6 text-center opacity-70">No hay información para mostrar.</div>
  </UiDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AuditLog } from '~/types/audit'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { formatDateTime } from '~/utils/dates'

const props = defineProps<{
  modelValue: boolean
  model?: AuditLog | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: v => {
    emit('update:modelValue', v)
    if (!v) emit('close')
  },
})

const dateLabel = computed(() => formatDateTime(props.model?.createdAt))

const prettyMeta = computed(() => {
  const m = props.model?.meta ?? {}
  try {
    return JSON.stringify(m, null, 2)
  } catch {
    return String(m)
  }
})
</script>
