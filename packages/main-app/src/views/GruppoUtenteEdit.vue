<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header con breadcrumb -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex flex-col-reverse lg:flex-row lg:items-center lg:justify-between gap-3">
          <div class="max-md:block">
            <h1 class="text-3xl font-bold text-base-content">
              {{ isEditMode ? 'Modifica Gruppo Utente' : 'Nuovo Gruppo Utente' }}
            </h1>
            <p class="text-base-content/70 mt-1">
              {{ isEditMode ? `Modifica i dati del gruppo: ${gruppoForm.codice}` : 'Inserisci i dati del nuovo gruppo utente' }}
            </p>
          </div>

          <div>
            <button
              class="btn btn-ghost btn-sm"
              @click="goBack"
              :disabled="saving"
            >
              <FaIcon icon="arrow-left" class="mr-2"/>
              Indietro
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-3">Caricamento dati gruppo...</span>
    </div>

    <!-- Messaggio di errore globale -->
    <div v-if="errorMessage" class="alert alert-error">
      <FaIcon icon="exclamation-triangle" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Messaggio di successo -->
    <div v-if="successMessage" class="alert alert-success">
      <FaIcon icon="check-circle" />
      <span>{{ successMessage }}</span>
    </div>

    <!-- Form principale -->
    <form v-if="!loading" @submit.prevent="handleSubmit" class="space-y-6">

      <!-- Azioni -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="lg:flex items-center justify-between gap-3">
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
              <!-- Navigazione gruppi (solo in modalità modifica) -->
              <div v-if="isEditMode" class="flex items-center max-md:justify-center space-x-2">
                <button
                  type="button"
                  class="btn btn-primary btn-outline btn-sm"
                  @click="navigateToPreviousGruppo"
                  :disabled="saving || !hasPreviousGruppo"
                  title="Gruppo precedente"
                >
                  <FaIcon icon="chevron-left" />
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-outline btn-sm"
                  @click="navigateToNextGruppo"
                  :disabled="saving || !hasNextGruppo"
                  title="Gruppo successivo"
                >
                  <FaIcon icon="chevron-right" />
                </button>
              </div>

              <!-- Azioni principali -->
              <button
                type="submit"
                class="btn btn-primary btn-sm text-white"
                :class="{ 'loading': saving }"
                :disabled="saving || !isFormValid"
              >
                <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                <FaIcon v-if="!saving" icon="save" class="mr-2"/>
                <span v-if="saving">
                  {{ isEditMode ? 'Salvataggio...' : 'Creazione...' }}
                </span>
                <span v-if="!saving">
                  {{ isEditMode ? 'Salva' : 'Crea Gruppo' }}
                </span>
              </button>

              <button
                v-if="isEditMode"
                type="button"
                class="btn btn-primary btn-outline btn-sm"
                @click="duplicateCurrentGruppo"
                :disabled="saving"
              >
                <FaIcon icon="copy" class="mr-2"/>
                Duplica
              </button>

              <button
                v-if="isEditMode"
                type="button"
                class="btn btn-error btn-outline btn-sm"
                @click="deleteCurrentGruppo"
                :disabled="saving"
              >
                <FaIcon icon="trash" class="mr-2"/>
                Elimina
              </button>
            </div>

            <div class="max-md:mt-3">
              <button
                type="button"
                class="max-md:block max-md:w-full btn btn-ghost btn-sm"
                @click="resetForm"
                :disabled="saving"
              >
                <FaIcon icon="undo" class="mr-2"/>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sezione Informazioni Base -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="bg-primary/10 rounded-lg p-2 mr-3">
                <FaIcon icon="users" class="text-primary text-lg" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content">Informazioni Gruppo</h3>
                <p class="text-sm text-base-content/70">Dati principali del gruppo utente</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6">
            <!-- Codice -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Codice Gruppo *</span>
              </label>
              <input
                type="text"
                v-model="gruppoForm.codice"
                :class="{
                  'input-error': submitted && !gruppoForm.codice
                }"
                class="input input-bordered w-full"
                placeholder="Inserisci codice gruppo (es. GRP1)"
                required
                :disabled="isEditMode"
                maxlength="20"
              />
              <div class="label">
                <span class="label-text-alt">
                  {{ isEditMode ? 'Il codice non può essere modificato' : 'Codice univoco per identificare il gruppo' }}
                </span>
                <span v-if="submitted && !gruppoForm.codice" class="label-text-alt text-error">
                  Codice richiesto
                </span>
              </div>
            </div>

            <!-- Descrizione -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Descrizione *</span>
              </label>
              <textarea
                v-model="gruppoForm.descrizione"
                :class="{ 'textarea-error': submitted && !gruppoForm.descrizione }"
                class="textarea textarea-bordered w-full h-24 resize-none"
                placeholder="Inserisci descrizione del gruppo"
                required
                maxlength="200"
              ></textarea>
              <div class="label">
                <span class="label-text-alt">
                  {{ gruppoForm.descrizione.length }}/200 caratteri
                </span>
                <span v-if="submitted && !gruppoForm.descrizione" class="label-text-alt text-error">
                  Descrizione richiesta
                </span>
              </div>
            </div>
          </div>

          <div class="text-sm text-base-content/60 mt-4">
            * Campi obbligatori
          </div>
        </div>
      </div>

      <!-- Sezione Abilitazioni Menu (se l'utente è company user) -->
      <div v-if="authStore.isCompanyUser && isEditMode" class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex flex-col lg:flex-row items-center justify-between mb-4 gap-3">
            <div class="flex w-full items-center">
              <div class="p-2 mr-3">
                <FaIcon icon="table" class="text-lg" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content">Abilitazioni Menu Gruppo</h3>
                <p class="text-sm text-base-content/70">Configura i permessi predefiniti per tutti gli utenti del gruppo</p>
              </div>
            </div>

            <!-- Azioni rapide -->
            <div class="w-full flex flex-col lg:flex-row lg:items-center lg:justify-end gap-2">
              <button
                type="button"
                class="max-md:block max-md:w-full btn btn-sm btn-ghost"
                @click="selectAllPermissions"
              >
                <FaIcon icon="check-circle" class="mr-1"/>
                Seleziona Tutto
              </button>
              <button
                type="button"
                class="max-md:block max-md:w-full btn btn-sm btn-ghost"
                @click="deselectAllPermissions"
              >
                <FaIcon icon="times-circle" class="mr-1"/>
                Deseleziona Tutto
              </button>
              <button
                type="button"
                class="max-md:block max-md:w-full btn btn-sm btn-ghost"
                @click="refreshPermissions"
                :disabled="loadingPermissions"
              >
                <FaIcon icon="refresh" class="mr-1"/>
                Ricarica
              </button>
            </div>
          </div>

          <!-- Filtro ricerca -->
          <div class="mb-4">
            <div class="form-control">
              <div class="relative">
                <input
                  type="text"
                  v-model="permissionSearchQuery"
                  placeholder="Cerca tabelle o funzionalità..."
                  class="input input-bordered input-sm w-full pr-10"
                />
                <FaIcon
                  icon="search"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Loading permessi -->
          <div v-if="loadingPermissions" class="flex justify-center items-center py-8">
            <span class="loading loading-spinner loading-md"></span>
            <span class="ml-3 text-sm">Caricamento permessi...</span>
          </div>

          <!-- Messaggio placeholder -->
          <div class="alert alert-info">
            <FaIcon icon="info-circle" />
            <div>
              <div class="font-bold">Funzionalità in sviluppo</div>
              <div class="text-sm">La gestione delle abilitazioni per i gruppi utente sarà disponibile nelle prossime versioni.</div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Modale di conferma eliminazione -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Conferma eliminazione</h3>
        <p class="mb-4">
          Sei sicuro di voler eliminare il gruppo <strong>{{ gruppoForm.codice }}</strong>?
        </p>
        <p class="text-sm text-base-content/70 mb-2">
          <strong>{{ gruppoForm.descrizione }}</strong>
        </p>
        <p class="text-sm text-base-content/70 mb-6">
          Questa azione è irreversibile e potrebbe influenzare tutti gli utenti associati a questo gruppo.
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute} from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import { gruppiUtenteService, type GruppoUtente } from '@/services/gruppiUtenteService'

