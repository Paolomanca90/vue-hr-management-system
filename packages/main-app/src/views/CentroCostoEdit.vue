<template>
  <EditViewLayout>
    <template #header>
      <PageHeader
        :title="isEditMode ? `Modifica ${centroCosto.descriz} (${centroCosto.codCenco})` : 'Nuovo Centro di Costo'"
        :breadcrumbItems="[
          { label: 'Home', to: '/app' },
          { label: 'Centri Costo', to: '/app/centri-costo' },
          { label: isEditMode ? 'Modifica' : 'Nuovo' }
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
    </template>

    <template #actions>
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
        @save="handleSave"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
        @reset="handleReset"
      />
    </template>

    <template #content>
      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- Form Content con componente riutilizzabile -->
        <CodiceDescrizioneEdit
          v-model:data="centroCosto"
          :saving="saving"
          :is-edit-mode="isEditMode"
          codice-field="codCenco"
          codice-label="Codice Centro"
        />
      </form>
    </template>
  </EditViewLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import EditViewLayout from '@/components/EditViewLayout.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import CodiceDescrizioneEdit from '@/components/CodiceDescrizioneEdit.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import { centriCostoService, type CentroCosto } from '@/services/centriCostoService'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'

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
const originalData = ref<FormCentroCosto | null>(null)

useMessageAlerts(errorMessage, successMessage)

const { isDirty, touchedFields, updateOriginalData } = useFormDirtyState(centroCosto, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate al Centro di Costo. Sei sicuro di voler lasciare questa pagina?'
})

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
      updateOriginalData(centroCosto.value)
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
      updateOriginalData(centroCosto.value)
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
