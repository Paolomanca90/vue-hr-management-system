<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <EditViewLayout>
    <!-- Header fisso -->
    <template #header>
      <PageHeader
        :title="pageTitle"
        :breadcrumbItems="breadcrumbItems"
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

    <!-- ActionButtons fissi -->
    <template #actions>
      <ActionButtons
        v-if="!loading"
        entity-name="Utente"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="userNavigationConfig"
        @save="handleSubmit"
        @duplicate="duplicateCurrentUser"
        @delete="deleteCurrentUser"
        @reset="resetForm"
      />
    </template>

    <!-- Contenuto scrollabile -->
    <template #content>
      <!-- Loading indicator -->
      <LoadingIndicator :loading="loading" message="Caricamento dati utente..." />

      <!-- Form principale -->
      <form v-if="!loading" @submit.prevent="handleSubmit" class="space-y-6">

        <!-- Sezione Informazioni Base -->
      <SectionCard
        title="Informazioni Base"
        description="Dati principali e configurazione dell'utente"
        icon="user"
      >
        <template #actions>
          <div class="grid grid-cols-1 gap-2">
            <!-- Prima riga -->
            <div class="grid lg:grid-cols-2 gap-4">
              <!-- Username -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Username *</span>
                </label>
                <input
                  type="text"
                  v-model="userForm.username"
                  :class="{
                    'input-error': submitted && !userForm.username
                  }"
                  class="input input-bordered w-full"
                  placeholder="Inserisci username"
                  required
                  autocomplete="username"
                  :disabled="isEditMode"
                />
                <div v-if="submitted && !userForm.username" class="label">
                  <span class="label-text-alt text-error">Username richiesto</span>
                </div>
              </div>

              <!-- Nome Completo -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Nome Completo *</span>
                </label>
                <input
                  type="text"
                  v-model="userForm.nomecompleto"
                  :class="{ 'input-error': submitted && !userForm.nomecompleto }"
                  class="input input-bordered w-full"
                  placeholder="Inserisci nome completo"
                  required
                />
                <div v-if="submitted && !userForm.nomecompleto" class="label">
                  <span class="label-text-alt text-error">Nome completo richiesto</span>
                </div>
              </div>
            </div>

            <!-- Seconda riga -->
            <div class="grid lg:grid-cols-2 gap-4">
              <!-- Gruppo Utenti -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Gruppo Utenti</span>
                </label>
                <select
                  v-model="userForm.codgruppo"
                  class="select select-bordered w-full"
                >
                  <option value="">Seleziona gruppo</option>
                  <option
                    v-for="gruppo in availableGroups"
                    :key="gruppo.value"
                    :value="gruppo.value"
                  >
                    {{ gruppo.label }}
                  </option>
                </select>
              </div>

              <!-- Codice Accesso -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Codice Accesso</span>
                </label>
                <select
                  v-model="userForm.codaccesso"
                  class="select select-bordered w-full"
                >
                  <option value="">Seleziona codice accesso</option>
                  <option
                    v-for="accesso in availableAccessCodes"
                    :key="accesso.value"
                    :value="accesso.value"
                  >
                    {{ accesso.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Terza riga -->
            <div class="grid lg:grid-cols-2 gap-4">
              <!-- Lingua -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Lingua *</span>
                </label>
                <select
                  v-model="userForm.iD_LINGUA"
                  class="select select-bordered w-full"
                  :class="{ 'input-error': submitted && !userForm.iD_LINGUA }"
                  required
                >
                  <option value="">Seleziona lingua</option>
                  <option
                    v-for="gruppo in availableLingue"
                    :key="gruppo.value"
                    :value="gruppo.value"
                  >
                    {{ gruppo.label }}
                  </option>
                </select>
                <div v-if="submitted && !userForm.iD_LINGUA" class="label">
                  <span class="label-text-alt text-error">Lingua richiesta</span>
                </div>
              </div>

              <!-- Impostazioni Internazionali -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Impost. Internazionale *</span>
                </label>
                <select
                  v-model="userForm.iD_INTER"
                  class="select select-bordered w-full"
                  :class="{ 'input-error': submitted && !userForm.iD_INTER }"
                  required
                >
                  <option value="">Seleziona impost. internazionale</option>
                  <option
                    v-for="gruppo in availableImpostazioniInternazionali"
                    :key="gruppo.value"
                    :value="gruppo.value"
                  >
                    {{ gruppo.label }}
                  </option>
                </select>
                <div v-if="submitted && !userForm.iD_INTER" class="label">
                  <span class="label-text-alt text-error">Impost. Internazionale richiesta</span>
                </div>
              </div>
            </div>
          </div>
          <div class=" text-base-content/60 mt-4">
            * Campi obbligatori
          </div>
        </template>
      </SectionCard>

      <!-- Sezione Abilitazioni Menu/Tabelle -->
      <MenuPermissionsManager
        v-if="authStore.isCompanyUser"
        title="Abilitazioni Menu e Tabelle"
        description="Configura i permessi specifici per ogni sezione"
        :loading="loadingPermissions"
        :error="permissionsError"
        :menu-data="menuUtenteData"
        v-model="userPermissions"
        @refresh="refreshPermissions"
        @permission-change="onPermissionChange"
      />

        <!-- Modale di conferma eliminazione -->
        <div v-if="showDeleteModal" class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Conferma eliminazione</h3>
            <p class="mb-4">
              Sei sicuro di voler eliminare l'utente <strong>{{ userForm.username }}</strong>?
            </p>
            <p class=" text-base-content/70 mb-6">
              Questa azione è irreversibile e rimuoverà tutti i dati associati all'utente.
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

      </form>
    </template>
  </EditViewLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute} from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { menuService, type AbilitazioneMenuUtente, type ApiMenuUtenteItem } from '@/services/menuService'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import { userService, type User } from '@/services/userService'
import { settingsService } from '@/services/settingsService'
import { accessiService } from '@/services/accessiService'
import { useCrudView } from '@/composables/useCrudView'
import MenuPermissionsManager from '@/components/MenuPermissionsManager.vue'
import { gruppiUtenteService, type ApiMenuGruppoItem } from '@/services/gruppiUtenteService'
import PageHeader from '@/components/PageHeader.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import SectionCard from '@/components/SectionCard.vue'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'
import EditViewLayout from '@/components/EditViewLayout.vue'

// Interfaccia per il form dell'utente
interface UserForm {
  username: string
  nomecompleto: string
  codgruppo: string
  codaccesso: string
  iD_LINGUA: number,
  iD_INTER: number
}

// Interfaccia per i permessi
interface UserPermission {
  visualizza: boolean
  modifica: boolean
  parent_id?: number
}

interface UserPermissions {
  [key: string]: UserPermission
}

interface SelectOption {
  label: string
  value: string | number
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form reattivo
const userForm = ref<UserForm>({
  username: '',
  nomecompleto: '',
  codgruppo: '',
  codaccesso: '',
  iD_LINGUA: 0,
  iD_INTER: 0
})

const originalData = ref<UserForm | null>(null)

const {
  loading,
  saving,
  errorMessage,
  successMessage
} = useCrudView<User>(userService, {
  entityName: 'Utente',
  idField: 'username',
  listRoute: '/app/users',
  editRoute: '/app/users',
  newRoute: '/app/users/new'
})


useMessageAlerts(errorMessage, successMessage)

const { isDirty, touchedFields, updateOriginalData } = useFormDirtyState(userForm, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate all\'Utente. Sei sicuro di voler lasciare questa pagina?'
})

const submitted = ref(false)

// Gestione eliminazione
const showDeleteModal = ref(false)
const deleting = ref(false)

// Gestione permessi
const loadingPermissions = ref(false)
const permissionsError = ref('')
const permissionSearchQuery = ref('')
const userPermissions = ref<UserPermissions>({})
const menuUtenteData = ref<ApiMenuUtenteItem[]>([])

// Navigazione ad albero
const selectedCategoryId = ref<number | null>(null)
const selectedSubcategoryId = ref<number | null>(null)
const selectedSubSubcategoryId = ref<number | null>(null)

// Opzioni per i dropdown
const availableGroups = ref<SelectOption[]>([])
const loadingGroups = ref(false)

const availableAccessCodes = ref<SelectOption[]>([])
const loadingAccessCodes = ref(false)

const availableImpostazioniInternazionali = ref<SelectOption[]>([])
const loadingImpostazioniInternazionali = ref(false)

const availableLingue = ref<SelectOption[]>([])
const loadingLingue = ref(false)
const loadingGroupPermissions = ref(false)
const isInitialLoad = ref(false)

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const userId = computed(() => route.params.id as string)

// Navigation configuration
const userNavigationConfig = {
  fetchAll: () => userService.getUsers(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (user: any) => user.username,
  basePath: '/app/users',
  entityType: 'user',
  defaultSortField: 'username',
  defaultSortOrder: 1
}

const isFormValid = computed(() => {
  return userForm.value.username.trim() !== '' &&
         userForm.value.nomecompleto.trim() !== '' &&
         userForm.value.iD_LINGUA > 0 &&
         userForm.value.iD_INTER > 0
})

const breadcrumbItems = computed<{ label: string; to?: string }[]>(() => {
  const items: { label: string; to?: string }[] = [
    { label: 'Home', to: '/app' },
    { label: 'Utenti', to: '/app/users' }
  ]

  if (isEditMode.value) {
    items.push({ label: 'Modifica' })
  } else {
    items.push({ label: 'Nuovo' })
  }

  return items
})

const pageTitle = computed(() => {
  if (isEditMode.value && userForm.value.nomecompleto && userForm.value.username) {
    return `Modifica ${userForm.value.nomecompleto} (${userForm.value.username})`
  } else if (isEditMode.value) {
    return 'Modifica Utente'
  } else {
    return 'Nuovo Utente'
  }
})

// Funzione per trovare tutti i match e i loro percorsi nella gerarchia
const findMatchingItemsWithPaths = (items: ApiMenuUtenteItem[], query: string): {
  matchingItems: ApiMenuUtenteItem[],
  pathsToMatches: Set<number>
} => {
  const lowerQuery = query.toLowerCase()
  const matchingItems: ApiMenuUtenteItem[] = []
  const pathsToMatches = new Set<number>()

  const searchRecursively = (item: ApiMenuUtenteItem, currentPath: number[]): boolean => {
    let hasMatchInSubtree = false
    const newPath = [...currentPath, item.id]

    // Controlla se questo item matcha direttamente
    const directMatch = item.nome.toLowerCase().includes(lowerQuery)

    if (directMatch) {
      matchingItems.push(item)
      // Aggiungi tutto il percorso fino a questo item
      newPath.forEach(id => pathsToMatches.add(id))
      hasMatchInSubtree = true
    }

    // Cerca ricorsivamente nei figli
    if (item.figli && item.figli.length > 0) {
      for (const child of item.figli) {
        const childHasMatch = searchRecursively(child, newPath)
        if (childHasMatch) {
          hasMatchInSubtree = true
        }
      }
    }

    // Se qualche figlio ha un match, aggiungi questo item al percorso
    if (hasMatchInSubtree && !directMatch) {
      pathsToMatches.add(item.id)
    }

    return hasMatchInSubtree
  }

  // Avvia la ricerca per ogni item di primo livello
  items.forEach(item => {
    searchRecursively(item, [])
  })

  return { matchingItems, pathsToMatches }
}

// Funzione per cercare e espandere immediatamente
const performSearchAndExpand = (query: string) => {
  if (!query || query.trim() === '') {
    return
  }

  const { matchingItems } = findMatchingItemsWithPaths(menuUtenteData.value, query)

  if (matchingItems.length > 0) {
    // Trova il percorso del primo match più profondo
    let deepestMatch = matchingItems[0]
    let maxDepth = 0

    // Funzione per calcolare la profondità di un item nell'albero
    const findDepth = (item: ApiMenuUtenteItem): number => {
      const searchInLevel = (items: ApiMenuUtenteItem[], depth: number): number => {
        for (const currentItem of items) {
          if (currentItem.id === item.id) {
            return depth
          }
          if (currentItem.figli && currentItem.figli.length > 0) {
            const foundDepth = searchInLevel(currentItem.figli, depth + 1)
            if (foundDepth > -1) return foundDepth
          }
        }
        return -1
      }
      return searchInLevel(menuUtenteData.value, 0)
    }

    // Trova il match più profondo
    for (const match of matchingItems) {
      const depth = findDepth(match)
      if (depth > maxDepth) {
        maxDepth = depth
        deepestMatch = match
      }
    }

    // Costruisce il percorso verso questo match
    const buildPathToItem = (targetItem: ApiMenuUtenteItem): number[] => {
      const findPath = (items: ApiMenuUtenteItem[], path: number[] = []): number[] | null => {
        for (const item of items) {
          const currentPath = [...path, item.id]

          if (item.id === targetItem.id) {
            return currentPath
          }

          if (item.figli && item.figli.length > 0) {
            const foundPath = findPath(item.figli, currentPath)
            if (foundPath) return foundPath
          }
        }
        return null
      }
      return findPath(menuUtenteData.value) || []
    }

    const pathToMatch = buildPathToItem(deepestMatch)

    // Espande il percorso
    if (pathToMatch.length > 0) {
      selectedCategoryId.value = pathToMatch[0] || null
      selectedSubcategoryId.value = pathToMatch[1] || null
      selectedSubSubcategoryId.value = pathToMatch[2] || null
    }
  }
}


// Duplica utente corrente
const duplicateCurrentUser = () => {
  router.push({
    name: 'UserNew',
    query: {
      duplicate: userForm.value.username,
      sourceNome: userForm.value.nomecompleto,
      sourceGruppo: userForm.value.codgruppo,
      sourceAccesso: userForm.value.codaccesso,
      sourceId_Inter: userForm.value.iD_INTER,
      sourceId_Lingua: userForm.value.iD_LINGUA
    }
  })
}

// Elimina utente corrente
const deleteCurrentUser = async () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleting.value = false
}

const confirmDelete = async () => {
  try {
    deleting.value = true

    await userService.deleteUser(userForm.value.username)

    successMessage.value = 'Utente eliminato con successo'

    setTimeout(() => {
      router.push('/app/users')
    }, 1500)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nell\'eliminazione dell\'utente'
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}


// Metodi per la navigazione ad albero
const loadGruppiUtente = async () => {
  loadingGroups.value = true
  try {
    const gruppi = await userService.getGruppiUtente()
    availableGroups.value = gruppi.map(gruppo => ({
      label: gruppo.codice + ' - ' + gruppo.descrizione,
      value: gruppo.codice
    }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento dei gruppi utente'
  } finally {
    loadingGroups.value = false
  }
}

const loadLingue = async () => {
  loadingLingue.value = true
  try {
    const gruppi = await settingsService.getLingue()
    availableLingue.value = gruppi.map(gruppo => ({
      label: gruppo.iD_LINGUA + ' - ' + gruppo.descrizione,
      value: gruppo.iD_LINGUA
    }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento delle lingue'
  } finally {
    loadingLingue.value = false
  }
}

const loadImpostazioniInternazionali = async () => {
  loadingImpostazioniInternazionali.value = true
  try {
    const gruppi = await settingsService.getImpostazioniInternazionali()
    availableImpostazioniInternazionali.value = gruppi.map(gruppo => ({
      label: gruppo.iD_INTER + ' - ' + gruppo.formatO_DATA,
      value: gruppo.iD_INTER
    }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento delle impostazioni internazionali'
  } finally {
    loadingImpostazioniInternazionali.value = false
  }
}

const loadTabAccessi = async () => {
  loadingAccessCodes.value = true
  try {
    const gruppi = await accessiService.getTabAccessi()
    availableAccessCodes.value = gruppi.map(gruppo => ({
      label: gruppo.codice + ' - ' + gruppo.descrizione,
      value: gruppo.codice
    }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento delle impostazioni internazionali'
  } finally {
    loadingAccessCodes.value = false
  }
}

// Caricamento dati utente
const loadUserData = async () => {
  if (!isEditMode.value) return

  loading.value = true
  errorMessage.value = ''
  isInitialLoad.value = true

  try {
    // Prima prova a cercare l'utente nella lista già caricata
    let userData = null

    // Carica i dati dell'utente dal servizio
    const response = await userService.getUsers()
    if (response) {
      userData = response.find(user => user.username === userId.value)
    }

    // Se non trovato nella lista, prova con i dati del router state
    if (!userData) {
      const routerState = history.state?.userData
      if (routerState && routerState.username === userId.value) {
        userData = routerState
      }
    }

    // Se ancora non trovato, carica i dati dell'utente (fallback)
    if (!userData) {
      userData = {
        username: userId.value,
        nomecompleto: userId.value,
        codgruppo: 'GRP1',
        codaccesso: '12345',
        iD_LINGUA: 1,
        iD_INTER: 1
      }
    }

    // Imposta i dati del form assicurandoti che tutti i campi siano popolati
    userForm.value = {
      username: userData.username || '',
      nomecompleto: userData.nomecompleto || '',
      codgruppo: userData.codgruppo || '',
      codaccesso: userData.codaccesso || '',
      iD_LINGUA: Number(userData.iD_LINGUA) || 0,
      iD_INTER: Number(userData.iD_INTER) || 0
    }


    await loadUserPermissions()

    updateOriginalData(userForm.value)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento dei dati utente'
  } finally {
    loading.value = false
    // Reset del flag dopo il caricamento iniziale
    setTimeout(() => {
      isInitialLoad.value = false
    }, 100)
  }
}

const loadUserPermissions = async () => {
  if (!userForm.value.username) return

  loadingPermissions.value = true
  permissionsError.value = ''

  try {
    const menuData = await menuService.getMenuUtente(userForm.value.username)
    menuUtenteData.value = menuData

    initializePermissions(menuData)

  } catch (error) {
    permissionsError.value = 'Errore nel caricamento dei permessi: ' + error
  } finally {
    loadingPermissions.value = false
  }
}

const initializePermissions = (menuData: ApiMenuUtenteItem[]) => {
  const permissions: UserPermissions = {}

  const processItems = (items: ApiMenuUtenteItem[]) => {
    items.forEach(item => {
      // Aggiunge il permesso per questo item
      permissions[item.id] = {
        visualizza: item.visualizza === 'S',
        modifica: item.modifica === 'S',
        parent_id: item.parenT_ID
      }

      // Processa ricorsivamente i figli
      if (item.figli && item.figli.length > 0) {
        processItems(item.figli)
      }
    })
  }

  processItems(menuData)
  userPermissions.value = permissions
}

// Metodi per gestione permessi
const refreshPermissions = async () => {
  if (userForm.value.username) {
    await loadUserPermissions()
  }
}

const onPermissionChange = (itemId: number, type: 'visualizza' | 'modifica') => {
  if (type === 'visualizza' && !userPermissions.value[itemId].visualizza) {
    userPermissions.value[itemId].modifica = false
  } else if (type === 'modifica' && userPermissions.value[itemId].modifica) {
    userPermissions.value[itemId].visualizza = true
  }
}

// Metodi utilità
const goBack = () => {
  router.push('/app/users')
}

const resetForm = () => {
  if (isEditMode.value) {
    userForm.value = {
      username: '',
      nomecompleto: '',
      codgruppo: '',
      codaccesso: '',
      iD_INTER: 0,
      iD_LINGUA: 0
    }

    loadUserData()
  } else {
    userForm.value = {
      username: '',
      nomecompleto: '',
      codgruppo: '',
      codaccesso: '',
      iD_INTER: 0,
      iD_LINGUA: 0
    }
    userPermissions.value = {}
    menuUtenteData.value = []
  }
  submitted.value = false
  errorMessage.value = ''
  successMessage.value = ''

  // Reset selezioni albero
  selectedCategoryId.value = null
  selectedSubcategoryId.value = null
  selectedSubSubcategoryId.value = null
}

// Validazione form
const validateForm = () => {
  const errors = []

  if (!userForm.value.username.trim()) {
    errors.push('Username richiesto')
  }

  if (!userForm.value.nomecompleto.trim()) {
    errors.push('Nome completo richiesto')
  }

  if (!userForm.value.iD_LINGUA) {
    errors.push('Lingua richiesta')
  }

  if (!userForm.value.iD_INTER) {
    errors.push('Impost. Internazionale richiesta')
  }

  return errors
}

// Preparazione dati per il salvataggio dei permessi - VERSIONE CORRETTA
const preparePermissionsForSave = (): AbilitazioneMenuUtente[] => {
  const abilitazioni: AbilitazioneMenuUtente[] = []
  const addedIds = new Set<number>() // Per evitare duplicati

  Object.keys(userPermissions.value).forEach(itemId => {
    const permission = userPermissions.value[itemId]
    const id = Number(itemId)

    if (permission.visualizza === true) {
      // Aggiunge l'item corrente solo se non è già stato aggiunto
      if (!addedIds.has(id)) {
        abilitazioni.push({
          username: userForm.value.username,
          menU_ID: id,
          modifica: permission.modifica ? 'S' : 'N'
        })
        addedIds.add(id)
      }

      // Aggiunge i parent solo se non sono già stati aggiunti
      let currentParentId = permission.parent_id
      while (currentParentId && currentParentId > 0 && !addedIds.has(currentParentId)) {
        abilitazioni.push({
          username: userForm.value.username,
          menU_ID: currentParentId,
          modifica: null
        })
        addedIds.add(currentParentId)

        // Va al parent del parent
        const parentPermission = userPermissions.value[currentParentId]
        currentParentId = parentPermission?.parent_id
      }
    }
  })

  return abilitazioni
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
    const userData: User = {
      username: userForm.value.username,
      nomecompleto: userForm.value.nomecompleto,
      codgruppo: userForm.value.codgruppo,
      codaccesso: userForm.value.codaccesso,
      iD_LINGUA: userForm.value.iD_LINGUA,
      iD_INTER: userForm.value.iD_INTER
    }

    if (isEditMode.value) {
      // Modifica utente esistente
      await userService.editUser(userData)

      // Salva anche i permessi se sono stati modificati
      if (Object.keys(userPermissions.value).length > 0) {
        const abilitazioni = preparePermissionsForSave()
        await menuService.updateMenuUtente(abilitazioni, userData.username)
      }

      updateOriginalData(userForm.value)
      successMessage.value = 'Utente aggiornato con successo'
    } else {
      // Crea nuovo utente
      await userService.newUser(userData)

      // Se ci sono permessi impostati, salvali
      if (Object.keys(userPermissions.value).length > 0) {
        const abilitazioni = preparePermissionsForSave()
        await menuService.updateMenuUtente(abilitazioni, userData.username)
      }

      successMessage.value = 'Nuovo utente creato con successo'
    }

    // Nasconde il messaggio dopo 2 secondi
    setTimeout(() => {
      successMessage.value = ''
      if(!isEditMode.value)
        router.push(`/app/users/${userData.username}/edit`)
    }, 2000)

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio dei dati'
  } finally {
    saving.value = false
  }
}

// Gestione duplicazione utente
const handleDuplicateMode = () => {
  const duplicateUsername = route.query.duplicate as string
  const sourceNome = route.query.sourceNome as string
  const sourceGruppo = route.query.sourceGruppo as string
  const sourceAccesso = route.query.sourceAccesso as string
  const sourceId_Inter = Number(route.query.sourceId_Inter)
  const sourceId_Lingua = Number(route.query.sourceId_Lingua)

  if (duplicateUsername && !isEditMode.value) {
    userForm.value = {
      username: '',
      nomecompleto: sourceNome ? `Copia di ${sourceNome}` : `Copia di ${duplicateUsername}`,
      codgruppo: sourceGruppo || '',
      codaccesso: sourceAccesso || '',
      iD_INTER: sourceId_Inter || 0,
      iD_LINGUA: sourceId_Lingua || 0
    }

    // Carica i permessi dell'utente originale per duplicarli
    if (duplicateUsername) {
      loadUserPermissionsForDuplication(duplicateUsername)
    }
  }
}

const loadUserPermissionsForDuplication = async (originalUsername: string) => {
  try {
    loadingPermissions.value = true
    const menuData = await menuService.getMenuUtente(originalUsername)
    menuUtenteData.value = menuData
    initializePermissions(menuData)
  } catch (error) {
    console.error('Errore caricamento permessi per duplicazione:', error)
    // Non è critico, continua senza permessi
  } finally {
    loadingPermissions.value = false
  }
}

// Funzione per caricare i permessi del gruppo
const loadGroupPermissions = async (codgruppo: string) => {
  if (!codgruppo) return

  loadingGroupPermissions.value = true
  permissionsError.value = ''

  try {
    const menuGruppoData = await gruppiUtenteService.getMenuGruppoUtente(codgruppo)

    if (menuGruppoData && menuGruppoData.length > 0) {
      // Aggiorna i dati del menu
      menuUtenteData.value = menuGruppoData

      // Sovrascrive i permessi con quelli del gruppo
      const groupPermissions = gruppiUtenteService.initializePermissionsFromGroupData(menuGruppoData)
      userPermissions.value = JSON.parse(JSON.stringify(groupPermissions))

    } else {
      // Fallback carica menu base vuoti
      await loadEmptyPermissions()
    }

  } catch (error) {
    permissionsError.value = `Errore nel caricamento dei permessi del gruppo: ${error}`
    await loadEmptyPermissions()
  } finally {
    loadingGroupPermissions.value = false
  }
}

// Aggiungere questa funzione
const loadEmptyPermissions = async () => {
  try {
    const baseMenuData = await menuService.getMenuVisibili()
    const emptyMenuData = gruppiUtenteService.convertMenuToGroupMenu(baseMenuData, userForm.value.codgruppo || 'temp')
    menuUtenteData.value = emptyMenuData

    const emptyPermissions: UserPermissions = {}
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
    processItems(emptyMenuData)
    userPermissions.value = emptyPermissions

  } catch (error) {
    console.error('Errore caricamento menu base:', error)
  }
}

// Inizializzazione
onMounted(async() => {
  await loadGruppiUtente()
  await loadLingue()
  await loadImpostazioniInternazionali()
  await loadTabAccessi()

  if (isEditMode.value) {
    loadUserData()
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
      await loadUserData()
    } else {
      resetForm()
      handleDuplicateMode()
    }
  }
}, { immediate: true })

// Watch per caricare permessi quando viene inserito username (solo in modalità creazione)
watch(() => userForm.value.username, (newUsername) => {
  if (newUsername && !isEditMode.value && newUsername.trim() !== '') {
    // In modalità creazione, carica il menu base quando viene inserito un username
    loadUserPermissions()
  }
})

// Watcher per espandere automaticamente quando si cerca
watch(permissionSearchQuery, (newQuery, oldQuery) => {
  if (newQuery && newQuery.trim() !== '') {
    nextTick(() => {
      performSearchAndExpand(newQuery.trim())
    })
  } else if (oldQuery && oldQuery.trim() !== '' && (!newQuery || newQuery.trim() === '')) {
    // Reset selezioni solo quando si pulisce completamente la ricerca
    selectedCategoryId.value = null
    selectedSubcategoryId.value = null
    selectedSubSubcategoryId.value = null
  }
})

// Watcher per caricare i permessi di un gruppo
// Solo quando l'utente cambia manualmente il gruppo, non al caricamento iniziale
watch(() => userForm.value.codgruppo, async (newCodgruppo, oldCodgruppo) => {
  if (newCodgruppo && newCodgruppo !== oldCodgruppo && oldCodgruppo !== undefined && oldCodgruppo !== '' && !isInitialLoad.value) {
    await loadGroupPermissions(newCodgruppo)
  }
})

// Auto-hide messaggi di successo/errore dopo alcuni secondi
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
.form-control select:focus {
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
.card:nth-child(4) { animation-delay: 0.4s; }

.grid.grid-cols-12 .border {
  border-color: oklch(var(--bc) / 0.2);
}

.hover\:bg-base-200:hover {
  background-color: oklch(var(--b2));
}

.bg-primary\/10 {
  background-color: rgb(var(--primary) / 0.1);
}

.text-primary {
  color: rgb(var(--primary));
}

.checkbox-xs {
  width: 1rem;
  height: 1rem;
}

.checkbox:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.checkbox:checked {
  animation: checkBounce 0.2s ease-in-out;
}

@keyframes checkBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
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

.badge-xs {
  font-size: 0.625rem;
  line-height: 1rem;
  padding: 0.125rem 0.25rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cursor-pointer:hover {
  transform: translateY(-1px);
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.input-error {
  border-color: rgb(var(--error));
}

.select-error {
  border-color: rgb(var(--error));
}

.input-error:focus,
.select-error:focus {
  outline-color: rgb(var(--error));
  border-color: rgb(var(--error));
}

:deep(mark) {
  background-color: rgba(var(--primary), 0.2);
  color: rgb(var(--primary));
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-weight: 600;
  font-size: inherit;
}

.search-highlight {
  animation: searchPulse 1s ease-in-out;
}

@keyframes searchPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--primary), 0.4);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(var(--primary), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--primary), 0);
  }
}

.hover\:bg-base-50:hover {
  background-color: oklch(var(--b1) / 0.5);
}

.ring-2 {
  box-shadow: 0 0 0 2px var(--tw-ring-color);
}

.ring-primary\/20 {
  --tw-ring-color: rgb(var(--primary) / 0.2);
}

.badge-primary.badge-xs {
  background-color: rgb(var(--primary));
  color: rgb(var(--primary-content));
  font-size: 0.625rem;
  line-height: 1rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  font-weight: 600;
}

.tooltip[data-tip]:before {
  z-index: 10000;
  background-color: oklch(var(--n));
  color: oklch(var(--nc));
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  max-width: 200px;
  white-space: normal;
  text-align: center;
  line-height: 1.2;
}

.grid.grid-cols-12 > div {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: oklch(var(--b2));
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: oklch(var(--bc) / 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: oklch(var(--bc) / 0.5);
}

input[type="text"]:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

@keyframes fadeInResults {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-1 > div {
  animation: fadeInResults 0.3s ease-out;
}

.bg-primary\/5 {
  background-color: rgb(var(--primary) / 0.05);
}

.border-primary\/20 {
  border-color: rgb(var(--primary) / 0.2);
}

.checkbox-xs:checked {
  background-color: currentColor;
  border-color: currentColor;
}

.checkbox-success:checked {
  background-color: rgb(var(--success));
  border-color: rgb(var(--success));
}

.checkbox-warning:checked {
  background-color: rgb(var(--warning));
  border-color: rgb(var(--warning));
}

@media (prefers-color-scheme: dark) {
  :deep(mark) {
    background-color: rgba(var(--primary), 0.3);
    color: rgb(var(--primary-content));
  }
}

.btn-outline:hover {
  color: white !important;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.form-control select:disabled,
.form-control input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: oklch(var(--b2));
}

.input-error,
.select-error {
  border-color: rgb(var(--error));
  background-color: rgb(var(--error) / 0.05);
}

.input-error:focus,
.select-error:focus {
  outline: 2px solid rgb(var(--error));
  outline-offset: 2px;
  border-color: rgb(var(--error));
}

.label-text:after {
  content: "";
}

.label-text:has(+ * [required]):after {
  content: " *";
  color: rgb(var(--error));
}

.btn.loading .loading-spinner {
  margin-right: 0.5rem;
}

.alert-success {
  border-left: 4px solid rgb(var(--success));
}

.alert-error {
  border-left: 4px solid rgb(var(--error));
}

.checkbox:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

.btn:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

.btn, .input, .select, .checkbox {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.card:hover {
  transform: translateY(-2px);
}

.alert {
  position: relative;
  overflow: hidden;
}

.alert::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.tooltip {
  --tooltip-delay: 300ms;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

*:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}
</style>
