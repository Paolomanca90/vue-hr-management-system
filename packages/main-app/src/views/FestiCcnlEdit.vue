<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Festività CCNL Anno: ${festiForm.anno}` : 'Nuova Festività CCNL'"
      :description="isEditMode ? 'Modifica le festività CCNL per l\'anno selezionato' : 'Crea nuove festività CCNL per un anno'"
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
    <LoadingIndicator :loading="loading" message="Caricamento dati festività CCNL..." />

    <!-- Form Container -->
    <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <ActionButtons
            entity-name="Festività CCNL"
            :is-edit-mode="isEditMode"
            :saving="saving"
            :is-form-valid="isFormValid"
            :show-duplicate="isEditMode"
            :show-delete="isEditMode"
            :show-reset="true"
            :show-navigation="isEditMode"
            :navigation-config="festiCcnlNavigationConfig"
            @delete="handleDelete"
            @reset="handleReset"
            @duplicate="handleDuplicate"
          />
        </div>
      </div>

      <!-- Dati Base -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Dati Base</h2>

          <div class="grid grid-cols-1 gap-6">
            <!-- Prima riga: Anno -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium dark:text-gray-200">Anno <span class="text-black">*</span></span>
              </label>
              <input
                v-model.number="festiForm.anno"
                type="number"
                placeholder="Inserisci anno (es. 2025)"
                class="input input-bordered w-full"
                :disabled="saving || isEditMode"
                required
                min="1900"
                max="2100"
              />
            </div>

            <!-- Seconda riga: CCNL e Provincia -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Codice CCNL -->
              <div>
                <GenericLookupInput
                  v-model="festiForm.ccnl"
                  :config="contrattoLookupConfig"
                  :lookup-data="contrattiData"
                  :disabled="saving || isEditMode"
                  size="sm"
                />
              </div>

              <!-- Provincia -->
              <div>
                <GenericLookupInput
                  v-model="festiForm.provinciaLookup"
                  :config="provinciaLookupConfig"
                  :lookup-data="provinceData"
                  :disabled="saving || isEditMode"
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div class="mt-4 text-sm text-base-content/70">
            <span class="text-black">*</span> Campi obbligatori
          </div>
        </div>
      </div>

      <!-- Festività -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between mb-6">
            <h2 class="card-title dark:text-gray-100">Festività</h2>
            <button
              type="button"
              class="btn btn-sm btn-primary text-white"
              @click="addFestivita"
              :disabled="saving"
            >
              <FaIcon icon="plus" class="mr-2" />
              Aggiungi Festività
            </button>
          </div>

          <div class="space-y-4">
            <div v-for="(festivita, index) in festiForm.festivita" :key="index" class="p-4 border border-base-300 rounded relative">
              <button
                type="button"
                class="btn btn-circle btn-ghost btn-xs absolute top-2 right-2"
                @click="removeFestivita(index)"
                :disabled="saving"
                title="Rimuovi festività"
              >
                <FaIcon icon="times" />
              </button>

              <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <!-- Data -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium dark:text-gray-200">Data</span>
                  </label>
                  <input
                    v-model="festivita.data"
                    type="date"
                    class="input input-bordered w-full"
                    :disabled="saving"
                  />
                </div>

                <!-- Descrizione -->
                <div class="form-control md:col-span-3">
                  <label class="label">
                    <span class="label-text font-medium dark:text-gray-200">Descrizione</span>
                  </label>
                  <input
                    v-model="festivita.descriz"
                    type="text"
                    placeholder="Descrizione festività"
                    class="input input-bordered w-full"
                    :disabled="saving"
                    maxlength="100"
                  />
                </div>

                <!-- Tipo Festa -->
                <div class="form-control">
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
              </div>

              <!-- Causali -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <GenericLookupInput
                    v-model="festivita.causLav"
                    :config="causaliLookupConfig"
                    :lookup-data="causaliData"
                    :disabled="saving"
                    size="xs"
                  />
                </div>
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

            <div v-if="festiForm.festivita.length === 0" class="text-center py-8 text-base-content/60">
              <FaIcon icon="calendar-plus" class="text-4xl mb-2" />
              <p>Nessuna festività aggiunta. Clicca sul pulsante "Aggiungi Festività" per iniziare.</p>
            </div>
          </div>
        </div>
      </div>

      <SimpleConfirmDialog
        :visible="showConfirmDialog"
        :title="confirmDialogTitle"
        :message="confirmDialogMessage"
        type="danger"
        @confirm="handleConfirmRemove"
        @cancel="handleCancelRemove"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import SimpleConfirmDialog from '@/components/SimpleConfirmDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import GenericLookupInput from '@/components/GenericLookupInput.vue'
import { festiCcnlService } from '@/services/festiCcnlService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { causaliLookupConfig, contrattoLookupConfig, provinciaLookupConfig } from '@/config/lookupConfigs'
import { lookupService } from '@/services/lookupService'

const route = useRoute()
const router = useRouter()

const {
  errorMessage,
  successMessage,
  clearMessages
} = useCrudView(festiCcnlService, {
  entityName: 'Festività CCNL',
  idField: 'anno',
  listRoute: '/app/festi-ccnl',
  editRoute: '/app/festi-ccnl',
  newRoute: '/app/festi-ccnl/new'
})

useMessageAlerts(errorMessage, successMessage)

// Precarica lookup
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const causaliData = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const contrattiData = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const provinceData = ref<any[]>([])

// Navigation configuration
const festiCcnlNavigationConfig = {
  fetchAll: () => festiCcnlService.getAll(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (entity: any) => String(entity.id),
  basePath: '/app/festi-ccnl',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortFn: (a: any, b: any) => a.anno - b.anno
}

const loadLookupData = async () => {
  try {
    const [causali, contratti, province] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lookupService.getList<any>('gruppocausale'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lookupService.getList<any>('contratto'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lookupService.getList<any>('provincia')
    ])
    causaliData.value = causali
    contrattiData.value = contratti
    provinceData.value = province
  } catch (error) {
    console.error('Errore caricamento lookup:', error)
  }
}

// Types per le causali
interface CausaleData {
  codice: string
  descrizione: string
}

// Type per festività nel form
interface FestivitaForm {
  data: string
  descriz: string
  tipoFesta: number
  causLav: CausaleData
  causRip: CausaleData
}

// Type per il form
interface FestiCcnlForm {
  anno: number
  codCCNL: number
  provincia: string
  ccnl: CausaleData
  provinciaLookup: CausaleData
  festivita: FestivitaForm[]
}

// State per il form
const festiForm = ref<FestiCcnlForm>({
  anno: 0,
  codCCNL: 0,
  provincia: '',
  ccnl: { codice: '', descrizione: '' },
  provinciaLookup: { codice: '', descrizione: '' },
  festivita: []
})

const loading = ref(false)
const saving = ref(false)

// Dialog state
const showConfirmDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const festiToRemoveIndex = ref(-1)

// Computed
const isEditMode = computed(() => {
  const params = route.params.id as string
  return params !== undefined && params !== 'new'
})

const isFormValid = computed(() => {
  return festiForm.value.anno > 0 &&
         festiForm.value.ccnl.codice.trim() !== '' &&
         festiForm.value.provinciaLookup.codice.trim() !== ''
})

// Watch per sincronizzare i valori delle lookup con i campi del form
watch(() => festiForm.value.ccnl.codice, (newVal) => {
  festiForm.value.codCCNL = newVal ? Number(newVal) : 0
})

watch(() => festiForm.value.provinciaLookup.codice, (newVal) => {
  festiForm.value.provincia = newVal || ''
})

// Methods
const addFestivita = () => {
  festiForm.value.festivita.push({
    data: '',
    descriz: '',
    tipoFesta: 0,
    causLav: { codice: '', descrizione: '' },
    causRip: { codice: '', descrizione: '' }
  })
}

const removeFestivita = (index: number) => {
  const festData = festiForm.value.festivita[index]
  festiToRemoveIndex.value = index
  confirmDialogTitle.value = 'Conferma rimozione'
  confirmDialogMessage.value = `Sei sicuro di voler rimuovere la festività "${festData.descriz || 'senza descrizione'}" del ${festData.data || 'data non impostata'}"?`
  showConfirmDialog.value = true
}

