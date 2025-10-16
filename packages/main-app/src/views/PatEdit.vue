<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica PAT: ${patForm.pat}` : 'Nuova PAT'"
      :description="isEditMode ? 'Modifica i dettagli della PAT selezionata' : 'Crea una nuova PAT nel sistema'"
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
    <LoadingIndicator :loading="loading" message="Caricamento dati PAT..." />

    <!-- Form Container -->
    <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <ActionButtons
            entity-name="PAT"
            :is-edit-mode="isEditMode"
            :saving="saving"
            :is-form-valid="isFormValid"
            :show-duplicate="true"
            :show-delete="isEditMode"
            :show-reset="true"
            :show-navigation="isEditMode"
            :navigation-config="patNavigationConfig"
            @duplicate="handleDuplicate"
            @reset="handleReset"
          />
        </div>
      </div>

      <!-- Form Fields -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title mb-6 dark:text-gray-100">Dati PAT</h2>

          <!-- PAT Form Component -->
          <CompanyEntityFormComponent
            v-model="patForm"
            :is-edit-mode="isEditMode"
            :disabled="saving || isEditMode"
            :company-display-text="selectedCompanyDisplay"
            field1-key="codicePat"
            field1-label="Codice"
            field1-type="number"
            field1-placeholder="Inserisci codice"
            :field1-required="true"
            field1-classes="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-1"
            :show-field2="true"
            field2-key="pat"
            field2-label="P.A.T."
            field2-type="text"
            field2-placeholder="Inserisci descrizione PAT"
            :field2-required="true"
            :field2-max-length="200"
            field2-classes="max-w-md rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-1"
            :show-field3="true"
            field3-key="codCont"
            field3-label="Cod. Controllo"
            field3-type="text"
            field3-placeholder="Inserisci codice controllo"
            :field3-required="false"
            :field3-max-length="2"
            field3-classes="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-1"
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
import CompanyEntityFormComponent, { type EntityFormData } from '@/components/CompanyEntityFormComponent.vue'
import { patService, type Pat } from '@/services/patService'
import { aziendeService, type Azienda } from '@/services/aziendeService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'

const route = useRoute()
const router = useRouter()

const {
  errorMessage,
  successMessage
} = useCrudView<Pat>(patService, {
  entityName: 'PAT',
  idField: 'id',
  listRoute: '/app/pat',
  editRoute: '/app/pat',
  newRoute: '/app/pat/new'
})

useMessageAlerts(errorMessage, successMessage)

// State per il form
const patForm = ref<EntityFormData>({
  codAzi: null,
  codicePat: null,
  pat: '',
  codCont: ''
})

const selectedCompany = ref<Azienda | null>(null)
const loading = ref(false)
const saving = ref(false)

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')

const isFormValid = computed(() => {
  return !!(patForm.value.codAzi !== null &&
         patForm.value.codicePat !== null &&
         patForm.value.pat && typeof patForm.value.pat === 'string' && patForm.value.pat.trim() !== '')
})

const selectedCompanyDisplay = computed(() => {
  if (!selectedCompany.value) return ''
  return `${selectedCompany.value.codAzi} ${selectedCompany.value.ragSoc}`
})

// Navigation configuration
const patNavigationConfig = {
  fetchAll: () => patService.getPat(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (entity: any) => entity.id,
  basePath: '/app/pat',
  entityType: 'pat',
  defaultSortField: 'codicePat',
  defaultSortOrder: 1
}

// Methods
const loadPat = async () => {
  if (!isEditMode.value) return

  const id = String(route.params.id)
  loading.value = true

  try {
    const response = await patService.getPatById(id)
    patForm.value = {
      codAzi: response.codAzi,
      codicePat: response.codicePat,
      pat: response.pat,
      codCont: response.codCont
    }

    // Carica i dati dell'azienda per la visualizzazione
    if (response.codAzi) {
      const aziende = await aziendeService.getAziende()
      selectedCompany.value = aziende.find(a => a.codAzi === response.codAzi) || null
    }
  } catch (error) {
    console.error('Errore nel caricamento PAT:', error)
    errorMessage.value = 'Errore nel caricamento dei dati PAT. Riprova più tardi.'
  } finally {
    loading.value = false
  }
}

const loadPatForDuplication = async (duplicateId: string) => {
  loading.value = true

  try {
    const response = await patService.getPatById(duplicateId)
    patForm.value = {
      codAzi: response.codAzi, // Mantieni l'azienda
      codicePat: null, // Reset del codice PAT
      pat: `${response.pat} - Copia`,
      codCont: response.codCont
    }
  } catch (error) {
    console.error('Errore nel caricamento PAT per duplicazione:', error)
    errorMessage.value = 'Errore nel caricamento dei dati per la duplicazione. Riprova più tardi.'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    const patToSave: Pat = {
      id: `${patForm.value.codAzi}-${patForm.value.codicePat}`,
      codAzi: patForm.value.codAzi as number,
      codicePat: patForm.value.codicePat as number,
      pat: patForm.value.pat as string,
      codCont: patForm.value.codCont as string
    }

    if (isEditMode.value) {
      await patService.editPat(patToSave)
      successMessage.value = 'PAT aggiornata con successo!'
    } else {
      await patService.addPat(patToSave)
      successMessage.value = 'PAT creata con successo!'
      // Passa in modalità edit dopo creazione
      router.push(`/app/pat/${patToSave.id}/edit`)
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
    ...patForm.value,
    codicePat: null,
    pat: `${patForm.value.pat} - Copia`
  }

  // Salva i dati duplicati in sessionStorage
  sessionStorage.setItem('duplicatedPatData', JSON.stringify(duplicated))
  router.push('/app/pat/new')
}


const handleReset = () => {
  if (isEditMode.value) {
    loadPat()
  } else {
    patForm.value = {
      codAzi: null,
      codicePat: null,
      pat: '',
      codCont: ''
    }
  }
}

const handleCompanyChange = (azienda: Azienda | null) => {
  selectedCompany.value = azienda
  console.log('Azienda selezionata:', azienda)
}

const goBack = () => {
  router.push('/app/pat')
}

// Watcher per route changes (navigation buttons)
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId && newId !== 'new') {
    await loadPat()
  }
}, { immediate: false })

onMounted(async () => {
  if (isEditMode.value) {
    await loadPat()
  } else {
    // Controlla se ci sono parametri di query per la duplicazione (dal DataTableManager)
    const duplicateId = route.query.duplicate
    if (duplicateId && typeof duplicateId === 'string') {
      await loadPatForDuplication(duplicateId)
    } else {
      // Controlla se ci sono dati duplicati da caricare (dal bottone Duplica)
      const duplicatedDataStr = sessionStorage.getItem('duplicatedPatData')
      if (duplicatedDataStr) {
        const duplicatedData = JSON.parse(duplicatedDataStr)
        await nextTick()
        patForm.value = duplicatedData
        sessionStorage.removeItem('duplicatedPatData')
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
