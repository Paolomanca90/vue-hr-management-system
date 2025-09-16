<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Sede: ${sede?.ragSoc || sede?.codSede}` : 'Nuova Sede'"
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
                <label for="codSede" class="block text-sm font-medium text-gray-700">
                  Codice Sede
                </label>
                <input
                  id="codSede"
                  v-model="sede.codSede"
                  type="text"
                  placeholder="Inserisci codice sede"
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
                  v-model="sede.ragSoc"
                  type="text"
                  placeholder="Inserisci ragione sociale"
                  :disabled="saving"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
                />
              </div>
            </div>

            <!-- Componente Indirizzo -->
            <AddressInput
              v-model="sede.address"
              :disabled="saving"
            />

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="codFisc" class="block text-sm font-medium text-gray-700">
                  Codice Fiscale
                </label>
                <input
                  id="codFisc"
                  v-model="sede.codFisc"
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
                  v-model="sede.sigla"
                  type="text"
                  placeholder="Inserisci sigla sede"
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
import { sediService, type SedeDettaglio } from '@/services/sediService'
import type { AnagraficaField } from '@/components/DetailTabSelector.vue'

const route = useRoute()
const router = useRouter()

// State per il form (tutti i campi come stringhe per l'input)
interface FormSede {
  codSede: string
  ragSoc: string
  sigla: string
  codFisc: string
  address: AddressData
}

const sede = ref<FormSede>({
  codSede: '',
  ragSoc: '',
  sigla: '',
  codFisc: '',
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
const isEditMode = computed(() => route.params.id !== 'new')
const isFormValid = computed(() => {
  // Il form è sempre valido dato che tutti i campi sono opzionali nel DTO
  return true
})

// Navigation configuration
const sedeNavigationConfig = {
  fetchAll: () => sediService.getSedi(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (sede: any) => String(sede.codSede),
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
        codSede: String(response.codSede),
        ragSoc: response.ragSoc,
        sigla: response.sigla,
        codFisc: response.codFisc,
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
      codSede: Number(sede.value.codSede),
      ragSoc: sede.value.ragSoc,
      sigla: sede.value.sigla,
      indirSede: sede.value.address.indirizzo,
      numSede: sede.value.address.civico,
      capSede: Number(sede.value.address.cap) || 0,
      comuSede: sede.value.address.comune,
      provSede: sede.value.address.provincia,
      codFisc: sede.value.codFisc
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
    codSede: '',
    ragSoc: `${sede.value.ragSoc} - Copia`
  }
  sede.value = duplicated
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
      codSede: '',
      ragSoc: '',
      sigla: '',
      codFisc: '',
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

onMounted(() => {
  if (isEditMode.value) {
    loadSede()
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