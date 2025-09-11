<template>
  <MessageAlerts
    :error-message="errorMessage"
    :success-message="successMessage"
  />

  <QueryBuilder
    entity-name="Accesso"
    entity-icon="key"
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
import MessageAlerts from '@/components/MessageAlerts.vue'
import { accessiService, type Accesso } from '@/services/accessiService'

const router = useRouter()
const route = useRoute()

// State
const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const initialData = ref({
  codice: '',
  descrizione: '',
  formula: ''
})

// Navigation state
const previousAccesso = ref<{ codice: string } | null>(null)
const nextAccesso = ref<{ codice: string } | null>(null)
const allAccessi = ref<{ codice: string }[]>([])

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const accessoId = computed(() => route.params.id as string)
const hasPrevious = computed(() => previousAccesso.value !== null)
const hasNext = computed(() => nextAccesso.value !== null)

// Methods
const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const loadAccessoData = async () => {
  if (!isEditMode.value) return

  loading.value = true
  clearMessages()

  try {
    // Prima prova a recuperare dai dati del router state
    const routerState = history.state?.accessoData
    if (routerState && routerState.codice === accessoId.value) {
      initialData.value = {
        codice: routerState.codice,
        descrizione: routerState.descrizione,
        formula: routerState.formula || ''
      }
    }
    // Fallback se non trovato
    else {
      initialData.value = {
        codice: accessoId.value,
        descrizione: `Accesso ${accessoId.value}`,
        formula: ''
      }
    }

  } catch (error) {
    console.error('Errore nel caricamento dell\'accesso:', error)
    errorMessage.value = 'Errore nel caricamento dei dati dell\'accesso'
    // Fallback
    initialData.value = {
      codice: accessoId.value,
      descrizione: `Accesso ${accessoId.value}`,
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
      codice: duplicateCodice || '',
      descrizione: sourceDescrizione ? `Copia di ${sourceDescrizione}` : `Copia di ${duplicateCodice}`,
      formula: sourceFormula || ''
    }
  }
}

const goBack = () => {
  router.push('/app/accessi')
}

// Navigation methods
const navigateToPrevious = () => {
  if (previousAccesso.value) {
    router.push(`/app/accessi/${previousAccesso.value.codice}/edit`)
  }
}

const navigateToNext = () => {
  if (nextAccesso.value) {
    router.push(`/app/accessi/${nextAccesso.value.codice}/edit`)
  }
}

// Navigazione accessi
const loadAdjacentAccessi = async () => {
  if (!isEditMode.value) return

  try {
    // Carica tutti gli accessi se non già caricati
    if (allAccessi.value.length === 0) {
      const response = await accessiService.getTabAccessi()
      if (response) {
        // Ordina alfabeticamente per codice
        allAccessi.value = response
          .map(accesso => ({ codice: accesso.codice }))
          .sort((a, b) => a.codice.localeCompare(b.codice))
      }
    }

    // Trova l'indice dell'accesso corrente
    const currentCodice = accessoId.value
    if (!currentCodice || allAccessi.value.length === 0) {
      previousAccesso.value = null
      nextAccesso.value = null
      return
    }

    const currentIndex = allAccessi.value.findIndex(accesso => accesso.codice === currentCodice)

    if (currentIndex === -1) {
      // Codice non trovato
      previousAccesso.value = null
      nextAccesso.value = null
      return
    }

    // Set previous accesso
    previousAccesso.value = currentIndex > 0 ? allAccessi.value[currentIndex - 1] : null

    // Set next accesso
    nextAccesso.value = currentIndex < allAccessi.value.length - 1 ? allAccessi.value[currentIndex + 1] : null

  } catch (error) {
    console.error('Errore nel caricamento degli accessi adiacenti:', error)
    previousAccesso.value = null
    nextAccesso.value = null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSave = async (data: any) => {
  saving.value = true
  clearMessages()

  try {
    const accessoData: Accesso = {
      codice: data.nome,
      descrizione: data.descrizione,
      formula: data.formula || ''
    }

    if (isEditMode.value) {
      await accessiService.editAccesso(accessoData)
      successMessage.value = 'Accesso aggiornato con successo'
    } else {
      await accessiService.addAccesso(accessoData)
      successMessage.value = 'Nuovo accesso creato con successo'

      // Reindirizza alla modalità edit dopo la creazione
      setTimeout(() => {
        router.push(`/app/accessi/${accessoData.codice}/edit`)
      }, 1500)
    }

    // Nasconde il messaggio dopo alcuni secondi
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    console.error('Errore nel salvataggio dell\'accesso:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio dell\'accesso'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  clearMessages()

  try {
    await accessiService.deleteAccesso(accessoId.value)
    successMessage.value = 'Accesso eliminato con successo'

    setTimeout(() => {
      router.push('/app/accessi')
    }, 1500)

  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'accesso:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione dell\'accesso'
  }
}

const handleDuplicate = () => {
  router.push({
    name: 'AccessoNew',
    query: {
      duplicate: accessoId.value,
      sourceDescrizione: initialData.value.descrizione,
      sourceFormula: initialData.value.formula
    }
  })
}

const handleReset = () => {
  clearMessages()
  if (isEditMode.value) {
    loadAccessoData()
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
    await loadAccessoData()
    await loadAdjacentAccessi()
  } else {
    handleDuplicateMode()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    clearMessages()
    if (isEditMode.value) {
      await loadAccessoData()
      await loadAdjacentAccessi()
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
