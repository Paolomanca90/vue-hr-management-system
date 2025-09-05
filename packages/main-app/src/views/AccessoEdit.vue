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
    entity-name="Accesso"
    entity-icon="key"
    :show-query-builder="true"
    :is-edit-mode="isEditMode"
    :loading="loading"
    :saving="saving"
    :success-message="successMessage"
    :error-message="errorMessage"
    :initial-data="initialData"
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
import { accessiService, type Accesso } from '@/services/accessiService'

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

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const accessoId = computed(() => route.params.id as string)

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
        nome: routerState.codice,
        descrizione: routerState.descrizione,
        formula: routerState.formula || ''
      }
    }
    // Fallback se non trovato
    else {
      initialData.value = {
        nome: accessoId.value,
        descrizione: `Accesso ${accessoId.value}`,
        formula: ''
      }
    }

  } catch (error) {
    console.error('Errore nel caricamento dell\'accesso:', error)
    errorMessage.value = 'Errore nel caricamento dei dati dell\'accesso'
    // Fallback
    initialData.value = {
      nome: accessoId.value,
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
      nome: duplicateCodice || '',
      descrizione: sourceDescrizione ? `Copia di ${sourceDescrizione}` : `Copia di ${duplicateCodice}`,
      formula: sourceFormula || ''
    }
  }
}

const goBack = () => {
  router.push('/app/accessi')
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
    await loadAccessoData()
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
