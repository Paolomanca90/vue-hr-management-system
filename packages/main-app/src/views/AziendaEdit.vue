<template>
  <div class="space-y-1">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica ${azienda.ragSoc} (${azienda.codAzi})` : 'Nuova Azienda'"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Aziende', to: '/app/aziende' },
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
        entity-name="Azienda"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="aziendaNavigationConfig"
        @duplicate="handleDuplicate"
        @reset="handleReset"
      />

      <!-- Tab Selector -->
      <DetailTabSelector
        :data="azienda as any"
        :anagrafica-fields="anagraficaFields"
        :custom-tabs="customTabs"
        :saving="saving"
        :show-presenze-tab="true"
        @update:data="azienda = $event as unknown as FormAzienda"
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
                  v-model="azienda.codAzi"
                  type="text"
                  placeholder="Inserisci codice azienda"
                  :disabled="saving || isEditMode"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div class="space-y-2">
                <label for="ragSoc" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ragione Sociale
                </label>
                <input
                  id="ragSoc"
                  v-model="azienda.ragSoc"
                  type="text"
                  placeholder="Inserisci ragione sociale"
                  :disabled="saving"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            <!-- Componente Indirizzo -->
            <AddressInput
              v-model="azienda.address"
              :disabled="saving"
            />

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="codFisc" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Codice Fiscale
                </label>
                <input
                  id="codFisc"
                  v-model="azienda.codFisc"
                  type="text"
                  placeholder="Inserisci codice fiscale"
                  :disabled="saving"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div class="space-y-2">
                <label for="sigla" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sigla
                </label>
                <input
                  id="sigla"
                  v-model="azienda.sigla"
                  type="text"
                  placeholder="Inserisci sigla azienda"
                  :disabled="saving"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

        </template>

        <!-- Tab Configurazioni -->
        <template #configurazioni>
          <div class="grid grid-cols-1 gap-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Configurazioni Aziendali</h3>

            <!-- Santo Patrono -->
            <div class="space-y-2">
              <label for="santoPatrono" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Giorno Santo Patrono
              </label>
              <input
                id="santoPatrono"
                v-model="azienda.santoPatrono"
                type="text"
                placeholder="gg/MM (es. 15/08)"
                :disabled="saving"
                maxlength="5"
                class="block w-full lg:w-1/2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400">Formato: gg/MM (es. 15/08 per 15 Agosto)</p>
            </div>

            <!-- Codice Causale Lavoro -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Codice Causale Lavoro
              </label>
              <GenericLookupInput
                v-model="azienda.causLav"
                :config="causaliLookupConfig"
                :disabled="saving"
              />
            </div>

            <!-- Codice Causale Riposo -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Codice Causale Riposo
              </label>
              <GenericLookupInput
                v-model="azienda.causRip"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import DetailTabSelector, { type CustomTab } from '@/components/DetailTabSelector.vue'
import AddressInput, { type AddressData } from '@/components/AddressInput.vue'
import GenericLookupInput from '@/components/GenericLookupInput.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import { aziendeService, type AziendaDettaglio } from '@/services/aziendeService'
import { lookupService } from '@/services/lookupService'
import type { AnagraficaField } from '@/components/DetailTabSelector.vue'
import { causaliLookupConfig } from '@/config/lookupConfigs'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'

const route = useRoute()
const router = useRouter()

// Type per causali
interface CausaleData {
  codice: string
  descrizione: string
}

// State per il form (tutti i campi come stringhe per l'input)
interface FormAzienda {
  codAzi: string
  ragSoc: string
  sigla: string
  codFisc: string
  santoPatrono: string // formato gg/MM
  causLav: CausaleData
  causRip: CausaleData
  codice1: string
  codGrCau1: string
  abbreviazione1: string | null
  codice2: string
  codGrCau2: string
  abbreviazione2: string | null
  codice3: string
  codGrCau3: string
  abbreviazione3: string | null
  codice4: string
  codGrCau4: string
  abbreviazione4: string | null
  address: AddressData
}

const azienda = ref<FormAzienda>({
  codAzi: '',
  ragSoc: '',
  sigla: '',
  codFisc: '',
  santoPatrono: '',
  causLav: { codice: '', descrizione: '' },
  causRip: { codice: '', descrizione: '' },
  codice1: '',
  codGrCau1: '',
  abbreviazione1: null,
  codice2: '',
  codGrCau2: '',
  abbreviazione2: null,
  codice3: '',
  codGrCau3: '',
  abbreviazione3: null,
  codice4: '',
  codGrCau4: '',
  abbreviazione4: null,
  address: {
    indirizzo: '',
    codiceBelfiore: null,
    comune: '',
    cap: '',
    provincia: '',
    civico: ''
  }
})

const saving = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const originalData = ref<FormAzienda | null>(null)

useMessageAlerts(errorMessage, successMessage)

const {
  isDirty,
  touchedFields,
  updateOriginalData
} = useFormDirtyState(azienda, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate all\'Azienda. Sei sicuro di voler lasciare questa pagina?'
})

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const isFormValid = computed(() => {
  // Il form è sempre valido dato che tutti i campi sono opzionali nel DTO
  return true
})

// Navigation configuration
const aziendaNavigationConfig = {
  fetchAll: () => aziendeService.getAziende(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (azienda: any) => String(azienda.codAzi),
  basePath: '/app/aziende',
  entityType: 'azienda',
  defaultSortField: 'codAzi',
  defaultSortOrder: 1
}

const anagraficaFields: AnagraficaField[] = []

const customTabs: CustomTab[] = [
  { key: 'configurazioni', title: 'Configurazioni', icon: 'cog' }
]

let gruppiCausaliCache: Map<string, string> | null = null

const loadGruppiCausali = async (): Promise<Map<string, string>> => {
  if (gruppiCausaliCache) return gruppiCausaliCache

  try {
    const gruppi = await lookupService.getGruppiCausali()
    gruppiCausaliCache = new Map(gruppi.map(g => [g.codice, g.descrizione]))
    return gruppiCausaliCache
  } catch (error) {
    console.error('Errore nel caricamento gruppi causali:', error)
    return new Map()
  }
}

const getDescrizioneGruppo = (codice: number | null, gruppiMap: Map<string, string>): string => {
  if (!codice || codice === 0) return ''
  return gruppiMap.get(String(codice)) || ''
}

// Methods
const loadAzienda = async () => {
  if (!isEditMode.value) return

  const id = String(route.params.id)
  loading.value = true

  try {
    const response = await aziendeService.getAzienda(id)
    if (response) {
      const gruppiMap = await loadGruppiCausali()

      const desc1 = getDescrizioneGruppo(response.codGrCau1, gruppiMap)
      const desc2 = getDescrizioneGruppo(response.codGrCau2, gruppiMap)
      const desc3 = getDescrizioneGruppo(response.codGrCau3, gruppiMap)
      const desc4 = getDescrizioneGruppo(response.codGrCau4, gruppiMap)

      // Formatta santo patrono come gg/MM
      const santoPatrono = response.ggSanto && response.mmSanto
        ? `${String(response.ggSanto).padStart(2, '0')}/${String(response.mmSanto).padStart(2, '0')}`
        : ''

      azienda.value = {
        codAzi: String(response.codAzi),
        ragSoc: response.ragSoc,
        sigla: response.sigla,
        codFisc: response.codFisc,
        santoPatrono,
        causLav: {
          codice: response.codCauLav ? String(response.codCauLav) : '',
          descrizione: '' // Verrà popolato automaticamente dal GenericLookupInput
        },
        causRip: {
          codice: response.codCauRip ? String(response.codCauRip) : '',
          descrizione: '' // Verrà popolato automaticamente dal GenericLookupInput
        },
        codice1: response.codGrCau1 && response.codGrCau1 !== 0 ? String(response.codGrCau1) : '',
        codGrCau1: desc1,
        abbreviazione1: response.abbreviazione1,
        codice2: response.codGrCau2 && response.codGrCau2 !== 0 ? String(response.codGrCau2) : '',
        codGrCau2: desc2,
        abbreviazione2: response.abbreviazione2,
        codice3: response.codGrCau3 && response.codGrCau3 !== 0 ? String(response.codGrCau3) : '',
        codGrCau3: desc3,
        abbreviazione3: response.abbreviazione3,
        codice4: response.codGrCau4 && response.codGrCau4 !== 0 ? String(response.codGrCau4) : '',
        codGrCau4: desc4,
        abbreviazione4: response.abbreviazione4,
        address: {
          indirizzo: response.indirSede,
          codiceBelfiore: '', // Da popolare se disponibile
          comune: response.comuSede,
          cap: String(response.capSede),
          provincia: response.provSede,
          civico: response.numSede
        }
      }
      updateOriginalData(azienda.value)
    }
  } catch (error) {
    console.error('Errore nel caricamento azienda:', error)
    errorMessage.value = 'Errore nel caricamento dei dati azienda'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    const toNumberOrNull = (value: string | number): number | null => {
      const num = Number(value)
      return num > 0 ? num : null
    }

    const toStringOrNull = (value: string | null | undefined): string | null => {
      if (!value) return null
      return value.trim() ? value.trim() : null
    }

    // Parsea santo patrono da formato gg/MM
    const parseSantoPatrono = (value: string): { gg: number | null; mm: number | null } => {
      if (!value || !value.includes('/')) return { gg: null, mm: null }
      const [gg, mm] = value.split('/').map(Number)
      if (!gg || !mm) return { gg: null, mm: null }
      return { gg, mm }
    }

    const santoPatrono = parseSantoPatrono(azienda.value.santoPatrono)

    const aziendaToSave: AziendaDettaglio = {
      codAzi: Number(azienda.value.codAzi),
      ragSoc: azienda.value.ragSoc,
      sigla: azienda.value.sigla,
      indirSede: azienda.value.address.indirizzo,
      numSede: azienda.value.address.civico,
      capSede: Number(azienda.value.address.cap) || 0,
      comuSede: azienda.value.address.comune,
      provSede: azienda.value.address.provincia,
      codFisc: azienda.value.codFisc,
      ggSanto: santoPatrono.gg,
      mmSanto: santoPatrono.mm,
      codGrCau1: toNumberOrNull(azienda.value.codice1),
      abbreviazione1: toStringOrNull(azienda.value.abbreviazione1),
      codGrCau2: toNumberOrNull(azienda.value.codice2),
      abbreviazione2: toStringOrNull(azienda.value.abbreviazione2),
      codGrCau3: toNumberOrNull(azienda.value.codice3),
      abbreviazione3: toStringOrNull(azienda.value.abbreviazione3),
      codGrCau4: toNumberOrNull(azienda.value.codice4),
      abbreviazione4: toStringOrNull(azienda.value.abbreviazione4),
      codCauLav: toNumberOrNull(azienda.value.causLav.codice),
      codCauRip: toNumberOrNull(azienda.value.causRip.codice)
    }

    if (isEditMode.value) {
      await aziendeService.editAzienda(aziendaToSave)
      updateOriginalData(azienda.value)
    } else {
      await aziendeService.addAzienda(aziendaToSave)
    }
    successMessage.value = isEditMode.value ? 'Azienda aggiornata con successo' : 'Azienda creata con successo'
    router.push('/app/aziende')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
    errorMessage.value = 'Errore nel salvataggio dell\'azienda'
  } finally {
    saving.value = false
  }
}


const handleDuplicate = () => {
  router.push({
    name: 'AziendaNew',
    query: {
      duplicate: azienda.value.codAzi
    }
  })
}


const handleDuplicateMode = async () => {
  const duplicateId = route.query.duplicate as string

  if (duplicateId && !isEditMode.value) {
    loading.value = true
    try {
      const response = await aziendeService.getAzienda(duplicateId)
      if (response) {
        const gruppiMap = await loadGruppiCausali()

        const desc1 = getDescrizioneGruppo(response.codGrCau1, gruppiMap)
        const desc2 = getDescrizioneGruppo(response.codGrCau2, gruppiMap)
        const desc3 = getDescrizioneGruppo(response.codGrCau3, gruppiMap)
        const desc4 = getDescrizioneGruppo(response.codGrCau4, gruppiMap)

        // Formatta santo patrono come gg/MM
        const santoPatrono = response.ggSanto && response.mmSanto
          ? `${String(response.ggSanto).padStart(2, '0')}/${String(response.mmSanto).padStart(2, '0')}`
          : ''

        azienda.value = {
          codAzi: '', // Codice vuoto per il nuovo record
          ragSoc: response.ragSoc,
          sigla: response.sigla,
          codFisc: response.codFisc,
          santoPatrono,
          causLav: {
            codice: response.codCauLav ? String(response.codCauLav) : '',
            descrizione: ''
          },
          causRip: {
            codice: response.codCauRip ? String(response.codCauRip) : '',
            descrizione: ''
          },
          codice1: response.codGrCau1 && response.codGrCau1 !== 0 ? String(response.codGrCau1) : '',
          codGrCau1: desc1,
          abbreviazione1: response.abbreviazione1,
          codice2: response.codGrCau2 && response.codGrCau2 !== 0 ? String(response.codGrCau2) : '',
          codGrCau2: desc2,
          abbreviazione2: response.abbreviazione2,
          codice3: response.codGrCau3 && response.codGrCau3 !== 0 ? String(response.codGrCau3) : '',
          codGrCau3: desc3,
          abbreviazione3: response.abbreviazione3,
          codice4: response.codGrCau4 && response.codGrCau4 !== 0 ? String(response.codGrCau4) : '',
          codGrCau4: desc4,
          abbreviazione4: response.abbreviazione4,
          address: {
            indirizzo: response.indirSede,
            codiceBelfiore: '',
            comune: response.comuSede,
            cap: String(response.capSede),
            provincia: response.provSede,
            civico: response.numSede
          }
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento azienda per duplicate:', error)
      errorMessage.value = 'Errore nel caricamento dei dati per la duplicazione'
    } finally {
      loading.value = false
    }
  }
}

const handleReset = async() => {
  if (isEditMode.value) {
    loadAzienda()
  } else {
    azienda.value = {
      codAzi: '',
      ragSoc: '',
      sigla: '',
      codFisc: '',
      santoPatrono: '',
      causLav: { codice: '', descrizione: '' },
      causRip: { codice: '', descrizione: '' },
      codice1: '',
      codGrCau1: '',
      abbreviazione1: null,
      codice2: '',
      codGrCau2: '',
      abbreviazione2: null,
      codice3: '',
      codGrCau3: '',
      abbreviazione3: null,
      codice4: '',
      codGrCau4: '',
      abbreviazione4: null,
      address: {
        indirizzo: '',
        codiceBelfiore: null,
        comune: '',
        cap: '',
        provincia: '',
        civico: ''
      }
    }
    await handleDuplicateMode()
  }
}

const handleTabChanged = (tab: string) => {
  console.log('Tab changed to:', tab)
}

const goBack = () => {
  router.push('/app/aziende')
}

// Watcher per ricaricare i dati quando cambia l'ID nell'URL
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId && isEditMode.value) {
    loadAzienda()
  }
}, { immediate: false })

// Watcher per gestire i cambiamenti nei query parameters (duplicate)
watch(() => route.query.duplicate, async (newDuplicate) => {
  if (newDuplicate && !isEditMode.value) {
    await handleDuplicateMode()
  }
}, { immediate: false })

onMounted(async () => {
  if (isEditMode.value) {
    loadAzienda()
  } else {
    await handleDuplicateMode()
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
