<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Filiale: ${filiale?.descriz}` : 'Nuova Filiale'"
      :description="isEditMode ? 'Modifica i dettagli della filiale selezionata' : 'Crea una nuova filiale nel sistema'"
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

    <!-- Form Container -->
    <form @submit.prevent="handleSave" class="space-y-6">
      <div class="bg-white p-4 rounded-lg shadow-sm border">
        <div class="lg:flex items-center justify-between gap-3">
          <div class="flex flex-col lg:flex-row lg:items-center gap-3">
            <!-- Navigazione -->
            <NavigationButtons
              :show-navigation="isEditMode"
              :disabled="saving"
              entity-name="Filiale"
              :navigation-config="filialeNavigationConfig"
            />

            <!-- Azioni principali -->
            <ActionButtons
              entity-name="Filiale"
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

      <!-- Tab Selector -->
      <DetailTabSelector
        :key="componentKey"
        :data="filiale as any"
        :anagrafica-fields="anagraficaFields"
        :saving="saving"
        :show-presenze-tab="false"
        @update:data="filiale = $event as unknown as FormFiliale"
        @tab-changed="handleTabChanged"
      >
        <!-- Anagrafica -->
        <template #anagrafica>
          <div class="grid grid-cols-1 gap-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="codAzi" class="block text-sm font-medium text-gray-700">
                  Codice Azienda
                </label>
                <input
                  id="codAzi"
                  v-model="filiale.codAzi"
                  type="number"
                  placeholder="Inserisci codice azienda"
                  :disabled="saving || isEditMode"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
                />
              </div>

              <div class="space-y-2">
                <label for="codCant" class="block text-sm font-medium text-gray-700">
                  Codice Cantiere Filiale
                </label>
                <input
                  id="codCant"
                  v-model="filiale.codCant"
                  type="number"
                  placeholder="Inserisci codice cantiere"
                  :disabled="saving || isEditMode"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="descriz" class="block text-sm font-medium text-gray-700">
                Descrizione
              </label>
              <input
                id="descriz"
                v-model="filiale.descriz"
                type="text"
                placeholder="Inserisci descrizione filiale"
                :disabled="saving"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
              />
            </div>

            <!-- Componente Indirizzo -->
            <AddressInput
              v-model="filiale.address"
              :disabled="saving"
            />
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
import NavigationButtons from '@/components/NavigationButtons.vue'
import DetailTabSelector from '@/components/DetailTabSelector.vue'
import AddressInput, { type AddressData } from '@/components/AddressInput.vue'
import { filialiService, type FilialeDettaglio } from '@/services/filialiService'
import type { AnagraficaField } from '@/components/DetailTabSelector.vue'

const route = useRoute()
const router = useRouter()

// State per il form (tutti i campi come stringhe per l'input)
interface FormFiliale {
  codAzi: string
  codCant: string
  descriz: string
  address: AddressData
}

const filiale = ref<FormFiliale>({
  codAzi: '',
  codCant: '',
  descriz: '',
  address: {
    indirizzo: '',
    codiceBelfiore: '',
    comune: '',
    cap: '',
    provincia: '',
    civico: ''
  }
})

const saving = ref(false)
const loading = ref(false)
const componentKey = ref(0)

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  sortFn: (_a: any, _b: any) => 0
}

const anagraficaFields: AnagraficaField[] = []

// Methods
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
        }
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento filiale:', error)
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
        }
      }
      // Forza il re-render del DetailTabSelector
      await nextTick()
      componentKey.value++
    }
  } catch (error) {
    console.error('Errore nel caricamento filiale per duplicazione:', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
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
      provincia: filiale.value.address.provincia
    }

    if (isEditMode.value) {
      await filialiService.editFiliale(filialeToSave)
    } else {
      await filialiService.addFiliale(filialeToSave)
    }
    router.push('/app/filiali')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
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

const handleDelete = () => {
  if (confirm('Sei sicuro di voler eliminare questa filiale?')) {
    console.log('Delete filiale')
  }
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
        codiceBelfiore: '',
        comune: '',
        cap: '',
        provincia: '',
        civico: ''
      }
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
    // Controlla se ci sono parametri di query per la duplicazione (dal DataTableManager)
    const duplicateId = route.query.duplicate
    if (duplicateId && typeof duplicateId === 'string') {
      await loadFilialeForDuplication(duplicateId)
    } else {
      // Controlla se ci sono dati duplicati da caricare
      const duplicatedDataStr = sessionStorage.getItem('duplicatedFilialeData')
      if (duplicatedDataStr) {
        const duplicatedData = JSON.parse(duplicatedDataStr)
        // Usa nextTick per assicurarti che il componente sia completamente montato
        await nextTick()
        filiale.value = duplicatedData
        // Forza il re-render del DetailTabSelector
        componentKey.value++
        // Rimuove i dati dal sessionStorage dopo averli usati
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
