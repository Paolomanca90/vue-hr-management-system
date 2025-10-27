import { ref, watch, onBeforeUnmount, onMounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirmDialog } from './useConfirmDialog'

export interface UseFormDirtyStateOptions {
  onLeaveConfirmed?: () => void
  confirmMessage?: string
  confirmTitle?: string
}

export function useFormDirtyState<T extends Record<string, unknown>>(
  formData: Ref<T>,
  originalData: Ref<T | null>,
  options: UseFormDirtyStateOptions = {}
) {
  const isDirty = ref(false)
  const touchedFields = ref<Set<string>>(new Set())
  const { showConfirm } = useConfirmDialog()

  const router = useRouter()
  let removeGuard: (() => void) | null = null

  const checkDirty = () => {
    if (!originalData.value) {
      isDirty.value = false
      touchedFields.value.clear()
      return
    }

    // Confronta i valori campo per campo per identificare quali sono stati modificati
    const changedFields = new Set<string>()

    const compareObjects = (obj1: Record<string, unknown>, obj2: Record<string, unknown>, prefix = '') => {
      const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

      for (const key of keys) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const val1 = obj1[key]
        const val2 = obj2[key]

        // Se sono entrambi oggetti (ma non array o null), confronta ricorsivamente
        if (
          val1 !== null &&
          val2 !== null &&
          typeof val1 === 'object' &&
          typeof val2 === 'object' &&
          !Array.isArray(val1) &&
          !Array.isArray(val2)
        ) {
          compareObjects(val1 as Record<string, unknown>, val2 as Record<string, unknown>, fullKey)
        } else {
          // Confronta i valori (inclusi array, null, primitivi)
          if (JSON.stringify(val1) !== JSON.stringify(val2)) {
            changedFields.add(fullKey)
          }
        }
      }
    }

    compareObjects(formData.value, originalData.value)

    // Aggiorna touchedFields con i campi effettivamente modificati
    touchedFields.value = changedFields
    isDirty.value = changedFields.size > 0
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

  // Intercetta la navigazione e mostra dialog se ci sono modifiche non salvate
  onMounted(() => {
    const currentRoute = router.currentRoute.value

    removeGuard = router.beforeEach((to, from, next) => {
      // Controlla solo se stiamo lasciando la route corrente
      if (from.path !== currentRoute.path) {
        next()
        return
      }

      if (isDirty.value) {
        showConfirm({
          title: options.confirmTitle || 'Modifiche non salvate',
          message: options.confirmMessage || 'Ci sono modifiche non salvate. Sei sicuro di voler lasciare questa pagina?',
          type: 'warning',
          confirmLabel: 'Lascia pagina',
          cancelLabel: 'Rimani qui'
        }).then(confirmed => {
          if (confirmed) {
            if (options.onLeaveConfirmed) {
              options.onLeaveConfirmed()
            }
            next()
          } else {
            next(false)
          }
        })
      } else {
        next()
      }
    })
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
    if (removeGuard) {
      removeGuard()
    }
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
