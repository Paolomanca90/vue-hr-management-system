import { ref, watch, onBeforeUnmount, type Ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

export interface UseFormDirtyStateOptions {
  onLeaveConfirmed?: () => void
  confirmMessage?: string
}

export function useFormDirtyState<T extends Record<string, unknown>>(
  formData: Ref<T>,
  originalData: Ref<T | null>,
  options: UseFormDirtyStateOptions = {}
) {
  const isDirty = ref(false)
  const touchedFields = ref<Set<string>>(new Set())

  const checkDirty = () => {
    if (!originalData.value) {
      isDirty.value = false
      return
    }

    const hasChanges = JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
    isDirty.value = hasChanges
  }

  const markFieldAsTouched = (fieldName: string) => {
    touchedFields.value.add(fieldName)
  }

  const isFieldTouched = (fieldName: string): boolean => {
    return touchedFields.value.has(fieldName)
  }

  const resetDirtyState = () => {
    isDirty.value = false
    touchedFields.value.clear()
  }

  // Aggiorna i dati originali (dopo un salvataggio riuscito)
  const updateOriginalData = (newData: T) => {
    originalData.value = JSON.parse(JSON.stringify(newData))
    resetDirtyState()
  }

  // Watch per aggiornare automaticamente isDirty
  watch(
    formData,
    () => {
      checkDirty()
    },
    { deep: true }
  )

  // Intercetta la navigazione e mostra alert se ci sono modifiche non salvate
  onBeforeRouteLeave((to, from, next) => {
    if (isDirty.value) {
      const message =
        options.confirmMessage ||
        'Ci sono modifiche non salvate. Sei sicuro di voler lasciare questa pagina?'

      if (window.confirm(message)) {
        if (options.onLeaveConfirmed) {
          options.onLeaveConfirmed()
        }
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  })

  // Intercetta la chiusura/refresh del browser
  const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (isDirty.value) {
      event.preventDefault()
      event.returnValue = ''
    }
  }

  // Listener per beforeunload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', beforeUnloadHandler)
  }

  // Rimuove listener quando il componente viene smontato
  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
    }
  })

  return {
    isDirty,
    touchedFields,
    markFieldAsTouched,
    isFieldTouched,
    resetDirtyState,
    updateOriginalData,
    checkDirty
  }
}
