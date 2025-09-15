import { useToast as usePrimeToast } from 'primevue/usetoast'

export interface ToastOptions {
  life?: number
  closable?: boolean
  sticky?: boolean
  group?: string
}

export const useToast = () => {
  const toast = usePrimeToast()

  const showSuccess = (summary: string, detail?: string, options?: ToastOptions) => {
    toast.add({
      severity: 'success',
      summary,
      detail,
      life: options?.life || 4000,
      closable: options?.closable !== false,
      group: options?.group
    })
  }

  const showError = (summary: string, detail?: string, options?: ToastOptions) => {
    toast.add({
      severity: 'error',
      summary,
      detail,
      life: options?.life || 6000,
      closable: options?.closable !== false,
      group: options?.group
    })
  }

  const showWarn = (summary: string, detail?: string, options?: ToastOptions) => {
    toast.add({
      severity: 'warn',
      summary,
      detail,
      life: options?.life || 5000,
      closable: options?.closable !== false,
      group: options?.group
    })
  }

  const showInfo = (summary: string, detail?: string, options?: ToastOptions) => {
    toast.add({
      severity: 'info',
      summary,
      detail,
      life: options?.life || 4000,
      closable: options?.closable !== false,
      group: options?.group
    })
  }

  const showSecondary = (summary: string, detail?: string, options?: ToastOptions) => {
    toast.add({
      severity: 'secondary',
      summary,
      detail,
      life: options?.life || 4000,
      closable: options?.closable !== false,
      group: options?.group
    })
  }

  const showContrast = (summary: string, detail?: string, options?: ToastOptions) => {
    toast.add({
      severity: 'contrast',
      summary,
      detail,
      life: options?.life || 4000,
      closable: options?.closable !== false,
      group: options?.group
    })
  }

  const clear = (group?: string) => {
    if (group) {
      toast.removeGroup(group)
    } else {
      toast.removeAllGroups()
    }
  }

  return {
    showSuccess,
    showError,
    showWarn,
    showInfo,
    showSecondary,
    showContrast,
    clear
  }
}

