<template>
  <EditViewLayout>
    <template #header>
      <PageHeader
        :title="isEditMode ? `Modifica ${posizioneInpsForm.matrInps || 'Posizione INPS'} (${posizioneInpsForm.posInps})` : 'Nuova Posizione INPS'"
        :breadcrumbItems="[
          { label: 'Home', to: '/app' },
          { label: 'Posizioni INPS', to: '/app/posizioni-inps' },
          { label: isEditMode ? 'Modifica' : 'Nuova' }
        ]"
      >
        <template #backButton>
          <button class="btn btn-ghost btn-circle btn-xs" @click="goBack" :disabled="saving" title="Indietro">
            <FaIcon icon="arrow-left" />
          </button>
        </template>
        <template #actions>
          <FormStatusIndicator :is-dirty="isDirty" :touched-fields="touchedFields" />
        </template>
      </PageHeader>
    </template>

    <template #actions>
      <ActionButtons
        v-if="!loading"
        entity-name="Posizione INPS"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="posizioneInpsNavigationConfig"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
        @reset="handleReset"
      />
    </template>

    <template #content>
      <!-- Loading indicator -->
      <LoadingIndicator :loading="loading" message="Caricamento dati Posizione INPS..." />

      <!-- Form Container -->
      <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">

      <!-- Form Fields -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Dati Posizione INPS</h2>

          <!-- Posizione INPS Form Component -->
          <CompanyEntityFormComponent
            v-model="posizioneInpsForm"
            :is-edit-mode="isEditMode"
            :disabled="saving || isEditMode"
            :company-display-text="selectedCompanyDisplay"
            field1-key="posInps"
            field1-label="Codice"
            field1-type="number"
            field1-placeholder="Inserisci posizione INPS"
            :field1-required="true"
            field1-classes="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-1"
            :show-field2="true"
            field2-key="matrInps"
            field2-label="Matric. INPS"
            field2-type="text"
            field2-placeholder="Inserisci matricola INPS"
            :field2-required="false"
            field2-classes="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-1"
            :show-field3="false"
            @company-change="handleCompanyChange"
          />

        </div>
      </div>
      </form>
    </template>
  </EditViewLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import EditViewLayout from '@/components/EditViewLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import CompanyEntityFormComponent, { type EntityFormData } from '@/components/CompanyEntityFormComponent.vue'
import { posizioneInpsService, type PosizioneInps } from '@/services/posizioneInpsService'
import { aziendeService, type Azienda } from '@/services/aziendeService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'

const route = useRoute()
const router = useRouter()

const {
  errorMessage,
  successMessage
} = useCrudView<PosizioneInps>(posizioneInpsService, {
  entityName: 'Posizione INPS',
  idField: 'id',
  listRoute: '/app/posizioni-inps',
  editRoute: '/app/posizioni-inps',
  newRoute: '/app/posizioni-inps/new'
})

useMessageAlerts(errorMessage, successMessage)

// State per il form
const posizioneInpsForm = ref<EntityFormData>({
  codAzi: null,
  posInps: null,
  matrInps: ''
})
const originalData = ref<EntityFormData | null>(null)

const selectedCompany = ref<Azienda | null>(null)
const loading = ref(false)
const saving = ref(false)

const { isDirty, touchedFields, updateOriginalData } = useFormDirtyState(posizioneInpsForm, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate alla Posizione INPS. Sei sicuro di voler lasciare questa pagina?'
})

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')

const isFormValid = computed(() => {
  return posizioneInpsForm.value.codAzi !== null &&
         posizioneInpsForm.value.posInps !== null
})

const selectedCompanyDisplay = computed(() => {
  if (!selectedCompany.value) return ''
  return `${selectedCompany.value.codAzi} ${selectedCompany.value.ragSoc}`
})

