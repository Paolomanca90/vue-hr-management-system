<template>
  <div class="space-y-1">
    <!-- Page Header -->
    <PageHeader
      :title="pageTitle"
      :breadcrumbItems="breadcrumbs"
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

      <ActionButtons
        entity-name="Reparto"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="repartoNavigationConfig"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
        @reset="handleReset"
      />

      <!-- Form Content con componente riutilizzabile -->
      <CodiceDescrizioneEdit
        v-model:data="reparto"
        :saving="saving"
        :is-edit-mode="isEditMode"
        codice-field="codReparto"
        codice-label="Codice Reparto"
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
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import { repartiService, type Reparto } from '@/services/repartiService'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'

const route = useRoute()
const router = useRouter()

// State per il form
interface FormReparto {
  codAzi: number
  codReparto: string
  descriz: string
}

const reparto = ref<FormReparto>({
  codAzi: 0,
  codReparto: '',
  descriz: ''
})

const saving = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const originalData = ref<FormReparto | null>(null)

useMessageAlerts(errorMessage, successMessage)

const { isDirty, touchedFields, updateOriginalData } = useFormDirtyState(reparto, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate al Reparto. Sei sicuro di voler lasciare questa pagina?'
})

// Computed
const isEditMode = computed(() => {
  // Se siamo su /reparti/new, non abbiamo route.params.id
  return route.params.id !== 'new' && route.params.id !== undefined
})

const isFormValid = computed(() => {
  return reparto.value.codAzi > 0 &&
         reparto.value.codReparto.trim() !== '' &&
         reparto.value.descriz.trim() !== ''
})

const pageTitle = computed(() => {
  if (isEditMode.value && reparto.value.descriz && reparto.value.codReparto) {
    return `${reparto.value.descriz} (${reparto.value.codReparto})`
  }
  return isEditMode.value ? 'Modifica Reparto' : 'Nuovo Reparto'
})

const breadcrumbs = computed(() => [
  { label: 'Home', to: '/app' },
  { label: 'Reparti', to: '/app/reparti' },
  { label: isEditMode.value ? 'Modifica' : 'Nuovo' }
])

// Navigation configuration
const repartoNavigationConfig = {
  fetchAll: () => repartiService.getReparti(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (reparto: any) => reparto.id,
  basePath: '/app/reparti',
  entityType: 'reparto',
  defaultSortField: 'codReparto',
  defaultSortOrder: 1
}

// Methods
const loadReparto = async () => {
  if (!isEditMode.value) return

  const id = String(route.params.id)
  loading.value = true

  try {
    const response = await repartiService.getReparto(id)
    if (response) {
      reparto.value = {
        codAzi: response.codAzi,
        codReparto: response.codReparto,
        descriz: response.descriz
      }
      updateOriginalData(reparto.value)
    }
  } catch (error) {
    console.error('Errore nel caricamento reparto:', error)
    errorMessage.value = 'Errore nel caricamento dei dati reparto'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    const repartoToSave: Reparto = {
      id: `${reparto.value.codAzi}-${reparto.value.codReparto}`,
      codAzi: reparto.value.codAzi,
      codReparto: reparto.value.codReparto,
      descriz: reparto.value.descriz
    }

    if (isEditMode.value) {
      await repartiService.editReparto(repartoToSave)
      updateOriginalData(reparto.value)
    } else {
      await repartiService.addReparto(repartoToSave)
    }
    successMessage.value = isEditMode.value ? 'Reparto aggiornato con successo' : 'Reparto creato con successo'
    router.push('/app/reparti')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
    errorMessage.value = 'Errore nel salvataggio del reparto'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/app/reparti')
}

const handleDuplicate = () => {
  // Naviga verso la pagina new con i dati correnti come parametri
  router.push({
    name: 'RepartoNew',
    query: {
      duplicate: route.params.id as string,
      sourceCodAzi: String(reparto.value.codAzi),
      sourceDescriz: reparto.value.descriz
    }
  })
}

const handleDelete = async () => {
  try {
    await repartiService.deleteRepartoByCompositeKey(reparto.value.codAzi, reparto.value.codReparto)
    successMessage.value = 'Reparto eliminato con successo'
    router.push('/app/reparti')
  } catch (error) {
    console.error('Errore nell\'eliminazione:', error)
    errorMessage.value = 'Errore nell\'eliminazione del reparto'
  }
}

const handleReset = () => {
  if (isEditMode.value) {
    loadReparto()
  } else {
    reparto.value = {
      codAzi: 0,
      codReparto: '',
      descriz: ''
    }
  }
}

const handleDuplicateMode = () => {
  const duplicateId = route.query.duplicate as string
  const sourceCodAzi = route.query.sourceCodAzi as string
  const sourceDescriz = route.query.sourceDescriz as string

  if (duplicateId && !isEditMode.value) {
    reparto.value = {
      codAzi: Number(sourceCodAzi) || 0,
      codReparto: '',
      descriz: sourceDescriz ? `${sourceDescriz} - Copia` : ''
    }
  }
}

// Watcher per route changes (navigation buttons)
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId && newId !== 'new') {
    await loadReparto()
  }
}, { immediate: false })

onMounted(() => {
  if (isEditMode.value) {
    loadReparto()
  } else {
    handleDuplicateMode()
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
