<template>
  <div class="filter-component bg-white p-6 rounded-lg shadow-sm border">
    <!-- Prima riga: Azienda, Sede, Filiale -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <!-- Azienda Dropdown -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Azienda
        </label>
        <select
          v-model="selectedAzienda"
          @change="onAziendaChange"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
        >
          <option value="" disabled>Seleziona azienda...</option>
          <option
            v-for="azienda in aziende"
            :key="azienda.codAzi"
            :value="azienda.codAzi"
          >
            {{ azienda.codAzi }} - {{ azienda.ragSoc }}
          </option>
        </select>
      </div>

      <!-- Sede Button -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Sede
        </label>
        <button
          @click="openSedeModal"
          :disabled="!selectedAzienda"
          class="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          <span class="text-sm text-gray-900">
            {{ selectedSede ? `${selectedSede.codSedeAz} - ${selectedSede.descriz}` : 'Seleziona sede...' }}
          </span>
          <FaIcon icon="user" class="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <!-- Filiale Button -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Filiale
        </label>
        <button
          @click="openFilialeModal"
          :disabled="!selectedAzienda"
          class="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          <span class="text-sm text-gray-900">
            {{ selectedFiliale ? `${selectedFiliale.codCant} - ${selectedFiliale.descriz}` : 'Seleziona filiale...' }}
          </span>
          <FaIcon icon="user" class="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>

    <!-- Seconda riga: Reparto, Centro di Costo, Filtro -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <!-- Reparto Button -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Reparto
        </label>
        <button
          @click="openRepartoModal"
          :disabled="!selectedAzienda"
          class="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          <span class="text-sm text-gray-900">
            {{ selectedReparto ? `${selectedReparto.codReparto} - ${selectedReparto.descriz}` : 'Seleziona reparto...' }}
          </span>
          <FaIcon icon="user" class="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <!-- Centro di Costo Button -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Centro di Costo
        </label>
        <button
          @click="openCentroCostoModal"
          :disabled="!selectedAzienda"
          class="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          <span class="text-sm text-gray-900">
            {{ selectedCentroCosto ? `${selectedCentroCosto.codCenco} - ${selectedCentroCosto.descriz}` : 'Seleziona centro di costo...' }}
          </span>
          <FaIcon icon="user" class="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <!-- Filtro Radio Buttons -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Filtro
        </label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="filtroTipo"
              type="radio"
              value="codice-cognome"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span class="ml-2 text-sm text-gray-900">Filtra per Codice o Cognome</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="filtroTipo"
              type="radio"
              value="intervallo"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span class="ml-2 text-sm text-gray-900">Selezione un intervallo di dipendenti</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Terza riga: Campi filtro condizionali -->
    <div v-if="filtroTipo === 'codice-cognome'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Codice
        </label>
        <input
          v-model="codice"
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
          placeholder="Inserisci codice..."
        />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Cognome
        </label>
        <input
          v-model="cognome"
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
          placeholder="Inserisci cognome..."
        />
      </div>
    </div>

    <div v-else-if="filtroTipo === 'intervallo'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Dal Dipendente
        </label>
        <input
          v-model="dalDipendente"
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
          placeholder="Codice dipendente..."
        />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Al Dipendente
        </label>
        <input
          v-model="alDipendente"
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
          placeholder="Codice dipendente..."
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3">
      <button
        @click="resetFilters"
        class="btn btn-ghost btn-sm"
      >
        Annulla
      </button>
      <button
        @click="applyFilters"
        class="btn btn-primary btn-sm text-white"
      >
        Conferma
      </button>
    </div>

    <!-- Modals -->
    <FilterSelectionModal
      v-if="showSedeModal"
      :is-visible="showSedeModal"
      :title="'Seleziona Sede'"
      :items="filteredSedi"
      :loading="loadingSedi"
      :search-placeholder="'Cerca sede...'"
      @close="closeSedeModal"
      @select="selectSede"
    />

    <FilterSelectionModal
      v-if="showFilialeModal"
      :is-visible="showFilialeModal"
      :title="'Seleziona Filiale'"
      :items="filteredFiliali"
      :loading="loadingFiliali"
      :search-placeholder="'Cerca filiale...'"
      @close="closeFilialeModal"
      @select="selectFiliale"
    />

    <FilterSelectionModal
      v-if="showRepartoModal"
      :is-visible="showRepartoModal"
      :title="'Seleziona Reparto'"
      :items="filteredReparti"
      :loading="loadingReparti"
      :search-placeholder="'Cerca reparto...'"
      @close="closeRepartoModal"
      @select="selectReparto"
    />

    <FilterSelectionModal
      v-if="showCentroCostoModal"
      :is-visible="showCentroCostoModal"
      :title="'Seleziona Centro di Costo'"
      :items="filteredCentriCosto"
      :loading="loadingCentriCosto"
      :search-placeholder="'Cerca centro di costo...'"
      @close="closeCentroCostoModal"
      @select="selectCentroCosto"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import { aziendeService, type Azienda } from '@/services/aziendeService'
