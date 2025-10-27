<template>
  <div class="space-y-1">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica ${filiale.descriz} (${filiale.codAzi}-${filiale.codCant})` : 'Nuova Filiale'"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Filiali', to: '/app/filiali' },
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

    <!-- Form Container -->
    <form @submit.prevent="handleSave" class="space-y-6">

      <!-- Azioni principali con navigazione integrata -->
      <ActionButtons
        entity-name="Filiale"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="filialeNavigationConfig"
        @duplicate="handleDuplicate"
        @reset="handleReset"
      />

      <!-- Tab Selector -->
      <DetailTabSelector
        :key="componentKey"
        :data="filiale as any"
        :anagrafica-fields="anagraficaFields"
        :saving="saving"
        :show-presenze-tab="false"
        :custom-tabs="customTabs"
        @update:data="filiale = $event as unknown as FormFiliale"
        @tab-changed="handleTabChanged"
      >
        <!-- Anagrafica -->
        <template #anagrafica>
          <div class="grid grid-cols-1 gap-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="codAzi" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Codice Azienda
                </label>
                <input
                  id="codAzi"
                  v-model="filiale.codAzi"
                  type="number"
                  placeholder="Inserisci codice azienda"
                  :disabled="saving || isEditMode"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div class="space-y-2">
                <label for="codCant" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Codice Cantiere Filiale
                </label>
                <input
                  id="codCant"
                  v-model="filiale.codCant"
                  type="number"
                  placeholder="Inserisci codice cantiere"
                  :disabled="saving || isEditMode"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="descriz" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descrizione
              </label>
              <input
                id="descriz"
                v-model="filiale.descriz"
                type="text"
                placeholder="Inserisci descrizione filiale"
                :disabled="saving"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <!-- Componente Indirizzo -->
            <AddressInput
              v-model="filiale.address"
              :disabled="saving"
            />
          </div>

        </template>

        <!-- Configurazioni Tab -->
        <template #configurazioni>
          <div class="grid grid-cols-1 gap-6">
            <!-- Santo Patrono -->
            <div class="space-y-2">
              <label for="santoPatrono" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Santo Patrono (gg/MM)
              </label>
              <input
                id="santoPatrono"
                v-model="filiale.santoPatrono"
                type="text"
                placeholder="01/01"
                maxlength="5"
                :disabled="saving"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <!-- Causale Lavoro -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Causale Lavoro
              </label>
              <GenericLookupInput
                v-model="filiale.causLav"
                :config="causaliLookupConfig"
                :disabled="saving"
              />
            </div>

            <!-- Causale Riposo -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Causale Riposo
              </label>
              <GenericLookupInput
                v-model="filiale.causRip"
                :config="causaliLookupConfig"
                :disabled="saving"
              />
            </div>
          </div>
        </template>
      </DetailTabSelector>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import DetailTabSelector from '@/components/DetailTabSelector.vue'
import AddressInput, { type AddressData } from '@/components/AddressInput.vue'
import GenericLookupInput from '@/components/GenericLookupInput.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import { filialiService, type FilialeDettaglio } from '@/services/filialiService'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'
import type { AnagraficaField } from '@/components/DetailTabSelector.vue'
import { causaliLookupConfig } from '@/config/lookupConfigs'

const route = useRoute()
const router = useRouter()

interface CausaleData extends Record<string, unknown> {
  codice: string
  descrizione: string
}

// State per il form (tutti i campi come stringhe per l'input)
interface FormFiliale {
  codAzi: string
  codCant: string
  descriz: string
  address: AddressData
  santoPatrono: string
  causLav: CausaleData
  causRip: CausaleData
}

const filiale = ref<FormFiliale>({
  codAzi: '',
  codCant: '',
  descriz: '',
  address: {
    indirizzo: '',
    codiceBelfiore: null,
    comune: '',
    cap: '',
    provincia: '',
    civico: ''
  },
  santoPatrono: '',
  causLav: { codice: '', descrizione: '' },
  causRip: { codice: '', descrizione: '' }
})

const saving = ref(false)
const loading = ref(false)
const componentKey = ref(0)
const errorMessage = ref('')
const successMessage = ref('')
const originalData = ref<FormFiliale | null>(null)

useMessageAlerts(errorMessage, successMessage)

const { isDirty, touchedFields, updateOriginalData } = useFormDirtyState(filiale, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate alla Filiale. Sei sicuro di voler lasciare questa pagina?'
})

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const isFormValid = computed(() => {
  // Il form è sempre valido dato che tutti i campi sono opzionali nel DTO
  return true
})

// Navigation configuration
const filialeNavigationConfig = {
  fetchAll: () => filialiService.getSedi(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (filiale: any) => filiale.id,
  basePath: '/app/filiali',
  entityType: 'filiale',
  defaultSortField: 'codCant',
  defaultSortOrder: 1
}

const anagraficaFields: AnagraficaField[] = []

const customTabs = [
  {
    key: 'configurazioni',
    title: 'Configurazioni',
    icon: 'cog'
  }
]

// Methods
const formatSantoPatrono = (gg: number | null, mm: number | null): string => {
  if (!gg || !mm) return ''
  return `${String(gg).padStart(2, '0')}/${String(mm).padStart(2, '0')}`
}

const parseSantoPatrono = (value: string): { gg: number | null; mm: number | null } => {
  if (!value || !value.includes('/')) return { gg: null, mm: null }
  const [gg, mm] = value.split('/').map(Number)
  if (!gg || !mm) return { gg: null, mm: null }
  return { gg, mm }
}

const toNumberOrNull = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return isNaN(num) || num === 0 ? null : num
}

const loadFiliale = async () => {
  if (!isEditMode.value) return

  const id = String(route.params.id)
  loading.value = true

  try {
    const response = await filialiService.getFiliale(id)
    if (response) {
      filiale.value = {
        codAzi: String(response.codAzi),
        codCant: String(response.codCant),
        descriz: response.descriz,
        address: {
          indirizzo: response.indirizzo,
          codiceBelfiore: response.codComune, // Mapping
          comune: response.localita,
          cap: response.cap,
          provincia: response.provincia,
          civico: response.numCivico
        },
        santoPatrono: formatSantoPatrono(response.ggSanto, response.mmSanto),
        causLav: {
          codice: response.codCauLav ? String(response.codCauLav) : '',
          descrizione: ''
        },
        causRip: {
          codice: response.codCauRip ? String(response.codCauRip) : '',
          descrizione: ''
        }
      }
      updateOriginalData(filiale.value)
    }
  } catch (error) {
    console.error('Errore nel caricamento filiale:', error)
    errorMessage.value = 'Errore nel caricamento dei dati filiale'
  } finally {
    loading.value = false
  }
}

const loadFilialeForDuplication = async (duplicateId: string) => {
  loading.value = true

  try {
    const response = await filialiService.getFiliale(duplicateId)
    if (response) {
      filiale.value = {
        codAzi: String(response.codAzi),
        codCant: String(response.codCant),
        descriz: `${response.descriz} - Copia`,
        address: {
          indirizzo: response.indirizzo,
          codiceBelfiore: response.codComune,
          comune: response.localita,
          cap: response.cap,
          provincia: response.provincia,
          civico: response.numCivico
        },
        santoPatrono: formatSantoPatrono(response.ggSanto, response.mmSanto),
        causLav: {
          codice: response.codCauLav ? String(response.codCauLav) : '',
          descrizione: ''
        },
        causRip: {
          codice: response.codCauRip ? String(response.codCauRip) : '',
          descrizione: ''
        }
      }
      // Forza il re-render del DetailTabSelector
      await nextTick()
      componentKey.value++
    }
  } catch (error) {
    console.error('Errore nel caricamento filiale per duplicazione:', error)
    errorMessage.value = 'Errore nel caricamento dei dati per la duplicazione'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    const { gg, mm } = parseSantoPatrono(filiale.value.santoPatrono)

    const filialeToSave: FilialeDettaglio = {
      id: `${filiale.value.codAzi}-${filiale.value.codCant}`,
      codAzi: Number(filiale.value.codAzi),
      codCant: Number(filiale.value.codCant),
      descriz: filiale.value.descriz,
      indirizzo: filiale.value.address.indirizzo,
      numCivico: filiale.value.address.civico,
      localita: filiale.value.address.comune,
      codComune: filiale.value.address.codiceBelfiore,
      cap: filiale.value.address.cap,
      provincia: filiale.value.address.provincia,
      ggSanto: gg,
      mmSanto: mm,
      codCauLav: toNumberOrNull(filiale.value.causLav.codice),
      codCauRip: toNumberOrNull(filiale.value.causRip.codice)
    }

    if (isEditMode.value) {
      await filialiService.editFiliale(filialeToSave)
      updateOriginalData(filiale.value)
    } else {
      await filialiService.addFiliale(filialeToSave)
    }
    successMessage.value = isEditMode.value ? 'Filiale aggiornata con successo' : 'Filiale creata con successo'
    router.push('/app/filiali')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
    errorMessage.value = 'Errore nel salvataggio della filiale'
  } finally {
    saving.value = false
  }
}


const handleDuplicate = () => {
  const duplicated = {
    ...filiale.value,
    codFilialeAz: '',
    descriz: `${filiale.value.descriz} - Copia`
  }

  // Salva i dati duplicati in sessionStorage
  sessionStorage.setItem('duplicatedFilialeData', JSON.stringify(duplicated))
  router.push('/app/filiali/new')
}


const handleReset = () => {
  if (isEditMode.value) {
    loadFiliale()
  } else {
    filiale.value = {
      codAzi: '',
      codCant: '',
      descriz: '',
      address: {
        indirizzo: '',
        codiceBelfiore: null,
        comune: '',
        cap: '',
        provincia: '',
        civico: ''
      },
      santoPatrono: '',
      causLav: { codice: '', descrizione: '' },
      causRip: { codice: '', descrizione: '' }
    }
  }
}

const handleTabChanged = (tab: string) => {
  console.log('Tab changed to:', tab)
}

const goBack = () => {
  router.push('/app/filiale')
}

// Watcher per ricaricare i dati quando cambia l'ID nell'URL
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId && isEditMode.value) {
    loadFiliale()
  }
}, { immediate: false })

onMounted(async () => {
  if (isEditMode.value) {
    loadFiliale()
  } else {
    const duplicateId = route.query.duplicate
    if (duplicateId && typeof duplicateId === 'string') {
      await loadFilialeForDuplication(duplicateId)
    } else {
      const duplicatedDataStr = sessionStorage.getItem('duplicatedFilialeData')
      if (duplicatedDataStr) {
        const duplicatedData = JSON.parse(duplicatedDataStr)
        await nextTick()
        filiale.value = duplicatedData
        componentKey.value++
        sessionStorage.removeItem('duplicatedFilialeData')
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

.text-primary-dark {
  color: oklch(var(--p) / 0.8);
}

input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
