<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Festività Anno: ${festiForm.anno}` : 'Nuovo Anno Festività'"
      :description="isEditMode ? 'Modifica le festività dell\'anno selezionato' : 'Crea un nuovo anno con le relative festività'"
    >
      <template #actions>
        <button
          class="btn btn-ghost btn-sm"
          @click="goBack"
          :disabled="saving"
        >
          <FaIcon icon="arrow-left" class="mr-2"/>
          Indietro
        </button>
      </template>
    </PageHeader>

    <!-- Loading indicator -->
    <LoadingIndicator :loading="loading" message="Caricamento dati festività..." />

    <!-- Form Container -->
    <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
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
        </div>
      </div>

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
          <h2 class="card-title mb-6 dark:text-gray-100">Festività (15 righe disponibili)</h2>

          <div class="space-y-4">
            <div v-for="(festivita, index) in festiForm.festivita" :key="index" class="p-3 border border-base-300 rounded">
              <!-- Prima riga: dati base -->
              <div class="flex items-start mb-3">
                <!-- Numero Riga -->
                <div class="text-xs font-medium pt-6 flex-shrink-0" style="min-width: 24px;">
                  {{ index + 1 }}.
                </div>

                <div class="grid grid-cols-12 gap-5 flex-grow">
                  <!-- Giorno -->
                  <div class="form-control col-span-1">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">GG</span>
                    </label>
                    <input
                      v-model.number="festivita.giorno"
                      type="number"
                      placeholder="GG"
                      class="input input-bordered w-full"
                      :disabled="saving"
                      min="1"
                      max="31"
                    />
                  </div>

                  <!-- Mese -->
                  <div class="form-control col-span-2">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Mese</span>
                    </label>
                    <select
                      v-model.number="festivita.mese"
                      class="select select-bordered w-full"
                      :disabled="saving"
                    >
                      <option :value="0">-</option>
                      <option :value="1">1 - Gennaio</option>
                      <option :value="2">2 - Febbraio</option>
                      <option :value="3">3 - Marzo</option>
                      <option :value="4">4 - Aprile</option>
                      <option :value="5">5 - Maggio</option>
                      <option :value="6">6 - Giugno</option>
                      <option :value="7">7 - Luglio</option>
                      <option :value="8">8 - Agosto</option>
                      <option :value="9">9 - Settembre</option>
                      <option :value="10">10 - Ottobre</option>
                      <option :value="11">11 - Novembre</option>
                      <option :value="12">12 - Dicembre</option>
                    </select>
                  </div>

                  <!-- Tipo Festa -->
                  <div class="form-control col-span-2">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Tipo</span>
                    </label>
                    <select
                      v-model.number="festivita.tipoFesta"
                      class="select select-bordered w-full"
                      :disabled="saving"
                    >
                      <option :value="0">-</option>
                      <option :value="1">1 - Festivo</option>
                      <option :value="2">2 - Semifestivo</option>
                    </select>
                  </div>

                  <!-- Descrizione -->
                  <div class="form-control col-span-7">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Descrizione</span>
                    </label>
                    <input
                      v-model="festivita.descrizione"
                      type="text"
                      placeholder="Descrizione festività"
                      class="input input-bordered w-full"
                      :disabled="saving"
                      maxlength="100"
                    />
                  </div>
                </div>
              </div>

              <!-- Seconda riga: causali -->
              <div class="flex gap-5 items-start pl-6">
                <!-- Causale Lavoro (Lookup) -->
                <div>
                  <GenericLookupInput
                    v-model="festivita.causLav"
                    :config="causaliLookupConfig"
                    :lookup-data="causaliData"
                    :disabled="saving"
                    size="xs"
                  />
                </div>

                <!-- Causale Riposo (Lookup) -->
                <div>
                  <GenericLookupInput
                    v-model="festivita.causRip"
                    :config="causaliLookupConfig"
                    :lookup-data="causaliData"
                    :disabled="saving"
                    size="xs"
                  />
                </div>
              </div>
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
import { festiService, type FestiDettaglio } from '@/services/festiService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { causaliLookupConfig } from '@/config/lookupConfigs'
import { lookupService } from '@/services/lookupService'

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
  anno: number
  mese: number
  giorno: number
  tipoFesta: number
  descrizione: string
  causLav: CausaleData
  causRip: CausaleData
}

// Crea 15 righe vuote per le festività
const createEmptyFestivitaRows = (anno: number = 0): FestivitaForm[] => {
  return Array.from({ length: 15 }, () => ({
    anno,
    mese: 0,
    giorno: 0,
    tipoFesta: 0,
    descrizione: '',
    causLav: { codice: '', descrizione: '' },
    causRip: { codice: '', descrizione: '' }
  }))
}

// Interface per il form (estende FestiDettaglio con causali come oggetti)
interface FestiFormDettaglio {
  anno: number
  festivita: FestivitaForm[]
}

// State per il form
const festiForm = ref<FestiFormDettaglio>({
  anno: 0,
  festivita: createEmptyFestivitaRows()
})

const loading = ref(false)
const saving = ref(false)

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortFn: (a: any, b: any) => a.anno - b.anno
}


// Methods
const loadFesti = async () => {
  if (!isEditMode.value) return

  const anno = Number(route.params.id)
  loading.value = true

  try {
    // Prova a recuperare dai dati del router state
    const routerState = window.history.state?.annoData

    if (routerState && routerState.anno === anno) {
      // Carica le festività per questo anno
      const festivitaData = await festiService.getFestiAnno(anno)

      // Crea 15 righe, riempiendo quelle disponibili e lasciando vuote le altre
      const festivitaRows = createEmptyFestivitaRows(anno)
      // Carica le descrizioni delle causali per i dati esistenti
      for (let index = 0; index < Math.min(festivitaData.length, 15); index++) {
        const fest = festivitaData[index]
        const [causLavData, causRipData] = await Promise.all([
          fest.codCauLav ? lookupService.getGruppoCausaleByCode(String(fest.codCauLav)) : null,
          fest.codCauRip ? lookupService.getGruppoCausaleByCode(String(fest.codCauRip)) : null
        ])

        festivitaRows[index] = {
          ...fest,
          causLav: {
            codice: fest.codCauLav ? String(fest.codCauLav) : '',
            descrizione: causLavData?.descrizione || ''
          },
          causRip: {
            codice: fest.codCauRip ? String(fest.codCauRip) : '',
            descrizione: causRipData?.descrizione || ''
          }
        }
      }

      festiForm.value = {
        anno: anno,
        festivita: festivitaRows
      }
    } else {
      // Fallback: carica comunque i dati
      const festivitaData = await festiService.getFestiAnno(anno)
      const festivitaRows = createEmptyFestivitaRows(anno)
      // Carica le descrizioni delle causali per i dati esistenti
      for (let index = 0; index < Math.min(festivitaData.length, 15); index++) {
        const fest = festivitaData[index]
        const [causLavData, causRipData] = await Promise.all([
          fest.codCauLav ? lookupService.getGruppoCausaleByCode(String(fest.codCauLav)) : null,
          fest.codCauRip ? lookupService.getGruppoCausaleByCode(String(fest.codCauRip)) : null
        ])

        festivitaRows[index] = {
          ...fest,
          causLav: {
            codice: fest.codCauLav ? String(fest.codCauLav) : '',
            descrizione: causLavData?.descrizione || ''
          },
          causRip: {
            codice: fest.codCauRip ? String(fest.codCauRip) : '',
            descrizione: causRipData?.descrizione || ''
          }
        }
      }

      festiForm.value = {
        anno: anno,
        festivita: festivitaRows
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento festività:', error)
    errorMessage.value = 'Errore nel caricamento dei dati festività. Riprova più tardi.'
    festiForm.value = {
      anno: anno,
      festivita: createEmptyFestivitaRows(anno)
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
      festivita: createEmptyFestivitaRows()
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
        festivita: createEmptyFestivitaRows()
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
