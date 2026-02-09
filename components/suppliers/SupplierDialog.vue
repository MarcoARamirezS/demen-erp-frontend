<template>
  <UiDialog v-model="open" size="xl" hide-close>
    <!-- =========================
         HEADER (STICKY)
    ========================== -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="text-lg font-semibold">
        {{ mode === 'create' ? 'Nuevo proveedor' : 'Editar proveedor' }}
      </h2>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- =========================
         CONTENT (SCROLL)
    ========================== -->
    <div class="px-6 py-5 overflow-auto space-y-8" style="max-height: calc(90vh - 160px)">
      <!-- ===== DATOS GENERALES ===== -->
      <section>
        <h3 class="text-sm font-semibold mb-4">Datos generales</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput v-model="form.code" label="Código" />
          <UiInput v-model="form.name" label="Nombre comercial" />

          <UiInput v-model="form.legalName" label="Razón social" />
          <UiInput v-model="form.rfc" label="RFC" />

          <UiInput v-model="form.email" label="Email" />
          <UiInput v-model="form.phone" label="Teléfono" />

          <UiInput v-model="form.website" label="Sitio web" />
        </div>
      </section>

      <!-- ===== CONDICIONES COMERCIALES ===== -->
      <section>
        <h3 class="text-sm font-semibold mb-4">Condiciones comerciales</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <UiInput v-model="form.paymentTermsDays" type="number" label="Días de crédito" />

          <UiSelect v-model="form.defaultCurrency" label="Moneda por defecto">
            <UiOption value="MXN">MXN – Peso mexicano</UiOption>
            <UiOption value="USD">USD – Dólar americano</UiOption>
          </UiSelect>
        </div>
      </section>

      <!-- ===== CONTACTOS ===== -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold">Contactos</h3>

          <UiButton size="sm" variant="outline" icon="plus" type="button" @click="addContact">
            Agregar contacto
          </UiButton>
        </div>

        <div
          v-for="(c, i) in form.contacts"
          :key="i"
          class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3"
        >
          <UiInput v-model="c.name" label="Nombre" />
          <UiInput v-model="c.role" label="Puesto" />
          <UiInput v-model="c.email" label="Email" />
          <UiInput v-model="c.phone" label="Teléfono" />
        </div>
      </section>

      <!-- ===== CUENTAS BANCARIAS ===== -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold">Cuentas bancarias</h3>

          <UiButton size="sm" variant="outline" icon="plus" type="button" @click="addBankAccount">
            Agregar cuenta bancaria
          </UiButton>
        </div>

        <div
          v-for="(b, i) in form.bankAccounts"
          :key="i"
          class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 items-end"
        >
          <UiInput v-model="b.bankName" label="Banco" />
          <UiInput v-model="b.accountHolder" label="Titular" />
          <UiInput v-model="b.accountNumber" label="Cuenta" />

          <UiSelect v-model="b.currency" label="Moneda">
            <UiOption value="MXN">MXN</UiOption>
            <UiOption value="USD">USD</UiOption>
          </UiSelect>

          <UiInput v-model="b.clabe" label="CLABE" class="md:col-span-2" />
        </div>
      </section>

      <!-- ===== NOTAS ===== -->
      <section>
        <UiInput v-model="form.notes" label="Notas" type="textarea" />
      </section>
    </div>

    <!-- =========================
         FOOTER (STICKY)
    ========================== -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton variant="primary" @click="submit"> Guardar </UiButton>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { Supplier } from '~/types/supplier'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model: Supplier | null
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const form = reactive<any>({
  code: '',
  name: '',
  legalName: '',
  rfc: '',
  email: '',
  phone: '',
  website: '',
  paymentTermsDays: '0',
  defaultCurrency: 'MXN',
  contacts: [],
  bankAccounts: [],
  notes: '',
  active: true,
})

watch(
  () => props.model,
  v => {
    if (v) Object.assign(form, JSON.parse(JSON.stringify(v)))
  },
  { immediate: true }
)

function addContact() {
  form.contacts.push({ name: '', role: '', email: '', phone: '' })
}

function addBankAccount() {
  form.bankAccounts.push({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    clabe: '',
    currency: 'MXN',
  })
}

function submit() {
  emit('submit', {
    ...form,
    paymentTermsDays: Number(form.paymentTermsDays),
  })
  open.value = false
}
</script>
