import { useUiStore } from "~/stores/ui.store"

export const useConfirm = () => {
  const ui = useUiStore()

  return (options) => {
    ui.showConfirm(options)
  }
}
