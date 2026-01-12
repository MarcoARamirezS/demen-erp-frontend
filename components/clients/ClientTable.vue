<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useClientsStore } from '~/stores/clients.store'
import { useAuthStore } from '~/stores/auth.store'
import Icon from '~/components/ui/Icon.vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiInput from '~/components/ui/UiInput.vue'

const clientsStore = useClientsStore()
const auth = useAuthStore()

/* =========================
   FILTERS / STATE
========================= */
const search = ref('')
const itemsPerPage = ref(10)

/* =========================
   FETCH
========================= */
onMounted(() => {
  clientsStore.fetch(itemsPerPage.value)
})

/* =========================
   COMPUTED
========================= */
const filteredItems = computed(() => {
  if (!search.value) return clientsStore.items

  const q = search.value.toLowerCase()
  return clientsStore.items.filter(c =>
    [c.razonSocial, c.nombreComercial, c.rfc]
      .filter(Boolean)
      .some(v => v!.toLowerCase().includes(q))
  )
})

/* =========================
   ACTIONS
========================= */
function goToClient(id: string) {
  navigateTo(`/clients/${id}`)
}

function reload() {
  clientsStore.fetch(itemsPerPage.value)
}
</script>

<template>
  <div class="animate-fadeIn rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg">
    <!-- =========================
         HEADER / FILTERS
    ========================== -->
    <div
      class="mb-4 flex flex-col gap-3 rounded-lg bg-gradient-to-r from-base-200 to-base-100 p-3 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <!-- Buscador -->
          <div class="flex flex-1 items-center gap-3">
            <UiInput
              v-model="search"
              size="xl"
              class="flex-1 max-w-3xl"
              placeholder="Buscar cliente por razón social o RFC"
              icon="search"
            />

            <UiButton size="md" variant="outline" class="shrink-0" @click="reload">
              <Icon name="refresh" size="md" />
            </UiButton>
          </div>

          <!-- Selector -->
          <div class="flex items-center gap-2 text-sm shrink-0">
            <span class="text-base-content/60">Mostrar</span>
            <select
              v-model="itemsPerPage"
              class="select select-md select-bordered"
              @change="reload"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================
         DESKTOP TABLE
    ========================== -->
    <div class="hidden md:block overflow-x-auto">
      <table class="table w-full">
        <thead class="bg-base-200 text-xs uppercase text-base-content/70">
          <tr>
            <th>Razón social</th>
            <th>RFC</th>
            <th>Email</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading -->
          <tr v-if="clientsStore.loading">
            <td colspan="5" class="py-8 text-center text-base-content/50">Cargando clientes…</td>
          </tr>

          <!-- Empty -->
          <tr v-else-if="!filteredItems.length">
            <td colspan="5" class="py-8 text-center text-base-content/50">
              No se encontraron clientes
            </td>
          </tr>

          <!-- Rows -->
          <tr v-for="c in filteredItems" :key="c.id" class="hover:bg-base-200 transition">
            <td class="font-medium">
              {{ c.razonSocial }}
              <div v-if="c.nombreComercial" class="text-xs text-base-content/60">
                {{ c.nombreComercial }}
              </div>
            </td>

            <td>{{ c.rfc || '—' }}</td>
            <td>{{ c.email || '—' }}</td>

            <td>
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                :class="c.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="c.activo ? 'bg-green-500' : 'bg-red-500'"
                />
                {{ c.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="text-right">
              <div class="flex justify-end gap-2">
                <UiButton
                  size="xs"
                  variant="ghost"
                  data-tip="Ver detalle"
                  @click="goToClient(c.id)"
                >
                  <Icon name="eye" size="sm" />
                </UiButton>

                <UiButton
                  v-if="auth.hasPermission('clients:update')"
                  size="xs"
                  variant="ghost"
                  data-tip="Editar"
                  @click="goToClient(c.id)"
                >
                  <Icon name="edit" size="sm" />
                </UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =========================
         MOBILE CARDS
    ========================== -->
    <div class="md:hidden space-y-3">
      <div
        v-for="c in filteredItems"
        :key="c.id"
        class="rounded-xl border border-base-300 bg-base-200 p-4 shadow-sm"
      >
        <div class="font-semibold">{{ c.razonSocial }}</div>
        <div class="text-xs text-base-content/60 mb-2">
          {{ c.rfc || 'Sin RFC' }}
        </div>

        <div class="flex justify-between items-center">
          <span class="badge" :class="c.activo ? 'badge-success' : 'badge-error'">
            {{ c.activo ? 'Activo' : 'Inactivo' }}
          </span>

          <UiButton size="xs" variant="primary" @click="goToClient(c.id)"> Ver </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
