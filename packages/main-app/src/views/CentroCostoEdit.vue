<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Centro di Costo: ${centroCosto.codCenCo}` : 'Nuovo Centro di Costo'"
      :description="isEditMode ? 'Modifica i dettagli del centro di costo selezionato' : 'Crea un nuovo centro di costo nel sistema'"
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
              entity-name="Centro di Costo"
              :navigation-config="centroCostoNavigationConfig"
            />

            <!-- Azioni principali -->
            <ActionButtons
              entity-name="Centro di Costo"
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

      <!-- Form Content con componente riutilizzabile -->
      <CodiceDescrizioneEdit
        v-model:data="centroCosto"
        :saving="saving"
        :is-edit-mode="isEditMode"
        codice-field="codCenCo"
        codice-label="Codice Centro"
      />
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
import CodiceDescrizioneEdit from '@/components/CodiceDescrizioneEdit.vue'
import { centriCostoService, type CentroCosto } from '@/services/centriCostoService'

const route = useRoute()
const router = useRouter()

// State per il form
interface FormCentroCosto {
  codAzi: number
  codCenCo: string
  descriz: string
}

const centroCosto = ref<FormCentroCosto>({
  codAzi: 0,
  codCenCo: '',
  descriz: ''
})

const saving = ref(false)
const loading = ref(false)

// Computed
const isEditMode = computed(() => {
  return route.params.codAzi !== undefined && route.params.codCenCo !== undefined &&
         route.params.codAzi !== 'new' && route.params.codCenCo !== 'new'
})

const isFormValid = computed(() => {
  return centroCosto.value.codAzi > 0 &&
         centroCosto.value.codCenCo.trim() !== '' &&
         centroCosto.value.descriz.trim() !== ''
})

// Navigation configuration
const centroCostoNavigationConfig = {
  fetchAll: () => centriCostoService.getCentriCosto(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (centroCosto: any) => `${centroCosto.codAzi}/${centroCosto.codCenCo}`,
  basePath: '/app/centri-costo',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  sortFn: (_a: any, _b: any) => 0
}

// Methods
const loadCentroCosto = async () => {
  if (!isEditMode.value) return

  const codAzi = Number(route.params.codAzi)
  const codCenCo = String(route.params.codCenCo)
  loading.value = true

  try {
    const response = await centriCostoService.getCentroCosto(codAzi, codCenCo)
    if (response) {
      centroCosto.value = {
        codAzi: response.codAzi,
        codCenCo: response.codCenCo,
        descriz: response.descriz
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento centro di costo:', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    const centroCostoToSave: CentroCosto = {
      codAzi: centroCosto.value.codAzi,
      codCenCo: centroCosto.value.codCenCo,
      descriz: centroCosto.value.descriz
    }

    if (isEditMode.value) {
      await centriCostoService.editCentroCosto(centroCostoToSave)
    } else {
      await centriCostoService.addCentroCosto(centroCostoToSave)
    }
    router.push('/app/centri-costo')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/app/centri-costo')
}

const handleDuplicate = () => {
  const duplicated = {
    ...centroCosto.value,
    codCenCo: '',
    descriz: `${centroCosto.value.descriz} - Copia`
  }
  centroCosto.value = duplicated
  router.push('/app/centri-costo/new')
}

const handleDelete = async () => {
  if (confirm('Sei sicuro di voler eliminare questo centro di costo?')) {
    try {
      await centriCostoService.deleteCentroCosto(centroCosto.value.codAzi, centroCosto.value.codCenCo)
      router.push('/app/centri-costo')
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error)
    }
  }
}

const handleReset = () => {
  if (isEditMode.value) {
    loadCentroCosto()
  } else {
    centroCosto.value = {
      codAzi: 0,
      codCenCo: '',
      descriz: ''
    }
  }
}

// Watcher per ricaricare i dati quando cambiano i parametri nell'URL
watch(() => [route.params.codAzi, route.params.codCenCo], ([newCodAzi, newCodCenCo], [oldCodAzi, oldCodCenCo]) => {
  if ((newCodAzi !== oldCodAzi || newCodCenCo !== oldCodCenCo) && isEditMode.value) {
    loadCentroCosto()
  }
}, { immediate: false })

onMounted(() => {
  if (isEditMode.value) {
    loadCentroCosto()
  }
})
</script>
