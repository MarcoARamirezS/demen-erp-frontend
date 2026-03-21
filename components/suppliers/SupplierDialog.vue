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

        <button type="button" class="btn btn-circle btn-ghost btn-sm" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- CONTENT -->
      <section class="flex-1 space-y-8 overflow-y-auto px-6 py-6 pb-10">
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
            <div>
              <UiInput
                :model-value="form.code"
                label="Código"
                placeholder="Se generará automáticamente"
                disabled
                readonly
              />
              <p class="mt-1 text-xs opacity-60">
                <span v-if="mode === 'create' && nextCodeLoading">
                  Consultando siguiente código disponible…
                </span>
                <span v-else-if="mode === 'create'">
                  Vista previa del siguiente código. El definitivo se asigna al guardar.
                </span>
                <span v-else> Código autogenerado del proveedor. </span>
              </p>
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
                <UiInput
                  :model-value="b.accountNumber"
                  label="Cuenta"
                  placeholder="Ej: 0123456789"
                  inputmode="numeric"
                  maxlength="10"
                  :error="errors[`account_number_${i}`]"
                  @update:model-value="value => handleAccountNumberInput(i, value)"
                  @blur="handleBankFieldBlur(i)"
                />
                <p class="mt-1 text-xs opacity-60">
                  Solo números · {{ String(b.accountNumber || '').length }}/10
                </p>
              </div>

              <div :data-error-field="`bank_currency_${i}`">
                <UiSelect v-model="b.currency" label="Moneda" :options="bankCurrencyOptions" />
              </div>

              <div class="md:col-span-2" :data-error-field="`clabe_${i}`">
                <UiInput
                  :model-value="b.clabe"
                  label="CLABE"
                  placeholder="Ej: 012180001234567890"
                  inputmode="numeric"
                  maxlength="18"
                  :error="errors[`clabe_${i}`]"
                  @update:model-value="value => handleClabeInput(i, value)"
                  @blur="handleBankFieldBlur(i)"
                />
                <p class="mt-1 text-xs opacity-60">
                  Solo números · {{ String(b.clabe || '').length }}/18
                </p>
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
import { reactive, watch, computed, nextTick, ref } from 'vue'
import { useUiStore } from '~/stores/ui.store'

type Currency = 'MXN' | 'USD'
type DialogMode = 'create' | 'edit'

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

type SupplierDialogModel = Partial<SupplierForm> | null

