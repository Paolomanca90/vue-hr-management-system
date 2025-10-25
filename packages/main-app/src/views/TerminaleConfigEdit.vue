<template>
  <div class="space-y-1">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `${terminaleConfigForm.descrizione} (${terminaleConfigForm.codter})` : 'Nuovo Terminale Config'"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Terminali Config', to: '/app/terminali' },
        { label: isEditMode ? 'Modifica' : 'Nuovo' }
      ]"
    >
      <template #backButton>
        <button class="btn btn-ghost btn-circle btn-xs" @click="goBack" :disabled="saving" title="Indietro">
          <FaIcon icon="arrow-left" />
        </button>
      </template>
      <template #actions>
        <FormStatusIndicator :isDirty="isDirty" :touchedFields="touchedFields" :showSavedIndicator="isEditMode" />
      </template>
    </PageHeader>

    <!-- Loading indicator -->
    <LoadingIndicator :loading="loading" message="Caricamento dati Terminale..." />

    <!-- Form Container -->
    <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">

      <ActionButtons
        entity-name="Terminale"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="terminaleConfigNavigationConfig"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
        @reset="handleReset"
      />

      <!-- Form Fields -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Dati Terminale</h2>

          <!-- Prima riga: Codice e Descrizione -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Codice Terminale -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Codice Terminale <span class="text-black">*</span></span>
              </label>
              <input
                v-model="terminaleConfigForm.codter"
                type="text"
                :placeholder="isEditMode ? '' : 'Inserisci codice terminale'"
                class="input input-bordered w-full"
                :disabled="saving || isEditMode"
                maxlength="15"
                required
              />
            </div>

            <!-- Descrizione -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Descrizione <span class="text-black">*</span></span>
              </label>
              <input
                v-model="terminaleConfigForm.descrizione"
                type="text"
                placeholder="Inserisci descrizione"
                class="input input-bordered w-full"
                :disabled="saving"
                maxlength="30"
                required
              />
            </div>
          </div>

          <!-- Seconda riga: Codice Alt (metà) + Checkbox (altra metà) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Codice Terminale Alternativo -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Codice Terminale Alternativo</span>
              </label>
              <input
                v-model="terminaleConfigForm.codtermalt"
                type="text"
                placeholder="Inserisci codice alternativo"
                class="input input-bordered w-full"
                :disabled="saving"
                maxlength="15"
              />
            </div>

            <!-- Checkbox gruppo -->
            <div class="flex items-center gap-6">
              <!-- TM RTP -->
              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-2 py-2">
                  <input
                    v-model="formCheckboxes.tmrtp"
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm"
                    :disabled="saving"
                  />
                  <span class="label-text text-sm">TM RTP</span>
                </label>
              </div>

              <!-- TM Mensa -->
              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-2 py-2">
                  <input
                    v-model="formCheckboxes.tmmensa"
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm"
                    :disabled="saving"
                  />
                  <span class="label-text text-sm">TM Mensa</span>
                </label>
              </div>

              <!-- TM Commesse -->
              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-2 py-2">
                  <input
                    v-model="formCheckboxes.tmcommesse"
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm"
                    :disabled="saving"
                  />
                  <span class="label-text text-sm">TM Commesse</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Nota campi obbligatori -->
          <div class="mt-6 text-sm text-base-content/70">
            <span class="text-black">*</span> Campi obbligatori
          </div>

        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import { terminaleConfigService, type TerminaleConfig } from '@/services/terminaleConfigService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'

const route = useRoute()
const router = useRouter()

const {
  errorMessage,
  successMessage,
  clearMessages
} = useCrudView<TerminaleConfig>(terminaleConfigService, {
  entityName: 'Terminale',
  idField: 'codter',
  listRoute: '/app/terminali',
  editRoute: '/app/terminali',
  newRoute: '/app/terminali/new'
})

useMessageAlerts(errorMessage, successMessage)

// State per il form
const terminaleConfigForm = ref<TerminaleConfig>({
  codter: '',
  descrizione: '',
  tmrtp: '',
  tmmensa: '',
  tmcommesse: '',
  codtermalt: ''
})

