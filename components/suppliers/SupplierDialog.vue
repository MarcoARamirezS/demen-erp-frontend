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
        <!-- ALERTA DE VALIDACIÓN -->
        <div
          v-if="errorSummary.length"
          class="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm"
        >
          <div class="flex items-start gap-3">
            <Icon name="alert-triangle" class="mt-0.5 h-5 w-5 text-error" />

            <div class="flex-1">
              <p class="font-semibold text-error">Revisa los siguientes campos:</p>

              <ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/80">
                <li v-for="item in errorSummary" :key="item.key">
                  <span class="font-medium">{{ item.label }}:</span>
                  {{ item.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- DATOS GENERALES -->
        <section>
          <h3 class="mb-4 text-sm font-semibold">Datos generales</h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div data-error-field="code">
              <UiInput
                v-model="form.code"
                label="Código *"
                placeholder="Ej: PROV-001"
                :error="errors.code"
              />
            </div>

            <div data-error-field="name">
              <UiInput
                v-model="form.name"
                label="Nombre comercial *"
                placeholder="Ej: Suministros Industriales del Bajío"
                :error="errors.name"
              />
            </div>

            <div data-error-field="legalName">
              <UiInput
                v-model="form.legalName"
                label="Razón social"
                placeholder="Ej: Suministros Industriales del Bajío S.A. de C.V."
                :error="errors.legalName"
              />
            </div>

            <div data-error-field="rfc">
              <UiInput
                v-model="form.rfc"
                label="RFC"
                placeholder="Ej: SIB230101AB1"
                :error="errors.rfc"
              />
            </div>

            <div data-error-field="email">
              <UiInput
                v-model="form.email"
                label="Email"
                placeholder="Ej: compras@proveedor.com"
                :error="errors.email"
              />
            </div>

            <div data-error-field="phone">
              <UiInput
                v-model="form.phone"
                label="Teléfono"
                placeholder="Ej: 4641234567"
                :error="errors.phone"
              />
            </div>

            <div class="md:col-span-2" data-error-field="website">
              <UiInput
                v-model="form.website"
                label="Sitio web"
                placeholder="Ej: https://www.proveedor.com"
                :error="errors.website"
              />
            </div>
          </div>
        </section>

        <!-- CONDICIONES -->
        <section>
          <h3 class="mb-4 text-sm font-semibold">Condiciones comerciales</h3>

          <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
            <div data-error-field="paymentTermsDays">
              <UiInput
                v-model="form.paymentTermsDays"
                type="number"
                label="Días de crédito"
                placeholder="Ej: 30"
                :error="errors.paymentTermsDays"
              />
              <p class="mt-1 text-xs opacity-60">
                Indica los días de crédito pactados con el proveedor.
              </p>
            </div>

            <div data-error-field="defaultCurrency">
              <UiSelect
                v-model="form.defaultCurrency"
                label="Moneda por defecto"
                :options="currencyOptions"
              />
              <p class="mt-1 text-xs opacity-60">
                Selecciona la moneda más común para compras con este proveedor.
              </p>
            </div>
          </div>
        </section>

        <!-- CONTACTOS -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold">Contactos</h3>

            <UiButton size="sm" variant="outline" icon="plus" @click="addContact">
              Agregar contacto
            </UiButton>
          </div>

          <div
            v-for="(c, i) in form.contacts"
            :key="i"
            class="mb-4 rounded-2xl border border-base-300 bg-base-100 p-4"
          >
            <div class="mb-3 flex items-center justify-between">
              <p class="text-sm font-medium opacity-70">Contacto {{ i + 1 }}</p>

              <UiButton
                v-if="form.contacts.length > 1"
                size="sm"
                variant="ghost"
                icon="trash-2"
                @click="removeContact(i)"
              >
                Eliminar
              </UiButton>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div :data-error-field="`contact_name_${i}`">
                <UiInput
                  v-model="c.name"
                  label="Nombre *"
                  placeholder="Ej: Juan Pérez"
                  :error="errors[`contact_name_${i}`]"
                />
              </div>

              <div :data-error-field="`contact_role_${i}`">
                <UiInput v-model="c.role" label="Puesto" placeholder="Ej: Ejecutivo de ventas" />
              </div>

              <div :data-error-field="`contact_email_${i}`">
                <UiInput
                  v-model="c.email"
                  label="Email"
                  placeholder="Ej: juan.perez@proveedor.com"
                  :error="errors[`contact_email_${i}`]"
                />
              </div>

              <div :data-error-field="`contact_phone_${i}`">
                <UiInput v-model="c.phone" label="Teléfono" placeholder="Ej: 4771234567" />
              </div>
            </div>
          </div>
        </section>

        <!-- CUENTAS BANCARIAS -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold">Cuentas bancarias</h3>

            <UiButton size="sm" variant="outline" icon="plus" @click="addBankAccount">
              Agregar cuenta bancaria
            </UiButton>
          </div>

          <div
            v-for="(b, i) in form.bankAccounts"
            :key="i"
            class="mb-4 rounded-2xl border border-base-300 bg-base-100 p-4"
          >
            <div class="mb-3 flex items-center justify-between">
              <p class="text-sm font-medium opacity-70">Cuenta bancaria {{ i + 1 }}</p>

              <UiButton
                v-if="form.bankAccounts.length > 1"
                size="sm"
                variant="ghost"
                icon="trash-2"
                @click="removeBankAccount(i)"
              >
                Eliminar
              </UiButton>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div :data-error-field="`bank_name_${i}`">
                <UiInput
                  v-model="b.bankName"
                  label="Banco *"
                  placeholder="Ej: BBVA, Banorte, Santander"
                  :error="errors[`bank_name_${i}`]"
                />
              </div>

              <div :data-error-field="`account_holder_${i}`">
                <UiInput
                  v-model="b.accountHolder"
                  label="Titular *"
                  placeholder="Ej: Suministros Industriales del Bajío S.A. de C.V."
                  :error="errors[`account_holder_${i}`]"
                />
              </div>

              <div :data-error-field="`account_number_${i}`">
                <UiInput v-model="b.accountNumber" label="Cuenta" placeholder="Ej: 0123456789" />
              </div>

              <div :data-error-field="`bank_currency_${i}`">
                <UiSelect v-model="b.currency" label="Moneda" :options="bankCurrencyOptions" />
              </div>

              <div class="md:col-span-2" :data-error-field="`clabe_${i}`">
                <UiInput
                  v-model="b.clabe"
                  label="CLABE"
                  placeholder="Ej: 012180001234567890"
                  :error="errors[`clabe_${i}`]"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- NOTAS -->
        <section>
          <div data-error-field="notes">
            <UiInput
              v-model="form.notes"
              label="Notas"
              type="textarea"
              placeholder="Ej: Proveedor confiable, maneja crédito a 30 días, contacto principal para urgencias"
              :error="errors.notes"
            />
            <p class="mt-1 text-xs opacity-60">
              Agrega observaciones importantes sobre negociación, servicio o condiciones especiales.
            </p>
          </div>
        </section>
      </section>

      <!-- FOOTER -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 sm:flex-row"
      >
        <UiButton variant="ghost" @click="open = false">Cancelar</UiButton>
        <UiButton variant="primary" @click="submit">Guardar</UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, nextTick } from 'vue'
import { useUiStore } from '~/stores/ui.store'

type Currency = 'MXN' | 'USD'

type SupplierContactForm = {
  name: string
  role: string
  email: string
  phone: string
  notes?: string
}

type SupplierBankAccountForm = {
  bankName: string
  accountHolder: string
  accountNumber: string
  clabe: string
  swift?: string
  iban?: string
  currency: Currency
  notes?: string
}

type SupplierForm = {
  code: string
  name: string
  legalName: string
  rfc: string
  email: string
  phone: string
  website: string
  paymentTermsDays: number | string
  defaultCurrency: Currency
  contacts: SupplierContactForm[]
  bankAccounts: SupplierBankAccountForm[]
  notes: string
  active: boolean
}

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

function getDefaultForm(): SupplierForm {
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

const form = reactive<SupplierForm>(getDefaultForm())
const errors = reactive<Record<string, string>>({})

watch(
  () => props.model,
  v => {
    clearErrors()

    if (v) {
      const cloned = JSON.parse(JSON.stringify(v))

      Object.assign(form, {
        ...getDefaultForm(),
        ...cloned,
        contacts:
          Array.isArray(cloned.contacts) && cloned.contacts.length
            ? cloned.contacts
            : [{ name: '', role: '', email: '', phone: '' }],
        bankAccounts:
          Array.isArray(cloned.bankAccounts) && cloned.bankAccounts.length
            ? cloned.bankAccounts
            : [{ bankName: '', accountHolder: '', accountNumber: '', clabe: '', currency: 'MXN' }],
      })
    } else {
      Object.assign(form, getDefaultForm())
    }
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

const fieldLabels: Record<string, string> = {
  code: 'Código',
  name: 'Nombre comercial',
  legalName: 'Razón social',
  rfc: 'RFC',
  email: 'Email',
  phone: 'Teléfono',
  website: 'Sitio web',
  paymentTermsDays: 'Días de crédito',
  defaultCurrency: 'Moneda por defecto',
  notes: 'Notas',
}

const errorSummary = computed(() =>
  Object.entries(errors)
    .filter(([, message]) => !!message)
    .map(([key, message]) => ({
      key,
      label: getFieldLabel(key),
      message,
    }))
)

function getFieldLabel(key: string): string {
  if (fieldLabels[key]) return fieldLabels[key]

  const contactNameMatch = key.match(/^contact_name_(\d+)$/)
  if (contactNameMatch) return `Contacto ${Number(contactNameMatch[1]) + 1} · Nombre`

  const contactEmailMatch = key.match(/^contact_email_(\d+)$/)
  if (contactEmailMatch) return `Contacto ${Number(contactEmailMatch[1]) + 1} · Email`

  const bankNameMatch = key.match(/^bank_name_(\d+)$/)
  if (bankNameMatch) return `Cuenta bancaria ${Number(bankNameMatch[1]) + 1} · Banco`

  const accountHolderMatch = key.match(/^account_holder_(\d+)$/)
  if (accountHolderMatch) return `Cuenta bancaria ${Number(accountHolderMatch[1]) + 1} · Titular`

  const clabeMatch = key.match(/^clabe_(\d+)$/)
  if (clabeMatch) return `Cuenta bancaria ${Number(clabeMatch[1]) + 1} · CLABE`

  return key
}

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function addContact() {
  form.contacts.push({ name: '', role: '', email: '', phone: '' })
}

function removeContact(index: number) {
  form.contacts.splice(index, 1)

  if (!form.contacts.length) {
    form.contacts.push({ name: '', role: '', email: '', phone: '' })
  }
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

function removeBankAccount(index: number) {
  form.bankAccounts.splice(index, 1)

  if (!form.bankAccounts.length) {
    form.bankAccounts.push({
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      clabe: '',
      currency: 'MXN',
    })
  }
}

function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidUrl(value: string) {
  if (!value) return true

  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function hasAnyContactValue(contact: SupplierContactForm) {
  return !!(contact.name || contact.role || contact.email || contact.phone || contact.notes)
}

function hasAnyBankValue(bank: SupplierBankAccountForm) {
  return !!(
    bank.bankName ||
    bank.accountHolder ||
    bank.accountNumber ||
    bank.clabe ||
    bank.swift ||
    bank.iban ||
    bank.notes
  )
}

function sanitizeContacts(contacts: SupplierContactForm[]) {
  return contacts.filter(hasAnyContactValue).map(contact => ({
    name: contact.name?.trim() || '',
    role: contact.role?.trim() || '',
    email: contact.email?.trim() || '',
    phone: contact.phone?.trim() || '',
    notes: contact.notes?.trim() || '',
  }))
}

function sanitizeBankAccounts(bankAccounts: SupplierBankAccountForm[]) {
  return bankAccounts.filter(hasAnyBankValue).map(bank => ({
    bankName: bank.bankName?.trim() || '',
    accountHolder: bank.accountHolder?.trim() || '',
    accountNumber: bank.accountNumber?.trim() || '',
    clabe: bank.clabe?.trim() || '',
    swift: bank.swift?.trim() || '',
    iban: bank.iban?.trim() || '',
    currency: bank.currency || 'MXN',
    notes: bank.notes?.trim() || '',
  }))
}

async function focusFirstErrorField() {
  const firstKey = Object.keys(errors).find(key => errors[key])
  if (!firstKey) return

  await nextTick()

  const wrapper = document.querySelector(`[data-error-field="${firstKey}"]`)
  const target = wrapper?.querySelector('input, textarea, select, button') as HTMLElement | null

  if (wrapper) {
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (target?.focus) {
    target.focus()
  }
}

async function submit() {
  clearErrors()

  const payload = {
    code: form.code?.trim() || '',
    name: form.name?.trim() || '',
    legalName: form.legalName?.trim() || '',
    rfc: form.rfc?.trim() || '',
    email: form.email?.trim() || '',
    phone: form.phone?.trim() || '',
    website: form.website?.trim() || '',
    paymentTermsDays: Number(form.paymentTermsDays ?? 0),
    defaultCurrency: form.defaultCurrency || 'MXN',
    contacts: sanitizeContacts(form.contacts),
    bankAccounts: sanitizeBankAccounts(form.bankAccounts),
    notes: form.notes?.trim() || '',
    active: !!form.active,
  }

  // Datos generales
  if (!payload.code) {
    errors.code = 'El código es obligatorio'
  } else if (payload.code.length < 2) {
    errors.code = 'Debe tener al menos 2 caracteres'
  } else if (payload.code.length > 40) {
    errors.code = 'No debe exceder 40 caracteres'
  }

  if (!payload.name) {
    errors.name = 'El nombre comercial es obligatorio'
  } else if (payload.name.length < 2) {
    errors.name = 'Debe tener al menos 2 caracteres'
  } else if (payload.name.length > 180) {
    errors.name = 'No debe exceder 180 caracteres'
  }

  if (payload.legalName && payload.legalName.length > 220) {
    errors.legalName = 'No debe exceder 220 caracteres'
  }

  if (payload.rfc && (payload.rfc.length < 12 || payload.rfc.length > 13)) {
    errors.rfc = 'Debe tener 12 o 13 caracteres'
  }

  if (payload.email && !isValidEmail(payload.email)) {
    errors.email = 'Formato de email inválido'
  }

  if (payload.phone && payload.phone.length > 40) {
    errors.phone = 'No debe exceder 40 caracteres'
  }

  if (payload.website && !isValidUrl(payload.website)) {
    errors.website = 'La URL no es válida'
  }

  // Condiciones comerciales
  if (Number.isNaN(payload.paymentTermsDays)) {
    errors.paymentTermsDays = 'Debe ser un número válido'
  } else if (payload.paymentTermsDays < 0 || payload.paymentTermsDays > 365) {
    errors.paymentTermsDays = 'Debe estar entre 0 y 365'
  }

  // Contactos
  payload.contacts.forEach((contact, i) => {
    if (!contact.name) {
      errors[`contact_name_${i}`] = 'El nombre del contacto es obligatorio'
    } else if (contact.name.length < 2) {
      errors[`contact_name_${i}`] = 'Debe tener al menos 2 caracteres'
    } else if (contact.name.length > 120) {
      errors[`contact_name_${i}`] = 'No debe exceder 120 caracteres'
    }

    if (contact.email && !isValidEmail(contact.email)) {
      errors[`contact_email_${i}`] = 'Formato de email inválido'
    }
  })

  // Cuentas bancarias
  payload.bankAccounts.forEach((bank, i) => {
    if (!bank.bankName) {
      errors[`bank_name_${i}`] = 'El banco es obligatorio'
    } else if (bank.bankName.length < 2) {
      errors[`bank_name_${i}`] = 'Debe tener al menos 2 caracteres'
    } else if (bank.bankName.length > 120) {
      errors[`bank_name_${i}`] = 'No debe exceder 120 caracteres'
    }

    if (!bank.accountHolder) {
      errors[`account_holder_${i}`] = 'El titular es obligatorio'
    } else if (bank.accountHolder.length < 2) {
      errors[`account_holder_${i}`] = 'Debe tener al menos 2 caracteres'
    } else if (bank.accountHolder.length > 180) {
      errors[`account_holder_${i}`] = 'No debe exceder 180 caracteres'
    }

    if (bank.clabe && bank.clabe.length > 30) {
      errors[`clabe_${i}`] = 'No debe exceder 30 caracteres'
    }
  })

  if (payload.notes && payload.notes.length > 2000) {
    errors.notes = 'No debe exceder 2000 caracteres'
  }

  const firstErrorEntry = Object.entries(errors).find(([, message]) => !!message)

  if (firstErrorEntry) {
    const [key, message] = firstErrorEntry
    ui.showToast('warning', `${getFieldLabel(key)}: ${message}`)
    await focusFirstErrorField()
    return
  }

  emit('submit', payload)
  open.value = false
}
</script>
