<template>
  <div class="space-y-6">
    <!-- =========================
    HEADER CARD
    ========================== -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Familias de productos</h1>
          <p class="text-sm opacity-60">Catálogo maestro de clasificación</p>
        </div>

        <ClientOnly>
          <UiButton
            v-if="auth.hasPermission('product_families:create')"
            icon="plus"
            variant="primary"
            @click="openCreate"
          >
            Nueva familia
          </UiButton>
        </ClientOnly>
      </div>
    </div>

    <!-- =========================
    TABLE CARD
    ========================== -->
    <div
      class="animate-fadeIn space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg"
    >
      <!-- =========================
      FILTERS
      ========================== -->
      <div
        class="flex flex-wrap items-center gap-3 rounded-xl border border-base-300 bg-gradient-to-b from-base-200 to-base-100 p-4"
      >
        <div class="relative">
          <Icon name="search" class="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
          <input
            v-model="search"
            class="input input-sm input-bordered w-40 md:w-56 pl-9"
            placeholder="Buscar familia..."
          />
        </div>

        <button class="btn btn-sm btn-outline" @click="resetFilters">
          <Icon name="x-circle" class="h-4 w-4 mr-1" />
          Limpiar
        </button>
      </div>

      <!-- =========================
      TABLE DESKTOP
      ========================== -->
      <div class="overflow-x-auto rounded-xl border border-base-300">
        <table class="table w-full text-sm">
          <thead class="bg-base-200 text-xs uppercase tracking-wider">
            <tr>
              <th>Nombre</th>
              <th class="text-right w-[100px]">Acciones</th>
            </tr>
          </thead>

          <!-- LOADING -->
          <tbody v-if="store.loading">
            <tr v-for="i in 5" :key="i">
              <td colspan="2">
                <div class="h-10 w-full animate-pulse rounded bg-base-200"></div>
              </td>
            </tr>
          </tbody>

          <!-- DATA -->
          <tbody v-else-if="filtered.length">
            <tr
              v-for="f in filtered"
              :key="f.id"
              class="border-b border-base-200 hover:bg-base-200/40 transition"
            >
              <td>
                <div class="flex items-center gap-3">
                  <div
                    class="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold"
                  >
                    {{ f.name?.charAt(0) || '?' }}
                  </div>

                  <div class="font-semibold truncate max-w-[300px]">
                    {{ f.name }}
                  </div>
                </div>
              </td>

              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <div class="tooltip" data-tip="Editar">
                    <button
                      class="btn btn-circle btn-sm btn-ghost text-primary"
                      @click="openEdit(f)"
                    >
                      <Icon name="edit" />
                    </button>
                  </div>

                  <div class="tooltip" data-tip="Eliminar">
                    <button
                      class="btn btn-circle btn-sm btn-ghost text-error"
                      @click="confirmDelete(f)"
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- EMPTY -->
          <tbody v-else>
            <tr>
              <td colspan="2" class="p-6 text-center opacity-70">No hay familias registradas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- =========================
      MOBILE CARDS
      ========================== -->
      <div class="md:hidden space-y-3">
        <div
          v-for="f in filtered"
          :key="f.id"
          class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <div
              class="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold"
            >
              {{ f.name?.charAt(0) || '?' }}
            </div>

            <div class="font-medium">
              {{ f.name }}
            </div>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-circle btn-sm btn-ghost" @click="openEdit(f)">
              <Icon name="edit" />
            </button>

            <button class="btn btn-circle btn-sm btn-ghost text-error" @click="confirmDelete(f)">
              <Icon name="trash" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================
    DIALOG
    ========================== -->
    <ClientOnly>
      <ProductFamilyDialog
        v-if="dialogOpen"
        v-model="dialogOpen"
        :mode="dialogMode"
        :model="selected"
        @submit="handleSubmit"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

import ProductFamilyDialog from '~/components/product-families/ProductFamilyDialog.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'product_families:list',
})

const store = useProductFamiliesStore()
const auth = useAuthStore()
const ui = useUiStore()

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<any | null>(null)

const search = ref('')

const filtered = computed(() => {
  if (!search.value) return store.items

  return store.items.filter(f => f.name.toLowerCase().includes(search.value.toLowerCase()))
})

function resetFilters() {
  search.value = ''
}

onMounted(() => {
  store.fetch()
})

function openCreate() {
  dialogMode.value = 'create'
  selected.value = null
  dialogOpen.value = true
}

function openEdit(item: any) {
  dialogMode.value = 'edit'
  selected.value = item
  dialogOpen.value = true
}

function confirmDelete(item: any) {
  ui.confirm({
    title: 'Eliminar familia',
    message: `¿Eliminar la familia "${item.name}"?`,
    variant: 'danger',
    onConfirm: async () => {
      await store.remove(item.id)
      ui.showToast('success', 'Familia eliminada')
    },
  })
}

async function handleSubmit(payload: any) {
  if (dialogMode.value === 'create') {
    await store.create(payload)
  } else if (selected.value) {
    await store.update(selected.value.id, payload)
  }
  dialogOpen.value = false
}
</script>
