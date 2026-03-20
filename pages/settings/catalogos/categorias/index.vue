<template>
  <div class="space-y-6">
    <!-- =========================
    HEADER CARD
    ========================== -->
    <div
      class="rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100 p-6"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Categorías de productos</h1>
          <p class="text-sm opacity-60">Catálogo dependiente de familias</p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <UiSelect
            v-model="selectedFamilyId"
            size="sm"
            class="min-w-[240px]"
            placeholder="Selecciona una familia"
            :options="familyOptions"
          />

          <ClientOnly>
            <UiButton
              v-if="auth.hasPermission('product_categories:create')"
              icon="plus"
              variant="primary"
              @click="openCreate"
            >
              Nueva categoría
            </UiButton>
          </ClientOnly>
        </div>
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
            class="input input-sm input-bordered w-40 pl-9 md:w-56"
            placeholder="Buscar categoría..."
          />
        </div>

        <button class="btn btn-sm btn-outline" @click="resetFilters">
          <Icon name="x-circle" class="mr-1 h-4 w-4" />
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
              <th class="hidden md:table-cell">Familia</th>
              <th class="w-[100px] text-right">Acciones</th>
            </tr>
          </thead>

          <!-- LOADING -->
          <tbody v-if="categoriesStore.loading">
            <tr v-for="i in 5" :key="i">
              <td colspan="3">
                <div class="h-10 w-full animate-pulse rounded bg-base-200"></div>
              </td>
            </tr>
          </tbody>

          <!-- DATA -->
          <tbody v-else-if="filtered.length">
            <tr
              v-for="c in filtered"
              :key="c.id"
              class="border-b border-base-200 transition hover:bg-base-200/40"
            >
              <td>
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                  >
                    {{ c.name?.charAt(0) || '?' }}
                  </div>

                  <div class="max-w-[320px] truncate font-semibold">
                    {{ c.name }}
                  </div>
                </div>
              </td>

              <td class="hidden md:table-cell">
                <span
                  class="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {{ familyName(c.familyId) || 'Sin familia' }}
                </span>
              </td>

              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <div class="tooltip" data-tip="Editar">
                    <button
                      class="btn btn-circle btn-sm btn-ghost text-primary"
                      @click="openEdit(c)"
                    >
                      <Icon name="edit" />
                    </button>
                  </div>

                  <div class="tooltip" data-tip="Eliminar">
                    <button
                      class="btn btn-circle btn-sm btn-ghost text-error"
                      @click="confirmDelete(c)"
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
              <td colspan="3" class="p-10 text-center opacity-60">No hay categorías registradas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- =========================
      MOBILE CARDS
      ========================== -->
      <div class="space-y-3 md:hidden">
        <div
          v-for="c in filtered"
          :key="c.id"
          class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
              >
                {{ c.name?.charAt(0) || '?' }}
              </div>

              <div class="min-w-0">
                <div class="truncate font-medium">{{ c.name }}</div>
                <div class="mt-1 text-xs opacity-60">
                  {{ familyName(c.familyId) || 'Sin familia' }}
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <button class="btn btn-circle btn-sm btn-ghost" @click="openEdit(c)">
                <Icon name="edit" />
              </button>

              <button class="btn btn-circle btn-sm btn-ghost text-error" @click="confirmDelete(c)">
                <Icon name="trash" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="!categoriesStore.loading && !filtered.length" class="p-6 text-center opacity-60">
          No hay categorías registradas
        </div>
      </div>
    </div>

    <!-- =========================
    DIALOG
    ========================== -->
    <ClientOnly>
      <ProductCategoryDialog
        v-if="dialogOpen"
        v-model="dialogOpen"
        :mode="dialogMode"
        :model="selected"
        :family-id="selectedFamilyId"
        @submit="handleSubmit"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'
import { useProductCategoriesStore } from '~/stores/productCategories.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
import ProductCategoryDialog from '~/components/product-categories/ProductCategoryDialog.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'permission'],
  permission: 'product_categories:list',
})

const familiesStore = useProductFamiliesStore()
const categoriesStore = useProductCategoriesStore()
const auth = useAuthStore()
const ui = useUiStore()

const selectedFamilyId = ref<string>('')
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<any | null>(null)
const search = ref('')

const familyOptions = computed(() => [
  { label: 'Todas las familias', value: '' },
  ...familiesStore.items.map(f => ({
    label: f.name,
    value: f.id,
  })),
])

const filtered = computed(() => {
  const base = selectedFamilyId.value
    ? categoriesStore.items.filter(c => c.familyId === selectedFamilyId.value)
    : categoriesStore.items

  if (!search.value.trim()) return base

  const q = search.value.toLowerCase().trim()
  return base.filter(c => c.name?.toLowerCase().includes(q))
})

function familyName(id?: string) {
  return familiesStore.items.find(f => f.id === id)?.name
}

function resetFilters() {
  search.value = ''
  selectedFamilyId.value = ''
}

onMounted(async () => {
  await familiesStore.fetch()
  await categoriesStore.fetchAll()
})

watch(selectedFamilyId, async id => {
  search.value = ''

  if (id) {
    await categoriesStore.fetchByFamily(id)
  } else {
    await categoriesStore.fetchAll()
  }
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
    title: 'Eliminar categoría',
    message: `¿Eliminar la categoría "${item.name}"?`,
    variant: 'danger',
    onConfirm: async () => {
      await categoriesStore.remove(item.id)
      ui.showToast('success', 'Categoría eliminada')
    },
  })
}

async function handleSubmit(payload: any) {
  if (dialogMode.value === 'create') {
    await categoriesStore.create(payload)
  } else if (selected.value) {
    await categoriesStore.update(selected.value.id, payload)
  }

  if (selectedFamilyId.value) {
    await categoriesStore.fetchByFamily(selectedFamilyId.value, true)
  } else {
    await categoriesStore.fetchAll(true)
  }

  dialogOpen.value = false
}
</script>
