import { useUiStore } from "~/stores/ui.store"

export const useToast = () => {
  const ui = useUiStore()
  return {
    success: (msg) => ui.showToast(msg, "success"),
    error: (msg) => ui.showToast(msg, "error"),
    warning: (msg) => ui.showToast(msg, "warning"),
    info: (msg) => ui.showToast(msg, "info"),
  }
}
