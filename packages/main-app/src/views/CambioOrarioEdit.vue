<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <EditViewLayout>
    <template #header>
      <PageHeader
        :title="isEditMode ? `Modifica ${cambioForm.descrizione} (${cambioForm.codCambio})` : 'Nuovo Cambio Orario'"
        :breadcrumbItems="[
          { label: 'Home', to: '/app' },
          { label: 'Cambi Orario', to: '/app/cambio-orario' },
          { label: isEditMode ? 'Modifica' : 'Nuovo' }
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
          <FormStatusIndicator
            :isDirty="isDirty"
            :touchedFields="touchedFields"
            :showSavedIndicator="isEditMode"
          />
        </template>
      </PageHeader>
    </template>

    <template #actions>
      <ActionButtons
        v-if="!loading"
        entity-name="Cambio Orario"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="cambioOrarioNavigationConfig"
        @save="handleSave"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
        @reset="handleReset"
      />
    </template>

    <template #content>
      <!-- Loading indicator -->
      <LoadingIndicator :loading="loading" message="Caricamento dati Cambio Orario..." />

      <!-- Form Container -->
      <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">

      <!-- Dati Principali -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Dati Principali</h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Codice Cambio -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Codice Cambio</span>
              </label>
              <input
                v-model.number="cambioForm.codCambio"
                type="number"
                class="input input-bordered w-full"
                :disabled="isEditMode"
              />
            </div>

            <!-- Descrizione -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Descrizione</span>
              </label>
              <input
                v-model="cambioForm.descrizione"
                type="text"
                class="input input-bordered w-full"
                required
              />
            </div>

            <!-- Tipo Cambio -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Tipo Cambio</span>
              </label>
              <select
                v-model="cambioForm.tipoCambio"
                class="select select-bordered w-full"
                required
              >
                <option value="" disabled>Seleziona tipo</option>
                <option value="F">F - Fasce</option>
                <option value="T">T - Timbrature</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex gap-4">
            <div v-if="cambioForm.tipoCambio === 'F'" class="badge badge-primary badge-lg text-white">
              Fasce: {{ cambioForm.listaFasce?.length || 0 }}
            </div>
            <div v-if="cambioForm.tipoCambio === 'T'" class="badge badge-primary badge-lg text-white">
              Timbrature: {{ cambioForm.listaTimbrature?.length || 0 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Fasce Orarie (visibile solo se tipo = F) -->
      <div v-if="cambioForm.tipoCambio === 'F'" class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <EditableDataGrid
            v-model="cambioForm.listaFasce"
            :columns="fasceColumns"
            title="Fasce Orarie"
            addButtonLabel="Aggiungi Fascia"
            :disabled="saving"
            :emptyRowTemplate="createEmptyFascia"
          />
        </div>
      </div>

      <!-- Timbrature (visibile solo se tipo = T) -->
        <div v-if="cambioForm.tipoCambio === 'T'" class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <EditableDataGrid
              v-model="cambioForm.listaTimbrature"
              :columns="timbraturaColumns"
              title="Timbrature"
              addButtonLabel="Aggiungi Timbratura"
              :disabled="saving"
              :emptyRowTemplate="createEmptyTimbratura"
            />
          </div>
        </div>
      </form>
    </template>
  </EditViewLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import EditViewLayout from '@/components/EditViewLayout.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import EditableDataGrid, { type GridColumn } from '@/components/EditableDataGrid.vue'
import { cambioOrarioService, type CambioOrario, type CambioOrarioListItem } from '@/services/cambioOrarioService'
import { useCrudView, type CrudService } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import { orarioLookupConfig } from '@/config/lookupConfigs'
import { lookupService } from '@/services/lookupService'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'

const route = useRoute()
const router = useRouter()

const {
  errorMessage,
  successMessage,
  clearMessages
} = useCrudView(cambioOrarioService as unknown as CrudService<CambioOrarioListItem>, {
  entityName: 'Cambio Orario',
  idField: 'codCambio',
  listRoute: '/app/cambio-orario',
  editRoute: '/app/cambio-orario',
  newRoute: '/app/cambio-orario/new'
})

useMessageAlerts(errorMessage, successMessage)

// Precarica tutti gli orari per il lookup
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const orariData = ref<any[]>([])
const orariDataLoaded = ref(false)

const loadOrariData = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orari = await lookupService.getList<any>('orario')
    orariData.value = orari
    orariDataLoaded.value = true
    console.log('Orari caricati per lookup:', orari.length)
  } catch (error) {
    console.error('Errore caricamento orari data:', error)
  }
}

// State
const loading = ref(false)
const saving = ref(false)
const cambioForm = ref<CambioOrarioForm>({
  codCambio: 0,
  descrizione: '',
  tipoCambio: '',
  listaFasce: [],
  listaTimbrature: [],
  totCoFasce: 0,
  totCoTimbr: 0
})

