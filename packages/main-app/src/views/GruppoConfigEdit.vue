<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <EditViewLayout>
    <template #header>
      <PageHeader
        :title="isEditMode ? `Modifica ${gruppoForm.descrizione} (${gruppoForm.codgruppo})` : 'Nuovo Gruppo di Configurazione'"
        :breadcrumbItems="[
          { label: 'Home', to: '/app' },
          { label: 'Gruppi Config', to: '/app/gruppi-config' },
          { label: isEditMode ? 'Modifica' : 'Nuovo' }
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
        entity-name="Gruppo Config"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="gruppoNavigationConfig"
        @duplicate="duplicateCurrentGruppo"
        @delete="deleteCurrentGruppo"
        @reset="resetForm"
      />
    </template>

    <template #content>
      <!-- Loading indicator -->
      <LoadingIndicator :loading="loading" message="Caricamento dati gruppo..." />

      <!-- Form principale -->
      <form v-if="!loading" @submit.prevent="handleSubmit" class="space-y-6">

      <!-- Sezione Informazioni Base -->
      <SectionCard
        title="Informazioni Base"
        description="Dati principali del gruppo di configurazione"
        icon="folder-open"
      >
        <template #actions>
          <div class="grid grid-cols-1 gap-4">
            <!-- Codice Gruppo -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Codice Gruppo *</span>
              </label>
              <input
                type="number"
                v-model.number="gruppoForm.codgruppo"
                :class="{ 'input-error': submitted && !gruppoForm.codgruppo }"
                class="input input-bordered w-full"
                placeholder="Inserisci codice gruppo"
                required
                :disabled="isEditMode"
              />
              <div class="label">
                <span class="label-text-alt">
                  {{ isEditMode ? 'Il codice non può essere modificato' : 'Codice numerico identificativo del gruppo' }}
                </span>
                <span v-if="submitted && !gruppoForm.codgruppo" class="label-text-alt text-error">
                  Codice richiesto
                </span>
              </div>
            </div>

            <!-- Descrizione -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Descrizione *</span>
              </label>
              <input
                type="text"
                v-model="gruppoForm.descrizione"
                :class="{ 'input-error': submitted && !gruppoForm.descrizione }"
                class="input input-bordered w-full"
                placeholder="Inserisci descrizione"
                required
                maxlength="200"
              />
              <div class="label">
                <span class="label-text-alt">{{ gruppoForm.descrizione.length }}/200 caratteri</span>
                <span v-if="submitted && !gruppoForm.descrizione" class="label-text-alt text-error">
                  Descrizione richiesta
                </span>
              </div>
            </div>
          </div>

          <div class="text-sm text-base-content/60 mt-4">
            * Campi obbligatori
          </div>
        </template>
      </SectionCard>
      </form>

      <!-- Modale di conferma eliminazione -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Conferma eliminazione</h3>
        <p class="mb-4">
          Sei sicuro di voler eliminare il gruppo <strong>{{ gruppoForm.codgruppo }}</strong>?
        </p>
        <p class="text-sm text-base-content/70 mb-6">
          Questa azione è irreversibile.
        </p>
        <div class="modal-action">
          <button
            class="btn btn-ghost"
            @click="cancelDelete"
            :disabled="deleting"
          >
            Annulla
          </button>
          <button
            class="btn btn-error text-white"
            @click="confirmDelete"
            :disabled="deleting"
            :class="{ 'loading': deleting }"
          >
            <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
            <span v-if="!deleting">Elimina</span>
            <span v-if="deleting">Eliminazione...</span>
          </button>
        </div>
      </div>
    </div>
    </template>
  </EditViewLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import EditViewLayout from '@/components/EditViewLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import SectionCard from '@/components/SectionCard.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'
import { gruppiConfigService, type GruppoConfig } from '@/services/gruppiConfigService'

const router = useRouter()
const route = useRoute()

// State
const loading = ref(false)
const saving = ref(false)
const submitted = ref(false)
const showDeleteModal = ref(false)
const deleting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

useMessageAlerts(errorMessage, successMessage)

const gruppoForm = ref<GruppoConfig>({
  codgruppo: 0,
  descrizione: ''
})

const originalGruppoData = ref<GruppoConfig | null>(null)

const { isDirty, touchedFields, updateOriginalData, resetDirtyState } = useFormDirtyState(
  gruppoForm,
  originalGruppoData,
  {
    confirmMessage: 'Ci sono modifiche non salvate al Gruppo Config. Sei sicuro di voler lasciare questa pagina?'
  }
)

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const gruppoId = computed(() => Number(route.params.id))