import { sediService, type Sede } from '@/services/sediService'
import { filialiService, type Filiale } from '@/services/filialiService'
import { repartiService, type Reparto } from '@/services/repartiService'
import { centriCostoService, type CentroCosto } from '@/services/centriCostoService'
import { useNotification } from '@/composables/useNotification'
import FilterSelectionModal, { type FilterItem } from './FilterSelectionModal.vue'
import { dipendenteService, type FiltriDipendente, type Dipendente } from '@/services/dipendenteService'

export interface FilterData {
  azienda?: number
  sede?: Sede
  filiale?: Filiale
  reparto?: Reparto
  centroCosto?: CentroCosto
  filtroTipo: 'codice-cognome' | 'intervallo'
  codice?: string
  cognome?: string
  dalDipendente?: string
  alDipendente?: string
}

const emit = defineEmits<{
  'apply': [filters: FilterData]
  'reset': []
  'dipendenti-loaded': [dipendenti: Dipendente[]]
  'loading': [isLoading: boolean]
}>()

const { error: showError } = useNotification()

// State
const selectedAzienda = ref<number | ''>('')
const selectedSede = ref<Sede | null>(null)
const selectedFiliale = ref<Filiale | null>(null)
const selectedReparto = ref<Reparto | null>(null)
const selectedCentroCosto = ref<CentroCosto | null>(null)
const filtroTipo = ref<'codice-cognome' | 'intervallo'>('codice-cognome')
const codice = ref('')
const cognome = ref('')
const dalDipendente = ref('')
const alDipendente = ref('')

// Modal states
const showSedeModal = ref(false)
const showFilialeModal = ref(false)
const showRepartoModal = ref(false)
const showCentroCostoModal = ref(false)

// Loading states
const loadingSedi = ref(false)
const loadingFiliali = ref(false)
const loadingReparti = ref(false)
const loadingCentriCosto = ref(false)

// Data
const aziende = ref<Azienda[]>([])
const allSedi = ref<Sede[]>([])
const allFiliali = ref<Filiale[]>([])
const allReparti = ref<Reparto[]>([])
const allCentriCosto = ref<CentroCosto[]>([])

// Computed
const filteredSedi = computed(() =>
  allSedi.value.filter(sede => sede.codAzi === selectedAzienda.value)
)

const filteredFiliali = computed(() =>
  allFiliali.value.filter(filiale => filiale.codAzi === selectedAzienda.value)
)

const filteredReparti = computed(() =>
  allReparti.value.filter(reparto => reparto.codAzi === selectedAzienda.value)
)

const filteredCentriCosto = computed(() =>
  allCentriCosto.value.filter(centro => centro.codAzi === selectedAzienda.value)
)

// Methods
const loadAziende = async () => {
  try {
    aziende.value = await aziendeService.getAziende()
  } catch (error) {
    console.error('Error loading aziende:', error)
    showError('Errore nel caricamento delle aziende')
  }
}

const loadAllData = async () => {
  try {
    const [sedi, filiali, reparti, centriCosto] = await Promise.all([
      sediService.getSedi(),
      filialiService.getFiliali(),
      repartiService.getReparti(),
      centriCostoService.getCentriCosto()
    ])

    allSedi.value = sedi
    allFiliali.value = filiali
    allReparti.value = reparti
    allCentriCosto.value = centriCosto
  } catch (error) {
    console.error('Error loading data:', error)
    showError('Errore nel caricamento dei dati')
  }
}

