<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Azienda: ${azienda?.ragSoc || azienda?.codAzi}` : 'Nuova Azienda'"
      :description="isEditMode ? 'Modifica i dettagli dell\'azienda selezionata' : 'Crea una nuova azienda nel sistema'"
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
              entity-name="Azienda"
              :navigation-config="aziendaNavigationConfig"
            />

            <!-- Azioni principali -->
            <ActionButtons
              entity-name="Azienda"
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
        :data="azienda as any"
        :anagrafica-fields="anagraficaFields"
        :saving="saving"
        :show-presenze-tab="isEditMode || !!route.query.duplicate"
        @update:data="azienda = $event as unknown as FormAzienda"
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
                  v-model="azienda.codAzi"
                  type="text"
                  placeholder="Inserisci codice azienda"
                  :disabled="saving || isEditMode"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
                />
              </div>

              <div class="space-y-2">
                <label for="ragSoc" class="block text-sm font-medium text-gray-700">
                  Ragione Sociale
                </label>
                <input
                  id="ragSoc"
                  v-model="azienda.ragSoc"
                  type="text"
                  placeholder="Inserisci ragione sociale"
                  :disabled="saving"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
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
                <label for="codFisc" class="block text-sm font-medium text-gray-700">
                  Codice Fiscale
                </label>
                <input
                  id="codFisc"
                  v-model="azienda.codFisc"
                  type="text"
                  placeholder="Inserisci codice fiscale"
                  :disabled="saving"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
                />
              </div>

              <div class="space-y-2">
                <label for="sigla" class="block text-sm font-medium text-gray-700">
                  Sigla
                </label>
                <input
                  id="sigla"
                  v-model="azienda.sigla"
                  type="text"
                  placeholder="Inserisci sigla azienda"
                  :disabled="saving"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
                />
              </div>
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
import NavigationButtons from '@/components/NavigationButtons.vue'
import DetailTabSelector from '@/components/DetailTabSelector.vue'
import AddressInput, { type AddressData } from '@/components/AddressInput.vue'
import { aziendeService, type AziendaDettaglio } from '@/services/aziendeService'
import type { AnagraficaField } from '@/components/DetailTabSelector.vue'

const route = useRoute()
const router = useRouter()

// State per il form (tutti i campi come stringhe per l'input)
interface FormAzienda {
  codAzi: string
  ragSoc: string
  sigla: string
  codFisc: string
  codGrCau1: string
  abbreviazione1: string
  codGrCau2: string
  abbreviazione2: string
  codGrCau3: string
  abbreviazione3: string
  codGrCau4: string
  abbreviazione4: string
  address: AddressData
}

const azienda = ref<FormAzienda>({
  codAzi: '',
  ragSoc: '',
  sigla: '',
  codFisc: '',
  codGrCau1: '',
  abbreviazione1: '',
  codGrCau2: '',
  abbreviazione2: '',
  codGrCau3: '',
  abbreviazione3: '',
  codGrCau4: '',
  abbreviazione4: '',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  sortFn: (_a: any, _b: any) => 0
}

const anagraficaFields: AnagraficaField[] = []

// Methods
const loadAzienda = async () => {
  if (!isEditMode.value) return

  const id = String(route.params.id)
  loading.value = true

  try {
    const response = await aziendeService.getAzienda(id)
    if (response) {
      azienda.value = {
        codAzi: String(response.codAzi),
        ragSoc: response.ragSoc,
        sigla: response.sigla,
        codFisc: response.codFisc,
        codGrCau1: String(response.codGrCau1),
        abbreviazione1: response.abbreviazione1,
        codGrCau2: String(response.codGrCau2),
        abbreviazione2: response.abbreviazione2,
        codGrCau3: String(response.codGrCau3),
        abbreviazione3: response.abbreviazione3,
        codGrCau4: String(response.codGrCau4),
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
    }
  } catch (error) {
    console.error('Errore nel caricamento azienda:', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
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
      codGrCau1: Number(azienda.value.codGrCau1) || 0,
      abbreviazione1: azienda.value.abbreviazione1 || '',
      codGrCau2: Number(azienda.value.codGrCau2) || 0,
      abbreviazione2: azienda.value.abbreviazione2 || '',
      codGrCau3: Number(azienda.value.codGrCau3) || 0,
      abbreviazione3: azienda.value.abbreviazione3 || '',
      codGrCau4: Number(azienda.value.codGrCau4) || 0,
      abbreviazione4: azienda.value.abbreviazione4 || ''
    }

    if (isEditMode.value) {
      await aziendeService.editAzienda(aziendaToSave)
    } else {
      await aziendeService.addAzienda(aziendaToSave)
    }
    router.push('/app/aziende')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
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

const handleDelete = () => {
  if (confirm('Sei sicuro di voler eliminare questa azienda?')) {
    console.log('Delete azienda')
  }
}

const handleDuplicateMode = async () => {
  const duplicateId = route.query.duplicate as string

  if (duplicateId && !isEditMode.value) {
    loading.value = true
    try {
      const response = await aziendeService.getAzienda(duplicateId)
      if (response) {
        azienda.value = {
          codAzi: '', // Codice vuoto per il nuovo record
          ragSoc: response.ragSoc,
          sigla: response.sigla,
          codFisc: response.codFisc,
          codGrCau1: String(response.codGrCau1),
          abbreviazione1: response.abbreviazione1,
          codGrCau2: String(response.codGrCau2),
          abbreviazione2: response.abbreviazione2,
          codGrCau3: String(response.codGrCau3),
          abbreviazione3: response.abbreviazione3,
          codGrCau4: String(response.codGrCau4),
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
      codGrCau1: '',
      abbreviazione1: '',
      codGrCau2: '',
      abbreviazione2: '',
      codGrCau3: '',
      abbreviazione3: '',
      codGrCau4: '',
      abbreviazione4: '',
      address: {
        indirizzo: '',
        codiceBelfiore: '',
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
