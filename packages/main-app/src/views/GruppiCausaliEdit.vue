<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Gruppo Causale: ${gruppoCausaleForm.descrizione}` : 'Nuovo Gruppo Causale'"
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
    <LoadingIndicator :loading="loading" message="Caricamento dati gruppo causale..." />

    <!-- Form Container -->
    <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <ActionButtons
            entity-name="Gruppo Causale"
            :is-edit-mode="isEditMode"
            :saving="saving"
            :is-form-valid="isFormValid"
            :show-duplicate="isEditMode"
            :show-delete="isEditMode"
            :show-reset="true"
            :show-navigation="isEditMode"
            :navigation-config="gruppiCausaliNavigationConfig"
            @delete="handleDelete"
            @reset="handleReset"
            @duplicate="handleDuplicate"
          />
        </div>
      </div>

      <!-- Dati Gruppo Causale -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Dati Gruppo Causale</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Codice Gruppo Causale -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium dark:text-gray-200">Codice Gruppo *</span>
              </label>
              <input
                v-model.number="gruppoCausaleForm.codGrCau"
                type="number"
                placeholder="Inserisci codice gruppo"
                class="input input-bordered w-full"
                :disabled="saving || isEditMode"
                required
                min="0"
              />
            </div>

            <!-- Descrizione -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium dark:text-gray-200">Descrizione *</span>
              </label>
              <input
                v-model="gruppoCausaleForm.descrizione"
                type="text"
                placeholder="Inserisci descrizione gruppo"
                class="input input-bordered w-full"
                :disabled="saving"
                required
                maxlength="100"
              />
            </div>
          </div>

          <div class="mt-4 text-sm text-base-content/70">
            * Campi obbligatori
          </div>
        </div>
      </div>

      <!-- Causali Associate -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <EditableDataGrid
            v-model="gruppoCausaleForm.listaCausali"
            :columns="causaliColumns"
            title="Causali Associate"
            add-button-label="Aggiungi Causale"
            :disabled="saving"
            :empty-row-template="createEmptyCausale"
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
import EditableDataGrid, { type GridRow, type LookupValue } from '@/components/EditableDataGrid.vue'
import { gruppiCausaliService, type GruppoCausaleDettaglio, type CausaleConSegno } from '@/services/gruppiCausaliService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { lookupService } from '@/services/lookupService'

const route = useRoute()
const router = useRouter()

const {
  errorMessage,
  successMessage,
  clearMessages
} = useCrudView(gruppiCausaliService, {
  entityName: 'Gruppo Causale',
  idField: 'codGrCau',
  listRoute: '/app/gruppi-causali',
  editRoute: '/app/gruppi-causali',
  newRoute: '/app/gruppi-causali/new'
})

useMessageAlerts(errorMessage, successMessage)

interface CausaleGridRow extends GridRow {
  causale: LookupValue
  descrizione: string
  segno: string
}

interface GruppoCausaleForm {
  codGrCau: number
  descrizione: string
  listaCausali: CausaleGridRow[]
  totCau: number
}

// State per il form
const gruppoCausaleForm = ref<GruppoCausaleForm>({
  codGrCau: 0,
  descrizione: '',
  listaCausali: [],
  totCau: 0
})

const loading = ref(false)
const saving = ref(false)

// Lista di tutte le causali disponibili per la lookup
const causaliDisponibili = ref<Record<string, unknown>[]>([])

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')

const isFormValid = computed(() => {
  return gruppoCausaleForm.value.codGrCau >= 0 && gruppoCausaleForm.value.descrizione.trim() !== ''
})

// Navigation configuration
const gruppiCausaliNavigationConfig = {
  fetchAll: () => gruppiCausaliService.getAll(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (entity: any) => String(entity.codGrCau),
  basePath: '/app/gruppi-causali',
  entityType: 'gruppo-causale',
  defaultSortField: 'codGrCau',
  defaultSortOrder: 1
}

// Configurazione colonne per EditableDataGrid
const causaliColumns = computed(() => [
  {
    field: 'causale',
    header: 'Codice Causale',
    type: 'lookup' as const,
    width: '500px',
    lookupConfig: {
      lookupType: 'causale',
      fields: [],
      autoCompleteField: 'CODCAU',
      keyField: 'CODCAU',
      modalConfig: {
        title: 'Seleziona Causale',
        searchPlaceholder: 'Cerca per codice o descrizione...',
        columns: [
          { key: 'CODCAU', label: 'Codice', primary: true },
          { key: 'DESCRIZIONE', label: 'Descrizione' },
          { key: 'ABBREVIAZIONE', label: 'Abbreviazione' }
        ],
        searchFields: ['CODCAU', 'DESCRIZIONE', 'ABBREVIAZIONE'],
        keyField: 'CODCAU',
        loadingMessage: 'Caricamento causali...'
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapper: (item: any) => ({
        codice: String(item.CODCAU),
        descrizione: item.DESCRIZIONE
      })
    },
    lookupData: causaliDisponibili.value
  },
  {
    field: 'segno',
    header: 'Segno',
    type: 'dropdown' as const,
    width: '120px',
    dropdownOptions: [
      { value: '+', label: '+' },
      { value: '-', label: '-' }
    ]
  }
])

const createEmptyCausale = (): CausaleGridRow => ({
  causale: { codice: '', descrizione: '' },
  descrizione: '',
  segno: '+'
})

// Methods
const loadCausaliDisponibili = async () => {
  try {
    const result = await lookupService.getList('causale')
    causaliDisponibili.value = result
  } catch (error) {
    console.error('Errore nel caricamento causali:', error)
    errorMessage.value = 'Errore nel caricamento delle causali disponibili'
  }
}

const loadGruppoCausale = async () => {
  if (!isEditMode.value) return

  const codGrCau = Number(route.params.id)
  loading.value = true

  try {
    const gruppoData = await gruppiCausaliService.getDettaglioGruppoCausale(codGrCau)

    const causaliGrid: CausaleGridRow[] = (gruppoData.listaCausali || [])
      .filter(c => c && c.causale && c.causale.codCau != null)
      .map(c => ({
        causale: {
          codice: String(c.causale.codCau),
          descrizione: c.causale.descrizione || ''
        },
        descrizione: c.causale.descrizione || '',
        segno: c.segno || '+'
      }))

    gruppoCausaleForm.value = {
      codGrCau: gruppoData.codGrCau,
      descrizione: gruppoData.descrizione,
      listaCausali: causaliGrid,
      totCau: gruppoData.totCau
    }
  } catch (error) {
    console.error('Errore nel caricamento gruppo causale:', error)
    errorMessage.value = 'Errore nel caricamento del gruppo causale'
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
    const causaliServer: CausaleConSegno[] = gruppoCausaleForm.value.listaCausali
      .filter((c) => c.causale && c.causale.codice)
      .map((c) => ({
        causale: {
          codCau: Number(c.causale.codice),
          descrizione: c.descrizione || '',
          abbreviazione: ''
        },
        segno: c.segno || '+'
      }))

    const dataToSave: GruppoCausaleDettaglio = {
      codGrCau: gruppoCausaleForm.value.codGrCau,
      descrizione: gruppoCausaleForm.value.descrizione,
      listaCausali: causaliServer,
      totCau: causaliServer.length
    }

    if (isEditMode.value) {
      await gruppiCausaliService.updateGruppoCausale(dataToSave)
      successMessage.value = 'Gruppo causale aggiornato con successo'
    } else {
      await gruppiCausaliService.createGruppoCausale(dataToSave)
      successMessage.value = 'Gruppo causale creato con successo'
      router.push(`/app/gruppi-causali/${dataToSave.codGrCau}`)
    }
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
    errorMessage.value = (error as Error)?.message || 'Errore nel salvataggio del gruppo causale'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  try {
    await gruppiCausaliService.deleteGruppoCausale(gruppoCausaleForm.value.codGrCau)
    successMessage.value = 'Gruppo causale eliminato con successo'
    router.push('/app/gruppi-causali')
  } catch (error) {
    errorMessage.value = (error as Error)?.message || 'Errore nell\'eliminazione del gruppo causale'
  }
}

const handleReset = () => {
  if (isEditMode.value) {
    loadGruppoCausale()
  } else {
    gruppoCausaleForm.value = {
      codGrCau: 0,
      descrizione: '',
      listaCausali: [],
      totCau: 0
    }
  }
  clearMessages()
}

const handleDuplicate = () => {
  const duplicatedForm = {
    ...gruppoCausaleForm.value,
    codGrCau: 0,
    descrizione: `${gruppoCausaleForm.value.descrizione} - Copia`
  }
  gruppoCausaleForm.value = duplicatedForm
  router.push('/app/gruppi-causali/new')
}

const goBack = () => {
  router.push('/app/gruppi-causali')
}

// Watcher per route changes (navigation buttons)
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId && newId !== 'new') {
    await loadCausaliDisponibili()
    await loadGruppoCausale()
  }
}, { immediate: false })

onMounted(async () => {
  await loadCausaliDisponibili()
  await loadGruppoCausale()
})
</script>

<style scoped>
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
