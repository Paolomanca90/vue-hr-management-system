<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Festività Anno ${festiForm.anno} (${festiForm.anno})` : 'Nuovo Anno Festività'"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Festività', to: '/app/festi' },
        { label: isEditMode ? 'Modifica' : 'Nuova' }
      ]"
    >
      <template #backButton>
        <button class="btn btn-ghost btn-circle btn-sm" @click="goBack" :disabled="saving" title="Indietro">
          <FaIcon icon="arrow-left" />
        </button>
      </template>
      <template #actions>
        <FormStatusIndicator :isDirty="isDirty" :touchedFields="touchedFields" :showSavedIndicator="isEditMode" />
      </template>
    </PageHeader>

    <!-- Loading indicator -->
    <LoadingIndicator :loading="loading" message="Caricamento dati festività..." />

    <!-- Form Container -->
    <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">

      <ActionButtons
        entity-name="Anno"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="isEditMode"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="festiNavigationConfig"
        @delete="handleDelete"
        @reset="handleReset"
        @duplicate="handleDuplicate"
      />

      <!-- Anno Field -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Anno</h2>

          <div class="form-control max-w-xs">
            <label class="label">
              <span class="label-text font-medium dark:text-gray-200">Anno <span class="text-black">*</span></span>
            </label>
            <input
              v-model.number="festiForm.anno"
              type="number"
              :placeholder="isEditMode ? '' : 'Inserisci anno (es. 2025)'"
              class="input input-bordered w-full"
              :disabled="saving || isEditMode"
              required
              min="1900"
              max="2100"
            />
          </div>

          <div class="mt-4 text-sm text-base-content/70">
            <span class="text-black">*</span> Campi obbligatori
          </div>
        </div>
      </div>

      <!-- Festività Rows -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <EditableDataGrid
            v-model="festiForm.festivita"
            :columns="festivitaColumns"
            title="Festività"
            addButtonLabel="Aggiungi Festività"
            :disabled="saving"
            :emptyRowTemplate="createEmptyFestivita"
          />
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
import EditableDataGrid, { type GridColumn } from '@/components/EditableDataGrid.vue'
import { festiService, type FestiDettaglio } from '@/services/festiService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { causaliLookupConfig } from '@/config/lookupConfigs'
import { lookupService } from '@/services/lookupService'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'

const route = useRoute()
const router = useRouter()

const {
  errorMessage,
  successMessage,
  clearMessages
} = useCrudView(festiService, {
  entityName: 'Anno',
  idField: 'anno',
  listRoute: '/app/festi',
  editRoute: '/app/festi',
  newRoute: '/app/festi/new'
})

useMessageAlerts(errorMessage, successMessage)

// Precarica tutte le causali per il GenericLookupInput
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const causaliData = ref<any[]>([])
const causaliDataLoaded = ref(false)

const loadCausaliData = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const causali = await lookupService.getList<any>('gruppocausale')
    causaliData.value = causali
    causaliDataLoaded.value = true
    console.log('Causali caricate per lookup:', causali.length)
  } catch (error) {
    console.error('Errore caricamento causali data:', error)
  }
}

// Type per causali (compatibile con GenericLookupInput)
interface CausaleData {
  codice: string
  descrizione: string
}

// Type esteso per le festività nel form (include oggetti causali)
interface FestivitaForm {
  [key: string]: string | number | CausaleData
  anno: number
  mese: number
  giorno: number
  tipoFesta: number
  descrizione: string
  causLav: CausaleData
  causRip: CausaleData
}

const createEmptyFestivita = (): FestivitaForm => ({
  anno: festiForm.value.anno || new Date().getFullYear(),
  mese: 0,
  giorno: 0,
  tipoFesta: 0,
  descrizione: '',
  causLav: { codice: '', descrizione: '' },
  causRip: { codice: '', descrizione: '' }
})

// Interface per il form (estende FestiDettaglio con causali come oggetti)
interface FestiFormDettaglio {
  anno: number
  festivita: FestivitaForm[]
}

// State per il form
const festiForm = ref<FestiFormDettaglio>({
  anno: 0,
  festivita: []
})

const originalData = ref<FestiFormDettaglio | null>(null)

const loading = ref(false)
const saving = ref(false)

const { isDirty, touchedFields, updateOriginalData } = useFormDirtyState(festiForm, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate alle Festività. Sei sicuro di voler lasciare questa pagina?'
})

// Configurazione colonne per EditableDataGrid
const festivitaColumns = computed<GridColumn[]>(() => {
  const causaliArray = causaliData.value || []

  return [
    {
      field: 'data',
      header: 'Data',
      type: 'date',
      width: '120px'
    },
    {
      field: 'descrizione',
      header: 'Descrizione',
      type: 'text',
      width: '300px'
    },
    {
      field: 'tipoFesta',
      header: 'Tipo',
      type: 'dropdown',
      width: '150px',
      dropdownOptions: [
        { value: 0, label: '-' },
        { value: 1, label: '1 - Festivo' },
        { value: 2, label: '2 - Semifestivo' }
      ]
    },
    {
      field: 'causLav',
      header: 'Causale Lavoro',
      type: 'lookup',
      width: '200px',
      lookupConfig: causaliLookupConfig,
      lookupData: causaliArray
    },
    {
      field: 'causRip',
      header: 'Causale Riposo',
      type: 'lookup',
      width: '200px',
      lookupConfig: causaliLookupConfig,
      lookupData: causaliArray
    }
  ]
})

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')

const isFormValid = computed(() => {
  return festiForm.value.anno > 0
})

// Navigation configuration
const festiNavigationConfig = {
  fetchAll: () => festiService.getFestiAnni(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (entity: any) => String(entity.anno),
  basePath: '/app/festi',
  entityType: 'festi',
  defaultSortField: 'anno',
  defaultSortOrder: 1
}


// Methods
const loadFesti = async () => {
  if (!isEditMode.value) return

  const anno = Number(route.params.id)
  loading.value = true

  try {
    // Carica le festività per questo anno
    const festivitaData = await festiService.getFestiAnno(anno)

    const festivitaRows: FestivitaForm[] = []
    for (const fest of festivitaData) {
      const [causLavData, causRipData] = await Promise.all([
        fest.codCauLav ? lookupService.getGruppoCausaleByCode(String(fest.codCauLav)) : null,
        fest.codCauRip ? lookupService.getGruppoCausaleByCode(String(fest.codCauRip)) : null
      ])

      festivitaRows.push({
        ...fest,
        causLav: {
          codice: fest.codCauLav ? String(fest.codCauLav) : '',
          descrizione: causLavData?.descrizione || ''
        },
        causRip: {
          codice: fest.codCauRip ? String(fest.codCauRip) : '',
          descrizione: causRipData?.descrizione || ''
        }
      })
    }

    festiForm.value = {
      anno: anno,
      festivita: festivitaRows
    }

    updateOriginalData(festiForm.value)
  } catch (error) {
    console.error('Errore nel caricamento festività:', error)
    errorMessage.value = 'Errore nel caricamento dei dati festività. Riprova più tardi.'
    festiForm.value = {
      anno: anno,
      festivita: []
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/app/festi')
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  clearMessages()

  try {
    // Filtra solo le festività compilate (con almeno giorno e mese > 0)
    const festivitaValide = festiForm.value.festivita
      .filter(f => f.giorno > 0 && f.mese > 0)
      .map(f => ({
        anno: festiForm.value.anno,
        mese: f.mese,
        giorno: f.giorno,
        tipoFesta: f.tipoFesta,
        descrizione: f.descrizione,
        codCauLav: f.causLav?.codice ? Number(f.causLav.codice) : 0,
        codCauRip: f.causRip?.codice ? Number(f.causRip.codice) : 0
      }))

    const festiToSave: FestiDettaglio = {
      anno: festiForm.value.anno,
      festivita: festivitaValide
    }

    if (isEditMode.value) {
      await festiService.updateAnnoFestivita(festiToSave)
      updateOriginalData(festiForm.value)
      successMessage.value = 'Festività aggiornate con successo'
    } else {
      await festiService.createAnnoFestivita(festiToSave)
      successMessage.value = 'Nuovo anno festività creato con successo'

      // Reindirizza alla modalità edit dopo la creazione
      setTimeout(() => {
        router.push(`/app/festi/${festiToSave.anno}/edit`)
      }, 1500)
    }

    // Nasconde il messaggio dopo alcuni secondi
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    console.error('Errore nel salvataggio festività:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio festività'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  clearMessages()

  try {
    await festiService.deleteAnno(festiForm.value.anno)
    successMessage.value = 'Anno festività eliminato con successo'

    setTimeout(() => {
      router.push('/app/festi')
    }, 1500)

  } catch (error) {
    console.error('Errore nell\'eliminazione anno festività:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione anno festività'
  }
}

const handleReset = () => {
  clearMessages()
  if (isEditMode.value) {
    loadFesti()
  } else {
    festiForm.value = {
      anno: 0,
      festivita: []
    }
  }
}

const handleDuplicate = () => {
  clearMessages()
  // Crea un duplicato con anno incrementato
  const newAnno = festiForm.value.anno + 1
  festiForm.value.anno = newAnno

  // Aggiorna l'anno in tutte le festività
  festiForm.value.festivita = festiForm.value.festivita.map(f => ({
    ...f,
    anno: newAnno
  }))

  // Vai in modalità creazione
  router.push('/app/festi/new')
}

// Inizializzazione
onMounted(async () => {
  // Carica le causali per il GenericLookupInput
  await loadCausaliData()

  if (isEditMode.value) {
    await loadFesti()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    clearMessages()
    if (isEditMode.value) {
      await loadFesti()
    } else {
      festiForm.value = {
        anno: 0,
        festivita: []
      }
    }
  }
}, { immediate: true })
</script>

<style scoped>
.border-primary {
  border-color: oklch(var(--p));
}

.btn-outline:hover {
  color: white !important;
}
</style>
