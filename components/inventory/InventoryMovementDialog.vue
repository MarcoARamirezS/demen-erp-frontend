<script setup lang="ts">
import { ref, watch, onMounted, computed, reactive } from 'vue'
import { useProductsStore } from '~/stores/products.store'
import { useUiStore } from '~/stores/ui.store'

const ui = useUiStore()

const open = defineModel<boolean>()

const emit = defineEmits<{
  (e: 'submit', payload: any): void
}>()

const productsStore = useProductsStore()

/* =========================
   OPTIONS
========================= */

const productOptions = computed(() =>
  productsStore.items.map(p => ({
    label: `${p.sku ?? ''} · ${p.name}${p.brand ? ' — ' + p.brand : ''}`,
    value: p.id,
  }))
)

const typeOptions = [
  { label: 'Entrada', value: 'IN' },
  { label: 'Salida', value: 'OUT' },
  { label: 'Ajuste', value: 'ADJUST' },
]

/* =========================
   FORM
========================= */

const form = ref({
  productId: '',
  type: 'IN',
  quantity: '1',
  reason: '',
})

/* =========================
   ERRORS
========================= */

const errors = reactive({
  productId: '',
  quantity: '',
  reason: '',
})

/* =========================
   LOAD PRODUCTS
========================= */

onMounted(async () => {
  if (!productsStore.items.length) {
    await productsStore.fetch(100)
  }
})

/* =========================
   VALIDATION
========================= */

function validate() {
  errors.productId = ''
  errors.quantity = ''
  errors.reason = ''

  if (!form.value.productId) {
    errors.productId = 'Debes seleccionar un producto'
    ui.showToast('warning', 'Debes seleccionar un producto')
    return false
  }

  const qty = Number(form.value.quantity)

  if (isNaN(qty)) {
    errors.quantity = 'Cantidad inválida'
    ui.showToast('warning', 'La cantidad debe ser un número')
    return false
  }

  if (qty === 0) {
    errors.quantity = 'La cantidad no puede ser 0'
    ui.showToast('warning', 'La cantidad no puede ser 0')
    return false
  }

  if (!form.value.reason || form.value.reason.trim().length < 3) {
    errors.reason = 'El motivo debe tener al menos 3 caracteres'
    ui.showToast('warning', 'Debes indicar un motivo del movimiento')
    return false
  }

  return true
}

/* =========================
   SUBMIT
========================= */

function submit() {
  if (!validate()) return

  emit('submit', {
    productId: form.value.productId,
    type: form.value.type,
    quantity: Number(form.value.quantity),
    reason: form.value.reason.trim(),
    referenceType: 'manual',
  })

  open.value = false
}

/* =========================
   RESET FORM
========================= */

watch(open, v => {
  if (!v) {
    form.value = {
      productId: '',
      type: 'IN',
      quantity: '1',
      reason: '',
    }

    errors.productId = ''
    errors.quantity = ''
    errors.reason = ''
  }
})
</script>

<template>
  <UiDialog v-model="open" size="md" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- HEADER -->
      <header
        class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-full bg-primary/10 p-2">
            <Icon name="boxes" class="h-5 w-5 text-primary" />
          </div>

          <h2 class="font-semibold text-lg">Movimiento de inventario</h2>
        </div>

        <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- CONTENT -->
      <section class="px-6 py-5 space-y-4 overflow-auto flex-1">
        <!-- PRODUCTO -->
        <UiSelect
          v-model="form.productId"
          label="Producto *"
          :options="productOptions"
          empty-text="No hay productos"
          :error="errors.productId"
        />

        <!-- TIPO -->
        <UiSelect v-model="form.type" label="Tipo de movimiento" :options="typeOptions" />

        <!-- CANTIDAD -->
        <UiInput
          v-model="form.quantity"
          type="number"
          label="Cantidad *"
          :error="errors.quantity"
        />

        <!-- MOTIVO -->
        <UiInput
          v-model="form.reason"
          label="Motivo del movimiento *"
          type="textarea"
          :error="errors.reason"
        />
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4"
      >
        <UiButton variant="outline" type="button" @click="open = false"> Cancelar </UiButton>

        <UiButton @click="submit"> Guardar </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>
