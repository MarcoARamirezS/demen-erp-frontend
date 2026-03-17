<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- HEADER -->
      <header
        class="sticky top-0 z-10 flex flex-col gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Icon name="truck" class="h-6 w-6 text-primary" />
          </div>

          <div>
            <h2 class="text-xl font-bold text-primary">
              {{ mode === 'create' ? 'Nuevo proveedor' : 'Editar proveedor' }}
            </h2>

            <p class="text-sm opacity-60">Gestión de proveedores del sistema</p>
          </div>
        </div>

        <button class="btn btn-circle btn-ghost btn-sm" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- CONTENT -->
      <section class="flex-1 overflow-y-auto px-6 py-6 pb-10 space-y-8">
        <!-- DATOS GENERALES -->
        <section>
          <h3 class="text-sm font-semibold mb-4">Datos generales</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiInput v-model="form.code" label="Código *" :error="errors.code" />

            <UiInput v-model="form.name" label="Nombre comercial *" :error="errors.name" />

            <UiInput v-model="form.legalName" label="Razón social" :error="errors.legalName" />

            <UiInput v-model="form.rfc" label="RFC" :error="errors.rfc" />

            <UiInput v-model="form.email" label="Email" :error="errors.email" />

            <UiInput v-model="form.phone" label="Teléfono" />

            <UiInput v-model="form.website" label="Sitio web" :error="errors.website" />
          </div>
        </section>

        <!-- CONDICIONES -->
        <section>
          <h3 class="text-sm font-semibold mb-4">Condiciones comerciales</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <UiInput
              v-model="form.paymentTermsDays"
              type="number"
              label="Días de crédito"
              :error="errors.paymentTermsDays"
            />

            <UiSelect
              v-model="form.defaultCurrency"
              label="Moneda por defecto"
              :options="currencyOptions"
            />
          </div>
        </section>

        <!-- CONTACTOS -->
        <section>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold">Contactos</h3>

            <UiButton size="sm" variant="outline" icon="plus" @click="addContact">
              Agregar contacto
            </UiButton>
          </div>

          <div
            v-for="(c, i) in form.contacts"
            :key="i"
            class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3"
          >
            <UiInput v-model="c.name" label="Nombre *" :error="errors[`contact_name_${i}`]" />
            <UiInput v-model="c.role" label="Puesto" />

            <UiInput v-model="c.email" label="Email" :error="errors[`contact_email_${i}`]" />

            <UiInput v-model="c.phone" label="Teléfono" />
          </div>
        </section>

        <!-- CUENTAS BANCARIAS -->
        <section>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold">Cuentas bancarias</h3>

            <UiButton size="sm" variant="outline" icon="plus" @click="addBankAccount">
              Agregar cuenta bancaria
            </UiButton>
          </div>

          <div
            v-for="(b, i) in form.bankAccounts"
            :key="i"
            class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 items-end"
          >
            <UiInput v-model="b.bankName" label="Banco *" :error="errors[`bank_name_${i}`]" />

            <UiInput
              v-model="b.accountHolder"
              label="Titular *"
              :error="errors[`account_holder_${i}`]"
            />

            <UiInput v-model="b.accountNumber" label="Cuenta" />

            <UiSelect v-model="b.currency" label="Moneda" :options="bankCurrencyOptions" />

            <UiInput
              v-model="b.clabe"
              label="CLABE"
              class="md:col-span-2"
              :error="errors[`clabe_${i}`]"
            />
          </div>
        </section>

        <!-- NOTAS -->
        <section>
          <UiInput v-model="form.notes" label="Notas" type="textarea" :error="errors.notes" />
        </section>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <UiButton variant="ghost" @click="open = false"> Cancelar </UiButton>

        <UiButton variant="primary" @click="submit"> Guardar </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { useUiStore } from '~/stores/ui.store'

const ui = useUiStore()

const props = defineProps({
  modelValue: Boolean,
  mode: String,
  model: Object,
})

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
    rfc: '',
    email: '',
    phone: '',
    website: '',
    paymentTermsDays: 0,
    defaultCurrency: 'MXN',
    contacts: [{ name: '', role: '', email: '', phone: '' }],
    bankAccounts: [
      { bankName: '', accountHolder: '', accountNumber: '', clabe: '', currency: 'MXN' },
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

const currencyOptions = [
  { label: 'MXN – Peso mexicano', value: 'MXN' },
  { label: 'USD – Dólar americano', value: 'USD' },
]

const bankCurrencyOptions = [
  { label: 'MXN', value: 'MXN' },
  { label: 'USD', value: 'USD' },
]

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

function isValidEmail(e: string) {
  return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function submit() {
  Object.keys(errors).forEach(k => (errors[k] = ''))

  if (!form.code || form.code.length < 2) {
    errors.code = 'Código inválido'
  }

  if (!form.name || form.name.length < 2) {
    errors.name = 'Nombre requerido'
  }

  if (form.email && !isValidEmail(form.email)) {
    errors.email = 'Email inválido'
  }

  if (form.paymentTermsDays < 0 || form.paymentTermsDays > 365) {
    errors.paymentTermsDays = 'Debe estar entre 0 y 365'
  }

  form.contacts.forEach((c: any, i: number) => {
    if (c.name && c.name.length < 2) {
      errors[`contact_name_${i}`] = 'Nombre inválido'
    }
    if (c.email && !isValidEmail(c.email)) {
      errors[`contact_email_${i}`] = 'Email inválido'
    }
  })

  form.bankAccounts.forEach((b: any, i: number) => {
    if (b.bankName && b.bankName.length < 2) {
      errors[`bank_name_${i}`] = 'Banco inválido'
    }
    if (b.accountHolder && b.accountHolder.length < 2) {
      errors[`account_holder_${i}`] = 'Titular inválido'
    }
  })

  const hasErrors = Object.values(errors).some(e => e)

  if (hasErrors) {
    ui.showToast('error', 'Hay campos con errores')
    return
  }

  emit('submit', {
    ...form,
    paymentTermsDays: Number(form.paymentTermsDays),
  })

  open.value = false
}
</script>
