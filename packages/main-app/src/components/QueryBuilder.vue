<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex flex-col-reverse lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 class="text-3xl font-bold text-base-content">
              {{ isEditMode ? `Modifica ${entityName}` : `Nuovo ${entityName}` }}
            </h1>
            <p class="text-base-content/70 mt-1">
              {{ isEditMode ? `Modifica i dati del ${entityName.toLowerCase()}: ${formData.nome}` : `Inserisci i dati del nuovo ${entityName.toLowerCase()}` }}
            </p>
          </div>
          <div>
            <button
              class="btn btn-ghost btn-sm"
              @click="$emit('go-back')"
              :disabled="saving"
            >
              <FaIcon icon="arrow-left" class="mr-2"/>
              Indietro
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-3">Caricamento dati...</span>
    </div>

    <!-- Messaggio di errore -->
    <div v-if="errorMessage" class="alert alert-error">
      <FaIcon icon="exclamation-triangle" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Messaggio di successo -->
    <div v-if="successMessage" class="alert alert-success">
      <FaIcon icon="check-circle" />
      <span>{{ successMessage }}</span>
    </div>

    <!-- Form principale -->
    <form v-if="!loading" @submit.prevent="handleSubmit" class="space-y-6">

      <!-- Azioni -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="lg:flex items-center justify-between gap-3">
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
              <!-- Navigazione (solo in modalità modifica) -->
              <div v-if="isEditMode" class="flex items-center max-md:justify-center space-x-2">
                <button
                  type="button"
                  class="btn btn-primary btn-outline btn-sm"
                  @click="$emit('navigate-previous')"
                  :disabled="saving || !hasPrevious"
                  title="Elemento precedente"
                >
                  <FaIcon icon="chevron-left" />
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-outline btn-sm"
                  @click="$emit('navigate-next')"
                  :disabled="saving || !hasNext"
                  title="Elemento successivo"
                >
                  <FaIcon icon="chevron-right" />
                </button>
              </div>

              <!-- Azioni principali -->
              <button
                type="submit"
                class="btn btn-primary btn-sm text-white"
                :class="{ 'loading': saving }"
                :disabled="saving || !isFormValid"
              >
                <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                <FaIcon v-if="!saving" icon="save" class="mr-2"/>
                <span v-if="saving">
                  {{ isEditMode ? 'Salvataggio...' : 'Creazione...' }}
                </span>
                <span v-if="!saving">
                  {{ isEditMode ? 'Salva' : `Crea ${entityName}` }}
                </span>
              </button>

              <button
                v-if="isEditMode"
                type="button"
                class="btn btn-primary btn-outline btn-sm"
                @click="duplicateCurrent"
                :disabled="saving"
              >
                <FaIcon icon="copy" class="mr-2"/>
                Duplica
              </button>

              <button
                v-if="isEditMode"
                type="button"
                class="btn btn-error btn-outline btn-sm"
                @click="deleteCurrent"
                :disabled="saving"
              >
                <FaIcon icon="trash" class="mr-2"/>
                Elimina
              </button>
            </div>

            <div class="max-md:mt-3">
              <button
                type="button"
                class="max-md:block max-md:w-full btn btn-ghost btn-sm"
                @click="resetForm"
                :disabled="saving"
              >
                <FaIcon icon="undo" class="mr-2"/>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sezione Informazioni Base -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="bg-primary/10 rounded-lg p-2 mr-3">
                <FaIcon :icon="entityIcon" class="text-primary text-lg" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content">Informazioni Base</h3>
                <p class="text-sm text-base-content/70">Dati principali del {{ entityName.toLowerCase() }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <!-- Nome/Codice -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Nome *</span>
              </label>
              <input
                type="text"
                v-model="formData.nome"
                :class="{ 'input-error': submitted && !formData.nome }"
                class="input input-bordered w-full"
                placeholder="Inserisci nome"
                required
                maxlength="50"
              />
              <div class="label">
                <span class="label-text-alt">{{ formData.nome.length }}/50 caratteri</span>
                <span v-if="submitted && !formData.nome" class="label-text-alt text-error">
                  Nome richiesto
                </span>
              </div>
            </div>

            <!-- Descrizione -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Descrizione *</span>
              </label>
              <textarea
                v-model="formData.descrizione"
                :class="{ 'textarea-error': submitted && !formData.descrizione }"
                class="textarea textarea-bordered w-full h-24 resize-none"
                placeholder="Inserisci descrizione"
                required
                maxlength="200"
              ></textarea>
              <div class="label">
                <span class="label-text-alt">{{ formData.descrizione.length }}/200 caratteri</span>
                <span v-if="submitted && !formData.descrizione" class="label-text-alt text-error">
                  Descrizione richiesta
                </span>
              </div>
            </div>
          </div>

          <div class="text-sm text-base-content/60 mt-4">
            * Campi obbligatori
          </div>
        </div>
      </div>

      <!-- Sezione Query Builder (solo per Accessi e Filtri) -->
      <div v-if="showQueryBuilder" class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="bg-primary/10 rounded-lg p-2 mr-3">
                <FaIcon icon="code" class="text-primary text-lg" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content">Costruttore Query</h3>
                <p class="text-sm text-base-content/70">Costruisci le condizioni per la query</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="btn btn-primary btn-outline btn-sm"
                @click="addCondition"
              >
                <FaIcon icon="plus" class="mr-1"/>
                Aggiungi Condizione
              </button>
              <button
                type="button"
                class="btn btn-warning btn-outline btn-sm"
                @click="clearConditions"
                :disabled="queryConditions.length === 0"
              >
                <FaIcon icon="trash" class="mr-1"/>
                Pulisci
              </button>
            </div>
          </div>

          <!-- Area delle condizioni -->
          <div class="bg-base-200 rounded-lg p-4 min-h-[200px]">
            <div class="text-sm font-medium text-base-content/70 mb-3">Condizioni:</div>

            <div v-if="queryConditions.length === 0" class="text-center py-8 text-base-content/60">
              <FaIcon icon="code" class="text-3xl mb-2"/>
              <p>Nessuna condizione definita</p>
              <p class="text-xs">Clicca "Aggiungi Condizione" per iniziare</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(condition, index) in queryConditions"
                :key="index"
                class="bg-base-100 border border-base-300 rounded-lg p-3"
              >
                <div class="flex items-center gap-3 flex-wrap">
                  <!-- Operatore logico (AND/OR) -->
                  <div v-if="index > 0" class="form-control w-auto">
                    <select
                      v-model="condition.logicOperator"
                      class="select select-bordered select-sm w-20"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>

                  <!-- Parentesi aperta -->
                  <div class="form-control w-auto">
                    <select
                      v-model="condition.openParen"
                      class="select select-bordered select-sm w-16"
                    >
                      <option value="">-</option>
                      <option value="(">(</option>
                    </select>
                  </div>

                  <!-- Campo -->
                  <div class="form-control flex-1 min-w-[150px]">
                    <select
                      v-model="condition.field"
                      class="select select-bordered select-sm"
                    >
                      <option value="">Seleziona Campo</option>
                      <option
                        v-for="field in availableFields"
                        :key="field.value"
                        :value="field.value"
                      >
                        {{ field.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Operatore -->
                  <div class="form-control w-auto min-w-[120px]">
                    <select
                      v-model="condition.operator"
                      class="select select-bordered select-sm"
                    >
                      <option value="">Operatore</option>
                      <option
                        v-for="op in availableOperators"
                        :key="op.value"
                        :value="op.value"
                      >
                        {{ op.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Valore (se necessario) -->
                  <div
                    v-if="needsValue(condition.operator)"
                    class="form-control flex-1 min-w-[150px]"
                  >
                    <input
                      type="text"
                      v-model="condition.value"
                      placeholder="Valore"
                      class="input input-bordered input-sm"
                    />
                  </div>

                  <!-- Parentesi chiusa -->
                  <div class="form-control w-auto">
                    <select
                      v-model="condition.closeParen"
                      class="select select-bordered select-sm w-16"
                    >
                      <option value="">-</option>
                      <option value=")">)</option>
                    </select>
                  </div>

                  <!-- Rimuovi condizione -->
                  <button
                    type="button"
                    class="btn btn-error btn-outline btn-sm btn-circle"
                    @click="removeCondition(index)"
                    title="Rimuovi condizione"
                  >
                    <FaIcon icon="times" class="text-xs"/>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Query generata -->
          <div class="mt-4">
            <label class="label">
              <span class="label-text font-medium">Query Generata:</span>
            </label>
            <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <div class="flex items-start justify-between">
                <code>{{ generatedQuery || 'Aggiungi condizioni per generare la query' }}</code>
                <button
                  v-if="generatedQuery"
                  type="button"
                  class="btn btn-ghost btn-xs text-green-400 hover:text-green-300"
                  @click="copyQuery"
                  title="Copia query"
                >
                  <FaIcon icon="copy"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Modale di conferma eliminazione -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Conferma eliminazione</h3>
        <p class="mb-4">
          Sei sicuro di voler eliminare {{ entityName.toLowerCase() }} <strong>{{ formData.nome }}</strong>?
        </p>
        <p class="text-sm text-base-content/70 mb-6">
          Questa azione è irreversibile.
        </p>
        <div class="modal-action">
          <button
            class="btn btn-ghost"
            @click="cancelDelete"
            :disabled="deleting"
          >
            Annulla
          </button>
          <button
            class="btn btn-error text-white"
            @click="confirmDelete"
            :disabled="deleting"
            :class="{ 'loading': deleting }"
          >
            <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
            <span v-if="!deleting">Elimina</span>
            <span v-if="deleting">Eliminazione...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'

// Props
interface Props {
  entityName: string
  entityIcon: string
  showQueryBuilder?: boolean
  isEditMode?: boolean
  loading?: boolean
  saving?: boolean
  initialData?: {
    nome: string
    descrizione: string
    formula: string
  }
  // Navigation props
  hasPrevious?: boolean
  hasNext?: boolean
}
const isBuilding = ref(false)

const props = withDefaults(defineProps<Props>(), {
  showQueryBuilder: true,
  isEditMode: false,
  loading: false,
  saving: false,
  initialData: () => ({
    nome: '',
    descrizione: '',
    formula: ''
  }),
  hasPrevious: false,
  hasNext: false
})

// Emits
const emit = defineEmits<{
  'go-back': []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'save': [data: any]
  'delete': []
  'duplicate': []
  'reset': []
  'navigate-previous': []
  'navigate-next': []
}>()

// State
const formData = ref({
  nome: '',
  descrizione: '',
  formula: ''
})

const submitted = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showDeleteModal = ref(false)
const deleting = ref(false)

// Query Builder State
interface QueryCondition {
  logicOperator: string
  openParen: string
  field: string
  operator: string
  value: string
  closeParen: string
}

const queryConditions = ref<QueryCondition[]>([])

// Campi disponibili (statici)
const availableFields = ref([
  { label: 'Dipendente.CODDIP', value: 'Dipendente.CODDIP' },
  { label: 'Dipendente.CODAZI', value: 'Dipendente.CODAZI' },
  { label: 'Dipendente.Nome', value: 'Dipendente.Nome' },
  { label: 'Dipendente.Cognome', value: 'Dipendente.Cognome' },
  { label: 'Dipendente.DataNascita', value: 'Dipendente.DataNascita' },
  { label: 'Dipendente.CodiceFiscale', value: 'Dipendente.CodiceFiscale' },
  { label: 'Dipendente.Livello', value: 'Dipendente.Livello' },
  { label: 'Dipendente.Qualifica', value: 'Dipendente.Qualifica' },
  { label: 'Presenza.DataPresenza', value: 'Presenza.DataPresenza' },
  { label: 'Presenza.OrarioEntrata', value: 'Presenza.OrarioEntrata' },
  { label: 'Presenza.OrarioUscita', value: 'Presenza.OrarioUscita' }
])

// Operatori disponibili (statici)
const availableOperators = ref([
  { label: '= (uguale)', value: '=' },
  { label: '!= (diverso)', value: '!=' },
  { label: '< (minore)', value: '<' },
  { label: '<= (minore uguale)', value: '<=' },
  { label: '> (maggiore)', value: '>' },
  { label: '>= (maggiore uguale)', value: '>=' },
  { label: 'LIKE (contiene)', value: 'LIKE' },
  { label: 'NOT LIKE (non contiene)', value: 'NOT LIKE' },
  { label: 'IS NULL (è nullo)', value: 'IS NULL' },
  { label: 'IS NOT NULL (non è nullo)', value: 'IS NOT NULL' },
  { label: 'IN (in lista)', value: 'IN' },
  { label: 'NOT IN (non in lista)', value: 'NOT IN' },
  { label: 'BETWEEN (tra)', value: 'BETWEEN' }
])

// Computed
const isFormValid = computed(() => {
  return formData.value.nome.trim() !== '' &&
         formData.value.descrizione.trim() !== ''
})

const generatedQuery = computed(() => {
  if (queryConditions.value.length === 0) return ''

  let query = ''
  queryConditions.value.forEach((condition, index) => {
    if (index > 0 && condition.logicOperator) {
      query += ` ${condition.logicOperator} `
    }

    if (condition.openParen) {
      query += condition.openParen
    }

    if (condition.field && condition.operator) {
      query += `${condition.field} ${condition.operator}`

      if (needsValue(condition.operator) && condition.value) {
        query += ` ${condition.value}`
      }
    }

    if (condition.closeParen) {
      query += condition.closeParen
    }
  })

  return query.trim()
})

// Methods
const needsValue = (operator: string): boolean => {
  return !['IS NULL', 'IS NOT NULL'].includes(operator)
}

const addCondition = () => {
  isBuilding.value = true
  queryConditions.value.push({
    logicOperator: queryConditions.value.length > 0 ? 'AND' : '',
    openParen: '',
    field: '',
    operator: '',
    value: '',
    closeParen: ''
  })
}

const removeCondition = (index: number) => {
  isBuilding.value = true
  queryConditions.value.splice(index, 1)

  // Se rimuoviamo la prima condizione togliamo l'operatore logico dalla nuova prima
  if (index === 0 && queryConditions.value.length > 0) {
    queryConditions.value[0].logicOperator = ''
  }
}

const clearConditions = () => {
  isBuilding.value = true
  queryConditions.value = []
}

const copyQuery = async () => {
  if (generatedQuery.value) {
    try {
      await navigator.clipboard.writeText(generatedQuery.value)
      successMessage.value = 'Query copiata negli appunti'
      setTimeout(() => {
        successMessage.value = ''
      }, 2000)
    } catch (error) {
      console.log(error)
      errorMessage.value = 'Errore nella copia della query'
    }
  }
}

const handleSubmit = () => {
  submitted.value = true

  if (!isFormValid.value) {
    errorMessage.value = 'Compila tutti i campi obbligatori'
    return
  }

  const submitData = {
    ...formData.value,
    formula: generatedQuery.value || formData.value.formula
  }

  emit('save', submitData)
}

const resetForm = () => {
  formData.value = {
    nome: '',
    descrizione: '',
    formula: ''
  }
  queryConditions.value = []
  submitted.value = false
  errorMessage.value = ''
  successMessage.value = ''
  emit('reset')
}

const duplicateCurrent = () => {
  emit('duplicate')
}

const deleteCurrent = () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleting.value = false
}

const confirmDelete = async () => {
  deleting.value = true
  emit('delete')
  deleting.value = false
  showDeleteModal.value = false
}

// Inizializza i dati
onMounted(() => {
  if (props.initialData) {
    formData.value = { ...props.initialData }

    // Se c'è una formula prova a parsarla
    if (props.initialData.formula && props.initialData.formula.trim() !== '') {
      parseFormulaToConditions(props.initialData.formula)
    }
  }
})

const parseFormulaToConditions = (formula: string) => {
  if (!formula || formula.trim() === '') return

  isBuilding.value = false
  queryConditions.value = []

  try {
    // Rimuove spazi extra e divide per operatori logici mantenendo gli operatori
    const tokens = formula.split(/\s+(AND|OR)\s+/i)

    for (let i = 0; i < tokens.length; i += 2) {
      const conditionText = tokens[i]?.trim()
      if (!conditionText) continue

      const logicOp = i > 0 ? tokens[i - 1] : ''

      // Prova a parsare la singola condizione
      const condition = parseCondition(conditionText, logicOp)
      queryConditions.value.push(condition)
    }

    // Se non siamo riusciti a parsare nulla aggiunge una condizione vuota
    if (queryConditions.value.length === 0) {
      queryConditions.value.push({
        logicOperator: '',
        openParen: '',
        field: '',
        operator: '',
        value: '',
        closeParen: ''
      })
    }

  } catch (error) {
    console.error('Errore nel parsing:', error)
    // Fallback aggiunge una condizione vuota
    queryConditions.value.push({
      logicOperator: '',
      openParen: '',
      field: '',
      operator: '',
      value: '',
      closeParen: ''
    })
  } finally {
    setTimeout(() => {
      isBuilding.value = true
    }, 100)
  }
}

// Funzione helper per parsare una singola condizione
const parseCondition = (conditionText: string, logicOp: string) => {
  // Cerca parentesi
  const openParen = conditionText.match(/^(\(+)/)?.[1] || ''
  const closeParen = conditionText.match(/(\)+)$/)?.[1] || ''

  // Rimuove parentesi per analizzare il contenuto
  const cleanText = conditionText.replace(/^(\(+)|(\)+)$/g, '').trim()

  // Cerca pattern campo, operatore, valore
  const match = cleanText.match(/^(.+?)\s+(=|!=|<>|<=|>=|<|>|LIKE|NOT LIKE|IS NULL|IS NOT NULL|IN|NOT IN|BETWEEN)\s*(.*)$/i)

  if (match) {
    const [, field, operator, value] = match
    return {
      logicOperator: logicOp,
      openParen,
      field: field.trim(),
      operator: operator.trim(),
      value: value?.trim() || '',
      closeParen
    }
  }

  // Se non riesce a parsare, restituisce una condizione vuota
  return {
    logicOperator: logicOp,
    openParen,
    field: '',
    operator: '',
    value: '',
    closeParen
  }
}

// Watch per aggiornare la formula quando cambia la query
watch(generatedQuery, (newQuery) => {
  if (isBuilding.value) {
    formData.value.formula = newQuery
  }
}, { immediate: false })

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
    if (newData.formula && newData.formula.trim() !== '') {
      parseFormulaToConditions(newData.formula)
    }
  }
}, { deep: true, immediate: true })

</script>

<style scoped>
.input-error,
.textarea-error,
.select-error {
  border-color: rgb(var(--error));
  background-color: rgb(var(--error) / 0.05);
}

.input-error:focus,
.textarea-error:focus,
.select-error:focus {
  outline: 2px solid rgb(var(--error));
  outline-offset: 2px;
  border-color: rgb(var(--error));
}

.bg-primary\/10 {
  background-color: rgb(var(--primary) / 0.1);
}

.text-primary {
  color: rgb(var(--primary));
}

.card {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-box {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

code {
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
