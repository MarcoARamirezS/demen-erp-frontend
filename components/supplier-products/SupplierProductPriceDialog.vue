<script setup lang="ts">
import { ref, computed } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import Icon from '~/components/ui/Icon.vue'
import { useUiStore } from '~/stores/ui.store'

const props = defineProps<{
  modelValue: boolean
  supplierProductId: string
  supplierId: string
  productId: string
}>()

const emit = defineEmits(['update:modelValue', 'submit'])
const ui = useUiStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const form = ref({
  cost: 0,
  currency: 'MXN' as 'MXN' | 'USD',
})

function submit() {
  if (form.value.cost <= 0) {
    ui.showToast('warning', 'El precio debe ser mayor a 0')
    return
  }

  emit('submit', {
    supplierProductId: props.supplierProductId,
    supplierId: props.supplierId,
    productId: props.productId,
    cost: form.value.cost,
    currency: form.value.currency,
  })

  open.value = false
}
</script>

<template>
  <UiDialog v-model="open" size="lg" :hide-close="true">
    <!-- HEADER -->
    <header
      class="sticky top-0 z-10 flex justify-between border-b border-base-300 bg-base-200 px-5 py-4"
    >
      <div class="flex items-center gap-3">
        <div class="rounded-full bg-primary/10 p-3">
          <Icon name="dollar-sign" />
        </div>
        <div>
          <h2 class="font-semibold">Nuevo precio</h2>
          <p class="text-xs opacity-60">Se cerrará el precio vigente</p>
        </div>
      </div>

      <button class="btn btn-sm btn-circle btn-ghost" @click="open = false">
        <Icon name="close" />
      </button>
    </header>

    <!-- CONTENT -->
    <section class="px-5 py-6 space-y-4">
      <UiInput v-model.number="form.cost" type="number" label="Precio *" placeholder="0.00" />

      <div>
        <label class="label text-sm">Moneda</label>
        <select v-model="form.currency" class="select select-bordered w-full">
          <option value="MXN">MXN</option>
          <option value="USD">USD</option>
        </select>
      </div>
    </section>

    <!-- FOOTER -->
    <footer
      class="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-base-300 bg-base-200 px-5 py-4"
    >
      <UiButton variant="outline" @click="open = false">Cancelar</UiButton>
      <UiButton variant="primary" @click="submit">Guardar</UiButton>
    </footer>
  </UiDialog>
</template>
