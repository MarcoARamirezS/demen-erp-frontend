import { defineStore } from 'pinia'

export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export interface ConfirmState {
  visible: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    /* ---------------- Toast ---------------- */
    toasts: [] as ToastItem[],

    /* ---------------- Loader ---------------- */
    loadingCount: 0,

    /* ---------------- Confirm ---------------- */
    confirm: {
      visible: false,
      title: '',
      message: '',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: undefined,
    } as ConfirmState,
  }),

  getters: {
    loading: state => state.loadingCount > 0,
  },

  actions: {
    /* ---------------- Toast ---------------- */
    showToast(type: ToastItem['type'], message: string) {
      const id = crypto.randomUUID()
      this.toasts.push({ id, type, message })

      setTimeout(() => {
        this.removeToast(id)
      }, 4000)
    },

    removeToast(id: string) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },

    /* ---------------- Loader (SAFE) ---------------- */
    showLoading() {
      this.loadingCount++
    },

    hideLoading() {
      if (this.loadingCount > 0) {
        this.loadingCount--
      }
    },

    /* ---------------- Confirm ---------------- */
    openConfirm(payload: Omit<ConfirmState, 'visible'>) {
      this.confirm = {
        visible: true,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        ...payload,
      }
    },

    closeConfirm() {
      this.confirm.visible = false
      this.confirm.onConfirm = undefined
    },
  },
})
