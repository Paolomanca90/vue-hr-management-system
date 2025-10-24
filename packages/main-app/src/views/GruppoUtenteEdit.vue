<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header con breadcrumb -->
    <PageHeader
      :title="isEditMode ? 'Modifica Gruppo Utente' : 'Nuovo Gruppo Utente'"
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
    <LoadingIndicator :loading="loading" message="Caricamento dati gruppo..." />

    <!-- Form principale -->
    <form v-if="!loading" @submit.prevent="handleSubmit" class="space-y-6">

      <!-- Azioni -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <!-- Azioni principali con navigazione integrata -->
          <ActionButtons
            entity-name="Gruppo"
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
        </div>
      </div>

      <!-- Sezione Informazioni Base -->
      <SectionCard
        title="Informazioni Gruppo"
        description="Dati principali del gruppo utente"
        icon="users"
      >

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
      </SectionCard>

      <!-- Sezione Abilitazioni Menu Gruppo -->
      <MenuPermissionsManager
        v-if="authStore.isCompanyUser && (isEditMode || isDuplicateMode)"
        title="Abilitazioni Menu Gruppo"
        description="Configura i permessi predefiniti per tutti gli utenti del gruppo"
        :loading="loadingPermissions"
        :error="permissionsError"
        :menu-data="menuGruppoData"
        v-model="gruppoPermissions"
        @refresh="refreshPermissions"
        @permission-change="onPermissionChange"
      />

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
import { gruppiUtenteService, type AggiornamentoAbilitazioniGruppo, type ApiMenuGruppoItem, type GruppoUtente } from '@/services/gruppiUtenteService'
import MenuPermissionsManager from '@/components/MenuPermissionsManager.vue'
import { menuService } from '@/services/menuService'
import PageHeader from '@/components/PageHeader.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import SectionCard from '@/components/SectionCard.vue'

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


useMessageAlerts(errorMessage, successMessage)

// Gestione eliminazione
const showDeleteModal = ref(false)
const deleting = ref(false)

// Gestione permessi
const loadingPermissions = ref(false)
const permissionsError = ref('')
const gruppoPermissions = ref<Record<string, { visualizza: boolean; modifica: boolean; parent_id?: number }>>({})
const menuGruppoData = ref<ApiMenuGruppoItem[]>([])

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const gruppoId = computed(() => route.params.id as string)
const isDuplicateMode = computed(() => route.query.duplicate !== undefined)

// Navigation configuration
const gruppoNavigationConfig = {
  fetchAll: async () => {
    const response = await gruppiUtenteService.getGruppiUtente()
    return response || []
  },
  getEntityId: (gruppo: unknown) => (gruppo as { codice: string }).codice,
  basePath: '/app/gruppi-utente',
  entityType: 'gruppo-utente',
  defaultSortField: 'codice',
  defaultSortOrder: 1
}

const isFormValid = computed(() => {
  return gruppoForm.value.codice.trim() !== '' &&
         gruppoForm.value.descrizione.trim() !== ''
})


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


