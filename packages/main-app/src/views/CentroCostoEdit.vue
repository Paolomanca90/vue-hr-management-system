<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Centro di Costo: ${centroCosto.codCenco}` : 'Nuovo Centro di Costo'"
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
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <ActionButtons
            entity-name="Centro di Costo"
            :is-edit-mode="isEditMode"
            :saving="saving"
            :is-form-valid="isFormValid"
            :show-duplicate="true"
            :show-delete="isEditMode"
            :show-reset="true"
            :show-navigation="isEditMode"
            :navigation-config="centroCostoNavigationConfig"
            @duplicate="handleDuplicate"
            @delete="handleDelete"
            @reset="handleReset"
          />
        </div>
      </div>

      <!-- Form Content con componente riutilizzabile -->
      <CodiceDescrizioneEdit
        v-model:data="centroCosto"
        :saving="saving"
        :is-edit-mode="isEditMode"
        codice-field="codCenco"
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
import CodiceDescrizioneEdit from '@/components/CodiceDescrizioneEdit.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { centriCostoService, type CentroCosto } from '@/services/centriCostoService'

const route = useRoute()
const router = useRouter()

// State per il form
interface FormCentroCosto {
  codAzi: number
  codCenco: string
  descriz: string
}

const centroCosto = ref<FormCentroCosto>({
  codAzi: 0,
  codCenco: '',
  descriz: ''
})

const saving = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

useMessageAlerts(errorMessage, successMessage)

// Computed
const isEditMode = computed(() => {
  // Se siamo su /centri-costo/new, non abbiamo route.params.id
  return route.params.id !== 'new' && route.params.id !== undefined
})

const isFormValid = computed(() => {
  return centroCosto.value.codAzi > 0 &&
         centroCosto.value.codCenco.trim() !== '' &&
         centroCosto.value.descriz.trim() !== ''
})

const centroCostoNavigationConfig = {
  fetchAll: () => centriCostoService.getCentriCosto(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (centroCosto: any) => centroCosto.id,
  basePath: '/app/centri-costo',
  entityType: 'centro-costo',
  defaultSortField: 'codCenco',
  defaultSortOrder: 1
}

// Methods
const loadCentroCosto = async () => {
  if (!isEditMode.value) return

  const id = String(route.params.id)
  loading.value = true

  try {
    const response = await centriCostoService.getCentroCosto(id)
    if (response) {
      centroCosto.value = {
        codAzi: response.codAzi,
        codCenco: response.codCenco,
        descriz: response.descriz
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento centro di costo:', error)
    errorMessage.value = 'Errore nel caricamento dei dati centro di costo'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    const centroCostoToSave: CentroCosto = {
      id: `${centroCosto.value.codAzi}-${centroCosto.value.codCenco}`,
      codAzi: centroCosto.value.codAzi,
      codCenco: centroCosto.value.codCenco,
      descriz: centroCosto.value.descriz
    }

    if (isEditMode.value) {
      await centriCostoService.editCentroCosto(centroCostoToSave)
    } else {
      await centriCostoService.addCentroCosto(centroCostoToSave)
    }
    successMessage.value = isEditMode.value ? 'Centro di costo aggiornato con successo' : 'Centro di costo creato con successo'
    router.push('/app/centri-costo')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
    errorMessage.value = 'Errore nel salvataggio del centro di costo'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/app/centri-costo')
}

const handleDuplicate = () => {
  // Naviga verso la pagina new con i dati correnti come parametri
  router.push({
    name: 'CentroCostoNew',
    query: {
      duplicate: route.params.id as string,
      sourceCodAzi: String(centroCosto.value.codAzi),
      sourceDescriz: centroCosto.value.descriz
    }
  })
}

const handleDelete = async () => {
  try {
    await centriCostoService.deleteCentroCostoByCompositeKey(centroCosto.value.codAzi, centroCosto.value.codCenco)
    successMessage.value = 'Centro di costo eliminato con successo'
    router.push('/app/centri-costo')
  } catch (error) {
    console.error('Errore nell\'eliminazione:', error)
    errorMessage.value = 'Errore nell\'eliminazione del centro di costo'
  }
}

const handleReset = () => {
  if (isEditMode.value) {
    loadCentroCosto()
  } else {
    centroCosto.value = {
      codAzi: 0,
      codCenco: '',
      descriz: ''
    }
    // Reset anche i query parameters se esistono
    if (route.query.duplicate) {
      router.replace({ name: 'CentroCostoNew' })
    }
  }
}

const handleDuplicateMode = () => {
  const duplicateId = route.query.duplicate as string
  const sourceCodAzi = route.query.sourceCodAzi as string
  const sourceDescriz = route.query.sourceDescriz as string

  if (duplicateId && !isEditMode.value) {
    centroCosto.value = {
      codAzi: Number(sourceCodAzi) || 0,
      codCenco: '',
      descriz: sourceDescriz ? `${sourceDescriz} - Copia` : ''
    }
  }
}

// Watcher per route changes (navigation buttons)
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId && newId !== 'new') {
    await loadCentroCosto()
  }
}, { immediate: false })

onMounted(() => {
  if (isEditMode.value) {
    loadCentroCosto()
  } else {
    handleDuplicateMode()
  }
})
</script>
