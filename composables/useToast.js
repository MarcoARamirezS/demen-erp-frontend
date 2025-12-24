import { useUiStore } from "~/stores/ui.store"

export const useToast = () => {
  const ui = useUiStore()

  return {
    success: (msg) => ui.showToast("success", msg),
    error: (msg) => ui.showToast("error", msg),
    warning: (msg) => ui.showToast("warning", msg),
    info: (msg) => ui.showToast("info", msg),
  }
}
