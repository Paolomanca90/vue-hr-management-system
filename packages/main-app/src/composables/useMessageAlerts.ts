import { watch, type Ref } from 'vue'
import { useToast } from '@presenze-in-web-frontend/core-lib'

export const useMessageAlerts = (
  errorMessage: Ref<string>,
  successMessage: Ref<string>,
  warningMessage?: Ref<string>,
  infoMessage?: Ref<string>
) => {
  const { showSuccess, showError, showWarn, showInfo } = useToast()

  // Watch per i messaggi di errore
  watch(errorMessage, (newMessage, oldMessage) => {
    if (newMessage && newMessage !== oldMessage) {
      showError('Errore', newMessage)
      // Pulisce automaticamente il messaggio dopo averlo mostrato
      setTimeout(() => {
        errorMessage.value = ''
      }, 100)
    }
  })

  // Watch per i messaggi di successo
  watch(successMessage, (newMessage, oldMessage) => {
    if (newMessage && newMessage !== oldMessage) {
      showSuccess('Successo', newMessage)
      // Pulisce automaticamente il messaggio dopo averlo mostrato
      setTimeout(() => {
        successMessage.value = ''
      }, 100)
    }
  })

  // Watch per i messaggi di warning (opzionale)
  if (warningMessage) {
    watch(warningMessage, (newMessage, oldMessage) => {
      if (newMessage && newMessage !== oldMessage) {
        showWarn('Attenzione', newMessage)
        setTimeout(() => {
          warningMessage.value = ''
        }, 100)
      }
    })
  }

  // Watch per i messaggi info (opzionale)
  if (infoMessage) {
    watch(infoMessage, (newMessage, oldMessage) => {
      if (newMessage && newMessage !== oldMessage) {
        showInfo('Informazione', newMessage)
        setTimeout(() => {
          infoMessage.value = ''
        }, 100)
      }
    })
  }

  // Funzioni helper per mostrare direttamente i toast
  const showErrorToast = (message: string, detail?: string) => {
    showError(message, detail)
  }

  const showSuccessToast = (message: string, detail?: string) => {
    showSuccess(message, detail)
  }

  const showWarningToast = (message: string, detail?: string) => {
    showWarn(message, detail)
  }

  const showInfoToast = (message: string, detail?: string) => {
    showInfo(message, detail)
  }

  return {
    showErrorToast,
    showSuccessToast,
    showWarningToast,
    showInfoToast
  }
}
