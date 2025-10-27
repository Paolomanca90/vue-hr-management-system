<template>
  <div class="space-y-1">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica ${tolleranzaForm.descrizione} (${tolleranzaForm.codtoll})` : 'Nuova Tolleranza'"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Tolleranze', to: '/app/tolleranze' },
        { label: isEditMode ? 'Modifica' : 'Nuova' }
      ]"
    >
      <template #backButton>
        <button
          class="btn btn-ghost btn-circle btn-xs"
          @click="goBack"
          :disabled="saving"
          title="Indietro"
        >
          <FaIcon icon="arrow-left" />
        </button>
      </template>
      <template #actions>
        <FormStatusIndicator :isDirty="isDirty" :touchedFields="touchedFields" :showSavedIndicator="isEditMode" />
      </template>
    </PageHeader>

    <!-- Loading indicator -->
    <LoadingIndicator :loading="loading" message="Caricamento dati Tolleranza..." />

    <!-- Form Container -->
    <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">

      <ActionButtons
        entity-name="Tolleranza"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="tolleranzaNavigationConfig"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
        @reset="handleReset"
      />

      <!-- Dati Principali -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Dati Principali</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Codice Tolleranza -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Codice Tolleranza *</span>
              </label>
              <input
                v-model.number="tolleranzaForm.codtoll"
                type="number"
                :placeholder="isEditMode ? '' : 'Inserisci codice tolleranza'"
                class="input input-bordered w-full"
                :disabled="saving || isEditMode"
                required
                min="0"
              />
            </div>

            <!-- Descrizione -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Descrizione *</span>
              </label>
              <input
                v-model="tolleranzaForm.descrizione"
                type="text"
                placeholder="Inserisci descrizione"
                class="input input-bordered w-full"
                :disabled="saving"
                maxlength="100"
                required
              />
            </div>
          </div>

          <div class="mt-4 text-sm text-base-content/70">
            * Campi obbligatori
          </div>
        </div>
      </div>

      <!-- Tolleranze Entrata -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Tolleranze Entrata</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Minuti Entrata Prima -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Minuti Entrata Prima</span>
              </label>
              <input
                v-model.number="tolleranzaForm.minentrprima"
                type="number"
                placeholder="0"
                class="input input-bordered w-full"
                :disabled="saving"
                min="0"
              />
            </div>

            <!-- Minuti Entrata Dopo -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Minuti Entrata Dopo</span>
              </label>
              <input
                v-model.number="tolleranzaForm.minentrdopo"
                type="number"
                placeholder="0"
                class="input input-bordered w-full"
                :disabled="saving"
                min="0"
              />
            </div>

            <!-- Minuti Ritardo -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Minuti Ritardo</span>
              </label>
              <input
                v-model.number="tolleranzaForm.minrit"
                type="number"
                placeholder="0"
                class="input input-bordered w-full"
                :disabled="saving"
                min="0"
              />
            </div>
          </div>

          <!-- Causale Ritardo e Obbligo Entrata -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <!-- Causale Ritardo -->
            <div class="lg:col-span-2">
              <GenericLookupInput
                v-model="causaleRitardo"
                :config="causaliLookupConfig"
                :disabled="saving"
              />
            </div>

            <!-- Obbligo Entrata -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Obbligo Entrata</span>
              </label>
              <select
                v-model="tolleranzaForm.obbligoent"
                class="select select-bordered w-full"
                :disabled="saving"
              >
                <option value="">Nessuno</option>
                <option value="S">Sì</option>
                <option value="N">No</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tolleranze Uscita -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Tolleranze Uscita</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Minuti Uscita Prima -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Minuti Uscita Prima</span>
              </label>
              <input
                v-model.number="tolleranzaForm.minuscprima"
                type="number"
                placeholder="0"
                class="input input-bordered w-full"
                :disabled="saving"
                min="0"
              />
            </div>

            <!-- Minuti Uscita Dopo -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Minuti Uscita Dopo</span>
              </label>
              <input
                v-model.number="tolleranzaForm.minuscdopo"
                type="number"
                placeholder="0"
                class="input input-bordered w-full"
                :disabled="saving"
                min="0"
              />
            </div>

            <!-- Minuti Anticipo -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Minuti Anticipo</span>
              </label>
              <input
                v-model.number="tolleranzaForm.minant"
                type="number"
                placeholder="0"
                class="input input-bordered w-full"
                :disabled="saving"
                min="0"
              />
            </div>
          </div>

          <!-- Causale Anticipo e Obbligo Uscita -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <!-- Causale Anticipo -->
            <div class="lg:col-span-2">
              <GenericLookupInput
                v-model="causaleAnticipo"
                :config="causaliLookupConfig"
                :disabled="saving"
              />
            </div>

            <!-- Obbligo Uscita -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Obbligo Uscita</span>
              </label>
              <select
                v-model="tolleranzaForm.obbligousc"
                class="select select-bordered w-full"
                :disabled="saving"
              >
                <option value="">Nessuno</option>
                <option value="S">Sì</option>
                <option value="N">No</option>
              </select>
            </div>
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
import GenericLookupInput from '@/components/GenericLookupInput.vue'
import { tolleranzeService, type Tolleranza } from '@/services/tolleranzeService'
import { lookupService } from '@/services/lookupService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { causaleLookupConfig } from '@/config/lookupConfigs'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'

const route = useRoute()
const router = useRouter()

const {
  errorMessage,
  successMessage,
  clearMessages
} = useCrudView<Tolleranza>(tolleranzeService, {
  entityName: 'Tolleranza',
  idField: 'codtoll',
  listRoute: '/app/tolleranze',
  editRoute: '/app/tolleranze',
  newRoute: '/app/tolleranze/new'
})

useMessageAlerts(errorMessage, successMessage)

// Interface per dati causale
interface CausaleData {
  codice: string
  descrizione: string
}

// State per il form
const tolleranzaForm = ref<Tolleranza>({
  codtoll: 0,
  descrizione: '',
  minentrprima: 0,
  minentrdopo: 0,
  minrit: 0,
  codcaurit: 0,
  obbligoent: '',
  minuscprima: 0,
  minuscdopo: 0,
  minant: 0,
  codcauant: 0,
  obbligousc: ''
})

const originalData = ref<Tolleranza | null>(null)

const loading = ref(false)
const saving = ref(false)

const { isDirty, touchedFields, updateOriginalData } = useFormDirtyState(tolleranzaForm, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate alla Tolleranza. Sei sicuro di voler lasciare questa pagina?'
})

// State per le causali
const causaleRitardo = ref<CausaleData>({ codice: '', descrizione: '' })
const causaleAnticipo = ref<CausaleData>({ codice: '', descrizione: '' })
const causaliDisponibili = ref<Record<string, unknown>[]>([])

// Configurazione lookup causali con dati dinamici
const causaliLookupConfig = computed(() => ({
  ...causaleLookupConfig,
  modalConfig: {
    ...causaleLookupConfig.modalConfig,
    data: causaliDisponibili.value
  }
}))

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')

const isFormValid = computed(() => {
  return tolleranzaForm.value.codtoll > 0 &&
         tolleranzaForm.value.descrizione.trim() !== ''
})

// Navigation configuration
const tolleranzaNavigationConfig = {
  fetchAll: () => tolleranzeService.getTolleranze(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (entity: any) => String(entity.codtoll),
  basePath: '/app/tolleranze',
  entityType: 'tolleranza',
  defaultSortField: 'codtoll',
  defaultSortOrder: 1
}

// Watch per sincronizzare le causali con il form
watch(causaleRitardo, (newVal) => {
  if (newVal && newVal.codice) {
    tolleranzaForm.value.codcaurit = Number(newVal.codice) || 0
  } else {
    tolleranzaForm.value.codcaurit = 0
  }
}, { deep: true })

watch(causaleAnticipo, (newVal) => {
  if (newVal && newVal.codice) {
    tolleranzaForm.value.codcauant = Number(newVal.codice) || 0
  } else {
    tolleranzaForm.value.codcauant = 0
  }
}, { deep: true })

// Methods
const getCausaleDescrizione = (codcau: number | null | undefined): string => {
  if (!codcau || codcau === 0) return ''

  const causale = causaliDisponibili.value.find(c =>
    Number(c.CODCAU) === Number(codcau)
  )

  return causale ? String(causale.DESCRIZIONE || '') : ''
}

const loadCausaliDisponibili = async () => {
  try {
    const result = await lookupService.getList('causale')
    causaliDisponibili.value = result
  } catch (error) {
    console.error('Errore nel caricamento causali:', error)
    errorMessage.value = 'Errore nel caricamento delle causali disponibili'
  }
}

const loadTolleranza = async () => {
  if (!isEditMode.value) return

  const codtoll = Number(route.params.id)
  loading.value = true

  try {
    // Prova a recuperare dai dati del router state
    const routerState = window.history.state?.tolleranzaData
    if (routerState && routerState.codtoll === codtoll) {
      tolleranzaForm.value = {
        codtoll: routerState.codtoll,
        descrizione: routerState.descrizione || '',
        minentrprima: routerState.minentrprima ?? 0,
        minentrdopo: routerState.minentrdopo ?? 0,
        minrit: routerState.minrit ?? 0,
        codcaurit: routerState.codcaurit ?? 0,
        obbligoent: routerState.obbligoent || '',
        minuscprima: routerState.minuscprima ?? 0,
        minuscdopo: routerState.minuscdopo ?? 0,
        minant: routerState.minant ?? 0,
        codcauant: routerState.codcauant ?? 0,
        obbligousc: routerState.obbligousc || ''
      }

      // Inizializza le causali con la descrizione dal lookup
      causaleRitardo.value = {
        codice: routerState.codcaurit ? String(routerState.codcaurit) : '',
        descrizione: getCausaleDescrizione(routerState.codcaurit)
      }
      causaleAnticipo.value = {
        codice: routerState.codcauant ? String(routerState.codcauant) : '',
        descrizione: getCausaleDescrizione(routerState.codcauant)
      }
    } else {
      // Fallback semplice
      tolleranzaForm.value = {
        codtoll: codtoll,
        descrizione: `Tolleranza ${codtoll}`,
        minentrprima: 0,
        minentrdopo: 0,
        minrit: 0,
        codcaurit: 0,
        obbligoent: '',
        minuscprima: 0,
        minuscdopo: 0,
        minant: 0,
        codcauant: 0,
        obbligousc: ''
      }
      causaleRitardo.value = { codice: '', descrizione: '' }
      causaleAnticipo.value = { codice: '', descrizione: '' }
    }

    updateOriginalData(tolleranzaForm.value)
  } catch (error) {
    console.error('Errore nel caricamento Tolleranza:', error)
    errorMessage.value = 'I dati della Tolleranza verranno caricati dalla lista'
    tolleranzaForm.value = {
      codtoll: codtoll,
      descrizione: `Tolleranza ${codtoll}`,
      minentrprima: 0,
      minentrdopo: 0,
      minrit: 0,
      codcaurit: 0,
      obbligoent: '',
      minuscprima: 0,
      minuscdopo: 0,
      minant: 0,
      codcauant: 0,
      obbligousc: ''
    }
    causaleRitardo.value = { codice: '', descrizione: '' }
    causaleAnticipo.value = { codice: '', descrizione: '' }
  } finally {
    loading.value = false
  }
}

const handleDuplicateMode = () => {
  const duplicateCodtoll = route.query.duplicate as string

  if (duplicateCodtoll && !isEditMode.value) {
    const codcaurit = Number(route.query.sourceCodcaurit) || 0
    const codcauant = Number(route.query.sourceCodcauant) || 0

    tolleranzaForm.value = {
      codtoll: 0,
      descrizione: route.query.sourceDescrizione as string || '',
      minentrprima: Number(route.query.sourceMinentrprima) || 0,
      minentrdopo: Number(route.query.sourceMinentrdopo) || 0,
      minrit: Number(route.query.sourceMinrit) || 0,
      codcaurit: codcaurit,
      obbligoent: route.query.sourceObbligoent as string || '',
      minuscprima: Number(route.query.sourceMinuscprima) || 0,
      minuscdopo: Number(route.query.sourceMinuscdopo) || 0,
      minant: Number(route.query.sourceMinant) || 0,
      codcauant: codcauant,
      obbligousc: route.query.sourceObbligousc as string || ''
    }

    // Inizializza le causali con la descrizione dal lookup
    causaleRitardo.value = {
      codice: codcaurit ? String(codcaurit) : '',
      descrizione: getCausaleDescrizione(codcaurit)
    }
    causaleAnticipo.value = {
      codice: codcauant ? String(codcauant) : '',
      descrizione: getCausaleDescrizione(codcauant)
    }
  }
}

const goBack = () => {
  router.push('/app/tolleranze')
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  clearMessages()

  try {
    const tolleranzaToSave: Tolleranza = {
      codtoll: tolleranzaForm.value.codtoll,
      descrizione: tolleranzaForm.value.descrizione.trim(),
      minentrprima: tolleranzaForm.value.minentrprima ?? 0,
      minentrdopo: tolleranzaForm.value.minentrdopo ?? 0,
      minrit: tolleranzaForm.value.minrit ?? 0,
      codcaurit: tolleranzaForm.value.codcaurit ?? 0,
      obbligoent: tolleranzaForm.value.obbligoent || '',
      minuscprima: tolleranzaForm.value.minuscprima ?? 0,
      minuscdopo: tolleranzaForm.value.minuscdopo ?? 0,
      minant: tolleranzaForm.value.minant ?? 0,
      codcauant: tolleranzaForm.value.codcauant ?? 0,
      obbligousc: tolleranzaForm.value.obbligousc || ''
    }

    if (isEditMode.value) {
      await tolleranzeService.editTolleranza(tolleranzaToSave)
      updateOriginalData(tolleranzaForm.value)
      successMessage.value = 'Tolleranza aggiornata con successo'
    } else {
      await tolleranzeService.addTolleranza(tolleranzaToSave)
      successMessage.value = 'Nuova Tolleranza creata con successo'

      // Reindirizza alla modalità edit dopo la creazione
      setTimeout(() => {
        router.push(`/app/tolleranze/${tolleranzaToSave.codtoll}/edit`)
      }, 1500)
    }

    // Nasconde il messaggio dopo alcuni secondi
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    console.error('Errore nel salvataggio della Tolleranza:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio della Tolleranza'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  clearMessages()

  try {
    await tolleranzeService.deleteTolleranza(String(tolleranzaForm.value.codtoll))
    successMessage.value = 'Tolleranza eliminata con successo'

    setTimeout(() => {
      router.push('/app/tolleranze')
    }, 1500)

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione della Tolleranza'
  }
}

const handleDuplicate = () => {
  router.push({
    name: 'TolleranzaNew',
    query: {
      duplicate: String(tolleranzaForm.value.codtoll),
      sourceDescrizione: tolleranzaForm.value.descrizione,
      sourceMinentrprima: String(tolleranzaForm.value.minentrprima ?? 0),
      sourceMinentrdopo: String(tolleranzaForm.value.minentrdopo ?? 0),
      sourceMinrit: String(tolleranzaForm.value.minrit ?? 0),
      sourceCodcaurit: String(tolleranzaForm.value.codcaurit ?? 0),
      sourceObbligoent: tolleranzaForm.value.obbligoent || '',
      sourceMinuscprima: String(tolleranzaForm.value.minuscprima ?? 0),
      sourceMinuscdopo: String(tolleranzaForm.value.minuscdopo ?? 0),
      sourceMinant: String(tolleranzaForm.value.minant ?? 0),
      sourceCodcauant: String(tolleranzaForm.value.codcauant ?? 0),
      sourceObbligousc: tolleranzaForm.value.obbligousc || ''
    }
  })
}

const handleReset = () => {
  clearMessages()
  if (isEditMode.value) {
    loadTolleranza()
  } else {
    tolleranzaForm.value = {
      codtoll: 0,
      descrizione: '',
      minentrprima: 0,
      minentrdopo: 0,
      minrit: 0,
      codcaurit: 0,
      obbligoent: '',
      minuscprima: 0,
      minuscdopo: 0,
      minant: 0,
      codcauant: 0,
      obbligousc: ''
    }
    causaleRitardo.value = { codice: '', descrizione: '' }
    causaleAnticipo.value = { codice: '', descrizione: '' }
    handleDuplicateMode()
  }
}

// Inizializzazione
onMounted(async () => {
  await loadCausaliDisponibili()
  if (isEditMode.value) {
    await loadTolleranza()
  } else {
    handleDuplicateMode()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    clearMessages()

    if (causaliDisponibili.value.length === 0) {
      await loadCausaliDisponibili()
    }

    if (isEditMode.value) {
      await loadTolleranza()
    } else {
      tolleranzaForm.value = {
        codtoll: 0,
        descrizione: '',
        minentrprima: 0,
        minentrdopo: 0,
        minrit: 0,
        codcaurit: 0,
        obbligoent: '',
        minuscprima: 0,
        minuscdopo: 0,
        minant: 0,
        codcauant: 0,
        obbligousc: ''
      }
      causaleRitardo.value = { codice: '', descrizione: '' }
      causaleAnticipo.value = { codice: '', descrizione: '' }
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
