<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <PageHeader
      :title="`Anagrafica Dipendente: ${dipendente?.cognome || ''} ${dipendente?.nome || ''}`"
      :description="`Gestione completa dell'anagrafica dipendente - Codice: ${dipendente?.codDip || ''}`"
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

    <!-- Action Buttons -->
    <form @submit.prevent="handleSave" class="space-y-6">
      <div class="bg-white p-4 rounded-lg shadow-sm border">
        <!-- Azioni principali con navigazione integrata -->
        <ActionButtons
          entity-name="Dipendente"
          :is-edit-mode="isEditMode"
          :saving="saving"
          :is-form-valid="isFormValid"
          :show-duplicate="false"
          :show-delete="isEditMode"
          :show-reset="true"
          :show-navigation="isEditMode"
          :navigation-config="dipendenteNavigationConfig"
          @delete="handleDelete"
          @reset="handleReset"
        />
      </div>
    </form>

    <!-- Loading indicator -->
    <LoadingIndicator :loading="loading" message="Caricamento dati dipendente..." />

    <div v-if="!loading && dipendente" class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Codice</label>
            <div class="text-lg font-semibold text-gray-900">{{ dipendente.codDip }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Cognome</label>
            <div class="text-lg font-semibold text-gray-900">{{ dipendente.cognome }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <div class="text-lg font-semibold text-gray-900">{{ dipendente.nome }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Matricola</label>
            <div class="text-lg font-semibold text-gray-900">{{ dipendente.matricola }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Codice Paghe</label>
            <div class="text-lg font-semibold text-gray-900">{{ dipendente.datiAzi?.codicePat || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- Tabs System -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="border-b">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in availableTabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
              type="button"
            >
              <FaIcon v-if="tab.icon" :icon="tab.icon" class="mr-2" />
              {{ tab.title }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Dati Aziendali -->
          <div v-if="activeTab === 'aziendali'" class="space-y-6">
            <form @submit.prevent="handleSave" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Sede</span>
                  </label>
                  <input
                    v-model.number="dipendente.datiAzi.codSedeAz"
                    type="number"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Filiale</span>
                  </label>
                  <input
                    v-model.number="dipendente.datiAzi.codCant"
                    type="number"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Centro di Costo</span>
                  </label>
                  <input
                    v-model="dipendente.datiAzi.codCenco"
                    type="text"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Reparto</span>
                  </label>
                  <input
                    v-model="dipendente.datiAzi.codReparto"
                    type="text"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Posizione INPS</span>
                  </label>
                  <input
                    v-model.number="dipendente.datiAzi.posinps"
                    type="number"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Data Assunzione</span>
                  </label>
                  <DateInput
                    v-model="dipendente.datiAzi.dataAssunz"
                    format="european"
                    :disabled="saving"
                    :input-class="'input input-bordered'"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Data Anzianità Convenzionale</span>
                  </label>
                  <DateInput
                    v-model="dipendente.datiAzi.dataAssunzioneConvenzionale"
                    format="european"
                    :disabled="saving"
                    :input-class="'input input-bordered'"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Data Cessazione</span>
                  </label>
                  <DateInput
                    v-model="dipendente.datiAzi.dataCessazione"
                    format="european"
                    :disabled="saving"
                    :input-class="'input input-bordered'"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Percentuale Part-time</span>
                  </label>
                  <input
                    v-model.number="dipendente.datiAzi.percenpt"
                    type="number"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>
              </div>

            </form>
          </div>

          <!-- Dati Personali -->
          <div v-if="activeTab === 'personali'" class="space-y-6">
            <form @submit.prevent="handleSave" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Data Nascita</span>
                  </label>
                  <DateInput
                    v-model="dipendente.datiPers.dataNas"
                    format="european"
                    :disabled="saving"
                    :input-class="'input input-bordered'"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Indirizzo</span>
                  </label>
                  <input
                    v-model="dipendente.datiPers.viaRes"
                    type="text"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Località</span>
                  </label>
                  <input
                    v-model="dipendente.datiPers.comRes"
                    type="text"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">CAP</span>
                  </label>
                  <input
                    v-model.number="dipendente.datiPers.capRes"
                    type="number"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Telefono</span>
                  </label>
                  <input
                    v-model="dipendente.datiPers.telefono"
                    type="text"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Codice Fiscale *</span>
                  </label>
                  <input
                    v-model="dipendente.datiPers.codFis"
                    type="text"
                    class="input input-bordered"
                    @blur="handleCodiceFiscaleBlur"
                    :disabled="saving"
                    maxlength="16"
                  />
                  <div class="label">
                    <span class="label-text-alt">Il codice fiscale verrà decodificato automaticamente</span>
                  </div>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Stato Civile</span>
                  </label>
                  <select v-model="dipendente.datiPers.statoCivi" class="select select-bordered" :disabled="saving">
                    <option value="">Seleziona...</option>
                    <option value="1">Coniugato/a</option>
                    <option value="2">Non coniugato/a</option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">E-Mail</span>
                  </label>
                  <input
                    v-model="dipendente.datiPers.mail"
                    type="email"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Numero Civico</span>
                  </label>
                  <input
                    v-model="dipendente.datiPers.numRes"
                    type="text"
                    class="input input-bordered"
                    :disabled="saving"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Provincia</span>
                  </label>
                  <input
                    v-model="dipendente.datiPers.proRes"
                    type="text"
                    class="input input-bordered"
                    :disabled="saving"
                    maxlength="2"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Sesso</span>
                  </label>
                  <div class="flex gap-4 pt-2">
                    <label class="cursor-pointer label">
                      <input
                        v-model="dipendente.datiPers.sesso"
                        type="radio"
                        value="F"
                        class="radio radio-primary"
                        :disabled="saving"
                      />
                      <span class="label-text ml-2">Femmina</span>
                    </label>
                    <label class="cursor-pointer label">
                      <input
                        v-model="dipendente.datiPers.sesso"
                        type="radio"
                        value="M"
                        class="radio radio-primary"
                        :disabled="saving"
                      />
                      <span class="label-text ml-2">Maschio</span>
                    </label>
                  </div>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Servizio Militare</span>
                  </label>
                  <select v-model="dipendente.datiPers.militare" class="select select-bordered" :disabled="saving">
                    <option value="">Seleziona...</option>
                    <option value="1">Esente</option>
                  </select>
                </div>
              </div>

            </form>
          </div>

          <!-- Badge -->
          <div v-if="activeTab === 'badge'" class="space-y-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium">Elenco Badge</h3>
                <button
                  @click="addNewBadge"
                  class="btn btn-primary btn-sm"
                >
                  <FaIcon icon="plus" class="mr-2" />
                  Aggiungi Badge
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(badge, index) in badgeList"
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-base-100 border border-gray-200 rounded-lg"
                >
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cod. Azienda</label>
                    <input
                      v-model.number="badge.codAzi"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      disabled
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cod. Dipendente</label>
                    <input
                      v-model.number="badge.codDip"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      disabled
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Numero Badge</label>
                    <input
                      v-model.number="badge.codBadge"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      placeholder="Numero Badge"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Data Dal</label>
                    <DateInput
                      v-model="badge.dal"
                      format="european"
                      :input-class="'input input-bordered input-sm w-full'"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Data Al</label>
                    <DateInput
                      v-model="badge.al"
                      format="european"
                      :input-class="'input input-bordered input-sm w-full'"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div class="flex items-end gap-2">
                    <button
                      v-if="badgeList.length > 1 || (badgeList.length === 1 && badge.codBadge > 0)"
                      @click="removeBadge(index)"
                      class="btn btn-sm btn-error btn-outline"
                      title="Elimina badge"
                    >
                      <FaIcon icon="trash" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PAT -->
          <div v-if="activeTab === 'pat'" class="space-y-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium">Gestione P.A.T.</h3>
                <button
                  @click="showAddPatForm = true"
                  class="btn btn-primary btn-sm"
                >
                  <FaIcon icon="plus" class="mr-2" />
                  Gestione P.A.T.
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-200 rounded-lg">
                <div>
                  <label class="block text-sm font-medium">P.A.T.</label>
                  <div class="text-lg font-semibold">{{ dipendente.datiAzi.codicePat || '-' }}</div>
                </div>
                <div>
                  <label class="block text-sm font-medium">Data</label>
                  <div>{{ formatDate('24/09/2025') }}</div>
                </div>
                <div class="flex items-end">
                  <span class="badge badge-success">Attivo</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Familiari -->
          <div v-if="activeTab === 'familiari'" class="space-y-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium">Elenco Familiari</h3>
                <button
                  @click="addNewFamiliare"
                  class="btn btn-primary btn-sm"
                >
                  <FaIcon icon="plus" class="mr-2" />
                  Aggiungi Familiare
                </button>
              </div>

              <div v-if="dipendente.familiari.length > 0" class="space-y-3">
                <div
                  v-for="(familiare, index) in dipendente.familiari"
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-base-100 border border-gray-200 rounded-lg"
                >
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                    <input
                      v-model="familiare.cognome"
                      type="text"
                      class="input input-bordered input-sm w-full"
                      placeholder="Cognome"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      v-model="familiare.nome"
                      type="text"
                      class="input input-bordered input-sm w-full"
                      placeholder="Nome"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale</label>
                    <input
                      v-model="familiare.codFisc"
                      type="text"
                      class="input input-bordered input-sm w-full"
                      placeholder="Codice Fiscale"
                      maxlength="16"
                    />
                  </div>
                  <div class="flex items-end gap-2">
                    <button
                      @click="removeFamiliare(index)"
                      class="btn btn-sm btn-error btn-outline"
                      title="Elimina familiare"
                    >
                      <FaIcon icon="trash" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-8">
                <FaIcon icon="users" class="text-6xl text-gray-300 mb-4" />
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Nessun familiare presente</h3>
                <button @click="addNewFamiliare" class="btn btn-primary">
                  <FaIcon icon="plus" class="mr-2" />
                  Aggiungi Primo Familiare
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <SimpleConfirmDialog
      :visible="showConfirmDialog"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      type="danger"
      confirm-label="Elimina"
      cancel-label="Annulla"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import DateInput from '@/components/DateInput.vue'
import SimpleConfirmDialog from '@/components/SimpleConfirmDialog.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { dipendenteService, type DettaglioDipendente, type Familiare, type Badge } from '@/services/dipendenteService'

type BadgeWithPlaceholder = Badge & {
  _isPlaceholder?: boolean
}

const route = useRoute()
const router = useRouter()

// State
const loading = ref(false)
const saving = ref(false)
const dipendente = ref<DettaglioDipendente | null>(null)

const showConfirmDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmAction = ref<(() => void) | null>(null)
const activeTab = ref('aziendali')
const showAddPatForm = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

useMessageAlerts(errorMessage, successMessage)

// Computed
const dipendenteId = computed(() => {
  if (!isEditMode.value || !route.params.id) return 0
  const [, codDip] = String(route.params.id).split('-')
  return Number(codDip) || 0
})

const aziendaId = computed(() => {
  if (!isEditMode.value || !route.params.id) return Number(route.query.azienda) || 1
  const [codAzi] = String(route.params.id).split('-')
  return Number(codAzi) || 1
})

const availableTabs = computed(() => [
  { key: 'aziendali', title: 'Dati Aziendali', icon: 'building' },
  { key: 'personali', title: 'Dati Personali', icon: 'user' },
  { key: 'badge', title: 'Badge', icon: 'id-card' },
  { key: 'pat', title: 'P.A.T.', icon: 'clipboard-list' },
  { key: 'familiari', title: 'Familiari', icon: 'users' }
])

const isEditMode = computed(() => {
  return route.params.id !== 'new' && route.params.id !== undefined
})

const isFormValid = computed(() => {
  if (!dipendente.value) return false
  return dipendente.value.cognome.trim() !== '' && dipendente.value.nome.trim() !== ''
})

// Navigation configuration
const dipendenteNavigationConfig = computed(() => ({
  fetchAll: () => dipendenteService.getListaDipendenti({
    codAzi: aziendaId.value  // Usa l'azienda corrente dall'URL
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (dipendente: any) => `${dipendente.codAzi}-${dipendente.codDip}`, // Formato dinamico
  basePath: '/app/anagrafica-dipendente',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortFn: (a: any, b: any) => a.codDip - b.codDip
}))

const badgeList = computed((): BadgeWithPlaceholder[] => {
  if (!dipendente.value) return []
  if (!dipendente.value.datiAzi.listaBadge) {
    return []
  }
  return dipendente.value.datiAzi.listaBadge.map(badge => ({ ...badge, _isPlaceholder: false }))
})

const ensureBadgesInitialized = () => {
  if (!dipendente.value) return

  if (!dipendente.value.datiAzi.listaBadge) {
    dipendente.value.datiAzi.listaBadge = []
  }

  if (dipendente.value.datiAzi.listaBadge.length === 0) {
    const emptyBadge: Badge = {
      codAzi: dipendente.value.codAzi,
      codDip: dipendente.value.codDip,
      codBadge: 0,
      dal: '',
      al: ''
    }
    dipendente.value.datiAzi.listaBadge.push(emptyBadge)
  }
}

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmDialogTitle.value = title
  confirmDialogMessage.value = message
  confirmAction.value = action
  showConfirmDialog.value = true
}

const handleConfirm = () => {
  if (confirmAction.value) {
    confirmAction.value()
  }
  showConfirmDialog.value = false
  confirmAction.value = null
}

const handleCancel = () => {
  showConfirmDialog.value = false
  confirmAction.value = null
}

// Methods
const initializeEmptyDipendente = () => {
  dipendente.value = {
    codDip: dipendenteId.value || 0,
    codAzi: aziendaId.value || 1,
    matricola: '',
    cognome: '',
    nome: '',
    datiAzi: {
      codDip: dipendenteId.value || 0,
      codAzi: aziendaId.value || 1,
      codSedeAz: 0,
      codCant: 0,
      codCenco: '',
      codReparto: '',
      posinps: 0,
      codicePat: 0,
      codQualif: '',
      codLivello: '',
      codCCNL: 0,
      dataAssunz: '',
      dataAssunzioneConvenzionale: '',
      dataCessazione: '',
      percenpt: 100,
      tipoRappor: '',
      listaBadge: [],
      listaPAT: []
    },
    datiPers: {
      codDip: dipendenteId.value || 0,
      codAzi: aziendaId.value || 1,
      codFis: '',
      dataNas: '',
      sesso: '',
      comNas: '',
      proNas: '',
      viaRes: '',
      numRes: '',
      comRes: '',
      codComRes: '',
      capRes: 0,
      proRes: '',
      telefono: '',
      statoCivi: '',
      militare: '',
      mail: '',
      note: ''
    },
    codUte: {
      codUtente1: '',
      codUtente2: '',
      codUtente3: '',
      codUtente4: '',
      codUtente5: '',
      codUtente6: '',
      codUtente7: '',
      codUtente8: '',
      codUtente9: '',
      codUtente10: ''
    },
    familiari: []
  }
  ensureBadgesInitialized()
}

const loadDipendente = async () => {
  if (!dipendenteId.value && isEditMode.value) return

  loading.value = true
  try {
    if (isEditMode.value) {
      dipendente.value = await dipendenteService.getDettaglioDipendente({
        codDip: dipendenteId.value,
        codAzi: aziendaId.value
      })

      if (!dipendente.value.datiAzi.listaBadge) {
        dipendente.value.datiAzi.listaBadge = []
      }
      ensureBadgesInitialized()
    } else {
      initializeEmptyDipendente()
    }
  } catch (error) {
    console.error('Errore nel caricamento dipendente:', error)
    initializeEmptyDipendente()
    errorMessage.value = 'Dati non trovati nel database. È possibile inserire i dati manualmente.'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!dipendente.value) return

  if (!dipendente.value.cognome.trim() || !dipendente.value.nome.trim()) {
    errorMessage.value = 'Cognome e Nome sono obbligatori'
    return
  }

  saving.value = true
  try {
    if (isEditMode.value) {
      await dipendenteService.updateDipendente(dipendente.value)
      successMessage.value = 'Dipendente aggiornato con successo'
    } else {
      await dipendenteService.createDipendente(dipendente.value)
      successMessage.value = 'Dipendente creato con successo'
      router.replace(`/app/anagrafica-dipendente/edit/${dipendente.value.codAzi}-${dipendente.value.codDip}`)
    }
  } catch (error: unknown) {
    console.error('Errore nel salvataggio:', error)
    errorMessage.value = (error as Error)?.message || 'Errore nel salvataggio dei dati'
  } finally {
    saving.value = false
  }
}

const handleCodiceFiscaleBlur = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const codiceFiscale = target.value.trim().toUpperCase()

  if (!codiceFiscale || codiceFiscale.length !== 16 || !dipendente.value) {
    return
  }

  try {
    const decoded = await dipendenteService.decodeCodiceFiscale(codiceFiscale)

    dipendente.value.datiPers.dataNas = decoded.dataNascita
    dipendente.value.datiPers.sesso = decoded.sesso
    dipendente.value.datiPers.comRes = decoded.nomeComune
    dipendente.value.datiPers.proRes = decoded.provincia
    dipendente.value.datiPers.capRes = Number(decoded.cap) || 0
    dipendente.value.datiPers.codComRes = decoded.codiceComune

    successMessage.value = 'Codice fiscale decodificato con successo'
  } catch (error) {
    console.error('Errore nella decodifica del codice fiscale:', error)
    errorMessage.value = 'Errore nella decodifica del codice fiscale'
  }
}

const addNewFamiliare = () => {
  if (!dipendente.value) return

  const newFamiliare: Familiare = {
    codAzi: dipendente.value.codAzi,
    codDip: dipendente.value.codDip,
    codice: dipendente.value.familiari.length + 1,
    codFisc: '',
    cognome: '',
    nome: ''
  }

  dipendente.value.familiari.push(newFamiliare)
}


const removeFamiliare = (index: number) => {
  if (!dipendente.value) return

  const familiare = dipendente.value.familiari[index]
  const displayName = familiare.cognome && familiare.nome
    ? `${familiare.cognome} ${familiare.nome}`
    : 'questo familiare'

  showConfirmation(
    'Elimina Familiare',
    `Sei sicuro di voler eliminare ${displayName}?`,
    () => {
      if (!dipendente.value) return
      dipendente.value.familiari.splice(index, 1)
      successMessage.value = 'Familiare eliminato con successo'
    }
  )
}

const addNewBadge = () => {
  if (!dipendente.value) return

  if (!dipendente.value.datiAzi.listaBadge) {
    dipendente.value.datiAzi.listaBadge = []
  }

  const newBadge: Badge = {
    codAzi: dipendente.value.codAzi,
    codDip: dipendente.value.codDip,
    codBadge: 0,
    dal: '',
    al: ''
  }

  dipendente.value.datiAzi.listaBadge.push(newBadge)
}

const removeBadge = (index: number) => {
  if (!dipendente.value) return

  // Se stiamo rimuovendo dall'array originale (quando ci sono badge reali)
  if (dipendente.value.datiAzi.listaBadge.length > 0) {
    const badge = dipendente.value.datiAzi.listaBadge[index]
    const displayName = badge.codBadge && badge.codBadge > 0
      ? `il badge ${badge.codBadge}`
      : 'questo badge'

    showConfirmation(
      'Elimina Badge',
      `Sei sicuro di voler eliminare ${displayName}?`,
      () => {
        if (!dipendente.value) return
        dipendente.value.datiAzi.listaBadge.splice(index, 1)
        successMessage.value = 'Badge eliminato con successo'
      }
    )
  }
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('it-IT')
}

const handleDelete = async () => {
  if (!dipendente.value) return

  const displayName = dipendente.value.cognome && dipendente.value.nome
    ? `${dipendente.value.cognome} ${dipendente.value.nome}`
    : `il dipendente con codice ${dipendente.value.codDip}`

  showConfirmation(
    'Elimina Dipendente',
    `Sei sicuro di voler eliminare ${displayName}? Questa operazione non può essere annullata.`,
    async () => {
      if (!dipendente.value) return

      try {
        saving.value = true
        await dipendenteService.deleteDipendente(dipendente.value.codAzi, dipendente.value.codDip)
        successMessage.value = 'Dipendente eliminato con successo'
        // Torna alla lista dipendenti dopo eliminazione
        setTimeout(() => {
          router.push('/app/anagrafica-dipendente')
        }, 1500)
      } catch (error: unknown) {
        console.error('Errore nell\'eliminazione:', error)
        errorMessage.value = (error as Error)?.message || 'Errore nell\'eliminazione del dipendente'
      } finally {
        saving.value = false
      }
    }
  )
}

const handleReset = () => {
  if (isEditMode.value) {
    loadDipendente()
  } else {
    initializeEmptyDipendente()
  }
}

const goBack = () => {
  router.push('/app/anagrafica-dipendente')
}

watch(() => dipendente.value, () => {
  if (dipendente.value) {
    ensureBadgesInitialized()
  }
}, { deep: true, immediate: false })

// Watcher per ricaricare i dati quando cambia l'ID nell'URL (navigazione Previous/Next)
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId && isEditMode.value) {
    loadDipendente()
  }
}, { immediate: false })

onMounted(() => {
  loadDipendente()
})
</script>

<style scoped>
.border-primary {
  border-color: oklch(var(--p));
}

.text-primary {
  color: oklch(var(--p));
}
</style>
