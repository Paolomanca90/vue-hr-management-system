<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Posizione INPS: ${posizioneInpsForm.posInps}` : 'Nuova Posizione INPS'"
      :description="isEditMode ? 'Modifica i dettagli della Posizione INPS selezionata' : 'Crea una nuova Posizione INPS nel sistema'"
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
    <LoadingIndicator :loading="loading" message="Caricamento dati Posizione INPS..." />

    <!-- Form Container -->
    <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">
      <div class="bg-white p-4 rounded-lg shadow-sm border">
        <div class="lg:flex items-center justify-between gap-3">
          <div class="flex flex-col lg:flex-row lg:items-center gap-3">
            <!-- Navigazione -->
            <NavigationButtons
              :show-navigation="isEditMode"
              :disabled="saving"
              entity-name="Posizione INPS"
              :navigation-config="posizioneInpsNavigationConfig"
            />

            <!-- Azioni principali -->
            <ActionButtons
              entity-name="Posizione INPS"
              :is-edit-mode="isEditMode"
              :saving="saving"
              :is-form-valid="isFormValid"
              :show-duplicate="true"
              :show-delete="isEditMode"
              :show-reset="true"
              @duplicate="handleDuplicate"
              @delete="handleDelete"
              @reset="handleReset"
            />
          </div>
        </div>
      </div>

      <!-- Form Fields -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6">Dati Posizione INPS</h2>

          <!-- Posizione INPS Form Component -->
          <CompanyEntityFormComponent
            v-model="posizioneInpsForm"
            :is-edit-mode="isEditMode"
            :disabled="saving"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import NavigationButtons from '@/components/NavigationButtons.vue'
import CompanyEntityFormComponent, { type EntityFormData } from '@/components/CompanyEntityFormComponent.vue'
import { posizioneInpsService, type PosizioneInps } from '@/services/posizioneInpsService'
import { aziendeService, type Azienda } from '@/services/aziendeService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'

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

const selectedCompany = ref<Azienda | null>(null)
const loading = ref(false)
const saving = ref(false)

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortFn: (a: any, b: any) => a.posInps - b.posInps
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