const onAziendaChange = () => {
  selectedSede.value = null
  selectedFiliale.value = null
  selectedReparto.value = null
  selectedCentroCosto.value = null
}

// Modal methods
const openSedeModal = () => {
  showSedeModal.value = true
}

const closeSedeModal = () => {
  showSedeModal.value = false
}

const selectSede = (sede: FilterItem) => {
  selectedSede.value = sede as Sede
  closeSedeModal()
}

const openFilialeModal = () => {
  showFilialeModal.value = true
}

const closeFilialeModal = () => {
  showFilialeModal.value = false
}

const selectFiliale = (filiale: FilterItem) => {
  selectedFiliale.value = filiale as Filiale
  closeFilialeModal()
}

const openRepartoModal = () => {
  showRepartoModal.value = true
}

const closeRepartoModal = () => {
  showRepartoModal.value = false
}

const selectReparto = (reparto: FilterItem) => {
  selectedReparto.value = reparto as Reparto
  closeRepartoModal()
}

const openCentroCostoModal = () => {
  showCentroCostoModal.value = true
}

const closeCentroCostoModal = () => {
  showCentroCostoModal.value = false
}

const selectCentroCosto = (centroCosto: FilterItem) => {
  selectedCentroCosto.value = centroCosto as CentroCosto
  closeCentroCostoModal()
}

const applyFilters = async () => {
  if (!selectedAzienda.value) {
    showError('Seleziona almeno un\'azienda per procedere')
    return
  }

  const filters: FilterData = {
    filtroTipo: filtroTipo.value
  }

  if (selectedAzienda.value) {
    filters.azienda = selectedAzienda.value as number
  }

  if (selectedSede.value) {
    filters.sede = selectedSede.value
  }

  if (selectedFiliale.value) {
    filters.filiale = selectedFiliale.value
  }

  if (selectedReparto.value) {
    filters.reparto = selectedReparto.value
  }

  if (selectedCentroCosto.value) {
    filters.centroCosto = selectedCentroCosto.value
  }

  if (filtroTipo.value === 'codice-cognome') {
    if (codice.value) filters.codice = codice.value
    if (cognome.value) filters.cognome = cognome.value
  } else {
    if (dalDipendente.value) filters.dalDipendente = dalDipendente.value
    if (alDipendente.value) filters.alDipendente = alDipendente.value
  }

  // Prepara i dati per l'API
  const filtriApi: FiltriDipendente = {
    codAzi: selectedAzienda.value as number,
    codSedeAz: selectedSede.value?.codSedeAz,
    codCant: selectedFiliale.value?.codCant,
    codCenco: selectedCentroCosto.value?.codCenco,
    codReparto: selectedReparto.value?.codReparto,
    codFiltro: undefined // TODO: gestire codFiltro se necessario
  }

  // Aggiunge filtri dipendente se presenti
  if (filtroTipo.value === 'codice-cognome') {
    if (codice.value) {
      const codDip = parseInt(codice.value)
      if (!isNaN(codDip)) {
        filtriApi.codDip = codDip
      }
    }
    if (cognome.value) {
      filtriApi.cognome = cognome.value
    }
  }

  try {
    emit('loading', true)
    const dipendenti = await dipendenteService.getListaDipendenti(filtriApi)
    emit('dipendenti-loaded', dipendenti)
    emit('apply', filters)
  } catch (error) {
    console.error('Errore nel caricamento dipendenti:', error)
    showError('Errore nel caricamento dei dipendenti')
  } finally {
    emit('loading', false)
  }
}

const resetFilters = () => {
  selectedAzienda.value = ''
  selectedSede.value = null
  selectedFiliale.value = null
  selectedReparto.value = null
  selectedCentroCosto.value = null
  filtroTipo.value = 'codice-cognome'
  codice.value = ''
  cognome.value = ''
  dalDipendente.value = ''
  alDipendente.value = ''

  emit('reset')
}

onMounted(() => {
  loadAziende()
  loadAllData()
})
</script>

<style scoped>
.border-primary {
  border-color: oklch(var(--p));
}

.focus\:border-primary:focus {
  border-color: oklch(var(--p));
}

.focus\:ring-primary:focus {
  --tw-ring-color: oklch(var(--p));
}

.text-primary {
  color: oklch(var(--p));
}

button:focus,
input:focus,
select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
