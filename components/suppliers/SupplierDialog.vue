<template>
  <UiDialog v-model="open" size="xl" hide-close>
    <!-- ========================= HEADER ========================== -->
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

    <!-- ========================= CONTENT ========================== -->
    <div class="px-6 py-5 overflow-auto space-y-8" style="max-height: calc(90vh - 160px)">
      <!-- ===== DATOS GENERALES ===== -->
      <section>
        <h3 class="text-sm font-semibold mb-4">Datos generales</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput v-model="form.code" label="Código" placeholder="PROV-001" />

          <UiInput v-model="form.name" label="Nombre comercial" placeholder="Nombre comercial" />

          <UiInput
            v-model="form.legalName"
            label="Razón social"
            placeholder="Razón social completa"
          />

          <UiInput v-model="form.rfc" label="RFC" placeholder="XAXX010101000" />

          <UiInput
            v-model="form.email"
            label="Email"
            placeholder="contacto@empresa.com"
            :error="errors.email"
          />

          <UiInput v-model="form.phone" label="Teléfono" placeholder="1234567890" />

          <UiInput
            v-model="form.website"
            label="Sitio web"
            placeholder="https://www.empresa.com"
            :error="errors.website"
          />
        </div>
      </section>

      <!-- ===== CONDICIONES COMERCIALES ===== -->
      <section>
        <h3 class="text-sm font-semibold mb-4">Condiciones comerciales</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <UiInput
            v-model="form.paymentTermsDays"
            type="number"
            label="Días de crédito"
            placeholder="0 - 365"
            :error="errors.paymentTermsDays"
          />

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
          <UiInput v-model="c.name" label="Nombre" placeholder="Nombre del contacto" />
          <UiInput v-model="c.role" label="Puesto" placeholder="Cargo o puesto" />

          <UiInput
            v-model="c.email"
            label="Email"
            placeholder="contacto@empresa.com"
            :error="errors[`contact_email_${i}`]"
          />

          <UiInput v-model="c.phone" label="Teléfono" placeholder="1234567890" />
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
          <UiInput v-model="b.bankName" label="Banco" placeholder="BBVA, Banamex..." />
          <UiInput v-model="b.accountHolder" label="Titular" placeholder="Nombre del titular" />
          <UiInput v-model="b.accountNumber" label="Cuenta" placeholder="1234567890" />

          <UiSelect v-model="b.currency" label="Moneda">
            <UiOption value="MXN">MXN</UiOption>
            <UiOption value="USD">USD</UiOption>
          </UiSelect>

          <UiInput
            v-model="b.clabe"
            label="CLABE"
            placeholder="18 dígitos"
            class="md:col-span-2"
            :error="errors[`clabe_${i}`]"
          />
        </div>
      </section>

      <!-- ===== NOTAS ===== -->
      <section>
        <UiInput
          v-model="form.notes"
          label="Notas"
          type="textarea"
          placeholder="Observaciones internas..."
        />
      </section>
    </div>

    <!-- ========================= FOOTER ========================== -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton variant="primary" @click="submit"> Guardar </UiButton>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, watchEffect } from 'vue'
import type { Supplier } from '~/types/supplier'
import { useUiStore } from '~/stores/ui.store'

const ui = useUiStore()

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

function getDefaultForm() {
  return {
    code: '',
    name: '',
    legalName: '',
    rfc: 'XAXX010101000',
    email: '',
    phone: '',
    website: '',
    paymentTermsDays: 0,
    defaultCurrency: 'MXN',
    contacts: [{ name: '', role: '', email: '', phone: '' }],
    bankAccounts: [
      {
        bankName: '',
        accountHolder: '',
        accountNumber: '',
        clabe: '',
        currency: 'MXN',
      },
    ],
    notes: '',
    active: true,
  }
}

const form = reactive<any>(getDefaultForm())
const errors = reactive<Record<string, string>>({})

watch(
  () => props.model,
  v => {
    if (v) Object.assign(form, JSON.parse(JSON.stringify(v)))
    else Object.assign(form, getDefaultForm())
  },
  { immediate: true }
)

/* ========================= VALIDACIONES EN TIEMPO REAL ========================== */

function isValidURL(url: string) {
  if (!url) return true
  let testUrl = url.trim()
  if (!/^https?:\/\//i.test(testUrl)) testUrl = 'https://' + testUrl
  try {
    new URL(testUrl)
    return true
  } catch {
    return false
  }
}

function isValidCLABE(clabe: string) {
  return /^\d{18}$/.test(clabe)
}

function isValidEmail(email: string) {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

watchEffect(() => {
  errors.email = form.email && !isValidEmail(form.email) ? 'Email inválido' : ''
  errors.website = form.website && !isValidURL(form.website) ? 'URL inválida' : ''
  errors.paymentTermsDays =
    form.paymentTermsDays < 0 || form.paymentTermsDays > 365 ? 'Debe estar entre 0 y 365' : ''

  form.contacts.forEach((c: any, i: number) => {
    errors[`contact_email_${i}`] = c.email && !isValidEmail(c.email) ? 'Email inválido' : ''
  })

  form.bankAccounts.forEach((b: any, i: number) => {
    errors[`clabe_${i}`] = b.clabe && !isValidCLABE(b.clabe) ? 'CLABE debe tener 18 dígitos' : ''
  })
})

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
  const hasErrors = Object.values(errors).some(e => e)
  if (hasErrors) {
    ui.showToast('error', 'Hay campos con errores. Revisa el formulario.')
    return
  }

  emit('submit', {
    ...form,
    paymentTermsDays: Number(form.paymentTermsDays),
  })

  open.value = false
}
</script>