const handleConfirmRemove = () => {
  if (festiToRemoveIndex.value !== -1) {
    festiForm.value.festivita.splice(festiToRemoveIndex.value, 1)
    festiToRemoveIndex.value = -1
  }
  showConfirmDialog.value = false
}

const handleCancelRemove = () => {
  festiToRemoveIndex.value = -1
  showConfirmDialog.value = false
}

const loadFesti = async () => {
  if (!isEditMode.value) return

  // Per edit mode, dovremmo parsare i parametri dall'ID (anno-codCCNL-provincia)
  const params = (route.params.id as string).split('-')
  if (params.length !== 3) {
    errorMessage.value = 'Parametri URL non validi'
    return
  }

  const anno = Number(params[0])
  const codCCNL = Number(params[1])
  const provincia = params[2]

  loading.value = true

  try {
    // Usa getDettaglio con periodo dell'anno
    const periodoDal = `${anno}-01-01T00:00:00.000Z`
    const periodoAl = `${anno}-12-31T23:59:59.999Z`

    const dettagli = await festiCcnlService.getDettaglio({
      periodoDal,
      periodoAl,
      iContratto: codCCNL,
      sProv: provincia
    })

    if (dettagli.length > 0) {
      const dettaglio = dettagli[0]

      // Carica i dati delle lookup per CCNL e Provincia
      const [ccnlData, provinciaData] = await Promise.all([
        lookupService.getList('contratto').then(contratti =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contratti.find((c: any) => Number(c.CODCCNL) === dettaglio.codCCNL)
        ),
        lookupService.getList('provincia').then(province =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          province.find((p: any) => p.PROVINCIA === dettaglio.provincia)
        )
      ])

      festiForm.value = {
        anno: dettaglio.anno,
        codCCNL: dettaglio.codCCNL,
        provincia: dettaglio.provincia,
        ccnl: {
          codice: String(dettaglio.codCCNL),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          descrizione: (ccnlData as any)?.DESCRIZ || ''
        },
        provinciaLookup: {
          codice: dettaglio.provincia,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          descrizione: (provinciaData as any)?.DESCRIZ || ''
        },
        festivita: await Promise.all((dettaglio.listaGiorniFest || []).map(async (fest) => {
          const [causLavData, causRipData] = await Promise.all([
            fest.codCauLav ? lookupService.getGruppoCausaleByCode(String(fest.codCauLav)) : null,
            fest.codCauRip ? lookupService.getGruppoCausaleByCode(String(fest.codCauRip)) : null
          ])

          return {
            data: fest.data.split('T')[0],
            descriz: fest.descriz,
            tipoFesta: fest.tipoFesta,
            causLav: {
              codice: fest.codCauLav ? String(fest.codCauLav) : '',
              descrizione: causLavData?.descrizione || ''
            },
            causRip: {
              codice: fest.codCauRip ? String(fest.codCauRip) : '',
              descrizione: causRipData?.descrizione || ''
            }
          }
        }))
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento festività CCNL:', error)
    errorMessage.value = 'Errore nel caricamento dei dati. Riprova più tardi.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/app/festi-ccnl')
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  clearMessages()

  try {
    const festivitaValide = festiForm.value.festivita
      .filter(f => f.data && f.descriz)
      .map(f => ({
        data: new Date(f.data).toISOString(),
        descriz: f.descriz,
        tipoFesta: f.tipoFesta,
        codCauLav: f.causLav.codice ? Number(f.causLav.codice) : 0,
        codCauRip: f.causRip.codice ? Number(f.causRip.codice) : 0
      }))

    const festiToSave = {
      anno: festiForm.value.anno,
      codCCNL: festiForm.value.codCCNL,
      provincia: festiForm.value.provincia.toUpperCase(),
      festivita: festivitaValide
    }

    if (isEditMode.value) {
      await festiCcnlService.updateFestiCcnl(festiToSave)
      successMessage.value = 'Festività CCNL aggiornate con successo'
    } else {
      await festiCcnlService.createFestiCcnl(festiToSave)
      successMessage.value = 'Nuove festività CCNL create con successo'

      // Reindirizza alla modalità edit
      const editId = `${festiToSave.anno}-${festiToSave.codCCNL}-${festiToSave.provincia}`
      setTimeout(() => {
        router.push(`/app/festi-ccnl/${editId}/edit`)
      }, 1500)
    }

    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    console.error('Errore nel salvataggio festività CCNL:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio festività CCNL'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  clearMessages()

  try {
    await festiCcnlService.deleteFestiCcnl(
      festiForm.value.anno,
      festiForm.value.codCCNL,
      festiForm.value.provincia
    )
    successMessage.value = 'Festività CCNL eliminate con successo'

    setTimeout(() => {
      router.push('/app/festi-ccnl')
    }, 1500)

  } catch (error) {
    console.error('Errore nell\'eliminazione festività CCNL:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione festività CCNL'
  }
}

const handleReset = () => {
  clearMessages()
  if (isEditMode.value) {
    loadFesti()
  } else {
    festiForm.value = {
      anno: 0,
      codCCNL: 0,
      provincia: '',
      ccnl: { codice: '', descrizione: '' },
      provinciaLookup: { codice: '', descrizione: '' },
      festivita: []
    }
  }
}

const handleDuplicate = () => {
  clearMessages()
  const newAnno = festiForm.value.anno + 1
  festiForm.value.anno = newAnno
  router.push('/app/festi-ccnl/new')
}

// Inizializzazione
onMounted(async () => {
  await loadLookupData()

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
        codCCNL: 0,
        provincia: '',
        ccnl: { codice: '', descrizione: '' },
        provinciaLookup: { codice: '', descrizione: '' },
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