// Caricamento dati gruppo
const loadGruppoData = async () => {
  if (!isEditMode.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    // Prima prova a cercare il gruppo nella lista già caricata
    let gruppoData = null

    // Carica il gruppo dal servizio
    const response = await gruppiUtenteService.getGruppiUtente()
    if (response) {
      gruppoData = response.find(gruppo => gruppo.codice === gruppoId.value)
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

    await loadGruppoPermissions()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento dei dati del gruppo'
  } finally {
    loading.value = false
  }
}

const onPermissionChange = (itemId: number, type: 'visualizza' | 'modifica') => {
  if (type === 'visualizza' && !gruppoPermissions.value[itemId].visualizza) {
    gruppoPermissions.value[itemId].modifica = false
  } else if (type === 'modifica' && gruppoPermissions.value[itemId].modifica) {
    gruppoPermissions.value[itemId].visualizza = true
  }
}

// Caricamento permessi del gruppo
const loadGruppoPermissions = async () => {
  if (!gruppoForm.value.codice) return

  loadingPermissions.value = true
  permissionsError.value = ''

  try {
    // Prima prova a caricare i menu specifici del gruppo
    const menuData = await gruppiUtenteService.getMenuGruppoUtente(gruppoForm.value.codice)
    menuGruppoData.value = menuData

    // Se non ci sono dati specifici del gruppo, carica i menu base
    if (!menuData || menuData.length === 0) {
      const baseMenuData = await menuService.getMenuVisibili()
      menuGruppoData.value = gruppiUtenteService.convertMenuToGroupMenu(
        baseMenuData,
        gruppoForm.value.codice
      )
    }

    // Inizializza i permessi dal formato API
    gruppoPermissions.value = gruppiUtenteService.initializePermissionsFromGroupData(menuGruppoData.value)

  } catch (error) {
    permissionsError.value = 'Errore nel caricamento dei permessi del gruppo: ' + error

    // Fallback: carica i menu base se il caricamento specifico fallisce
    try {
      const baseMenuData = await menuService.getMenuVisibili()
      menuGruppoData.value = gruppiUtenteService.convertMenuToGroupMenu(
        baseMenuData,
        gruppoForm.value.codice
      )

      // Inizializza permessi vuoti
      const emptyPermissions: Record<string, { visualizza: boolean; modifica: boolean; parent_id?: number }> = {}
      const processItems = (items: ApiMenuGruppoItem[]) => {
        items.forEach(item => {
          emptyPermissions[item.id] = {
            visualizza: false,
            modifica: false,
            parent_id: item.parenT_ID
          }
          if (item.figli && item.figli.length > 0) {
            processItems(item.figli)
          }
        })
      }
      processItems(menuGruppoData.value)
      gruppoPermissions.value = emptyPermissions

      permissionsError.value = '' // Pulisce l'errore se il fallback funziona
    } catch (fallbackError) {
      permissionsError.value = 'Errore nel caricamento dei menu: ' + fallbackError
    }
  } finally {
    loadingPermissions.value = false
  }
}

const refreshPermissions = async () => {
  if (gruppoForm.value.codice) {
    await loadGruppoPermissions()
  }
}

// Preparazione dati per il salvataggio dei permessi
const preparePermissionsForGroupSave = (): AggiornamentoAbilitazioniGruppo[] => {
  return gruppiUtenteService.preparePermissionsForGroupSave(
    gruppoPermissions.value,
    menuGruppoData.value,
    gruppoForm.value.codice
  )
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

      // Salva anche i permessi se sono stati modificati
      if (Object.keys(gruppoPermissions.value).length > 0) {
        const abilitazioni = preparePermissionsForGroupSave()
        await gruppiUtenteService.aggiornaAbilitazioniGruppoUtente(abilitazioni, gruppoData.codice)
      }

      successMessage.value = 'Gruppo aggiornato con successo'
    } else {
      // Crea nuovo gruppo
      await gruppiUtenteService.newGruppoUtente(gruppoData)

      // Se ci sono permessi impostati, salvali
      if (Object.keys(gruppoPermissions.value).length > 0) {
        const abilitazioni = preparePermissionsForGroupSave()
        await gruppiUtenteService.aggiornaAbilitazioniGruppoUtente(abilitazioni, gruppoData.codice)
      }

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
const handleDuplicateMode = async () => {
  const duplicateCodice = route.query.duplicate as string
  const sourceDescrizione = route.query.sourceDescrizione as string

  if (duplicateCodice && !isEditMode.value) {
    gruppoForm.value = {
      codice: '',
      descrizione: sourceDescrizione ? `Copia di ${sourceDescrizione}` : `Copia di ${duplicateCodice}`
    }

    // Carica i permessi del gruppo originale per duplicarli
    if (authStore.isCompanyUser) {
      await loadPermissionsForDuplication(duplicateCodice)
    }
  }
}

const loadPermissionsForDuplication = async (originalCodice: string) => {
  loadingPermissions.value = true
  permissionsError.value = ''

  try {
    // Carica i permessi del gruppo originale
    const originalMenuData = await gruppiUtenteService.getMenuGruppoUtente(originalCodice)
    if (originalMenuData && originalMenuData.length > 0) {
      menuGruppoData.value = originalMenuData.map(item => ({
        ...item,
        codicE_GRUPPO: '' // Reset del codice gruppo per il nuovo gruppo
      }))
    } else {
      // Se non ci sono permessi specifici, carica i menu base
      const baseMenuData = await menuService.getMenuVisibili()
      menuGruppoData.value = gruppiUtenteService.convertMenuToGroupMenu(
        baseMenuData,
        ''
      )
    }

    // Inizializza i permessi dal gruppo originale
    gruppoPermissions.value = gruppiUtenteService.initializePermissionsFromGroupData(menuGruppoData.value)

  } catch (error) {
    permissionsError.value = 'Errore nel caricamento dei permessi per la duplicazione: ' + error

    // Fallback: carica i menu base
    try {
      const baseMenuData = await menuService.getMenuVisibili()
      menuGruppoData.value = gruppiUtenteService.convertMenuToGroupMenu(
        baseMenuData,
        ''
      )
      gruppoPermissions.value = gruppiUtenteService.initializePermissionsFromGroupData(menuGruppoData.value)
      permissionsError.value = ''
    } catch (fallbackError) {
      permissionsError.value = 'Errore nel caricamento dei menu: ' + fallbackError
    }
  } finally {
    loadingPermissions.value = false
  }
}

// Inizializzazione
onMounted(async() => {
  if (isEditMode.value) {
    loadGruppoData()
  } else {
    await handleDuplicateMode()
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
    } else {
      resetForm()
      await handleDuplicateMode()
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