// Navigation configuration
const posizioneInpsNavigationConfig = {
  fetchAll: () => posizioneInpsService.getPosizioniInps(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (entity: any) => entity.id,
  basePath: '/app/posizioni-inps',
  entityType: 'posizione-inps',
  defaultSortField: 'posInps',
  defaultSortOrder: 1
}

// Methods
const loadPosizioneInps = async () => {
  if (!isEditMode.value) return

  const id = String(route.params.id)
  loading.value = true

  try {
    const response = await posizioneInpsService.getPosizioneInpsById(id)
    posizioneInpsForm.value = {
      codAzi: response.codAzi,
      posInps: response.posInps,
      matrInps: response.matrInps
    }

    // Carica i dati dell'azienda per la visualizzazione
    if (response.codAzi) {
      const aziende = await aziendeService.getAziende()
      selectedCompany.value = aziende.find(a => a.codAzi === response.codAzi) || null
    }

    updateOriginalData(posizioneInpsForm.value)
  } catch (error) {
    console.error('Errore nel caricamento Posizione INPS:', error)
    errorMessage.value = 'Errore nel caricamento dei dati Posizione INPS. Riprova più tardi.'
  } finally {
    loading.value = false
  }
}

const loadPosizioneInpsForDuplication = async (duplicateId: string) => {
  loading.value = true

  try {
    const response = await posizioneInpsService.getPosizioneInpsById(duplicateId)
    posizioneInpsForm.value = {
      codAzi: response.codAzi, // Mantieni l'azienda
      posInps: null, // Reset della posizione INPS
      matrInps: `${response.matrInps} - Copia`
    }
  } catch (error) {
    console.error('Errore nel caricamento Posizione INPS per duplicazione:', error)
    errorMessage.value = 'Errore nel caricamento dei dati per la duplicazione. Riprova più tardi.'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    const posizioneInpsToSave: PosizioneInps = {
      id: `${posizioneInpsForm.value.codAzi}-${posizioneInpsForm.value.posInps}`,
      codAzi: posizioneInpsForm.value.codAzi as number,
      posInps: posizioneInpsForm.value.posInps as number,
      matrInps: posizioneInpsForm.value.matrInps as string
    }

    if (isEditMode.value) {
      await posizioneInpsService.editPosizioneInps(posizioneInpsToSave)
      successMessage.value = 'Posizione INPS aggiornata con successo!'
      updateOriginalData(posizioneInpsForm.value)
    } else {
      await posizioneInpsService.addPosizioneInps(posizioneInpsToSave)
      successMessage.value = 'Posizione INPS creata con successo!'
      // Passa in modalità edit dopo creazione
      router.push(`/app/posizioni-inps/${posizioneInpsToSave.id}/edit`)
    }
  } catch (error: unknown) {
    console.error('Errore nel salvataggio:', error)
    const errorMsg = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                     (error as { message?: string })?.message ||
                     'Errore durante il salvataggio'
    errorMessage.value = errorMsg
  } finally {
    saving.value = false
  }
}

const handleDuplicate = () => {
  const duplicated = {
    ...posizioneInpsForm.value,
    posInps: null,
    matrInps: `${posizioneInpsForm.value.matrInps} - Copia`
  }

  // Salva i dati duplicati in sessionStorage
  sessionStorage.setItem('duplicatedPosizioneInpsData', JSON.stringify(duplicated))
  router.push('/app/posizioni-inps/new')
}

const handleDelete = () => {
  if (confirm('Sei sicuro di voler eliminare questa Posizione INPS?')) {
    console.log('Delete Posizione INPS')
  }
}

const handleReset = () => {
  if (isEditMode.value) {
    loadPosizioneInps()
  } else {
    posizioneInpsForm.value = {
      codAzi: null,
      posInps: null,
      matrInps: ''
    }
  }
}

const handleCompanyChange = (azienda: Azienda | null) => {
  selectedCompany.value = azienda
  console.log('Azienda selezionata:', azienda)
}

const goBack = () => {
  router.push('/app/posizioni-inps')
}

// Watcher per route changes (navigation buttons)
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId && newId !== 'new') {
    await loadPosizioneInps()
  }
}, { immediate: false })

onMounted(async () => {
  if (isEditMode.value) {
    await loadPosizioneInps()
  } else {
    // Controlla se ci sono parametri di query per la duplicazione (dal DataTableManager)
    const duplicateId = route.query.duplicate
    if (duplicateId && typeof duplicateId === 'string') {
      await loadPosizioneInpsForDuplication(duplicateId)
    } else {
      // Controlla se ci sono dati duplicati da caricare (dal bottone Duplica)
      const duplicatedDataStr = sessionStorage.getItem('duplicatedPosizioneInpsData')
      if (duplicatedDataStr) {
        const duplicatedData = JSON.parse(duplicatedDataStr)
        await nextTick()
        posizioneInpsForm.value = duplicatedData
        sessionStorage.removeItem('duplicatedPosizioneInpsData')
      }
    }
  }
})
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
</style>