const isFormValid = computed(() => {
  return gruppoForm.value.codgruppo > 0 &&
         gruppoForm.value.descrizione.trim() !== ''
})

// Navigation configuration
const gruppoNavigationConfig = {
  fetchAll: () => gruppiConfigService.getTabGruppiConfig(),
  getEntityId: (gruppo: unknown) => (gruppo as GruppoConfig).codgruppo.toString(),
  basePath: '/app/gruppi-config',
  entityType: 'gruppo-config',
  defaultSortField: 'codgruppo',
  defaultSortOrder: 1
}

// Methods
const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const loadGruppoData = async () => {
  if (!isEditMode.value) return

  loading.value = true
  clearMessages()

  try {
    const routerState = history.state?.gruppoData
    if (routerState && routerState.codgruppo === gruppoId.value) {
      gruppoForm.value = {
        codgruppo: routerState.codgruppo,
        descrizione: routerState.descrizione
      }
    } else {
      gruppoForm.value = {
        codgruppo: gruppoId.value,
        descrizione: `Gruppo ${gruppoId.value}`
      }
    }

    originalGruppoData.value = JSON.parse(JSON.stringify(gruppoForm.value))
  } catch (error) {
    console.error('Errore nel caricamento del gruppo:', error)
    errorMessage.value = 'I dati del gruppo verranno caricati dalla lista'
    gruppoForm.value = {
      codgruppo: gruppoId.value,
      descrizione: `Gruppo ${gruppoId.value}`
    }
    originalGruppoData.value = JSON.parse(JSON.stringify(gruppoForm.value))
  } finally {
    loading.value = false
  }
}

const handleDuplicateMode = () => {
  const duplicateCodgruppo = route.query.duplicate as string
  const sourceDescrizione = route.query.sourceDescrizione as string

  if (duplicateCodgruppo && !isEditMode.value) {
    gruppoForm.value = {
      codgruppo: 0,
      descrizione: sourceDescrizione || ''
    }
  }
}

const goBack = () => {
  router.push('/app/gruppi-config')
}

const handleSubmit = async () => {
  submitted.value = true
  saving.value = true
  clearMessages()

  if (!isFormValid.value) {
    errorMessage.value = 'Compila tutti i campi obbligatori'
    saving.value = false
    return
  }

  try {
    if (isEditMode.value) {
      await gruppiConfigService.editGruppoConfig(gruppoForm.value)
      successMessage.value = 'Gruppo aggiornato con successo'
      updateOriginalData(gruppoForm.value)
    } else {
      await gruppiConfigService.addGruppoConfig(gruppoForm.value)
      successMessage.value = 'Nuovo gruppo creato con successo'
      updateOriginalData(gruppoForm.value)

      setTimeout(() => {
        router.push(`/app/gruppi-config/${gruppoForm.value.codgruppo}/edit`)
      }, 1500)
    }

    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    console.error('Errore nel salvataggio del gruppo:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio del gruppo'
  } finally {
    saving.value = false
  }
}

const deleteCurrentGruppo = () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
}

const confirmDelete = async () => {
  if (!isEditMode.value) return

  deleting.value = true
  clearMessages()

  try {
    await gruppiConfigService.deleteGruppoConfig(gruppoId.value)
    successMessage.value = 'Gruppo eliminato con successo'

    resetDirtyState()

    setTimeout(() => {
      router.push('/app/gruppi-config')
    }, 1500)

  } catch (error) {
    console.error('Errore nell\'eliminazione del gruppo:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione del gruppo'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

const duplicateCurrentGruppo = () => {
  router.push({
    name: 'GruppoConfigNew',
    query: {
      duplicate: gruppoId.value.toString(),
      sourceDescrizione: gruppoForm.value.descrizione
    }
  })
}

const resetForm = () => {
  submitted.value = false
  clearMessages()

  if (isEditMode.value) {
    loadGruppoData()
  } else {
    gruppoForm.value = {
      codgruppo: 0,
      descrizione: ''
    }
    handleDuplicateMode()
  }

  resetDirtyState()
}

// Lifecycle
onMounted(async () => {
  if (isEditMode.value) {
    await loadGruppoData()
  } else {
    handleDuplicateMode()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    clearMessages()
    submitted.value = false

    if (isEditMode.value) {
      await loadGruppoData()
    } else {
      gruppoForm.value = {
        codgruppo: 0,
        descrizione: ''
      }
      handleDuplicateMode()
    }
  }
}, { immediate: true })
</script>

<style scoped>
.btn-outline:hover {
  color: white !important;
}
</style>
