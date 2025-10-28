<template>
  <EditViewLayout>
    <template #header>
      <PageHeader
        :title="pageTitle"
        :breadcrumbItems="breadcrumbItems"
      >
        <template #backButton>
          <button class="btn btn-ghost btn-circle btn-xs" @click="$emit('go-back')" :disabled="saving" title="Indietro">
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
        v-if="!loading"
        :entity-name="entityName"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="navigationConfig"
        @duplicate="duplicateCurrent"
        @delete="deleteCurrent"
        @reset="resetForm"
      />
    </template>

    <template #content>
      <LoadingIndicator :loading="loading" message="Caricamento dati..." />

      <form v-if="!loading" @submit.prevent="handleSubmit" class="space-y-6">

      <!-- Sezione Informazioni Base -->
      <SectionCard
        title="Informazioni Base"
        :description="`Dati principali del ${entityName.toLowerCase()}`"
        :icon="entityIcon"
      >

          <div class="grid grid-cols-1 gap-4">
            <!-- Codice -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Codice *</span>
              </label>
              <input
                type="text"
                v-model="formData.codice"
                :class="{ 'input-error': submitted && !formData.codice }"
                class="input input-bordered w-full"
                placeholder="Inserisci codice"
                required
                :disabled="isEditMode"
                maxlength="50"
              />
              <div class="label">
                <span class="label-text-alt">
                  {{ isEditMode ? 'Il codice non può essere modificato' : `${formData.codice.length}/50 caratteri` }}
                </span>
                <span v-if="submitted && !formData.codice" class="label-text-alt text-error">
                  Codice richiesto
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
      </SectionCard>

      <!-- Sezione Query Builder -->
      <SectionCard
        v-if="showQueryBuilder"
        title="Costruttore Formula"
        description="Costruisci una condizione e inseriscila nella formula"
        icon="code"
      >

          <!-- Singolo Selettore Formula -->
          <div class="bg-base-200 rounded-lg p-4 mb-4">
            <div class="text-sm font-medium text-base-content/70 mb-3">Costruisci Condizione:</div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <!-- Operatore Logico (AND/OR) -->
              <div class="md:col-span-1">
                <label class="label">
                  <span class="label-text text-xs">Logica</span>
                </label>
                <select
                  v-model="currentCondition.logicOperator"
                  class="select select-bordered select-sm w-full"
                  :disabled="!formData.formula"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>

              <!-- Parentesi -->
              <div class="md:col-span-1">
                <label class="label">
                  <span class="label-text text-xs">Parentesi</span>
                </label>
                <div class="flex gap-1">
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm flex-1 text-xs"
                    @click="addParenthesis('(')"
                    title="Aggiungi parentesi aperta"
                  >
                    (
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm flex-1 text-xs"
                    @click="addParenthesis(')')"
                    title="Aggiungi parentesi chiusa"
                  >
                    )
                  </button>
                </div>
              </div>

              <!-- Campo -->
              <div class="md:col-span-3">
                <label class="label">
                  <span class="label-text text-xs">Campo</span>
                </label>
                <select
                  v-model="currentCondition.field"
                  class="select select-bordered select-sm w-full"
                  @change="onFieldChange"
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
              <div class="md:col-span-2">
                <label class="label">
                  <span class="label-text text-xs">Operatore</span>
                </label>
                <select
                  v-model="currentCondition.operator"
                  class="select select-bordered select-sm w-full"
                  @change="onOperatorChange"
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

              <!-- Valori -->
              <div class="md:col-span-3">
                <label class="label">
                  <span class="label-text text-xs">
                    {{ getValueLabel(currentCondition.operator) }}
                  </span>
                </label>

                <!-- Single Value -->
                <div v-if="needsSingleValue(currentCondition.operator)">
                  <select
                    v-if="currentCondition.fieldData && currentCondition.field"
                    v-model="currentCondition.value"
                    class="select select-bordered select-sm w-full"
                    :class="{ 'loading': currentCondition.loadingValues }"
                  >
                    <option value="">Seleziona Valore</option>
                    <option
                      v-for="value in currentCondition.availableValues || []"
                      :key="value"
                      :value="value"
                    >
                      {{ value }}
                    </option>
                  </select>
                  <input
                    v-else
                    type="text"
                    v-model="currentCondition.value"
                    placeholder="Valore"
                    class="input input-bordered input-sm w-full"
                  />
                </div>

                <!-- Multiple Values (IN, NOT IN) -->
                <div v-else-if="needsMultipleValues(currentCondition.operator)">
                  <select
                    v-if="currentCondition.fieldData && currentCondition.field"
                    v-model="currentCondition.values"
                    multiple
                    class="select select-bordered select-sm w-full h-20"
                    :class="{ 'loading': currentCondition.loadingValues }"
                  >
                    <option
                      v-for="value in currentCondition.availableValues || []"
                      :key="value"
                      :value="value"
                    >
                      {{ value }}
                    </option>
                  </select>
                  <div v-else class="space-y-1">
                    <input
                      v-for="(_, idx) in currentCondition.values"
                      :key="idx"
                      type="text"
                      v-model="currentCondition.values[idx]"
                      :placeholder="`Valore ${idx + 1}`"
                      class="input input-bordered input-sm w-full"
                    />
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs"
                      @click="addValueInput"
                    >
                      <FaIcon icon="plus" class="mr-1"/>
                      Aggiungi valore
                    </button>
                  </div>
                </div>

                <!-- Range Values (BETWEEN) -->
                <div v-else-if="needsRangeValues(currentCondition.operator)" class="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    v-model="currentCondition.valueMin"
                    placeholder="Da"
                    class="input input-bordered input-sm"
                  />
                  <input
                    type="text"
                    v-model="currentCondition.valueMax"
                    placeholder="A"
                    class="input input-bordered input-sm"
                  />
                </div>
              </div>

              <!-- Pulsante Inserisci -->
              <div class="md:col-span-2">
                <button
                  type="button"
                  class="btn btn-primary btn-sm w-full text-white"
                  @click="insertCondition"
                  :disabled="!canInsertCondition"
                >
                  <FaIcon icon="plus" class="mr-1"/>
                  Inserisci
                </button>
              </div>
            </div>
          </div>

          <!-- Formula Editabile -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Formula *</span>
              <button
                v-if="formData.formula"
                type="button"
                class="btn btn-ghost btn-xs"
                @click="clearFormula"
                title="Pulisci formula"
              >
                <FaIcon icon="trash" class="mr-1"/>
                Pulisci
              </button>
            </label>
            <textarea
              v-model="formData.formula"
              :class="{ 'textarea-error': submitted && !formData.formula }"
              class="textarea textarea-bordered w-full h-32 resize-none font-mono text-sm"
              placeholder="Inserisci la formula manualmente o usa il costruttore sopra per generarla automaticamente"
              required
            ></textarea>
            <div class="label">
              <span class="label-text-alt">Puoi modificare direttamente la formula qui o usare il costruttore sopra</span>
              <span v-if="submitted && !formData.formula" class="label-text-alt text-error">
                Formula richiesta
              </span>
            </div>
          </div>
      </SectionCard>
      </form>

      <!-- Modale di conferma eliminazione -->
      <div v-if="showDeleteModal" class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Conferma eliminazione</h3>
          <p class="mb-4">
            Sei sicuro di voler eliminare {{ entityName.toLowerCase() }} <strong>{{ formData.codice }}</strong>?
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
    </template>
  </EditViewLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from './PageHeader.vue'
