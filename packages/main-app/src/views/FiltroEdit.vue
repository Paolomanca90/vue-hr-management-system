<template>
  <QueryBuilder
    entity-name="Filtro"
    entity-icon="filter"
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
import { filtriService, type Filtro } from '@/services/filtriService'

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
const filtroId = computed(() => route.params.id as string)

// Methods
const loadFiltroData = async () => {
  if (!isEditMode.value) return

  loading.value = true

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
    // else {
    //   // Altrimenti carica dall'API
    //   const filtro = await filtriService.getFiltroById(filtroId.value)
    //   if (filtro) {
    //     initialData.value = {
    //       nome: filtro.codice,
    //       descrizione: filtro.descrizione,
    //       formula: filtro.formula || ''
    //     }
    //   } else {
    //     // Fallback se non trovato
    //     initialData.value = {
    //       nome: filtroId.value,
    //       descrizione: `Filtro ${filtroId.value}`,
    //       formula: ''
    //     }
    //   }
    // }

  } catch (error) {
    console.error('Errore nel caricamento del filtro:', error)
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
      nome: '',
      descrizione: sourceDescrizione ? `Copia di ${sourceDescrizione}` : `Copia di ${duplicateCodice}`,
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

  try {
    const filtroData: Filtro = {
      codice: data.nome,
      descrizione: data.descrizione,
      formula: data.formula || ''
    }

    if (isEditMode.value) {
      await filtriService.editFiltro(filtroData)
    } else {
      await filtriService.addFiltro(filtroData)

      // Reindirizza alla modadlità edit dopo la creazione
      setTimeout(() => {
        router.push(`/app/filtri/${filtroData.codice}/edit`)
      }, 1500)
    }

  } catch (error) {
    console.error('Errore nel salvataggio del filtro:', error)
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  try {
    await filtriService.deleteFiltro(filtroId.value)
    console.log('Filtro eliminato con successo')

    setTimeout(() => {
      router.push('/app/filtri')
    }, 1500)

  } catch (error) {
    console.error('Errore nell\'eliminazione del filtro:', error)
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
  } else {
    handleDuplicateMode()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    if (isEditMode.value) {
      await loadFiltroData()
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
