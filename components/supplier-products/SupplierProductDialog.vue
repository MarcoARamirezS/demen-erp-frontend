<script setup lang="ts">
import { ref, computed } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiSelectSearch from '~/components/ui/UiSelectSearch.vue'

import { useUiStore } from '~/stores/ui.store'
import { useProductsStore } from '~/stores/products.store'
import { useSuppliersStore } from '~/stores/suppliers.store'

import type { CreateSupplierProductDto } from '~/types/supplier-product'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'submit'])

const ui = useUiStore()
const productsStore = useProductsStore()
const suppliersStore = useSuppliersStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const form = ref<CreateSupplierProductDto>({
  productId: '',
  supplierId: '',
  supplierSku: '',
  purchasePrice: 0,
  currency: 'MXN',
  active: true,
})

const productOptions = computed(() =>
  productsStore.items.map(p => ({
    value: p.id,
    label: `${p.sku} · ${p.name}`,
  }))
)

const supplierOptions = computed(() =>
  suppliersStore.items.map(s => ({
    value: s.id,
    label: s.name,
  }))
)

function submit() {
  if (!form.value.productId || !form.value.supplierId || form.value.purchasePrice <= 0) {
    ui.showToast('warning', 'Completa producto, proveedor y precio')
    return
  }

  emit('submit', form.value)
  open.value = false
}
</script>

<template>
  <UiDialog v-model="open" size="lg" title="Asignar producto a proveedor">
    <form class="space-y-4" @submit.prevent="submit">
      <UiSelectSearch
        v-model="form.productId"
        label="Producto *"
        :items="productOptions"
        placeholder="Selecciona producto"
      />

      <UiSelectSearch
        v-model="form.supplierId"
        label="Proveedor *"
        :items="supplierOptions"
        placeholder="Selecciona proveedor"
      />

      <UiInput v-model="form.supplierSku" label="SKU proveedor" />
      <UiInput v-model.number="form.purchasePrice" type="number" label="Precio de compra *" />
      <UiInput v-model="form.currency" label="Moneda (MXN / USD)" />

      <div class="flex justify-end gap-3 border-t pt-4">
        <UiButton variant="ghost" type="button" @click="open = false">Cancelar</UiButton>
        <UiButton variant="primary" type="submit">Guardar</UiButton>
      </div>
    </form>
  </UiDialog>
</template>