import EditViewLayout from './EditViewLayout.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import LoadingIndicator from './LoadingIndicator.vue'
import ActionButtons from './ActionButtons.vue'
import SectionCard from './SectionCard.vue'
import FormStatusIndicator from './FormStatusIndicator.vue'
import { dipendenteService, type CampoDipendente } from '../services/dipendenteService'

// Navigation config types importati da ActionButtons

// Props
interface Props {
  entityName: string
  entityIcon: string
  showQueryBuilder?: boolean
  isEditMode?: boolean
  loading?: boolean
  saving?: boolean
  initialData?: {
    codice: string
    descrizione: string
    formula: string
  }
  // Navigation configuration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigationConfig?: any
  breadcrumbItems?: { label: string; to?: string }[]
  pageTitle?: string
  isDirty?: boolean
  touchedFields?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  showQueryBuilder: true,
  isEditMode: false,
  loading: false,
  saving: false,
  initialData: () => ({
    codice: '',
    descrizione: '',
    formula: ''
  }),
  breadcrumbItems: () => [],
  pageTitle: '',
  isDirty: false,
  touchedFields: () => new Set<string>()
})

// Emits
const emit = defineEmits<{
  'go-back': []
  'save': [data: { codice: string; descrizione: string; formula: string }]
  'delete': []
  'duplicate': []
  'reset': []
}>()

