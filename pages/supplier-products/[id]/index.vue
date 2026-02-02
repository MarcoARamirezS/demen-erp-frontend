<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useSupplierProductsStore } from '~/stores/supplierProducts.store'
import { useSupplierProductPricesStore } from '~/stores/supplierProductPrices.store'

import SupplierProductPriceTable from '~/components/supplier-products/SupplierProductPriceTable.vue'
import SupplierProductPriceDialog from '~/components/supplier-products/SupplierProductPriceDialog.vue'

const route = useRoute()
const relationId = route.params.id as string

const relationsStore = useSupplierProductsStore()
const pricesStore = useSupplierProductPricesStore()

const openPriceDialog = ref(false)

onMounted(async () => {
  await relationsStore.getById(relationId)
  await pricesStore.fetchByRelation(relationId)
})

const relation = computed(() => relationsStore.selected!)
</script>

<template>
  <div v-if="relation" class="space-y-6">
    <!-- HEADER -->
    <div class="rounded-2xl border border-base-300 bg-base-100 p-5">
      <h1 class="text-xl font-semibold">
        {{ relation.product?.nombre }} · {{ relation.supplier?.razonSocial }}
      </h1>
      <p class="text-sm opacity-60">Gestión de precios del proveedor</p>
    </div>

    <!-- ACTION -->
    <UiButton size="sm" @click="openPriceDialog = true"> Nuevo precio </UiButton>

    <!-- HISTÓRICO -->
    <SupplierProductPriceTable :items="pricesStore.items" :loading="pricesStore.loading" />

    <!-- DIALOG -->
    <SupplierProductPriceDialog
      v-model="openPriceDialog"
      :supplier-product-id="relation.id"
      :supplier-id="relation.supplierId"
      :product-id="relation.productId"
      @submit="
        async payload => {
          await pricesStore.create(payload)
          await pricesStore.fetchByRelation(relation.id)
        }
      "
    />
  </div>
</template>
