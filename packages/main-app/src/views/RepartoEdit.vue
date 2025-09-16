<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="isEditMode ? `Modifica Reparto: ${reparto.codReparto}` : 'Nuovo Reparto'"
      :description="isEditMode ? 'Modifica i dettagli del reparto selezionato' : 'Crea un nuovo reparto nel sistema'"
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
              entity-name="Reparto"
              :navigation-config="repartoNavigationConfig"
            />

            <!-- Azioni principali -->
            <ActionButtons
              entity-name="Reparto"
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
import NavigationButtons from '@/components/NavigationButtons.vue'
import CodiceDescrizioneEdit from '@/components/CodiceDescrizioneEdit.vue'
import { repartiService, type Reparto } from '@/services/repartiService'

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

// Computed
const isEditMode = computed(() => {
  return route.params.codAzi !== undefined && route.params.codReparto !== undefined &&
         route.params.codAzi !== 'new' && route.params.codReparto !== 'new'
})

const isFormValid = computed(() => {
  return reparto.value.codAzi > 0 &&
         reparto.value.codReparto.trim() !== '' &&
         reparto.value.descriz.trim() !== ''
})

// Navigation configuration
const repartoNavigationConfig = {
  fetchAll: () => repartiService.getReparti(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (reparto: any) => `${reparto.codAzi}/${reparto.codReparto}`,
  basePath: '/app/reparti',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  sortFn: (_a: any, _b: any) => 0
}

// Methods
const loadReparto = async () => {
  if (!isEditMode.value) return

  const codAzi = Number(route.params.codAzi)
  const codReparto = String(route.params.codReparto)
  loading.value = true

  try {
    const response = await repartiService.getReparto(codAzi, codReparto)
    if (response) {
      reparto.value = {
        codAzi: response.codAzi,
        codReparto: response.codReparto,
        descriz: response.descriz
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento reparto:', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    const repartoToSave: Reparto = {
      codAzi: reparto.value.codAzi,
      codReparto: reparto.value.codReparto,
      descriz: reparto.value.descriz
    }

    if (isEditMode.value) {
      await repartiService.editReparto(repartoToSave)
    } else {
      await repartiService.addReparto(repartoToSave)
    }
    router.push('/app/reparti')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/app/reparti')
}

const handleDuplicate = () => {
  const duplicated = {
    ...reparto.value,
    codReparto: '',
    descriz: `${reparto.value.descriz} - Copia`
  }
  reparto.value = duplicated
  router.push('/app/reparti/new')
}

const handleDelete = async () => {
  if (confirm('Sei sicuro di voler eliminare questo reparto?')) {
    try {
      await repartiService.deleteReparto(reparto.value.codAzi, reparto.value.codReparto)
      router.push('/app/reparti')
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error)
    }
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

// Watcher per ricaricare i dati quando cambiano i parametri nell'URL
watch(() => [route.params.codAzi, route.params.codReparto], ([newCodAzi, newCodReparto], [oldCodAzi, oldCodReparto]) => {
  if ((newCodAzi !== oldCodAzi || newCodReparto !== oldCodReparto) && isEditMode.value) {
    loadReparto()
  }
}, { immediate: false })

onMounted(() => {
  if (isEditMode.value) {
    loadReparto()
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