// State
const formData = ref({
  codice: '',
  descrizione: '',
  formula: ''
})

const submitted = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showDeleteModal = ref(false)
const deleting = ref(false)


useMessageAlerts(errorMessage, successMessage)

interface CurrentCondition {
  field: string
  operator: string
  value: string
  values: string[]
  valueMin: string
  valueMax: string
  logicOperator: string
  fieldData?: CampoDipendente
  availableValues?: string[]
  loadingValues?: boolean
}

const currentCondition = ref<CurrentCondition>({
  field: '',
  operator: '',
  value: '',
  values: [''],
  valueMin: '',
  valueMax: '',
  logicOperator: 'AND',
  availableValues: [],
  loadingValues: false
})

// Dati per Query Builder
const availableFields = ref<Array<{ value: string; label: string }>>([])

const availableOperators = [
  { value: '=', label: '= (uguale)' },
  { value: '!=', label: '!= (diverso)' },
  { value: '<>', label: '<> (diverso)' },
  { value: '>', label: '> (maggiore)' },
  { value: '>=', label: '>= (maggiore uguale)' },
  { value: '<', label: '< (minore)' },
  { value: '<=', label: '<= (minore uguale)' },
  { value: 'LIKE', label: 'LIKE (contiene)' },
  { value: 'NOT LIKE', label: 'NOT LIKE (non contiene)' },
  { value: 'IS NULL', label: 'IS NULL (vuoto)' },
  { value: 'IS NOT NULL', label: 'IS NOT NULL (non vuoto)' },
  { value: 'IN', label: 'IN (in lista)' },
  { value: 'NOT IN', label: 'NOT IN (non in lista)' },
  { value: 'BETWEEN', label: 'BETWEEN (tra valori)' }
]

// Computed
const isFormValid = computed(() => {
  const baseValid = formData.value.codice.trim() !== '' &&
                    formData.value.descrizione.trim() !== ''

  if (props.showQueryBuilder) {
    return baseValid && formData.value.formula.trim() !== ''
  }

  return baseValid
})

const canInsertCondition = computed(() => {
  const c = currentCondition.value
  if (!c.field || !c.operator) return false

  if (needsSingleValue(c.operator)) {
    return c.value.trim() !== ''
  } else if (needsMultipleValues(c.operator)) {
    return c.values.some(v => v.trim() !== '')
  } else if (needsRangeValues(c.operator)) {
    return c.valueMin.trim() !== '' && c.valueMax.trim() !== ''
  }

  return true
})

// Methods
const needsSingleValue = (operator: string): boolean => {
  return ['=', '!=', '<>', '>', '>=', '<', '<=', 'LIKE', 'NOT LIKE'].includes(operator)
}

const needsMultipleValues = (operator: string): boolean => {
  return ['IN', 'NOT IN'].includes(operator)
}

const needsRangeValues = (operator: string): boolean => {
  return operator === 'BETWEEN'
}

const getValueLabel = (operator: string): string => {
  if (needsMultipleValues(operator)) return 'Valori (seleziona multipli)'
  if (needsRangeValues(operator)) return 'Intervallo'
  if (['IS NULL', 'IS NOT NULL'].includes(operator)) return 'Nessun valore richiesto'
  return 'Valore'
}

const addValueInput = () => {
  currentCondition.value.values.push('')
}