// State per le checkbox (boolean)
const formCheckboxes = ref({
  tmrtp: false,
  tmmensa: false,
  tmcommesse: false
})

const loading = ref(false)
const saving = ref(false)
const originalData = ref<TerminaleConfig | null>(null)

const { isDirty, touchedFields, updateOriginalData } = useFormDirtyState(terminaleConfigForm, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate al Terminale Config. Sei sicuro di voler lasciare questa pagina?'
})

// Helper functions per conversione S/N ↔ boolean
const stringToBoolean = (value: string | undefined): boolean => {
  return value === 'S'
}

const booleanToString = (value: boolean): string => {
  return value ? 'S' : 'N'
}

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')

const isFormValid = computed(() => {
  return terminaleConfigForm.value.codter.trim() !== '' &&
         terminaleConfigForm.value.descrizione.trim() !== ''
})

// Navigation configuration
const terminaleConfigNavigationConfig = {
  fetchAll: () => terminaleConfigService.getTerminaliConfig(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (entity: any) => entity.codter,
  basePath: '/app/terminali',
  entityType: 'terminale-config',
  defaultSortField: 'codter',
  defaultSortOrder: 1
}

// Methods
const loadTerminaleConfig = async () => {
  if (!isEditMode.value) return

  const codter = String(route.params.id)
  loading.value = true

  try {
    // Prova a recuperare dai dati del router state
    const routerState = window.history.state?.terminaleData
    if (routerState && routerState.codter === codter) {
      terminaleConfigForm.value = {
        codter: routerState.codter,
        descrizione: routerState.descrizione,
        tmrtp: routerState.tmrtp || 'N',
        tmmensa: routerState.tmmensa || 'N',
        tmcommesse: routerState.tmcommesse || 'N',
        codtermalt: routerState.codtermalt || ''
      }

      // Converte i valori stringa in boolean per le checkbox
      formCheckboxes.value.tmrtp = stringToBoolean(routerState.tmrtp)
      formCheckboxes.value.tmmensa = stringToBoolean(routerState.tmmensa)
      formCheckboxes.value.tmcommesse = stringToBoolean(routerState.tmcommesse)

      updateOriginalData(terminaleConfigForm.value)
    } else {
      // Fallback semplice
      terminaleConfigForm.value = {
        codter: codter,
        descrizione: `Terminale ${codter}`,
        tmrtp: 'N',
        tmmensa: 'N',
        tmcommesse: 'N',
        codtermalt: ''
      }

      formCheckboxes.value.tmrtp = false
      formCheckboxes.value.tmmensa = false
      formCheckboxes.value.tmcommesse = false

      updateOriginalData(terminaleConfigForm.value)
    }
  } catch (error) {
    console.error('Errore nel caricamento Terminale:', error)
    errorMessage.value = 'I dati del Terminale verranno caricati dalla lista'
    terminaleConfigForm.value = {
      codter: codter,
      descrizione: `Terminale ${codter}`,
      tmrtp: 'N',
      tmmensa: 'N',
      tmcommesse: 'N',
      codtermalt: ''
    }

    formCheckboxes.value.tmrtp = false
    formCheckboxes.value.tmmensa = false
    formCheckboxes.value.tmcommesse = false

    updateOriginalData(terminaleConfigForm.value)
  } finally {
    loading.value = false
  }
}

const handleDuplicateMode = () => {
  const duplicateCodter = route.query.duplicate as string
  const sourceDescrizione = route.query.sourceDescrizione as string
  const sourceTmrtp = route.query.sourceTmrtp as string
  const sourceTmmensa = route.query.sourceTmmensa as string
  const sourceTmcommesse = route.query.sourceTmcommesse as string
  const sourceCodtermalt = route.query.sourceCodtermalt as string

  if (duplicateCodter && !isEditMode.value) {
    terminaleConfigForm.value = {
      codter: '',
      descrizione: sourceDescrizione || '',
      tmrtp: sourceTmrtp || 'N',
      tmmensa: sourceTmmensa || 'N',
      tmcommesse: sourceTmcommesse || 'N',
      codtermalt: sourceCodtermalt || ''
    }

    // Converte i valori stringa in boolean per le checkbox
    formCheckboxes.value.tmrtp = stringToBoolean(sourceTmrtp)
    formCheckboxes.value.tmmensa = stringToBoolean(sourceTmmensa)
    formCheckboxes.value.tmcommesse = stringToBoolean(sourceTmcommesse)
  }
}

const goBack = () => {
  router.push('/app/terminali')
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  clearMessages()

  try {
    // Converte i valori boolean delle checkbox in stringhe S/N
    const terminaleToSave: TerminaleConfig = {
      codter: terminaleConfigForm.value.codter.trim(),
      descrizione: terminaleConfigForm.value.descrizione.trim(),
      tmrtp: booleanToString(formCheckboxes.value.tmrtp),
      tmmensa: booleanToString(formCheckboxes.value.tmmensa),
      tmcommesse: booleanToString(formCheckboxes.value.tmcommesse),
      ...(terminaleConfigForm.value.codtermalt?.trim() !== '' && { codtermalt: terminaleConfigForm.value.codtermalt?.trim() })
    }

    if (isEditMode.value) {
      await terminaleConfigService.editTerminaleConfig(terminaleToSave)
      successMessage.value = 'Terminale aggiornato con successo'
      updateOriginalData(terminaleConfigForm.value)
    } else {
      await terminaleConfigService.addTerminaleConfig(terminaleToSave)
      successMessage.value = 'Nuovo Terminale creato con successo'

      // Reindirizza alla modalità edit dopo la creazione
      setTimeout(() => {
        router.push(`/app/terminali/${terminaleToSave.codter}/edit`)
      }, 1500)
    }

    // Nasconde il messaggio dopo alcuni secondi
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    console.error('Errore nel salvataggio del Terminale:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio del Terminale'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  clearMessages()

  try {
    await terminaleConfigService.deleteTerminaleConfig(terminaleConfigForm.value.codter)
    successMessage.value = 'Terminale eliminato con successo'

    setTimeout(() => {
      router.push('/app/terminali')
    }, 1500)

  } catch (error) {
    console.error('Errore nell\'eliminazione del Terminale:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione del Terminale'
  }
}

const handleDuplicate = () => {
  router.push({
    name: 'TerminaleConfigNew',
    query: {
      duplicate: terminaleConfigForm.value.codter,
      sourceDescrizione: terminaleConfigForm.value.descrizione,
      sourceTmrtp: booleanToString(formCheckboxes.value.tmrtp),
      sourceTmmensa: booleanToString(formCheckboxes.value.tmmensa),
      sourceTmcommesse: booleanToString(formCheckboxes.value.tmcommesse),
      sourceCodtermalt: terminaleConfigForm.value.codtermalt || ''
    }
  })
}

const handleReset = () => {
  clearMessages()
  if (isEditMode.value) {
    loadTerminaleConfig()
  } else {
    terminaleConfigForm.value = {
      codter: '',
      descrizione: '',
      tmrtp: 'N',
      tmmensa: 'N',
      tmcommesse: 'N',
      codtermalt: ''
    }
    formCheckboxes.value.tmrtp = false
    formCheckboxes.value.tmmensa = false
    formCheckboxes.value.tmcommesse = false
    handleDuplicateMode()
    updateOriginalData(terminaleConfigForm.value)
  }
}

// Inizializzazione
onMounted(async () => {
  if (isEditMode.value) {
    await loadTerminaleConfig()
  } else {
    handleDuplicateMode()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    clearMessages()
    if (isEditMode.value) {
      await loadTerminaleConfig()
    } else {
      terminaleConfigForm.value = {
        codter: '',
        descrizione: '',
        tmrtp: 'N',
        tmmensa: 'N',
        tmcommesse: 'N',
        codtermalt: ''
      }
      formCheckboxes.value.tmrtp = false
      formCheckboxes.value.tmmensa = false
      formCheckboxes.value.tmcommesse = false
      handleDuplicateMode()
    }
  }
}, { immediate: true })
</script>

<style scoped>
.border-primary {
  border-color: oklch(var(--p));
}

.text-primary {
  color: oklch(var(--p));
}

input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-outline:hover {
  color: white !important;
}
</style>
