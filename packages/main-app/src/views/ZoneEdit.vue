<template>
  <EditViewLayout>
    <template #header>
      <PageHeader
        :title="isEditMode ? `Modifica ${zonaForm.descrizione} (${zonaForm.codZona})` : 'Nuova Zona'"
        :breadcrumbItems="[
          { label: 'Home', to: '/app' },
          { label: 'Zone', to: '/app/zone' },
          { label: isEditMode ? 'Modifica' : 'Nuova' }
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
    </template>

    <template #actions>
      <ActionButtons
        v-if="!loading"
        entity-name="Zona"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="isEditMode"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="zoneNavigationConfig"
        @save="handleSave"
        @delete="handleDelete"
        @reset="handleReset"
        @duplicate="handleDuplicate"
      />
    </template>

    <template #content>
      <LoadingIndicator :loading="loading" message="Caricamento dati zona..." />

      <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">

      <!-- Dati Zona -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Dati Zona</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Codice Zona -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium dark:text-gray-200">Codice Zona <span class="text-black">*</span></span>
              </label>
              <input
                v-model.number="zonaForm.codZona"
                type="number"
                placeholder="Inserisci codice zona"
                class="input input-bordered w-full"
                :disabled="saving || isEditMode"
                required
                min="1"
              />
            </div>

            <!-- Descrizione -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium dark:text-gray-200">Descrizione <span class="text-black">*</span></span>
              </label>
              <input
                v-model="zonaForm.descrizione"
                type="text"
                placeholder="Inserisci descrizione zona"
                class="input input-bordered w-full"
                :disabled="saving"
                required
                maxlength="100"
              />
            </div>
          </div>

          <div class="mt-4  text-base-content/70">
            <span class="text-black">*</span> Campi obbligatori
          </div>
        </div>
      </div>

      <!-- Terminali Associati -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <MultiSelectList
            v-model="zonaForm.listaTerminali"
            :available-items="availableTerminali"
            key-field="codter"
            display-field="codter"
            subtitle-field="descrizione"
            title="Terminali"
            available-title="Terminali Disponibili"
            selected-title="Terminali Associati alla Zona"
            list-height="400px"
            :disabled="saving"
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
import MultiSelectList from '@/components/MultiSelectList.vue'
import { zoneService, type ZonaDettaglio, type Terminale } from '@/services/zoneService'
import { terminaleConfigService } from '@/services/terminaleConfigService'
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
} = useCrudView(zoneService, {
  entityName: 'Zona',
  idField: 'codZona',
  listRoute: '/app/zone',
  editRoute: '/app/zone',
  newRoute: '/app/zone/new'
})

useMessageAlerts(errorMessage, successMessage)

// State per il form
const zonaForm = ref<ZonaDettaglio>({
  codZona: 0,
  descrizione: '',
  listaTerminali: [],
  totTerm: 0
})

const loading = ref(false)
const saving = ref(false)
const originalData = ref<ZonaDettaglio | null>(null)

// Lista di tutti i terminali disponibili (usiamo Terminale invece di TerminaleConfig per compatibilità con null)
const availableTerminali = ref<Terminale[]>([])

const {
  isDirty,
  touchedFields,
  updateOriginalData
} = useFormDirtyState(zonaForm, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate alla Zona. Sei sicuro di voler lasciare questa pagina?'
})

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')

const isFormValid = computed(() => {
  return zonaForm.value.codZona > 0 && zonaForm.value.descrizione.trim() !== ''
})

