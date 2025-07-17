import { ref } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'error' | 'success'
}

export function useConfirm() {
  const isOpen = ref(false)
  const options = ref<ConfirmOptions>({
    message: '',
    title: 'Conferma',
    confirmText: 'Conferma',
    cancelText: 'Annulla',
    type: 'info'
  })
  
  let resolvePromise: ((value: boolean) => void) | null = null

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    options.value = { ...options.value, ...opts }
    isOpen.value = true
    
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  const handleCancel = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel
  }
}
