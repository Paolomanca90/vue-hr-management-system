<template>
  <!-- Messaggio di errore -->
  <div v-if="errorMessage" class="alert alert-error mb-4">
    <FaIcon icon="exclamation-triangle" />
    <span>{{ errorMessage }}</span>
  </div>

  <!-- Messaggio di successo -->
  <div v-if="successMessage" class="alert alert-success mb-4">
    <FaIcon icon="check-circle" />
    <span>{{ successMessage }}</span>
  </div>

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
    :has-previous="hasPrevious"
    :has-next="hasNext"
    @go-back="goBack"
    @save="handleSave"
    @delete="handleDelete"
    @duplicate="handleDuplicate"
    @reset="handleReset"
    @clear-messages="clearMessages"
    @navigate-previous="navigateToPrevious"
    @navigate-next="navigateToNext"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import QueryBuilder from '@/components/QueryBuilder.vue'
import { filtriService, type Filtro } from '@/services/filtriService'

const router = useRouter()
const route = useRoute()

// State
const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const initialData = ref({
  nome: '',
  descrizione: '',
  formula: ''
})

// Navigation state
const previousFiltro = ref<{ codice: string } | null>(null)
const nextFiltro = ref<{ codice: string } | null>(null)
const allFiltri = ref<{ codice: string }[]>([])

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const filtroId = computed(() => route.params.id as string)
const hasPrevious = computed(() => previousFiltro.value !== null)
const hasNext = computed(() => nextFiltro.value !== null)

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
    // Prima prova a recuperare dai dati del router state
    const routerState = history.state?.filtroData
    if (routerState && routerState.codice === filtroId.value) {
      initialData.value = {
        nome: routerState.codice,
        descrizione: routerState.descrizione,
        formula: routerState.formula || ''
      }
    }
    // Fallback se non trovato
    else {
      initialData.value = {
        nome: filtroId.value,
        descrizione: `Filtro ${filtroId.value}`,
        formula: ''
      }
    }

  } catch (error) {
    console.error('Errore nel caricamento del filtro:', error)
    errorMessage.value = 'Errore nel caricamento dei dati del filtro'
    // Fallback
    initialData.value = {
      nome: filtroId.value,
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
      nome: duplicateCodice || '',
      descrizione: sourceDescrizione ? `Copia di ${sourceDescrizione}` : `Copia di ${duplicateCodice}`,
      formula: sourceFormula || ''
    }
  }
}

const goBack = () => {
  router.push('/app/filtri')
}

// Navigation methods
const navigateToPrevious = () => {
  if (previousFiltro.value) {
    router.push(`/app/filtri/${previousFiltro.value.codice}/edit`)
  }
}

const navigateToNext = () => {
  if (nextFiltro.value) {
    router.push(`/app/filtri/${nextFiltro.value.codice}/edit`)
  }
}

// Navigazione filtri
const loadAdjacentFiltri = async () => {
  if (!isEditMode.value) return

  try {
    // Carcica tutti i filtri se non già caricati
    if (allFiltri.value.length === 0) {
      const response = await filtriService.getTabFiltri()
      if (response) {
        // Ordina alfabeticamente per codice
        allFiltri.value = response
          .map(filtro => ({ codice: filtro.codice }))
          .sort((a, b) => a.codice.localeCompare(b.codice))
      }
    }

    // Trova l'indice del filtro corrente
    const currentCodice = filtroId.value
    if (!currentCodice || allFiltri.value.length === 0) {
      previousFiltro.value = null
      nextFiltro.value = null
      return
    }

    const currentIndex = allFiltri.value.findIndex(filtro => filtro.codice === currentCodice)

    if (currentIndex === -1) {
      // Codice non trovato
      previousFiltro.value = null
      nextFiltro.value = null
      return
    }

    // Set previous filtro
    previousFiltro.value = currentIndex > 0 ? allFiltri.value[currentIndex - 1] : null

    // Set next filtro
    nextFiltro.value = currentIndex < allFiltri.value.length - 1 ? allFiltri.value[currentIndex + 1] : null

  } catch (error) {
    console.error('Errore nel caricamento dei filtri adiacenti:', error)
    previousFiltro.value = null
    nextFiltro.value = null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSave = async (data: any) => {
  saving.value = true
  clearMessages()

  try {
    const filtroData: Filtro = {
      codice: data.nome,
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
      nome: '',
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
    await loadAdjacentFiltri()
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
      await loadAdjacentFiltri()
    } else {
      initialData.value = {
        nome: '',
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