// Navigation configuration
const zoneNavigationConfig = {
  fetchAll: () => zoneService.getAll(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (entity: any) => String(entity.codZona),
  basePath: '/app/zone',
  entityType: 'zona',
  defaultSortField: 'codZona',
  defaultSortOrder: 1
}

// Methods
const loadTerminaliDisponibili = async () => {
  try {
    const terminaliData = await terminaleConfigService.getTerminaliConfig()
    availableTerminali.value = terminaliData.map(t => ({
      codter: t.codter || '',
      descrizione: t.descrizione || '',
      tmrtp: t.tmrtp || '',
      tmmensa: t.tmmensa || '',
      tmcommesse: t.tmcommesse || '',
      codtermalt: t.codtermalt || ''
    }))
  } catch (error) {
    console.error('Errore nel caricamento terminali:', error)
    errorMessage.value = 'Errore nel caricamento dei terminali disponibili'
  }
}

const loadZona = async () => {
  if (!isEditMode.value) return

  const codZona = Number(route.params.id)
  loading.value = true

  try {
    const zonaData = await zoneService.getDettaglioZona(codZona)

    zonaForm.value = {
      ...zonaData,
      listaTerminali: (zonaData.listaTerminali || []).map(t => ({
        codter: t.codter || '',
        descrizione: t.descrizione || '',
        tmrtp: t.tmrtp || '',
        tmmensa: t.tmmensa || '',
        tmcommesse: t.tmcommesse || '',
        codtermalt: t.codtermalt || ''
      }))
    }
    updateOriginalData(zonaForm.value)
  } catch (error) {
    console.error('Errore nel caricamento zona:', error)
    errorMessage.value = 'Errore nel caricamento dei dati zona. Riprova più tardi.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/app/zone')
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  clearMessages()

  try {
    const zonaToSave: ZonaDettaglio = {
      codZona: zonaForm.value.codZona,
      descrizione: zonaForm.value.descrizione.trim(),
      listaTerminali: zonaForm.value.listaTerminali.map(t => ({
        codter: t.codter || '',
        descrizione: t.descrizione || '',
        tmrtp: t.tmrtp || '',
        tmmensa: t.tmmensa || '',
        tmcommesse: t.tmcommesse || '',
        codtermalt: t.codtermalt || ''
      })),
      totTerm: zonaForm.value.listaTerminali.length
    }

    if (isEditMode.value) {
      await zoneService.updateZona(zonaToSave)
      successMessage.value = 'Zona aggiornata con successo'
      updateOriginalData(zonaForm.value)
    } else {
      await zoneService.createZona(zonaToSave)
      successMessage.value = 'Nuova zona creata con successo'

      // Reindirizza alla modalità edit dopo la creazione
      setTimeout(() => {
        router.push(`/app/zone/${zonaToSave.codZona}/edit`)
      }, 1500)
    }

    // Nasconde il messaggio dopo alcuni secondi
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    console.error('Errore nel salvataggio zona:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio zona'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  clearMessages()

  try {
    await zoneService.deleteZona(zonaForm.value.codZona)
    successMessage.value = 'Zona eliminata con successo'

    setTimeout(() => {
      router.push('/app/zone')
    }, 1500)

  } catch (error) {
    console.error('Errore nell\'eliminazione zona:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione zona'
  }
}

const handleReset = () => {
  clearMessages()
  if (isEditMode.value) {
    loadZona()
  } else {
    zonaForm.value = {
      codZona: 0,
      descrizione: '',
      listaTerminali: [],
      totTerm: 0
    }
  }
}

const handleDuplicate = () => {
  clearMessages()
  // Crea un duplicato incrementando il codice zona
  const newCodZona = zonaForm.value.codZona + 1
  zonaForm.value.codZona = newCodZona
  zonaForm.value.descrizione = `${zonaForm.value.descrizione} (Copia)`

  // Va in modalità creazione
  router.push('/app/zone/new')
}

// Inizializzazione
onMounted(async () => {
  // Carica i terminali disponibili
  await loadTerminaliDisponibili()

  if (isEditMode.value) {
    await loadZona()
  } else {
    updateOriginalData(zonaForm.value)
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    clearMessages()
    if (isEditMode.value) {
      await loadZona()
    } else {
      zonaForm.value = {
        codZona: 0,
        descrizione: '',
        listaTerminali: [],
        totTerm: 0
      }
      updateOriginalData(zonaForm.value)
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