// Interfaccia per il form del gruppo
interface GruppoForm {
  codice: string
  descrizione: string
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form reattivo
const gruppoForm = ref<GruppoForm>({
  codice: '',
  descrizione: ''
})

const loading = ref(false)
const saving = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Gestione eliminazione
const showDeleteModal = ref(false)
const deleting = ref(false)

// Gestione permessi (placeholder per future funzionalità)
const loadingPermissions = ref(false)
const permissionSearchQuery = ref('')

// Navigazione gruppi
const previousGruppo = ref<{ codice: string } | null>(null)
const nextGruppo = ref<{ codice: string } | null>(null)
const allGruppi = ref<{ codice: string }[]>([])

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const gruppoId = computed(() => route.params.id as string)
const hasPreviousGruppo = computed(() => previousGruppo.value !== null)
const hasNextGruppo = computed(() => nextGruppo.value !== null)

const isFormValid = computed(() => {
  return gruppoForm.value.codice.trim() !== '' &&
         gruppoForm.value.descrizione.trim() !== ''
})

// Navigazione tra gruppi
const navigateToPreviousGruppo = () => {
  if (previousGruppo.value) {
    router.push(`/app/gruppi-utente/${previousGruppo.value.codice}/edit`)
  }
}

const navigateToNextGruppo = () => {
  if (nextGruppo.value) {
    router.push(`/app/gruppi-utente/${nextGruppo.value.codice}/edit`)
  }
}

// Duplica gruppo corrente
const duplicateCurrentGruppo = () => {
  router.push({
    name: 'GruppoUtenteNew',
    query: {
      duplicate: gruppoForm.value.codice,
      sourceDescrizione: gruppoForm.value.descrizione
    }
  })
}

// Elimina gruppo corrente
const deleteCurrentGruppo = async () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleting.value = false
}

