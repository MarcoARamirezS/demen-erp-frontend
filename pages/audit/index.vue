<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold">Auditoría</h1>
        <p class="text-sm opacity-60">Trazabilidad de acciones del sistema</p>
      </div>

      <ClientOnly>
        <UiButton
          icon="refresh-cw"
          variant="ghost"
          size="sm"
          :disabled="store.loading"
          @click="refresh"
        >
          Recargar
        </UiButton>
      </ClientOnly>
    </div>

    <AuditTable
      :items="store.items"
      :loading="store.loading"
      :can-read="canRead"
      :has-more="store.hasMore"
      @view="openView"
      @load-more="loadMore"
      @refresh="refresh"
    />

    <ClientOnly>
      <AuditDialog
        v-model="dialogOpen"
        :loading="store.loadingOne"
        :model="store.selected"
        @close="store.clearSelected()"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuditStore } from '~/stores/audit.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import AuditTable from '~/components/audit/AuditTable.vue'
import AuditDialog from '~/components/audit/AuditDialog.vue'

definePageMeta({ layout: 'default', middleware: 'auth' })

const store = useAuditStore()
const auth = useAuthStore()
const ui = useUiStore()

const dialogOpen = ref(false)

const canList = computed(() => auth.hasPermission('audit:list'))
const canRead = computed(() => auth.hasPermission('audit:read'))

onMounted(async () => {
  if (!canList.value) {
    ui.showToast('warning', 'No tienes permiso para ver Auditoría (audit:list)')
    return
  }
  await store.fetch()
})

async function refresh() {
  if (!canList.value) return
  await store.fetch()
  ui.showToast('success', 'Auditoría actualizada')
}

async function loadMore() {
  if (!canList.value) return
  await store.fetchMore()
}

async function openView(id: string) {
  if (!canRead.value) {
    ui.showToast('warning', 'No tienes permiso para ver detalle (audit:read)')
    return
  }
  await store.get(id)
  dialogOpen.value = true
}
</script>
