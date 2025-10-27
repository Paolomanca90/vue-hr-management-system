import { ref } from 'vue'

export interface ConfirmDialogOptions {
  title?: string
  message?: string
  description?: string
  warningText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  confirmLabel?: string
  cancelLabel?: string
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  visible: boolean
  resolve: ((value: boolean) => void) | null
}

const dialogState = ref<ConfirmDialogState>({
  visible: false,
  title: 'Conferma azione',
  message: 'Sei sicuro di voler procedere?',
  type: 'warning',
  confirmLabel: 'Conferma',
  cancelLabel: 'Annulla',
  resolve: null
})

export function useConfirmDialog() {
  const showConfirm = (options: ConfirmDialogOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      dialogState.value = {
        visible: true,
        title: options.title || 'Conferma azione',
        message: options.message || 'Sei sicuro di voler procedere?',
        description: options.description,
        warningText: options.warningText,
        type: options.type || 'warning',
        confirmLabel: options.confirmLabel || 'Conferma',
        cancelLabel: options.cancelLabel || 'Annulla',
        resolve
      }
    })
  }

  const handleConfirm = () => {
    if (dialogState.value.resolve) {
      dialogState.value.resolve(true)
    }
    dialogState.value.visible = false
    dialogState.value.resolve = null
  }

  const handleCancel = () => {
    if (dialogState.value.resolve) {
      dialogState.value.resolve(false)
    }
    dialogState.value.visible = false
    dialogState.value.resolve = null
  }

  return {
    dialogState,
    showConfirm,
    handleConfirm,
    handleCancel
  }
}
