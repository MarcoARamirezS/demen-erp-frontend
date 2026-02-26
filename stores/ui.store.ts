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
    toasts: [],
    loadingCount: 0,

    confirmState: {
      visible: false,
      title: '',
      message: '',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: undefined,
    } as ConfirmState,

    _confirmResolve: undefined as ((v: boolean) => void) | undefined,
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

    /* ---------------- Confirm (FIXED) ---------------- */
    async confirm(payload: Omit<ConfirmState, 'visible' | 'onConfirm'>) {
      return new Promise<boolean>(resolve => {
        this._confirmResolve = resolve

        this.confirmState.visible = true
        this.confirmState.title = payload.title
        this.confirmState.message = payload.message
        this.confirmState.confirmText = payload.confirmText ?? 'Confirmar'
        this.confirmState.cancelText = payload.cancelText ?? 'Cancelar'

        this.confirmState.onConfirm = () => {
          if (this._confirmResolve) {
            this._confirmResolve(true)
            this._confirmResolve = undefined
          }

          this.confirmState.visible = false
          this.confirmState.onConfirm = undefined
        }
      })
    },

    closeConfirm() {
      if (this._confirmResolve) {
        this._confirmResolve(false)
        this._confirmResolve = undefined
      }

      this.confirmState.visible = false
      this.confirmState.onConfirm = undefined
    },
  },
})