const ui = useUiStore()

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode?: DialogMode
    model?: SupplierDialogModel
  }>(),
  {
    modelValue: false,
    mode: 'create',
    model: null,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', payload: Omit<SupplierForm, 'code'>): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const nextCodeLoading = ref(false)
const nextCodeLoaded = ref(false)

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
const limitWarningShown = reactive<Record<string, boolean>>({})

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

watch(
  () => [props.modelValue, props.mode] as const,
  async ([isOpen, mode]) => {
    if (!isOpen) return

    if (mode === 'create') {
      await loadNextCodePreview()
    } else {
      nextCodeLoaded.value = false
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

  const accountNumberMatch = key.match(/^account_number_(\d+)$/)
  if (accountNumberMatch) return `Cuenta bancaria ${Number(accountNumberMatch[1]) + 1} · Cuenta`

  const clabeMatch = key.match(/^clabe_(\d+)$/)
  if (clabeMatch) return `Cuenta bancaria ${Number(clabeMatch[1]) + 1} · CLABE`

  return key
}

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

async function loadNextCodePreview() {
  if (props.mode !== 'create') return

  nextCodeLoading.value = true

  try {
    const response = await $fetch<{ nextCode?: string; nextSequence?: number }>(
      '/api/suppliers/next-code'
    )

    form.code = response?.nextCode || ''
    nextCodeLoaded.value = true
  } catch (error) {
    form.code = ''
    nextCodeLoaded.value = false
    ui.showToast(
      'warning',
      'No se pudo consultar el siguiente código. Se asignará automáticamente al guardar.'
    )
  } finally {
    nextCodeLoading.value = false
  }
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

function keepOnlyDigits(value: unknown) {
  return String(value ?? '').replace(/\D/g, '')
}

function notifyDigitLimit(key: string, label: string, max: number) {
  if (limitWarningShown[key]) return
  limitWarningShown[key] = true
  ui.showToast('warning', `${label}: máximo ${max} dígitos`)
}

function handleAccountNumberInput(index: number, value: unknown) {
  const digits = keepOnlyDigits(value)
  const fieldKey = `account_number_${index}`

  if (digits.length > 10) {
    notifyDigitLimit(fieldKey, `Cuenta bancaria ${index + 1} · Cuenta`, 10)
  } else {
    limitWarningShown[fieldKey] = false
  }

  form.bankAccounts[index].accountNumber = digits.slice(0, 10)

  if (errors[fieldKey]) {
    validateBankAccountRow(index)
  }
}

function handleClabeInput(index: number, value: unknown) {
  const digits = keepOnlyDigits(value)
  const fieldKey = `clabe_${index}`

  if (digits.length > 18) {
    notifyDigitLimit(fieldKey, `Cuenta bancaria ${index + 1} · CLABE`, 18)
  } else {
    limitWarningShown[fieldKey] = false
  }

  form.bankAccounts[index].clabe = digits.slice(0, 18)

  if (errors[fieldKey]) {
    validateBankAccountRow(index)
  }
}

function isValidClabe(value: string) {
  if (!/^\d{18}$/.test(value)) return false

  const factors = [3, 7, 1]
  let sum = 0

  for (let i = 0; i < 17; i += 1) {
    const digit = Number(value[i])
    const factor = factors[i % 3]
    sum += (digit * factor) % 10
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === Number(value[17])
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
    accountNumber: keepOnlyDigits(bank.accountNumber).slice(0, 10),
    clabe: keepOnlyDigits(bank.clabe).slice(0, 18),
    swift: bank.swift?.trim() || '',
    iban: bank.iban?.trim() || '',
    currency: bank.currency || 'MXN',
    notes: bank.notes?.trim() || '',
  }))
}

function validateBankAccountRow(index: number) {
  delete errors[`bank_name_${index}`]
  delete errors[`account_holder_${index}`]
  delete errors[`account_number_${index}`]
  delete errors[`clabe_${index}`]

  const bank = form.bankAccounts[index]
  const sanitized = {
    bankName: bank.bankName?.trim() || '',
    accountHolder: bank.accountHolder?.trim() || '',
    accountNumber: keepOnlyDigits(bank.accountNumber),
    clabe: keepOnlyDigits(bank.clabe),
  }

  const hasValue = !!(
    sanitized.bankName ||
    sanitized.accountHolder ||
    sanitized.accountNumber ||
    sanitized.clabe ||
    bank.swift ||
    bank.iban ||
    bank.notes
  )

  if (!hasValue) return true

  if (!sanitized.bankName) {
    errors[`bank_name_${index}`] = 'El banco es obligatorio'
  } else if (sanitized.bankName.length < 2) {
    errors[`bank_name_${index}`] = 'Debe tener al menos 2 caracteres'
  } else if (sanitized.bankName.length > 120) {
    errors[`bank_name_${index}`] = 'No debe exceder 120 caracteres'
  }

  if (!sanitized.accountHolder) {
    errors[`account_holder_${index}`] = 'El titular es obligatorio'
  } else if (sanitized.accountHolder.length < 2) {
    errors[`account_holder_${index}`] = 'Debe tener al menos 2 caracteres'
  } else if (sanitized.accountHolder.length > 180) {
    errors[`account_holder_${index}`] = 'No debe exceder 180 caracteres'
  }

  if (sanitized.accountNumber && !/^\d{1,10}$/.test(sanitized.accountNumber)) {
    errors[`account_number_${index}`] = 'Debe contener solo números y máximo 10 dígitos'
  }

  if (sanitized.clabe) {
    if (!/^\d{18}$/.test(sanitized.clabe)) {
      errors[`clabe_${index}`] = 'Debe contener exactamente 18 dígitos'
    } else if (!isValidClabe(sanitized.clabe)) {
      errors[`clabe_${index}`] = 'La CLABE no es válida'
    }
  }

  return !(
    errors[`bank_name_${index}`] ||
    errors[`account_holder_${index}`] ||
    errors[`account_number_${index}`] ||
    errors[`clabe_${index}`]
  )
}

function handleBankFieldBlur(index: number) {
  validateBankAccountRow(index)
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

  if (Number.isNaN(payload.paymentTermsDays)) {
    errors.paymentTermsDays = 'Debe ser un número válido'
  } else if (payload.paymentTermsDays < 0 || payload.paymentTermsDays > 365) {
    errors.paymentTermsDays = 'Debe estar entre 0 y 365'
  }

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

    if (bank.accountNumber && !/^\d{1,10}$/.test(bank.accountNumber)) {
      errors[`account_number_${i}`] = 'Debe contener solo números y máximo 10 dígitos'
    }

    if (bank.clabe) {
      if (!/^\d{18}$/.test(bank.clabe)) {
        errors[`clabe_${i}`] = 'Debe contener exactamente 18 dígitos'
      } else if (!isValidClabe(bank.clabe)) {
        errors[`clabe_${i}`] = 'La CLABE no es válida'
      }
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
}
</script>
