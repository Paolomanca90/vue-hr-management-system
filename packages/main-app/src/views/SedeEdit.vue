<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Sede: ${sede?.descriz}` : 'Nuova Sede'"
      :description="isEditMode ? 'Modifica i dettagli della sede selezionata' : 'Crea una nuova sede nel sistema'"
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
              entity-name="Sede"
              :navigation-config="sedeNavigationConfig"
            />

            <!-- Azioni principali -->
            <ActionButtons
              entity-name="Sede"
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
        :data="sede as any"
        :anagrafica-fields="anagraficaFields"
        :saving="saving"
        :show-presenze-tab="false"
        @update:data="sede = $event as unknown as FormSede"
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
                  v-model="sede.codAzi"
                  type="number"
                  placeholder="Inserisci codice azienda"
                  :disabled="saving || isEditMode"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
                />
              </div>

              <div class="space-y-2">
                <label for="codSedeAz" class="block text-sm font-medium text-gray-700">
                  Codice Sede Azienda
                </label>
                <input
                  id="codSedeAz"
                  v-model="sede.codSedeAz"
                  type="number"
                  placeholder="Inserisci codice sede azienda"
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
                v-model="sede.descriz"
                type="text"
                placeholder="Inserisci descrizione sede"
                :disabled="saving"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
              />
            </div>

            <!-- Componente Indirizzo -->
            <AddressInput
              v-model="sede.address"
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
import { sediService, type SedeDettaglio } from '@/services/sediService'
import type { AnagraficaField } from '@/components/DetailTabSelector.vue'

const route = useRoute()
const router = useRouter()

// State per il form (tutti i campi come stringhe per l'input)
interface FormSede {
  codAzi: string
  codSedeAz: string
  descriz: string
  address: AddressData
}

const sede = ref<FormSede>({
  codAzi: '',
  codSedeAz: '',
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
const isEditMode = computed(() => route.params.id !== 'new')
const isFormValid = computed(() => {
  // Il form è sempre valido dato che tutti i campi sono opzionali nel DTO
  return true
})

// Navigation configuration
const sedeNavigationConfig = {
  fetchAll: () => sediService.getSedi(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (sede: any) => sede.id,
  basePath: '/app/sedi',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  sortFn: (_a: any, _b: any) => 0
}

const anagraficaFields: AnagraficaField[] = []

// Methods
const loadSede = async () => {
  if (!isEditMode.value) return

  const id = String(route.params.id)
  loading.value = true

  try {
    const response = await sediService.getSede(id)
    if (response) {
      sede.value = {
        codAzi: String(response.codAzi),
        codSedeAz: String(response.codSedeAz),
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
    console.error('Errore nel caricamento sede:', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    const sedeToSave: SedeDettaglio = {
      id: `${sede.value.codAzi}-${sede.value.codSedeAz}`,
      codAzi: Number(sede.value.codAzi),
      codSedeAz: Number(sede.value.codSedeAz),
      descriz: sede.value.descriz,
      indirizzo: sede.value.address.indirizzo,
      numCivico: sede.value.address.civico,
      localita: sede.value.address.comune,
      codComune: sede.value.address.codiceBelfiore,
      cap: sede.value.address.cap,
      provincia: sede.value.address.provincia
    }

    if (isEditMode.value) {
      await sediService.editSede(sedeToSave)
    } else {
      await sediService.addSede(sedeToSave)
    }
    router.push('/app/sedi')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
  } finally {
    saving.value = false
  }
}


const handleDuplicate = () => {
  const duplicated = {
    ...sede.value,
    codAzi: '',
    codSedeAz: '',
    descriz: `${sede.value.descriz} - Copia`
  }

  // Salva i dati duplicati in sessionStorage
  sessionStorage.setItem('duplicatedSedeData', JSON.stringify(duplicated))
  router.push('/app/sedi/new')
}

const handleDelete = () => {
  if (confirm('Sei sicuro di voler eliminare questa sede?')) {
    console.log('Delete sede')
  }
}

const handleReset = () => {
  if (isEditMode.value) {
    loadSede()
  } else {
    sede.value = {
      codAzi: '',
      codSedeAz: '',
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
  router.push('/app/sedi')
}

// Watcher per ricaricare i dati quando cambia l'ID nell'URL
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId && isEditMode.value) {
    loadSede()
  }
}, { immediate: false })

onMounted(async () => {
  if (isEditMode.value) {
    loadSede()
  } else {
    // Controlla se ci sono dati duplicati da caricare
    const duplicatedDataStr = sessionStorage.getItem('duplicatedSedeData')
    if (duplicatedDataStr) {
      const duplicatedData = JSON.parse(duplicatedDataStr)
      // Usa nextTick per assicurarti che il componente sia completamente montato
      await nextTick()
      sede.value = duplicatedData
      // Forza il re-render del DetailTabSelector
      componentKey.value++
      // Rimuovi i dati dal sessionStorage dopo averli usati
      sessionStorage.removeItem('duplicatedSedeData')
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