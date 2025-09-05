<template>
  <QueryBuilder
    entity-name="Accesso"
    entity-icon="key"
    :show-query-builder="true"
    :is-edit-mode="isEditMode"
    :loading="loading"
    :saving="saving"
    :initial-data="initialData"
    @go-back="goBack"
    @save="handleSave"
    @delete="handleDelete"
    @duplicate="handleDuplicate"
    @reset="handleReset"
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
const initialData = ref({
  nome: '',
  descrizione: '',
  formula: ''
})

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const accessoId = computed(() => route.params.id as string)

// Methods
const loadAccessoData = async () => {
  if (!isEditMode.value) return

  loading.value = true

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
    // else {
    //   // Altrimenti carica dall'API
    //   const accesso = await accessiService.getAccessoById(accessoId.value)
    //   if (accesso) {
    //     initialData.value = {
    //       nome: accesso.codice,
    //       descrizione: accesso.descrizione,
    //       formula: accesso.formula || ''
    //     }
    //   } else {
    //     // Fallback se non trovato
    //     initialData.value = {
    //       nome: accessoId.value,
    //       descrizione: `Accesso ${accessoId.value}`,
    //       formula: ''
    //     }
    //   }
    // }

  } catch (error) {
    console.error('Errore nel caricamento dell\'accesso:', error)
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
      nome: '',
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

  try {
    const accessoData: Accesso = {
      codice: data.nome,
      descrizione: data.descrizione,
      formula: data.formula || ''
    }

    if (isEditMode.value) {
      await accessiService.editAccesso(accessoData)
    } else {
      await accessiService.addAccesso(accessoData)

      // Reindirizza alla modalità edit dopo la creazione
      setTimeout(() => {
        router.push(`/app/accessi/${accessoData.codice}/edit`)
      }, 1500)
    }

  } catch (error) {
    console.error('Errore nel salvataggio dell\'accesso:', error)
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  try {
    await accessiService.deleteAccesso(accessoId.value)

    setTimeout(() => {
      router.push('/app/accessi')
    }, 1500)

  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'accesso:', error)
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
