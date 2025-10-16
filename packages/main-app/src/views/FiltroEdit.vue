<template>
  <QueryBuilder
    entity-name="Filtro"
    entity-icon="filter"
    :show-query-builder="true"
    :is-edit-mode="isEditMode"
    :loading="loading"
    :saving="saving"
    :success-message="successMessage"
    :error-message="errorMessage"
    :initial-data="initialData"
    :navigation-config="filtroNavigationConfig"
    @go-back="goBack"
    @save="handleSave"
    @delete="handleDelete"
    @duplicate="handleDuplicate"
    @reset="handleReset"
    @clear-messages="clearMessages"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import QueryBuilder from '@/components/QueryBuilder.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { filtriService, type Filtro } from '@/services/filtriService'

const router = useRouter()
const route = useRoute()

// State
const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')


useMessageAlerts(errorMessage, successMessage)
const initialData = ref({
  codice: '',
  descrizione: '',
  formula: ''
})

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const filtroId = computed(() => route.params.id as string)

// Navigation configuration
const filtroNavigationConfig = {
  fetchAll: () => filtriService.getTabFiltri(),
  getEntityId: (filtro: unknown) => (filtro as { codice: string }).codice,
  basePath: '/app/filtri',
  entityType: 'filtro',
  defaultSortField: 'codice',
  defaultSortOrder: 1
}

// Methods
const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const loadFiltroData = async () => {
  if (!isEditMode.value) return

  loading.value = true
  clearMessages()

  try {
    // Prova a recuperare dai dati del router state
    const routerState = history.state?.filtroData
    if (routerState && routerState.codice === filtroId.value) {
      initialData.value = {
        codice: routerState.codice,
        descrizione: routerState.descrizione,
        formula: routerState.formula || ''
      }
    } else {
      // Fallback semplice
      initialData.value = {
        codice: filtroId.value,
        descrizione: `Filtro ${filtroId.value}`,
        formula: ''
      }
    }

  } catch (error) {
    console.error('Errore nel caricamento del filtro:', error)
    errorMessage.value = 'I dati del filtro verranno caricati dalla lista'
    initialData.value = {
      codice: filtroId.value,
      descrizione: `Filtro ${filtroId.value}`,
      formula: ''
    }
  } finally {
    loading.value = false
  }
}

const handleDuplicateMode = () => {
  const duplicateCodice = route.query.duplicate as string
  const sourceDescrizione = route.query.sourceDescrizione as string
  const sourceFormula = route.query.sourceFormula as string

  if (duplicateCodice && !isEditMode.value) {
    initialData.value = {
      codice: '',
      descrizione: sourceDescrizione || '',
      formula: sourceFormula || ''
    }
  }
}

const goBack = () => {
  router.push('/app/filtri')
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSave = async (data: any) => {
  saving.value = true
  clearMessages()

  try {
    const filtroData: Filtro = {
      codice: data.codice,
      descrizione: data.descrizione,
      formula: data.formula || ''
    }

    if (isEditMode.value) {
      await filtriService.editFiltro(filtroData)
      successMessage.value = 'Filtro aggiornato con successo'
    } else {
      await filtriService.addFiltro(filtroData)
      successMessage.value = 'Nuovo filtro creato con successo'

      // Reindirizza alla modalità edit dopo la creazione
      setTimeout(() => {
        router.push(`/app/filtri/${filtroData.codice}/edit`)
      }, 1500)
    }

    // Nasconde il messaggio dopo alcuni secondi
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    console.error('Errore nel salvataggio del filtro:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio del filtro'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  clearMessages()

  try {
    await filtriService.deleteFiltro(filtroId.value)
    successMessage.value = 'Filtro eliminato con successo'

    setTimeout(() => {
      router.push('/app/filtri')
    }, 1500)

  } catch (error) {
    console.error('Errore nell\'eliminazione del filtro:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione del filtro'
  }
}

const handleDuplicate = () => {
  router.push({
    name: 'FiltroNew',
    query: {
      duplicate: filtroId.value,
      sourceDescrizione: initialData.value.descrizione,
      sourceFormula: initialData.value.formula
    }
  })
}

const handleReset = () => {
  clearMessages()
  if (isEditMode.value) {
    loadFiltroData()
  } else {
    initialData.value = {
      codice: '',
      descrizione: '',
      formula: ''
    }
    handleDuplicateMode()
  }
}

// Inizializzazione
onMounted(async () => {
  if (isEditMode.value) {
    await loadFiltroData()
  } else {
    handleDuplicateMode()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    clearMessages()
    if (isEditMode.value) {
      await loadFiltroData()
    } else {
      initialData.value = {
        codice: '',
        descrizione: '',
        formula: ''
      }
      handleDuplicateMode()
    }
  }
}, { immediate: true })
</script>

<style>
  .btn-outline:hover {
    color: white !important;
  }
</style>