const originalData = ref<CambioOrarioForm | null>(null)

const {
  isDirty,
  touchedFields,
  updateOriginalData
} = useFormDirtyState(cambioForm, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate al Cambio Orario. Sei sicuro di voler lasciare questa pagina?'
})

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const codCambio = computed(() => parseInt(route.params.id as string))

const isFormValid = computed(() => {
  return (
    cambioForm.value.codCambio > 0 &&
    cambioForm.value.descrizione.trim() !== '' &&
    cambioForm.value.tipoCambio.trim() !== ''
  )
})

// Navigation config
const cambioOrarioNavigationConfig = computed(() => ({
  fetchAll: async () => {
    const all = await cambioOrarioService.getAll()
    return all
  },
  getEntityId: (entity: { [key: string]: unknown }) => String(entity.codCambio),
  basePath: '/app/cambio-orario',
  entityType: 'cambioOrario',
  defaultSortField: 'codCambio',
  defaultSortOrder: 1
}))

interface OrarioData {
  codice: string
  descrizione: string
}

// Helper functions per conversione minuti <-> HH:MM
const minutesToTime = (minutes: number | string): string => {
  if (!minutes || minutes === 0 || minutes === '0') return ''
  const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes
  if (isNaN(mins)) return ''

  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${String(hours).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}`
}

const timeToMinutes = (time: string | number): number => {
  if (!time) return 0

  // Se è già un numero, ritorna direttamente
  if (typeof time === 'number') return time

  const timeStr = String(time).trim()
  if (!timeStr) return 0

  // Se contiene ':', è nel formato HH:MM
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(part => parseInt(part) || 0)
    return hours * 60 + minutes
  }

  // Altrimenti applica logica intelligente
  const numStr = timeStr.replace(/[^0-9]/g, '')
  if (!numStr) return 0

  const num = parseInt(numStr)

  // Se il numero è tra 0 e 23, è un'ora (es: 12 -> 12:00 -> 720)
  if (num >= 0 && num <= 23) {
    return num * 60
  }

  // Se il numero è tra 100 e 2359, è nel formato HHMM (es: 745 -> 7:45 -> 465)
  if (num >= 100 && num <= 2359) {
    const hours = Math.floor(num / 100)
    const minutes = num % 100
    return hours * 60 + minutes
  }

  // Altrimenti considera come minuti
  return num
}

interface FasciaForm {
  [key: string]: string | number | OrarioData
  codCambio: number
  codOra: OrarioData
  progressivo: number
  dalle1: string
  alle1: string
  peso1: number
  dalle2: string
  alle2: string
  peso2: number
  dalle3: string
  alle3: string
  peso3: number
  dalle4: string
  alle4: string
  peso4: number
}

interface TimbraturaForm {
  [key: string]: string | number | OrarioData
  codCambio: number
  codOra: OrarioData
  progressivo: number
  entrataDalle: string
  entrataAlle: string
  uscitaDalle: string
  uscitaAlle: string
}

interface CambioOrarioForm {
  codCambio: number
  descrizione: string
  tipoCambio: string
  listaFasce: FasciaForm[]
  listaTimbrature: TimbraturaForm[]
  totCoFasce: number
  totCoTimbr: number
}

const fasceColumns = computed<GridColumn[]>(() => {
  const orariArray = orariData.value || []

  return [
    {
      field: 'codOra',
      header: 'Cod. Ora',
      type: 'lookup',
      width: '150px',
      lookupConfig: orarioLookupConfig,
      lookupData: orariArray
    },
  {
    field: 'dalle1',
    header: 'F1 - Dalle',
    type: 'time',
    width: '100px'
  },
  {
    field: 'alle1',
    header: 'F1 - Alle',
    type: 'time',
    width: '100px'
  },
  {
    field: 'peso1',
    header: 'F1 - Peso',
    type: 'number',
    width: '100px'
  },
  {
    field: 'dalle2',
    header: 'F2 - Dalle',
    type: 'time',
    width: '100px'
  },
  {
    field: 'alle2',
    header: 'F2 - Alle',
    type: 'time',
    width: '100px'
  },
  {
    field: 'peso2',
    header: 'F2 - Peso',
    type: 'number',
    width: '100px'
  },
  {
    field: 'dalle3',
    header: 'F3 - Dalle',
    type: 'time',
    width: '100px'
  },
  {
    field: 'alle3',
    header: 'F3 - Alle',
    type: 'time',
    width: '100px'
  },
  {
    field: 'peso3',
    header: 'F3 - Peso',
    type: 'number',
    width: '100px'
  },
  {
    field: 'dalle4',
    header: 'F4 - Dalle',
    type: 'time',
    width: '100px'
  },
  {
    field: 'alle4',
    header: 'F4 - Alle',
    type: 'time',
    width: '100px'
  },
  {
    field: 'peso4',
    header: 'F4 - Peso',
    type: 'number',
    width: '100px'
  }
]
})

const timbraturaColumns = computed<GridColumn[]>(() => {
  const orariArray = orariData.value || []

  return [
    {
      field: 'codOra',
      header: 'Cod. Ora',
      type: 'lookup',
      width: '150px',
      lookupConfig: orarioLookupConfig,
      lookupData: orariArray
    },
  {
    field: 'entrataDalle',
    header: 'Entrata Dalle',
    type: 'time',
    width: '120px'
  },
  {
    field: 'entrataAlle',
    header: 'Entrata Alle',
    type: 'time',
    width: '120px'
  },
  {
    field: 'uscitaDalle',
    header: 'Uscita Dalle',
    type: 'time',
    width: '120px'
  },
  {
    field: 'uscitaAlle',
    header: 'Uscita Alle',
    type: 'time',
    width: '120px'
  }
]
})

const createEmptyFascia = (): FasciaForm => ({
  codCambio: cambioForm.value.codCambio,
  codOra: { codice: '', descrizione: '' } as OrarioData,
  progressivo: (cambioForm.value.listaFasce?.length || 0) + 1,
  dalle1: '',
  alle1: '',
  peso1: 0,
  dalle2: '',
  alle2: '',
  peso2: 0,
  dalle3: '',
  alle3: '',
  peso3: 0,
  dalle4: '',
  alle4: '',
  peso4: 0
})

const createEmptyTimbratura = (): TimbraturaForm => ({
  codCambio: cambioForm.value.codCambio,
  codOra: { codice: '', descrizione: '' } as OrarioData,
  progressivo: (cambioForm.value.listaTimbrature?.length || 0) + 1,
  entrataDalle: '',
  entrataAlle: '',
  uscitaDalle: '',
  uscitaAlle: ''
})

// Methods
const loadCambioOrario = async () => {
  if (!isEditMode.value) return

  loading.value = true
  try {
    const data = await cambioOrarioService.getDettaglio(codCambio.value)

    const fasceWithLookup = await Promise.all(
      (data.listaFasce || []).map(async (fascia) => {
        const orarioData = fascia.codOra
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? await lookupService.getListByCode<any>('orario', String(fascia.codOra), 'CODORA')
          : null

        return {
          ...fascia,
          codOra: orarioData
            ? { codice: String(orarioData.CODORA), descrizione: orarioData.DESCRIZIONE || '' }
            : { codice: '', descrizione: '' },
          dalle1: minutesToTime(fascia.dalle1),
          alle1: minutesToTime(fascia.alle1),
          dalle2: minutesToTime(fascia.dalle2),
          alle2: minutesToTime(fascia.alle2),
          dalle3: minutesToTime(fascia.dalle3),
          alle3: minutesToTime(fascia.alle3),
          dalle4: minutesToTime(fascia.dalle4),
          alle4: minutesToTime(fascia.alle4)
        }
      })
    )

    const timbraturaWithLookup = await Promise.all(
      (data.listaTimbrature || []).map(async (timbr) => {
        const orarioData = timbr.codOra
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? await lookupService.getListByCode<any>('orario', String(timbr.codOra), 'CODORA')
          : null

        return {
          ...timbr,
          codOra: orarioData
            ? { codice: String(orarioData.CODORA), descrizione: orarioData.DESCRIZIONE || '' }
            : { codice: '', descrizione: '' },
          entrataDalle: minutesToTime(timbr.entrataDalle),
          entrataAlle: minutesToTime(timbr.entrataAlle),
          uscitaDalle: minutesToTime(timbr.uscitaDalle),
          uscitaAlle: minutesToTime(timbr.uscitaAlle)
        }
      })
    )

    cambioForm.value = {
      ...data,
      listaFasce: fasceWithLookup,
      listaTimbrature: timbraturaWithLookup
    }
    originalData.value = JSON.parse(JSON.stringify(cambioForm.value))
  } catch (error) {
    console.error('Errore nel caricamento del Cambio Orario:', error)
    errorMessage.value = 'Errore nel caricamento del Cambio Orario'
    goBack()
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) {
    errorMessage.value = 'Compila tutti i campi obbligatori'
    return
  }

  saving.value = true
  clearMessages()

  try {
    // Converte dati del form da formato visualizzazione a formato backend
    const dataToSave: CambioOrario = {
      codCambio: cambioForm.value.codCambio,
      descrizione: cambioForm.value.descrizione,
      tipoCambio: cambioForm.value.tipoCambio,
      totCoFasce: cambioForm.value.totCoFasce || 0,
      totCoTimbr: cambioForm.value.totCoTimbr || 0,
      listaFasce: cambioForm.value.tipoCambio === 'F'
        ? cambioForm.value.listaFasce
            .filter(fascia => fascia.codOra?.codice && fascia.codCambio)
            .map(fascia => ({
              codCambio: fascia.codCambio,
              codOra: fascia.codOra?.codice ? parseInt(fascia.codOra.codice) : 0,
              progressivo: fascia.progressivo,
              dalle1: timeToMinutes(fascia.dalle1),
              alle1: timeToMinutes(fascia.alle1),
              peso1: fascia.peso1 || 0,
              dalle2: timeToMinutes(fascia.dalle2),
              alle2: timeToMinutes(fascia.alle2),
              peso2: fascia.peso2 || 0,
              dalle3: timeToMinutes(fascia.dalle3),
              alle3: timeToMinutes(fascia.alle3),
              peso3: fascia.peso3 || 0,
              dalle4: timeToMinutes(fascia.dalle4),
              alle4: timeToMinutes(fascia.alle4),
              peso4: fascia.peso4 || 0
            }))
        : [],
      listaTimbrature: cambioForm.value.tipoCambio === 'T'
        ? cambioForm.value.listaTimbrature
            .filter(timbr => timbr.codOra?.codice && timbr.codCambio)
            .map(timbr => ({
              codCambio: timbr.codCambio,
              codOra: timbr.codOra?.codice ? parseInt(timbr.codOra.codice) : 0,
              progressivo: timbr.progressivo,
              entrataDalle: timeToMinutes(timbr.entrataDalle),
              entrataAlle: timeToMinutes(timbr.entrataAlle),
              uscitaDalle: timeToMinutes(timbr.uscitaDalle),
              uscitaAlle: timeToMinutes(timbr.uscitaAlle)
            }))
        : []
    }

    if (isEditMode.value) {
      await cambioOrarioService.updateCambioOrario(dataToSave)
      successMessage.value = 'Cambio Orario aggiornato con successo'
      // Ricarica i dati aggiornati
      await loadCambioOrario()
      updateOriginalData(cambioForm.value)
    } else {
      const created = await cambioOrarioService.createCambioOrario(dataToSave)
      successMessage.value = 'Cambio Orario creato con successo'
      // Reindirizza alla modalità edit
      setTimeout(() => {
        router.push(`/app/cambio-orario/${created.codCambio}/edit`)
      }, 1500)
    }

    // Nasconde il messaggio dopo alcuni secondi
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    console.error('Errore nel salvataggio del Cambio Orario:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio del Cambio Orario'
  } finally {
    saving.value = false
  }
}

const handleDuplicate = () => {
  const duplicated = JSON.parse(JSON.stringify(cambioForm.value))
  duplicated.codCambio = 0
  duplicated.descrizione = `${duplicated.descrizione} (Copia)`
  cambioForm.value = duplicated
  router.push('/app/cambio-orario/new')
}

const handleReset = () => {
  clearMessages()
  if (originalData.value) {
    cambioForm.value = JSON.parse(JSON.stringify(originalData.value))
    successMessage.value = 'Dati ripristinati con successo'
  } else {
    cambioForm.value = {
      codCambio: 0,
      descrizione: '',
      tipoCambio: '',
      listaFasce: [],
      listaTimbrature: [],
      totCoFasce: 0,
      totCoTimbr: 0
    }
    updateOriginalData(cambioForm.value)
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  clearMessages()

  try {
    saving.value = true
    await cambioOrarioService.delete(String(codCambio.value))
    successMessage.value = 'Cambio Orario eliminato con successo'

    setTimeout(() => {
      router.push('/app/cambio-orario')
    }, 1500)
  } catch (error) {
    console.error('Errore nell\'eliminazione del Cambio Orario:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione del Cambio Orario'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/app/cambio-orario')
}

// Watcher per ricaricare i dati quando cambia l'ID nell'URL
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId && isEditMode.value) {
    loadCambioOrario()
  }
}, { immediate: false })

onMounted(async () => {
  // Carica gli orari per il lookup
  await loadOrariData()

  // Carica i dati del cambio orario se in edit mode
  if (isEditMode.value) {
    await loadCambioOrario()
  } else {
    // Inizializza originalData anche in modalità creazione
    updateOriginalData(cambioForm.value)
  }
})
</script>

<style scoped>
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.table th {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: oklch(var(--b2));
}

.table-zebra tbody tr:nth-child(even) {
  background-color: oklch(var(--b2) / 0.5);
}

.badge-lg {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.overflow-x-auto {
  max-width: 100%;
  overflow-x: auto;
}

.alert {
  border-radius: 0.5rem;
}
</style>
