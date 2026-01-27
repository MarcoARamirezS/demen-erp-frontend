<template>
  <div class="space-y-6">
    <!-- =========================
         HEADER CARD
    ========================== -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-5"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Auditoría</h1>
          <p class="text-sm opacity-70">Trazabilidad de acciones del sistema</p>
        </div>

        <ClientOnly>
          <UiButton
            icon="refresh"
            variant="outline"
            size="sm"
            :disabled="store.loading"
            @click="refresh"
          >
            Recargar
          </UiButton>
        </ClientOnly>
      </div>
    </div>

    <!-- =========================
         TABLE / CARDS
    ========================== -->
    <AuditTable
      :items="store.items"
      :loading="store.loading"
      :can-read="canRead"
      @view="openView"
    />

    <!-- =========================
         DIALOG
    ========================== -->
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
    ui.showToast('warning', 'No tienes permiso para ver Auditoría')
    return
  }
  await store.fetch()
})

async function refresh() {
  if (!canList.value) return
  await store.fetch()
  ui.showToast('success', 'Auditoría actualizada')
}

async function openView(id: string) {
  if (!canRead.value) {
    ui.showToast('warning', 'No tienes permiso para ver detalle')
    return
  }
  await store.get(id)
  dialogOpen.value = true
}
</script>