const onFieldChange = async () => {
  const condition = currentCondition.value
  condition.availableValues = []
  condition.loadingValues = true

  try {
    const fields = await dipendenteService.getCampiDipendente()
    const field = fields.find(f => `${f.tabella}.${f.campo}` === condition.field)

    if (field) {
      condition.fieldData = field
      const values = await dipendenteService.getValoriCampo(field.tabella, field.campo)
      condition.availableValues = values
    }
  } catch (error) {
    console.error('Errore nel caricamento valori campo:', error)
  } finally {
    condition.loadingValues = false
  }
}

const onOperatorChange = () => {
  const c = currentCondition.value
  c.value = ''
  c.values = ['']
  c.valueMin = ''
  c.valueMax = ''
}

const insertCondition = () => {
  const c = currentCondition.value
  let conditionString = ''

  if (needsSingleValue(c.operator)) {
    const value = c.value.includes(' ') ? `'${c.value}'` : c.value
    conditionString = `${c.field} ${c.operator} ${value}`
  } else if (needsMultipleValues(c.operator)) {
    const values = c.values.filter(v => v.trim() !== '').map(v => `'${v}'`).join(', ')
    conditionString = `${c.field} ${c.operator} (${values})`
  } else if (needsRangeValues(c.operator)) {
    conditionString = `${c.field} ${c.operator} '${c.valueMin}' AND '${c.valueMax}'`
  } else {
    conditionString = `${c.field} ${c.operator}`
  }

  const currentFormula = formData.value.formula
  const newFormula = currentFormula
    ? `${currentFormula} ${c.logicOperator} ${conditionString}`
    : conditionString

  formData.value.formula = newFormula

  resetCurrentCondition()
}

const resetCurrentCondition = () => {
  currentCondition.value = {
    field: '',
    operator: '',
    value: '',
    values: [''],
    valueMin: '',
    valueMax: '',
    logicOperator: 'AND',
    availableValues: [],
    loadingValues: false
  }
}

const clearFormula = () => {
  formData.value.formula = ''
}

const addParenthesis = (parenthesis: '(' | ')') => {
  const currentFormula = formData.value.formula

  if (parenthesis === '(') {
    // Se la formula è vuota, aggiunge solo la parentesi aperta
    if (!currentFormula) {
      formData.value.formula = '('
    } else {
      // Se la formula finisce con AND/OR, aggiunge la parentesi dopo
      if (currentFormula.endsWith(' AND ') || currentFormula.endsWith(' OR ')) {
        formData.value.formula = currentFormula + '('
      } else {
        // Altrimenti aggiunge AND e poi la parentesi
        formData.value.formula = currentFormula + ' AND ('
      }
    }
  } else {
    // Per parentesi chiusa, aggiunge sempre alla fine
    formData.value.formula = currentFormula + ')'
  }
}

const loadAvailableFields = async () => {
  try {
    const fields = await dipendenteService.getCampiDipendente()
    availableFields.value = fields.map(field => ({
      value: `${field.tabella}.${field.campo}`,
      label: `${field.tabella}.${field.campo} (${field.tipologia})`
    }))
  } catch (error) {
    console.error('Errore nel caricamento campi:', error)
    errorMessage.value = 'Errore nel caricamento dei campi disponibili'
  }
}

const resetForm = () => {
  formData.value = { ...props.initialData }
  resetCurrentCondition()
  submitted.value = false
  errorMessage.value = ''
  successMessage.value = ''
  emit('reset')
}

const handleSubmit = () => {
  submitted.value = true
  errorMessage.value = ''
  successMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = 'Compila tutti i campi obbligatori'
    return
  }

  emit('save', { ...formData.value })
}

const duplicateCurrent = () => {
  emit('duplicate')
}

const deleteCurrent = () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
}

const confirmDelete = () => {
  deleting.value = true
  emit('delete')
}

// Lifecycle
onMounted(async () => {
  formData.value = { ...props.initialData }

  if (props.showQueryBuilder) {
    await loadAvailableFields()
  }
})

// Watch per aggiornamenti di initialData
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
  }
}, { deep: true })
</script>