const confirmDelete = async () => {
  try {
    deleting.value = true

    await gruppiUtenteService.deleteGruppoUtente(gruppoForm.value.codice)

    successMessage.value = 'Gruppo eliminato con successo'

    setTimeout(() => {
      router.push('/app/gruppi-utente')
    }, 1500)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nell\'eliminazione del gruppo'
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

// Caricamento gruppi adiacenti per navigazione
const loadAdjacentGruppi = async () => {
  if (!isEditMode.value) return

  try {
    // Carica l'intera lista gruppi se non è già stata caricata o se è vuota
    if (allGruppi.value.length === 0) {
      const response = await gruppiUtenteService.getGruppiUtente()
      if (response.listaGruppi) {
        // Ordina i gruppi alfabeticamente per codice
        allGruppi.value = response.listaGruppi
          .map(gruppo => ({ codice: gruppo.codice }))
          .sort((a, b) => a.codice.localeCompare(b.codice))
      }
    }

    // Trova il gruppo corrente e determina quello precedente e successivo
    const currentCodice = gruppoId.value
    if (!currentCodice || allGruppi.value.length === 0) {
      previousGruppo.value = null
      nextGruppo.value = null
      return
    }

    const currentIndex = allGruppi.value.findIndex(gruppo => gruppo.codice === currentCodice)

    if (currentIndex === -1) {
      // Gruppo corrente non trovato nella lista
      previousGruppo.value = null
      nextGruppo.value = null
      return
    }

    // Imposta gruppo precedente
    previousGruppo.value = currentIndex > 0 ? allGruppi.value[currentIndex - 1] : null

    // Imposta gruppo successivo
    nextGruppo.value = currentIndex < allGruppi.value.length - 1 ? allGruppi.value[currentIndex + 1] : null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    previousGruppo.value = null
    nextGruppo.value = null
  }
}

// Caricamento dati gruppo
const loadGruppoData = async () => {
  if (!isEditMode.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    // Prima prova a cercare il gruppo nella lista già caricata
    let gruppoData = null

    // Se abbiamo già la lista gruppi, cerca il gruppo corrente
    if (allGruppi.value.length > 0) {
      const response = await gruppiUtenteService.getGruppiUtente()
      if (response.listaGruppi) {
        gruppoData = response.listaGruppi.find(gruppo => gruppo.codice === gruppoId.value)
      }
    }

    // Se non trovato nella lista, prova con i dati del router state
    if (!gruppoData) {
      const routerState = history.state?.gruppoData
      if (routerState && routerState.codice === gruppoId.value) {
        gruppoData = routerState
      }
    }

    // Se ancora non trovato, crea dati di fallback
    if (!gruppoData) {
      gruppoData = {
        codice: gruppoId.value,
        descrizione: `Gruppo ${gruppoId.value}`
      }
    }

    // Imposta i dati del form
    gruppoForm.value = {
      codice: gruppoData.codice || '',
      descrizione: gruppoData.descrizione || ''
    }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento dei dati del gruppo'
  } finally {
    loading.value = false
  }
}

// Metodi per gestione permessi (placeholder)
const refreshPermissions = async () => {
  console.log('Refresh permissions - da implementare')
}

const selectAllPermissions = () => {
  console.log('Select all permissions - da implementare')
}

const deselectAllPermissions = () => {
  console.log('Deselect all permissions - da implementare')
}

// Metodi utilità
const goBack = () => {
  router.push('/app/gruppi-utente')
}

const resetForm = () => {
  if (isEditMode.value) {
    loadGruppoData()
  } else {
    gruppoForm.value = {
      codice: '',
      descrizione: ''
    }
  }
  submitted.value = false
  errorMessage.value = ''
  successMessage.value = ''
}

// Validazione form
const validateForm = () => {
  const errors = []

  if (!gruppoForm.value.codice.trim()) {
    errors.push('Codice richiesto')
  }

  if (!gruppoForm.value.descrizione.trim()) {
    errors.push('Descrizione richiesta')
  }

  if (gruppoForm.value.descrizione.length > 200) {
    errors.push('Descrizione troppo lunga (massimo 200 caratteri)')
  }

  return errors
}

// Gestione submit
const handleSubmit = async () => {
  submitted.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const validationErrors = validateForm()
  if (validationErrors.length > 0) {
    errorMessage.value = validationErrors.join(', ')
    return
  }

  saving.value = true

  try {
    const gruppoData: GruppoUtente = {
      codice: gruppoForm.value.codice.trim(),
      descrizione: gruppoForm.value.descrizione.trim()
    }

    if (isEditMode.value) {
      // Modifica gruppo esistente
      await gruppiUtenteService.editGruppoUtente(gruppoData)
      successMessage.value = 'Gruppo aggiornato con successo'
    } else {
      // Crea nuovo gruppo
      await gruppiUtenteService.newGruppoUtente(gruppoData)
      successMessage.value = 'Nuovo gruppo creato con successo'
    }

    // Nasconde il messaggio dopo 2 secondi
    setTimeout(() => {
      successMessage.value = ''
      if(!isEditMode.value)
        router.push(`/app/gruppi-utente/${gruppoData.codice}/edit`)
    }, 2000)

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio dei dati'
  } finally {
    saving.value = false
  }
}

// Gestione duplicazione gruppo
const handleDuplicateMode = () => {
  const duplicateCodice = route.query.duplicate as string
  const sourceDescrizione = route.query.sourceDescrizione as string

  if (duplicateCodice && !isEditMode.value) {
    gruppoForm.value = {
      codice: '',
      descrizione: sourceDescrizione ? `Copia di ${sourceDescrizione}` : `Copia di ${duplicateCodice}`
    }
  }
}

// Inizializzazione
onMounted(async() => {
  if (isEditMode.value) {
    loadGruppoData()
    await loadAdjacentGruppi()
  } else {
    handleDuplicateMode()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    // Reset dei messaggi
    errorMessage.value = ''
    successMessage.value = ''

    if (isEditMode.value) {
      await loadGruppoData()
      await loadAdjacentGruppi()
    } else {
      resetForm()
      handleDuplicateMode()
    }
  }
}, { immediate: true })

// Clear success/error messages after timeout
watch([successMessage, errorMessage], ([success, error]) => {
  if (success) {
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }
  if (error) {
    setTimeout(() => {
      errorMessage.value = ''
    }, 8000)
  }
})
</script>

<style scoped>
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.6s ease-out;
}

.form-control input:focus,
.form-control select:focus,
.form-control textarea:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

.input-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }

.input-error,
.textarea-error {
  border-color: rgb(var(--error));
  background-color: rgb(var(--error) / 0.05);
}

.input-error:focus,
.textarea-error:focus {
  outline: 2px solid rgb(var(--error));
  outline-offset: 2px;
  border-color: rgb(var(--error));
}

.alert {
  animation: slideInUp 0.4s ease-out;
}

.btn.loading {
  pointer-events: none;
}

.modal {
  z-index: 1000;
}

.modal-box {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }

  .flex.space-x-3 {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.bg-primary\/10 {
  background-color: rgb(var(--primary) / 0.1);
}

.text-primary {
  color: rgb(var(--primary));
}

.btn-outline:hover {
  color: white !important;
}

.textarea.resize-none {
  resize: none;
}

input:disabled,
textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: oklch(var(--b2));
}

*:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}
</style>
