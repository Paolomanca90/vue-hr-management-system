<template>
  <EditViewLayout>
    <template #header>
      <PageHeader
        :title="isEditMode ? `Modifica ${dipendente?.cognome || ''} ${dipendente?.nome || ''} (${dipendente?.codDip || ''})` : 'Nuovo Dipendente'"
        :breadcrumbItems="[
          { label: 'Home', to: '/app' },
          { label: 'Anagrafica Dipendenti', to: '/app/anagrafica-dipendente' },
          { label: isEditMode ? 'Modifica' : 'Nuovo' }
        ]"
      >
        <template #backButton>
          <button class="btn btn-ghost btn-circle btn-xs" @click="goBack" :disabled="saving" title="Indietro">
            <FaIcon icon="arrow-left" />
          </button>
        </template>
        <template #actions>
          <FormStatusIndicator :is-dirty="isDirty" :touched-fields="touchedFields" />
        </template>
      </PageHeader>
    </template>

    <template #actions>
      <ActionButtons
        v-if="!loading"
        entity-name="Dipendente"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="isEditMode"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="dipendenteNavigationConfig"
        @save="handleSave"
        @delete="handleDelete"
        @duplicate="handleDuplicate"
        @reset="handleReset"
      />
    </template>

    <template #content>
      <!-- Loading indicator -->
      <LoadingIndicator :loading="loading" message="Caricamento dati dipendente..." />

      <div v-if="!loading && dipendente" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium dark:text-gray-200">Codice *</span>
            </label>
            <input
              v-if="!isEditMode"
              v-model.number="dipendente.codDip"
              type="number"
              class="input input-bordered"
              :disabled="saving"
              placeholder="Inserisci codice dipendente"
            />
            <div v-else class="text-lg font-semibold text-gray-900 dark:text-gray-100 py-2">{{ dipendente.codDip }}</div>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium dark:text-gray-200">Cognome *</span>
            </label>
            <input
              v-model="dipendente.cognome"
              type="text"
              class="input input-bordered"
              :disabled="saving"
              placeholder="Inserisci cognome"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium dark:text-gray-200">Nome *</span>
            </label>
            <input
              v-model="dipendente.nome"
              type="text"
              class="input input-bordered"
              :disabled="saving"
              placeholder="Inserisci nome"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium dark:text-gray-200">Matricola</span>
            </label>
            <input
              v-model="dipendente.matricola"
              type="text"
              class="input input-bordered"
              :disabled="saving"
              placeholder="Inserisci matricola"
            />
          </div>
        </div>
      </div>

      <!-- Tabs System -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in availableTabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium  focus:outline-none',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
              <!-- Sezione Organizzazione Aziendale -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class=" font-medium text-gray-900 dark:text-gray-100 mb-4">Organizzazione Aziendale</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GenericLookupInput
                    v-model="sedeData"
                    :config="sedeConfig"
                    :disabled="saving"
                  />

                  <GenericLookupInput
                    v-model="filialeData"
                    :config="filialeConfig"
                    :disabled="saving"
                  />

                  <GenericLookupInput
                    v-model="centroCostoData"
                    :config="centroCostoConfig"
                    :disabled="saving"
                  />

                  <GenericLookupInput
                    v-model="repartoData"
                    :config="repartoConfig"
                    :disabled="saving"
                  />
                </div>
              </div>

              <!-- Sezione Rapporto di Lavoro -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class=" font-medium text-gray-900 dark:text-gray-100 mb-4">Rapporto di Lavoro</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Data Assunzione *</span>
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
                      <span class="label-text font-medium dark:text-gray-200">Data Assunzione Convenzionale</span>
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
                      <span class="label-text font-medium dark:text-gray-200">Data Cessazione</span>
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
                      <span class="label-text font-medium dark:text-gray-200">Tipo Rapporto</span>
                    </label>
                    <select v-model="dipendente.datiAzi.tipoRappor" class="select select-bordered" :disabled="saving">
                      <option value="">Seleziona...</option>
                      <option value="1">1 - Tempo Indeterminato</option>
                      <option value="2">2 - Tempo Determinato</option>
                    </select>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Percentuale Part-time</span>
                    </label>
                    <input
                      v-model.number="dipendente.datiAzi.percenpt"
                      type="number"
                      class="input input-bordered"
                      :disabled="saving"
                    />
                  </div>

                  <GenericLookupInput
                    v-model="posinpsData"
                    :config="posinpsConfig"
                    :disabled="saving"
                  />
                </div>
              </div>

              <!-- Sezione Qualifiche e CCNL -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class=" font-medium text-gray-900 dark:text-gray-100 mb-4">Qualifiche e CCNL</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GenericLookupInput
                    v-model="ccnlData"
                    :config="ccnlConfig"
                    :disabled="saving"
                  />

                  <GenericLookupInput
                    v-model="livelloData"
                    :config="livelloConfig"
                    :disabled="saving || !ccnlData.codCCNL || Number(ccnlData.codCCNL) <= 0"
                  />

                  <GenericLookupInput
                    v-model="qualificaData"
                    :config="qualificaConfig"
                    :disabled="saving"
                  />
                </div>
              </div>

            </form>
          </div>

          <!-- Dati Personali -->
          <div v-if="activeTab === 'personali'" class="space-y-6">
            <form @submit.prevent="handleSave" class="space-y-6">
              <!-- Sezione Dati Anagrafici -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class=" font-medium text-gray-900 dark:text-gray-100 mb-4">Dati Anagrafici</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Fiscale *</span>
                    </label>
                    <input
                      v-model="dipendente.datiPers.codFis"
                      type="text"
                      class="input input-bordered"
                      @blur="handleCodiceFiscaleBlur"
                      :disabled="saving"
                      maxlength="16"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Data Nascita</span>
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
                      <span class="label-text font-medium dark:text-gray-200">Sesso</span>
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
                        <span class="label-text ml-2 dark:text-gray-200">Femmina</span>
                      </label>
                      <label class="cursor-pointer label">
                        <input
                          v-model="dipendente.datiPers.sesso"
                          type="radio"
                          value="M"
                          class="radio radio-primary"
                          :disabled="saving"
                        />
                        <span class="label-text ml-2 dark:text-gray-200">Maschio</span>
                      </label>
                    </div>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Stato Civile</span>
                    </label>
                    <select v-model="dipendente.datiPers.statoCivi" class="select select-bordered" :disabled="saving">
                      <option value="">Seleziona...</option>
                      <option value="C">1 - Coniugato/a</option>
                      <option value="D">2 - Divorziato/a</option>
                      <option value="N">3 - Nubile (Celibe)</option>
                      <option value="S">4 - Separato/a</option>
                      <option value="V">5 - Vedovo/a</option>
                      <option value="U">6 - Unito/a civilmente</option>
                      <option value="L">7 - Sciolto/a da unione civile</option>
                      <option value="A">8 - Abbandonato/a</option>
                    </select>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Servizio Militare</span>
                    </label>
                    <select v-model="dipendente.datiPers.militare" class="select select-bordered" :disabled="saving">
                      <option value="">Seleziona...</option>
                      <option value="1">1 - Esente</option>
                      <option value="2">2 - Assolto</option>
                      <option value="3">3 - Da fare</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Sezione Residenza -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class=" font-medium text-gray-900 dark:text-gray-100 mb-4">Dati di Residenza</h4>
                <AddressInput
                  v-model="addressData"
                  :disabled="saving"
                />
              </div>

              <!-- Sezione Contatti -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class=" font-medium text-gray-900 dark:text-gray-100 mb-4">Informazioni di Contatto</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Telefono</span>
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
                      <span class="label-text font-medium dark:text-gray-200">E-Mail</span>
                    </label>
                    <input
                      v-model="dipendente.datiPers.mail"
                      type="email"
                      class="input input-bordered"
                      :disabled="saving"
                    />
                  </div>
                </div>
              </div>

            </form>
          </div>

          <!-- Badge -->
          <div v-if="activeTab === 'badge'" class="space-y-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium dark:text-gray-100">Elenco Badge</h3>
                <button
                  @click="addNewBadge"
                  class="btn btn-primary btn-sm text-white"
                >
                  <FaIcon icon="plus" class="mr-2" />
                  Aggiungi Badge
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(badge, index) in badgeList"
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-base-100 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div class="md:col-span-1">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Cod. Azi</label>
                    <input
                      v-model.number="badge.codAzi"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      disabled
                    />
                  </div>
                  <div class="md:col-span-1">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Cod. Dip</label>
                    <input
                      v-model.number="badge.codDip"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      disabled
                    />
                  </div>
                  <div class="md:col-span-4">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Numero Badge</label>
                    <input
                      v-model.number="badge.codBadge"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      placeholder="Numero Badge"
                    />
                  </div>
                  <div class="md:col-span-3">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Data Dal</label>
                    <DateInput
                      :model-value="badge.dal"
                      @update:model-value="(val) => {
                        if (dipendente) {
                          dipendente.datiAzi.listaBadge[index].dal = val || ''
                        }
                      }"
                      format="european"
                      :input-class="'input input-bordered input-sm w-full'"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Data Al</label>
                    <DateInput
                      :model-value="badge.al"
                      @update:model-value="(val) => {
                        if (dipendente) {
                          dipendente.datiAzi.listaBadge[index].al = val || ''
                        }
                      }"
                      format="european"
                      :input-class="'input input-bordered input-sm w-full'"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div class="md:col-span-1 flex items-end">
                    <button
                      v-if="badgeList.length > 1 || (badgeList.length === 1 && badge.codBadge > 0)"
                      @click="removeBadge(index)"
                      class="btn btn-sm btn-error btn-outline w-full"
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
                <h3 class="text-lg font-medium dark:text-gray-100">Elenco P.A.T.</h3>
                <button
                  @click="addNewPat"
                  class="btn btn-primary btn-sm text-white"
                >
                  <FaIcon icon="plus" class="mr-2" />
                  Aggiungi P.A.T.
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(pat, index) in patList"
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-base-100 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div class="md:col-span-1">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Cod. Azi</label>
                    <input
                      v-model.number="pat.codAzi"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      disabled
                    />
                  </div>
                  <div class="md:col-span-1">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Cod. Dip</label>
                    <input
                      v-model.number="pat.codDip"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      disabled
                    />
                  </div>
                  <div class="md:col-span-4">
                    <GenericLookupInput
                      :model-value="{
                        codice: pat.codPat || '',
                        descrizione: getPATDescription(pat.codPat)
                      }"
                      @update:model-value="(val) => {
                        if (dipendente) {
                          dipendente.datiAzi.listaPAT[index].codPat = val.codice ? Number(val.codice) : 0
                        }
                      }"
                      :config="patLookupConfig"
                      :lookup-data="allPAT"
                      :input-class="'input input-bordered input-sm w-full'"
                    />
                  </div>
                  <div class="md:col-span-3">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Data Dal</label>
                    <DateInput
                      :model-value="pat.dal"
                      @update:model-value="(val) => {
                        if (dipendente) {
                          dipendente.datiAzi.listaPAT[index].dal = val || ''
                        }
                      }"
                      format="european"
                      :input-class="'input input-bordered input-sm w-full'"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Data Al</label>
                    <DateInput
                      :model-value="pat.al"
                      @update:model-value="(val) => {
                        if (dipendente) {
                          dipendente.datiAzi.listaPAT[index].al = val || ''
                        }
                      }"
                      format="european"
                      :input-class="'input input-bordered input-sm w-full'"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div class="md:col-span-1 flex items-end">
                    <button
                      v-if="patList.length > 1 || (patList.length === 1 && pat.codPat > 0)"
                      @click="removePat(index)"
                      class="btn btn-sm btn-error btn-outline"
                      title="Elimina P.A.T."
                    >
                      <FaIcon icon="trash" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gruppi Configurazione -->
          <div v-if="activeTab === 'gruppiConfig'" class="space-y-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium dark:text-gray-100">Elenco Gruppi Configurazione</h3>
                <button
                  @click="addNewGruppoConfig"
                  class="btn btn-primary btn-sm text-white"
                >
                  <FaIcon icon="plus" class="mr-2" />
                  Aggiungi Gruppo Configurazione
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(gruppo, index) in gruppiConfigList"
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-base-100 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div class="md:col-span-1">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Cod. Azi</label>
                    <input
                      v-model.number="gruppo.codAzi"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      disabled
                    />
                  </div>
                  <div class="md:col-span-1">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Cod. Dip</label>
                    <input
                      v-model.number="gruppo.codDip"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      disabled
                    />
                  </div>
                  <div class="md:col-span-4">
                    <GenericLookupInput
                      :model-value="{
                        codice: gruppo.codGruppo || '',
                        descrizione: getGruppoConfigDescription(gruppo.codGruppo)
                      }"
                      @update:model-value="(val) => {
                        if (dipendente) {
                          dipendente.datiAzi.listaGrpConfig[index].codGruppo = val.codice ? Number(val.codice) : 0
                        }
                      }"
                      :config="gruppiConfigLookupConfig"
                      :lookup-data="allGruppiConfig"
                      :input-class="'input input-bordered input-sm w-full'"
                    />
                  </div>
                  <div class="md:col-span-3">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Data Dal</label>
                    <DateInput
                      :model-value="gruppo.dal"
                      @update:model-value="(val) => {
                        if (dipendente) {
                          dipendente.datiAzi.listaGrpConfig[index].dal = val || ''
                        }
                      }"
                      format="european"
                      :input-class="'input input-bordered input-sm w-full'"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block  font-medium text-gray-700 dark:text-gray-300 label">Data Al</label>
                    <DateInput
                      :model-value="gruppo.al"
                      @update:model-value="(val) => {
                        if (dipendente) {
                          dipendente.datiAzi.listaGrpConfig[index].al = val || ''
                        }
                      }"
                      format="european"
                      :input-class="'input input-bordered input-sm w-full'"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div class="md:col-span-1 flex items-end">
                    <button
                      v-if="gruppiConfigList.length > 1 || (gruppiConfigList.length === 1 && gruppo.codGruppo > 0)"
                      @click="removeGruppoConfig(index)"
                      class="btn btn-sm btn-error btn-outline"
                      title="Elimina Gruppo Configurazione"
                    >
                      <FaIcon icon="trash" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Familiari -->
          <div v-if="activeTab === 'familiari'" class="space-y-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium dark:text-gray-100">Elenco Familiari</h3>
                <button
                  @click="addNewFamiliare"
                  class="btn btn-primary btn-sm text-white"
                >
                  <FaIcon icon="plus" class="mr-2" />
                  Aggiungi Familiare
                </button>
              </div>

              <div v-if="dipendente.familiari.length > 0" class="space-y-3">
                <div
                  v-for="(familiare, index) in dipendente.familiari"
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-base-100 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <label class="block  font-medium text-gray-700 dark:text-gray-300">Codice</label>
                    <input
                      v-model.number="familiare.codice"
                      type="number"
                      class="input input-bordered input-sm w-full"
                      placeholder="Codice"
                    />
                  </div>
                  <div>
                    <label class="block  font-medium text-gray-700 dark:text-gray-300">Cognome</label>
                    <input
                      v-model="familiare.cognome"
                      type="text"
                      class="input input-bordered input-sm w-full"
                      placeholder="Cognome"
                    />
                  </div>
                  <div>
                    <label class="block  font-medium text-gray-700 dark:text-gray-300">Nome</label>
                    <input
                      v-model="familiare.nome"
                      type="text"
                      class="input input-bordered input-sm w-full"
                      placeholder="Nome"
                    />
                  </div>
                  <div>
                    <label class="block  font-medium text-gray-700 dark:text-gray-300">Codice Fiscale</label>
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
                <FaIcon icon="users" class="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Nessun familiare presente</h3>
                <button @click="addNewFamiliare" class="btn btn-primary text-white">
                  <FaIcon icon="plus" class="mr-2" />
                  Aggiungi Primo Familiare
                </button>
              </div>
            </div>
          </div>

          <!-- Codici Utente -->
          <div v-if="activeTab === 'codiciUtente'" class="space-y-6">
            <form @submit.prevent="handleSave" class="space-y-6">
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class=" font-medium text-gray-900 dark:text-gray-100 mb-4">Codici Utente</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 1</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente1"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 1"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 2</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente2"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 2"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 3</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente3"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 3"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 4</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente4"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 4"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 5</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente5"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 5"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 6</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente6"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 6"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 7</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente7"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 7"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 8</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente8"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 8"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 9</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente9"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 9"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium dark:text-gray-200">Codice Utente 10</span>
                    </label>
                    <input
                      v-model="dipendente.codUte.codUtente10"
                      type="text"
                      class="input input-bordered"
                      :disabled="saving"
                      placeholder="Inserisci codice utente 10"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </template>
  </EditViewLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import EditViewLayout from '@/components/EditViewLayout.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'
import DateInput from '@/components/DateInput.vue'
import GenericLookupInput, { type LookupInputConfig } from '@/components/GenericLookupInput.vue'
import AddressInput, { type AddressData } from '@/components/AddressInput.vue'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { dipendenteService, type DettaglioDipendente, type Familiare, type Badge, type PAT, type GruppoConfigDipendente } from '@/services/dipendenteService'
import { lookupService, formatCap } from '@/services/lookupService'
import { gruppiConfigService, type GruppoConfig } from '@/services/gruppiConfigService'
import { patService, type Pat } from '@/services/patService'
import { gruppiConfigLookupConfig, patLookupConfig } from '@/config/lookupConfigs'

type BadgeWithPlaceholder = Badge & {
  _isPlaceholder?: boolean
}

type PatWithPlaceholder = PAT & {
  _isPlaceholder?: boolean
}

type GruppoConfigWithPlaceholder = GruppoConfigDipendente & {
  _isPlaceholder?: boolean
}

const route = useRoute()
const router = useRouter()

// State
const loading = ref(false)
const saving = ref(false)
const dipendente = ref<DettaglioDipendente | null>(null)
const originalData = ref<DettaglioDipendente | null>(null)

const activeTab = ref('aziendali')
const errorMessage = ref('')
const successMessage = ref('')

useMessageAlerts(errorMessage, successMessage)

const { showConfirm } = useConfirmDialog()

const {
  isDirty,
  touchedFields,
  updateOriginalData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} = useFormDirtyState(dipendente as any, originalData as any, {
  confirmMessage: 'Ci sono modifiche non salvate all\'Anagrafica Dipendente. Sei sicuro di voler lasciare questa pagina?'
})

const sedeData = ref<Record<string, unknown>>({
  codSedeAz: 0,
  descrizSede: ''
})

const filialeData = ref<Record<string, unknown>>({
  codCant: 0,
  descrizFiliale: ''
})

const centroCostoData = ref<Record<string, unknown>>({
  codCenco: '',
  descrizCentroCosto: ''
})

const repartoData = ref<Record<string, unknown>>({
  codReparto: '',
  descrizReparto: ''
})

const posinpsData = ref<Record<string, unknown>>({
  posinps: 0,
  matrinps: ''
})

const qualificaData = ref<Record<string, unknown>>({
  codQualif: '',
  descrizQualifica: ''
})

const livelloData = ref<Record<string, unknown>>({
  codLivello: '',
  descrizLivello: ''
})

const ccnlData = ref<Record<string, unknown>>({
  codCCNL: 0,
  descrizCCNL: ''
})

const addressData = ref<AddressData>({
  indirizzo: '',
  codiceBelfiore: null,
  comune: '',
  cap: '',
  provincia: '',
  civico: ''
})

// Cache per i dati dei lookup per evitare chiamate duplicate
const lookupCache = ref<Record<string, Array<Record<string, unknown>>>>({
  sede: [],
  filiale: [],
  ccosto: [],
  reparto: [],
  posinps: [],
  qualifica: [],
  livello: [],
  contratto: []
})

const sedeConfig = computed<LookupInputConfig>(() => ({
  lookupType: 'sede',
  autoCompleteField: 'codSedeAz',
  keyField: 'CODSEDEAZ',
  fields: [
    { key: 'codSedeAz', label: 'Codice Sede', editable: true, type: 'number', colSpan: 3 },
    { key: 'descrizSede', label: 'Descrizione Sede', editable: false, hasLookup: true, colSpan: 9 }
  ],
  modalConfig: {
    title: 'Selezione Sede',
    columns: [
      { key: 'CODSEDEAZ', label: 'Codice' },
      { key: 'DESCRIZ', label: 'Descrizione' }
    ],
    searchPlaceholder: 'Cerca per codice o descrizione...',
    searchFields: ['CODSEDEAZ', 'DESCRIZ'],
    // Usa dati cachati invece di fare nuove chiamate API
    loadData: async () => {
      if (lookupCache.value.sede.length === 0) {
        lookupCache.value.sede = await lookupService.getList('sede')
      }
      return lookupCache.value.sede
    }
  },
  mapper: (item: Record<string, unknown>) => ({
    codSedeAz: Number(item.CODSEDEAZ) || 0,
    descrizSede: String(item.DESCRIZ || '')
  })
}))

const filialeConfig: LookupInputConfig = {
  lookupType: 'filiale',
  autoCompleteField: 'codCant',
  keyField: 'CODCANT',
  fields: [
    { key: 'codCant', label: 'Codice Filiale', editable: true, type: 'number', colSpan: 3 },
    { key: 'descrizFiliale', label: 'Descrizione Filiale', editable: false, hasLookup: true, colSpan: 9 }
  ],
  modalConfig: {
    title: 'Selezione Filiale',
    columns: [
      { key: 'CODCANT', label: 'Codice' },
      { key: 'DESCRIZ', label: 'Descrizione' }
    ],
    searchPlaceholder: 'Cerca per codice o descrizione...',
    searchFields: ['CODCANT', 'DESCRIZ']
  },
  mapper: (item: Record<string, unknown>) => ({
    codCant: Number(item.CODCANT) || 0,
    descrizFiliale: String(item.DESCRIZ || '')
  })
}

const centroCostoConfig: LookupInputConfig = {
  lookupType: 'ccosto',
  autoCompleteField: 'codCenco',
  keyField: 'CODCENCO',
  fields: [
    { key: 'codCenco', label: 'Codice C. Costo', editable: true, colSpan: 3 },
    { key: 'descrizCentroCosto', label: 'Descrizione Centro di Costo', editable: false, hasLookup: true, colSpan: 9 }
  ],
  modalConfig: {
    title: 'Selezione Centro di Costo',
    columns: [
      { key: 'CODCENCO', label: 'Codice' },
      { key: 'DESCRIZ', label: 'Descrizione' }
    ],
    searchPlaceholder: 'Cerca per codice o descrizione...',
    searchFields: ['CODCENCO', 'DESCRIZ']
  },
  mapper: (item: Record<string, unknown>) => ({
    codCenco: String(item.CODCENCO || ''),
    descrizCentroCosto: String(item.DESCRIZ || '')
  })
}

const repartoConfig: LookupInputConfig = {
  lookupType: 'reparto',
  autoCompleteField: 'codReparto',
  keyField: 'CODREPARTO',
  fields: [
    { key: 'codReparto', label: 'Codice Reparto', editable: true, colSpan: 3 },
    { key: 'descrizReparto', label: 'Descrizione Reparto', editable: false, hasLookup: true, colSpan: 9 }
  ],
  modalConfig: {
    title: 'Selezione Reparto',
    columns: [
      { key: 'CODAZI', label: 'Cod. Azienda' },
      { key: 'CODREPARTO', label: 'Codice' },
      { key: 'DESCRIZ', label: 'Descrizione' }
    ],
    searchPlaceholder: 'Cerca per codice o descrizione...',
    searchFields: ['CODREPARTO', 'DESCRIZ']
  },
  mapper: (item: Record<string, unknown>) => ({
    codReparto: String(item.CODREPARTO || ''),
    descrizReparto: String(item.DESCRIZ || '')
  })
}

const posinpsConfig: LookupInputConfig = {
  lookupType: 'posinps',
  autoCompleteField: 'posinps',
  keyField: 'POSINPS',
  fields: [
    { key: 'posinps', label: 'Pos. INPS', editable: true, type: 'number', colSpan: 3 },
    { key: 'matrinps', label: 'Matricola INPS', editable: false, hasLookup: true, colSpan: 9 }
  ],
  modalConfig: {
    title: 'Selezione Posizione INPS',
    columns: [
      { key: 'POSINPS', label: 'Posizione' },
      { key: 'MATRINPS', label: 'Matricola INPS' }
    ],
    searchPlaceholder: 'Cerca per posizione o matricola...',
    searchFields: ['POSINPS', 'MATRINPS']
  },
  mapper: (item: Record<string, unknown>) => ({
    posinps: Number(item.POSINPS) || 0,
    matrinps: String(item.MATRINPS || '')
  })
}

const qualificaConfig: LookupInputConfig = {
  lookupType: 'qualifica',
  autoCompleteField: 'codQualif',
  keyField: 'CODQUALIF',
  fields: [
    { key: 'codQualif', label: 'Cod. Qualifica', editable: true, colSpan: 3 },
    { key: 'descrizQualifica', label: 'Descrizione Qualifica', editable: false, hasLookup: true, colSpan: 9 }
  ],
  modalConfig: {
    title: 'Selezione Qualifica',
    columns: [
      { key: 'CODQUALIF', label: 'Codice' },
      { key: 'DESCRIZ', label: 'Descrizione' }
    ],
    searchPlaceholder: 'Cerca per codice o descrizione...',
    searchFields: ['CODQUALIF', 'DESCRIZ']
  },
  mapper: (item: Record<string, unknown>) => ({
    codQualif: String(item.CODQUALIF || ''),
    descrizQualifica: String(item.DESCRIZ || '')
  })
}

const livelloConfig = computed<LookupInputConfig>(() => {
  const selectedCCNL = ccnlData.value.codCCNL
  const hasCCNL = selectedCCNL && Number(selectedCCNL) > 0

  return {
    lookupType: 'livello',
    autoCompleteField: 'codLivello',
    keyField: 'CODLIVELLO',
    searchFilter: hasCCNL ? { CODCCNL: String(selectedCCNL) } : undefined,
    fields: [
      { key: 'codLivello', label: 'Cod. Livello', editable: true, colSpan: 3 },
      { key: 'descrizLivello', label: 'Descrizione Livello', editable: false, hasLookup: true, colSpan: 9 }
    ],
    modalConfig: {
      title: 'Selezione Livello',
      columns: [
        { key: 'CODLIVELLO', label: 'Codice' },
        { key: 'DESCRIZ', label: 'Descrizione' },
        { key: 'CODCCNL', label: 'CCNL' }
      ],
      searchPlaceholder: 'Cerca per codice o descrizione...',
      searchFields: ['CODLIVELLO', 'DESCRIZ'],
      // Usa dati cachati con invalidazione per CCNL
      loadData: async () => {
        const cacheKey = hasCCNL ? `livello_${selectedCCNL}` : 'livello'

        if (!lookupCache.value[cacheKey]) {
          const filter = hasCCNL ? { CODCCNL: String(selectedCCNL) } : undefined
          lookupCache.value[cacheKey] = await lookupService.getList('livello', filter)
        }

        return lookupCache.value[cacheKey] || []
      }
    },
    mapper: (item: Record<string, unknown>) => ({
      codLivello: String(item.CODLIVELLO || ''),
      descrizLivello: String(item.DESCRIZ || '')
    })
  }
})

const ccnlConfig: LookupInputConfig = {
  lookupType: 'contratto',
  autoCompleteField: 'codCCNL',
  keyField: 'CODCCNL',
  fields: [
    { key: 'codCCNL', label: 'Cod. CCNL', editable: true, type: 'number', colSpan: 3 },
    { key: 'descrizCCNL', label: 'Descrizione CCNL', editable: false, hasLookup: true, colSpan: 9 }
  ],
  modalConfig: {
    title: 'Selezione CCNL',
    columns: [
      { key: 'CODCCNL', label: 'Codice' },
      { key: 'DESCRIZ', label: 'Descrizione' }
    ],
    searchPlaceholder: 'Cerca per codice o descrizione...',
    searchFields: ['CODCCNL', 'DESCRIZ']
  },
  mapper: (item: Record<string, unknown>) => ({
    codCCNL: Number(item.CODCCNL) || 0,
    descrizCCNL: String(item.DESCRIZ || '')
  })
}

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
  { key: 'gruppiConfig', title: 'Gruppi Configurazione', icon: 'cog' },
  { key: 'familiari', title: 'Familiari', icon: 'users' },
  { key: 'codiciUtente', title: 'Codici Utente', icon: 'key' }
])

const isEditMode = computed(() => {
  return route.params.id !== 'new' && route.params.id !== undefined
})

const isFormValid = computed(() => {
  if (!dipendente.value) return false
  return dipendente.value.cognome.trim() !== '' &&
         dipendente.value.nome.trim() !== '' &&
         dipendente.value.codDip > 0 &&
         dipendente.value.datiPers.codFis.trim() !== '' &&
         dipendente.value.datiAzi.dataAssunz.trim() !== ''
})

// Navigation configuration
const dipendenteNavigationConfig = {
  fetchAll: () => dipendenteService.getListaDipendenti({
    codAzi: aziendaId.value  // Usa l'azienda corrente dall'URL
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (dipendente: any) => `${aziendaId.value}-${dipendente.codDip}`,
  basePath: '/app/anagrafica-dipendente',
  entityType: 'dipendente',
  defaultSortField: 'codDip',
  defaultSortOrder: 1
}

const badgeList = computed((): BadgeWithPlaceholder[] => {
  if (!dipendente.value) return []
  if (!dipendente.value.datiAzi.listaBadge) {
    return []
  }
  return dipendente.value.datiAzi.listaBadge.map(badge => ({ ...badge, _isPlaceholder: false }))
})

const patList = computed((): PatWithPlaceholder[] => {
  if (!dipendente.value) return []
  if (!dipendente.value.datiAzi.listaPAT) {
    return []
  }
  return dipendente.value.datiAzi.listaPAT.map(pat => ({ ...pat, _isPlaceholder: false }))
})

const gruppiConfigList = computed((): GruppoConfigWithPlaceholder[] => {
  if (!dipendente.value) return []
  if (!dipendente.value.datiAzi.listaGrpConfig) {
    return []
  }
  return dipendente.value.datiAzi.listaGrpConfig.map(grp => ({ ...grp, _isPlaceholder: false }))
})

const allGruppiConfig = ref<GruppoConfig[]>([])
const allPAT = ref<Pat[]>([])

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

const ensurePatsInitialized = () => {
  if (!dipendente.value) return

  if (!dipendente.value.datiAzi.listaPAT) {
    dipendente.value.datiAzi.listaPAT = []
  }

  if (dipendente.value.datiAzi.listaPAT.length === 0) {
    const emptyPat: PAT = {
      codAzi: dipendente.value.codAzi,
      codDip: dipendente.value.codDip,
      codPat: 0,
      dal: '',
      al: ''
    }
    dipendente.value.datiAzi.listaPAT.push(emptyPat)
  }
}

const ensureGruppiConfigInitialized = () => {
  if (!dipendente.value) return

  if (!dipendente.value.datiAzi.listaGrpConfig) {
    dipendente.value.datiAzi.listaGrpConfig = []
  }

  if (dipendente.value.datiAzi.listaGrpConfig.length === 0) {
    const emptyGruppoConfig: GruppoConfigDipendente = {
      codAzi: dipendente.value.codAzi,
      codDip: dipendente.value.codDip,
      codGruppo: 0,
      dal: '',
      al: ''
    }
    dipendente.value.datiAzi.listaGrpConfig.push(emptyGruppoConfig)
  }
}


// Methods
const loadDipendenteForDuplication = async (duplicateId: string) => {
  loading.value = true

  try {
    const [codAzi, codDip] = duplicateId.split('-')
    const originalDipendente = await dipendenteService.getDettaglioDipendente({
      codDip: Number(codDip),
      codAzi: Number(codAzi)
    })

    dipendente.value = {
      ...originalDipendente,
      codDip: 0,
      matricola: '',
      cognome: `${originalDipendente.cognome} - Copia`,
      datiAzi: {
        ...originalDipendente.datiAzi,
        codDip: 0,
        listaBadge: [],
        listaPAT: [],
        listaGrpConfig: []
      },
      datiPers: {
        ...originalDipendente.datiPers,
        codDip: 0,
        codFis: ''
      },
      codUte: {
        ...originalDipendente.codUte
      },
      familiari: []
    }

    normalizeSelectValues()
    ensureBadgesInitialized()
    ensurePatsInitialized()
    ensureGruppiConfigInitialized()
  } catch (error) {
    console.error('Errore nel caricamento del dipendente per duplicazione:', error)
    errorMessage.value = 'Errore nel caricamento dei dati per la duplicazione'
  } finally {
    loading.value = false
  }
}

const initializeEmptyDipendente = async () => {
  const duplicatedData = sessionStorage.getItem('duplicatedDipendente')
  if (duplicatedData) {
    try {
      dipendente.value = JSON.parse(duplicatedData)
      sessionStorage.removeItem('duplicatedDipendente')
      normalizeSelectValues()
      ensureBadgesInitialized()
      ensurePatsInitialized()
      ensureGruppiConfigInitialized()
      return
    } catch (error) {
      console.error('Errore nel parsing dei dati duplicati:', error)
    }
  }

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
      tipoRappor: '2',
      listaBadge: [],
      listaPAT: [],
      listaGrpConfig: []
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
      codComRes: null,
      capRes: 0,
      proRes: '',
      telefono: '',
      statoCivi: 'C',
      militare: '1',
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
  ensurePatsInitialized()
  ensureGruppiConfigInitialized()
}

const normalizeSelectValues = () => {
  if (!dipendente.value) return

  // Normalizza i valori delle select per assicurarsi che siano stringhe
  if (dipendente.value.datiAzi.tipoRappor && typeof dipendente.value.datiAzi.tipoRappor === 'number') {
    dipendente.value.datiAzi.tipoRappor = String(dipendente.value.datiAzi.tipoRappor)
  }

  if (dipendente.value.datiPers.statoCivi) {
    if (typeof dipendente.value.datiPers.statoCivi === 'number') {
      const statoCiviMap: Record<number, string> = {
        1: 'C', // Coniugato/a
        2: 'N', // Celibe/Nubile
        3: 'S', // Separato/a
        4: 'D', // Divorziato/a
        5: 'V'  // Vedovo/a
      }
      dipendente.value.datiPers.statoCivi = statoCiviMap[dipendente.value.datiPers.statoCivi] || 'C'
    } else if (typeof dipendente.value.datiPers.statoCivi === 'string' && dipendente.value.datiPers.statoCivi.match(/^[1-5]$/)) {
      const statoCiviMap: Record<string, string> = {
        '1': 'C', // Coniugato/a
        '2': 'N', // Celibe/Nubile
        '3': 'S', // Separato/a
        '4': 'D', // Divorziato/a
        '5': 'V'  // Vedovo/a
      }
      dipendente.value.datiPers.statoCivi = statoCiviMap[dipendente.value.datiPers.statoCivi] || 'C'
    }
  } else {
    // Se null o undefined, imposta default
    dipendente.value.datiPers.statoCivi = 'C'
  }

  // Gestisce servizio militare: se null o undefined, imposta "1" (Esente)
  if (dipendente.value.datiPers.militare === null || dipendente.value.datiPers.militare === undefined || dipendente.value.datiPers.militare === '') {
    dipendente.value.datiPers.militare = '1'
  } else if (typeof dipendente.value.datiPers.militare === 'number') {
    dipendente.value.datiPers.militare = String(dipendente.value.datiPers.militare)
  }
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

      if (!dipendente.value.codUte) {
        dipendente.value.codUte = {
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
        }
      } else {
        dipendente.value.codUte.codUtente1 = dipendente.value.codUte.codUtente1 || ''
        dipendente.value.codUte.codUtente2 = dipendente.value.codUte.codUtente2 || ''
        dipendente.value.codUte.codUtente3 = dipendente.value.codUte.codUtente3 || ''
        dipendente.value.codUte.codUtente4 = dipendente.value.codUte.codUtente4 || ''
        dipendente.value.codUte.codUtente5 = dipendente.value.codUte.codUtente5 || ''
        dipendente.value.codUte.codUtente6 = dipendente.value.codUte.codUtente6 || ''
        dipendente.value.codUte.codUtente7 = dipendente.value.codUte.codUtente7 || ''
        dipendente.value.codUte.codUtente8 = dipendente.value.codUte.codUtente8 || ''
        dipendente.value.codUte.codUtente9 = dipendente.value.codUte.codUtente9 || ''
        dipendente.value.codUte.codUtente10 = dipendente.value.codUte.codUtente10 || ''
      }

      normalizeSelectValues()
      ensureBadgesInitialized()
      ensurePatsInitialized()
      ensureGruppiConfigInitialized()
      updateOriginalData(dipendente.value)
    }
  } catch (error) {
    console.error('Errore nel caricamento dipendente:', error)
    await initializeEmptyDipendente()
    errorMessage.value = 'Dati non trovati nel database. È possibile inserire i dati manualmente.'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!dipendente.value) return

  // Validazione campi obbligatori
  const errors = []
  if (!dipendente.value.cognome.trim()) errors.push('Cognome')
  if (!dipendente.value.nome.trim()) errors.push('Nome')
  if (!dipendente.value.codDip || dipendente.value.codDip <= 0) errors.push('Codice Dipendente')
  if (!dipendente.value.datiPers.codFis.trim()) errors.push('Codice Fiscale')
  if (!dipendente.value.datiAzi.dataAssunz.trim()) errors.push('Data Assunzione')

  if (errors.length > 0) {
    errorMessage.value = `I seguenti campi sono obbligatori: ${errors.join(', ')}`
    return
  }

  // Validazione PAT: solo uno attivo alla volta
  if (dipendente.value.datiAzi.listaPAT && dipendente.value.datiAzi.listaPAT.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const activePats = dipendente.value.datiAzi.listaPAT.filter(pat => {
      if (!pat.al) return true // Nessuna data fine = attivo

      const [day, month, year] = pat.al.split('/')
      if (!day || !month || !year) return true

      const endDate = new Date(Number(year), Number(month) - 1, Number(day))
      endDate.setHours(0, 0, 0, 0)

      return endDate >= today
    })

    if (activePats.length > 1) {
      errorMessage.value = 'È possibile avere solo un P.A.T. attivo alla volta. Verificare le date di fine.'
      return
    }
  }

  saving.value = true
  try {
    // Helper function per normalizzare date in formato ISO
    const normalizeDate = (date: string | null | undefined): string | null => {
      if (!date || date.trim() === '') return null

      try {
        // Se è in formato europeo dd/MM/yyyy, convertiamo in ISO
        if (date.includes('/')) {
          const [day, month, year] = date.split('/')
          const dateObj = new Date(`${year}-${month}-${day}`)
          if (isNaN(dateObj.getTime())) return null
          return dateObj.toISOString()
        }

        // Se è già in formato ISO o altro formato riconoscibile
        const dateObj = new Date(date)
        if (isNaN(dateObj.getTime())) return null
        return dateObj.toISOString()
      } catch {
        return null
      }
    }

    const dipendenteToSave = {
      ...dipendente.value,
      datiAzi: {
        ...dipendente.value.datiAzi,
        dataAssunz: normalizeDate(dipendente.value.datiAzi.dataAssunz),
        dataAssunzioneConvenzionale: normalizeDate(dipendente.value.datiAzi.dataAssunzioneConvenzionale),
        dataCessazione: normalizeDate(dipendente.value.datiAzi.dataCessazione),
        listaBadge: dipendente.value.datiAzi.listaBadge
          .filter(badge => badge.codBadge > 0)
          .map(badge => ({
            ...badge,
            dal: normalizeDate(badge.dal),
            al: normalizeDate(badge.al)
          })),
        listaPAT: dipendente.value.datiAzi.listaPAT
          .filter(pat => pat.codPat > 0)
          .map(pat => ({
            ...pat,
            dal: normalizeDate(pat.dal),
            al: normalizeDate(pat.al)
          })),
        listaGrpConfig: (dipendente.value.datiAzi.listaGrpConfig || [])
          .filter(grp => grp.codGruppo && grp.codGruppo > 0)
          .map(grp => ({
            ...grp,
            codGruppo: grp.codGruppo || null,
            dal: normalizeDate(grp.dal),
            al: normalizeDate(grp.al)
          }))
      },
      datiPers: {
        ...dipendente.value.datiPers,
        dataNas: normalizeDate(dipendente.value.datiPers.dataNas)
      },
      codUte: {
        codUtente1: dipendente.value.codUte.codUtente1 || null,
        codUtente2: dipendente.value.codUte.codUtente2 || null,
        codUtente3: dipendente.value.codUte.codUtente3 || null,
        codUtente4: dipendente.value.codUte.codUtente4 || null,
        codUtente5: dipendente.value.codUte.codUtente5 || null,
        codUtente6: dipendente.value.codUte.codUtente6 || null,
        codUtente7: dipendente.value.codUte.codUtente7 || null,
        codUtente8: dipendente.value.codUte.codUtente8 || null,
        codUtente9: dipendente.value.codUte.codUtente9 || null,
        codUtente10: dipendente.value.codUte.codUtente10 || null
      },
      familiari: (dipendente.value.familiari || []).map(familiare => ({
        ...familiare,
        dataNasc: normalizeDate(familiare.dataNasc)
      }))
    } as DettaglioDipendente

    if (isEditMode.value) {
      await dipendenteService.updateDipendente(dipendenteToSave)
      successMessage.value = 'Dipendente aggiornato con successo'
      updateOriginalData(dipendente.value)
    } else {
      await dipendenteService.createDipendente(dipendenteToSave)
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

  if (!codiceFiscale || !dipendente.value) {
    return
  }

  // Validazione lunghezza codice fiscale
  if (codiceFiscale.length !== 16) {
    // CF errato - svuota tutti i campi collegati
    if (dipendente.value) {
      dipendente.value.datiPers.dataNas = ''
      dipendente.value.datiPers.sesso = ''
      dipendente.value.datiPers.comRes = ''
      dipendente.value.datiPers.proRes = ''
      dipendente.value.datiPers.capRes = 0
      dipendente.value.datiPers.codComRes = ''
    }
    errorMessage.value = 'Codice fiscale non valido: deve essere di 16 caratteri'
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

    if (dipendente.value) {
      dipendente.value.datiPers.dataNas = ''
      dipendente.value.datiPers.sesso = ''
      dipendente.value.datiPers.comRes = ''
      dipendente.value.datiPers.proRes = ''
      dipendente.value.datiPers.capRes = 0
      dipendente.value.datiPers.codComRes = ''
    }

    errorMessage.value = 'Codice fiscale non valido: impossibile decodificare'
  }
}

const addNewFamiliare = () => {
  if (!dipendente.value) return

  const newFamiliare: Familiare = {
    codAzi: dipendente.value.codAzi,
    codDip: dipendente.value.codDip,
    codice: dipendente.value.familiari.length + 1,
    codFisc: null,
    cognome: null,
    nome: null,
    sesso: null,
    dataNasc: null,
    comNasc: null,
    provNasc: null,
    codComune: null
  }

  dipendente.value.familiari.push(newFamiliare)
}


const removeFamiliare = async (index: number) => {
  if (!dipendente.value) return

  const familiare = dipendente.value.familiari[index]
  const displayName = familiare.cognome && familiare.nome
    ? `${familiare.cognome} ${familiare.nome}`
    : 'questo familiare'

  const confirmed = await showConfirm({
    title: 'Elimina Familiare',
    message: `Sei sicuro di voler eliminare ${displayName}?`,
    type: 'danger',
    confirmLabel: 'Elimina',
    cancelLabel: 'Annulla'
  })

  if (!confirmed || !dipendente.value) return

  dipendente.value.familiari.splice(index, 1)
  successMessage.value = 'Familiare eliminato con successo'
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

const removeBadge = async (index: number) => {
  if (!dipendente.value) return

  // Se stiamo rimuovendo dall'array originale (quando ci sono badge reali)
  if (dipendente.value.datiAzi.listaBadge.length > 0) {
    const badge = dipendente.value.datiAzi.listaBadge[index]
    const displayName = badge.codBadge && badge.codBadge > 0
      ? `il badge ${badge.codBadge}`
      : 'questo badge'

    const confirmed = await showConfirm({
      title: 'Elimina Badge',
      message: `Sei sicuro di voler eliminare ${displayName}?`,
      type: 'danger',
      confirmLabel: 'Elimina',
      cancelLabel: 'Annulla'
    })

    if (!confirmed || !dipendente.value) return

    dipendente.value.datiAzi.listaBadge.splice(index, 1)
    successMessage.value = 'Badge eliminato con successo'
  }
}

const addNewPat = () => {
  if (!dipendente.value) return

  if (!dipendente.value.datiAzi.listaPAT) {
    dipendente.value.datiAzi.listaPAT = []
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const hasActivePat = dipendente.value.datiAzi.listaPAT.some(pat => {
    if (!pat.al) return true

    const [day, month, year] = pat.al.split('/')
    if (!day || !month || !year) return true

    const endDate = new Date(Number(year), Number(month) - 1, Number(day))
    endDate.setHours(0, 0, 0, 0)

    return endDate >= today
  })

  if (hasActivePat) {
    errorMessage.value = 'Esiste già un P.A.T. attivo. È possibile avere solo un P.A.T. attivo alla volta.'
    return
  }

  const newPat: PAT = {
    codAzi: dipendente.value.codAzi,
    codDip: dipendente.value.codDip,
    codPat: 0,
    dal: '',
    al: ''
  }

  dipendente.value.datiAzi.listaPAT.push(newPat)
}

const removePat = async (index: number) => {
  if (!dipendente.value) return

  // Se stiamo rimuovendo dall'array originale (quando ci sono P.A.T. reali)
  if (dipendente.value.datiAzi.listaPAT.length > 0) {
    const pat = dipendente.value.datiAzi.listaPAT[index]
    const displayName = pat.codPat && pat.codPat > 0
      ? `il P.A.T. ${pat.codPat}`
      : 'questo P.A.T.'

    const confirmed = await showConfirm({
      title: 'Elimina P.A.T.',
      message: `Sei sicuro di voler eliminare ${displayName}?`,
      type: 'danger',
      confirmLabel: 'Elimina',
      cancelLabel: 'Annulla'
    })

    if (!confirmed || !dipendente.value) return

    dipendente.value.datiAzi.listaPAT.splice(index, 1)
    successMessage.value = 'P.A.T. eliminato con successo'
  }
}

const addNewGruppoConfig = () => {
  if (!dipendente.value) return

  if (!dipendente.value.datiAzi.listaGrpConfig) {
    dipendente.value.datiAzi.listaGrpConfig = []
  }

  const newGruppoConfig: GruppoConfigDipendente = {
    codAzi: dipendente.value.codAzi,
    codDip: dipendente.value.codDip,
    codGruppo: 0,
    dal: '',
    al: ''
  }

  dipendente.value.datiAzi.listaGrpConfig.push(newGruppoConfig)
}

const removeGruppoConfig = async (index: number) => {
  if (!dipendente.value) return

  if (dipendente.value.datiAzi.listaGrpConfig.length > 0) {
    const gruppo = dipendente.value.datiAzi.listaGrpConfig[index]
    const gruppoDesc = allGruppiConfig.value.find(g => g.codgruppo === gruppo.codGruppo)
    const displayName = gruppoDesc
      ? `il gruppo ${gruppoDesc.codgruppo} - ${gruppoDesc.descrizione}`
      : 'questo gruppo configurazione'

    const confirmed = await showConfirm({
      title: 'Elimina Gruppo Configurazione',
      message: `Sei sicuro di voler eliminare ${displayName}?`,
      type: 'danger',
      confirmLabel: 'Elimina',
      cancelLabel: 'Annulla'
    })

    if (!confirmed || !dipendente.value) return

    dipendente.value.datiAzi.listaGrpConfig.splice(index, 1)
    successMessage.value = 'Gruppo configurazione eliminato con successo'
  }
}

const getGruppoConfigDescription = (codGruppo: number): string => {
  const gruppo = allGruppiConfig.value.find(g => g.codgruppo === codGruppo)
  return gruppo ? gruppo.descrizione : ''
}

const getPATDescription = (codPat: number): string => {
  const pat = allPAT.value.find(p => p.codicePat === codPat)
  return pat ? pat.pat : ''
}

const handleDuplicate = () => {
  if (!dipendente.value) return

  const duplicated = {
    ...dipendente.value,
    codDip: 0,
    matricola: '',
    cognome: `${dipendente.value.cognome} - Copia`,
    datiAzi: {
      ...dipendente.value.datiAzi,
      codDip: 0,
      listaBadge: [],
      listaPAT: [],
      listaGrpConfig: []
    },
    datiPers: {
      ...dipendente.value.datiPers,
      codDip: 0,
      codFis: ''
    },
    codUte: {
      ...dipendente.value.codUte
    },
    familiari: []
  }

  sessionStorage.setItem('duplicatedDipendente', JSON.stringify(duplicated))
  router.push('/app/anagrafica-dipendente/new')
}

const handleDelete = async () => {
  if (!dipendente.value) return


  try {
    saving.value = true
    await dipendenteService.deleteDipendente(dipendente.value.codAzi, dipendente.value.codDip)
    successMessage.value = 'Dipendente eliminato con successo'
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

const handleReset = async () => {
  if (isEditMode.value) {
    loadDipendente()
  } else {
    await initializeEmptyDipendente()
  }
}

const goBack = () => {
  router.push('/app/anagrafica-dipendente')
}

const loadAndCacheLookupData = async () => {
  if (!dipendente.value) return

  // Carica e cacha tutti i dati lookup in parallelo
  const promises = []

  // Per ogni lookup, carica i dati completi e trova la descrizione
  promises.push(
    lookupService.getList('sede').then(data => {
      lookupCache.value.sede = data
      if (dipendente.value?.datiAzi.codSedeAz) {
        const found = data.find(item => Number(item.CODSEDEAZ) === dipendente.value!.datiAzi.codSedeAz)
        if (found) sedeData.value.descrizSede = String(found.DESCRIZ || '')
      }
    })
  )

  promises.push(
    lookupService.getList('filiale').then(data => {
      lookupCache.value.filiale = data
      if (dipendente.value?.datiAzi.codCant) {
        const found = data.find(item => Number(item.CODCANT) === dipendente.value!.datiAzi.codCant)
        if (found) filialeData.value.descrizFiliale = String(found.DESCRIZ || '')
      }
    })
  )

  promises.push(
    lookupService.getList('ccosto').then(data => {
      lookupCache.value.ccosto = data
      if (dipendente.value?.datiAzi.codCenco) {
        const found = data.find(item => String(item.CODCENCO) === dipendente.value!.datiAzi.codCenco)
        if (found) centroCostoData.value.descrizCentroCosto = String(found.DESCRIZ || '')
      }
    })
  )

  promises.push(
    lookupService.getList('reparto').then(data => {
      lookupCache.value.reparto = data
      if (dipendente.value?.datiAzi.codReparto) {
        const found = data.find(item => String(item.CODREPARTO) === dipendente.value!.datiAzi.codReparto)
        if (found) repartoData.value.descrizReparto = String(found.DESCRIZ || '')
      }
    })
  )

  promises.push(
    lookupService.getList('posinps').then(data => {
      lookupCache.value.posinps = data
      if (dipendente.value?.datiAzi.posinps) {
        const found = data.find(item => Number(item.POSINPS) === dipendente.value!.datiAzi.posinps)
        if (found) posinpsData.value.matrinps = String(found.MATRINPS || '')
      }
    })
  )

  promises.push(
    lookupService.getList('qualifica').then(data => {
      lookupCache.value.qualifica = data
      if (dipendente.value?.datiAzi.codQualif) {
        const found = data.find(item => String(item.CODQUALIF) === dipendente.value!.datiAzi.codQualif)
        if (found) qualificaData.value.descrizQualifica = String(found.DESCRIZ || '')
      }
    })
  )

  promises.push(
    lookupService.getList('contratto').then(data => {
      lookupCache.value.contratto = data
      if (dipendente.value?.datiAzi.codCCNL) {
        const found = data.find(item => Number(item.CODCCNL) === dipendente.value!.datiAzi.codCCNL)
        if (found) ccnlData.value.descrizCCNL = String(found.DESCRIZ || '')
      }
    })
  )

  if (dipendente.value.datiAzi.codLivello) {
    const hasCCNL = dipendente.value.datiAzi.codCCNL > 0
    const ccnlFilter = hasCCNL ? { CODCCNL: String(dipendente.value.datiAzi.codCCNL) } : undefined
    const cacheKey = hasCCNL ? `livello_${dipendente.value.datiAzi.codCCNL}` : 'livello'

    const currentCodLivello = dipendente.value.datiAzi.codLivello

    promises.push(
      lookupService.getList('livello', ccnlFilter).then(data => {
        lookupCache.value[cacheKey] = data
        const found = data.find(item => String(item.CODLIVELLO) === currentCodLivello)

        if (found) {
          livelloData.value.codLivello = currentCodLivello
          livelloData.value.descrizLivello = String(found.DESCRIZ || '')
        } else {
          console.log('Livello not found in data')
        }
      })
    )
  }

  await Promise.all(promises)
}

const syncLookupDataToDipendente = () => {
  if (!dipendente.value) return

  // Sincronizza sede
  dipendente.value.datiAzi.codSedeAz = Number(sedeData.value.codSedeAz) || 0
  dipendente.value.datiAzi.codCant = Number(filialeData.value.codCant) || 0
  dipendente.value.datiAzi.codCenco = String(centroCostoData.value.codCenco || '')
  dipendente.value.datiAzi.codReparto = String(repartoData.value.codReparto || '')
  dipendente.value.datiAzi.posinps = Number(posinpsData.value.posinps) || 0
  dipendente.value.datiAzi.codQualif = String(qualificaData.value.codQualif || '')
  dipendente.value.datiAzi.codLivello = String(livelloData.value.codLivello || '')
  dipendente.value.datiAzi.codCCNL = Number(ccnlData.value.codCCNL) || 0

  // Sincronizza i dati dell'indirizzo
  dipendente.value.datiPers.viaRes = addressData.value.indirizzo || ''
  dipendente.value.datiPers.numRes = addressData.value.civico || ''
  dipendente.value.datiPers.comRes = addressData.value.comune || ''
  dipendente.value.datiPers.proRes = addressData.value.provincia || ''
  dipendente.value.datiPers.capRes = addressData.value.cap ? Number(addressData.value.cap) || 0 : 0
  dipendente.value.datiPers.codComRes = addressData.value.codiceBelfiore || null
}

const syncDipendenteToLookupData = () => {
  if (!dipendente.value) return

  sedeData.value.codSedeAz = dipendente.value.datiAzi.codSedeAz || 0
  filialeData.value.codCant = dipendente.value.datiAzi.codCant || 0
  centroCostoData.value.codCenco = dipendente.value.datiAzi.codCenco || ''
  repartoData.value.codReparto = dipendente.value.datiAzi.codReparto || ''
  posinpsData.value.posinps = dipendente.value.datiAzi.posinps || 0
  qualificaData.value.codQualif = dipendente.value.datiAzi.codQualif || ''

  // Solo se il codice livello non è già presente (per evitare sovrascritture)
  if (!livelloData.value.codLivello || livelloData.value.codLivello !== dipendente.value.datiAzi.codLivello) {
    livelloData.value.codLivello = dipendente.value.datiAzi.codLivello || ''
  }

  ccnlData.value.codCCNL = dipendente.value.datiAzi.codCCNL || 0

  // Sincronizza i dati dell'indirizzo
  addressData.value.indirizzo = dipendente.value.datiPers.viaRes || ''
  addressData.value.civico = dipendente.value.datiPers.numRes || ''
  addressData.value.comune = dipendente.value.datiPers.comRes || ''
  addressData.value.provincia = dipendente.value.datiPers.proRes || ''
  addressData.value.cap = dipendente.value.datiPers.capRes ? formatCap(String(dipendente.value.datiPers.capRes)) : ''
  addressData.value.codiceBelfiore = dipendente.value.datiPers.codComRes || null
}

// Watchers per sincronizzazione dei lookup
watch(() => sedeData.value.codSedeAz, () => {
  syncLookupDataToDipendente()
}, { deep: false })

watch(() => filialeData.value.codCant, () => {
  syncLookupDataToDipendente()
}, { deep: false })

watch(() => centroCostoData.value.codCenco, () => {
  syncLookupDataToDipendente()
}, { deep: false })

watch(() => repartoData.value.codReparto, () => {
  syncLookupDataToDipendente()
}, { deep: false })

watch(() => posinpsData.value.posinps, () => {
  syncLookupDataToDipendente()
}, { deep: false })

watch(() => qualificaData.value.codQualif, () => {
  syncLookupDataToDipendente()
}, { deep: false })

watch(() => livelloData.value.codLivello, () => {
  syncLookupDataToDipendente()
}, { deep: false })

watch(() => ccnlData.value.codCCNL, (newCCNL, oldCCNL) => {
  // Reset del campo livello quando cambia il CCNL
  if (newCCNL !== oldCCNL && oldCCNL !== undefined) {
    livelloData.value.codLivello = ''
    livelloData.value.descrizLivello = ''

    // Invalida la cache del livello per il nuovo CCNL
    const oldCacheKey = oldCCNL && Number(oldCCNL) > 0 ? `livello_${oldCCNL}` : 'livello'
    const newCacheKey = newCCNL && Number(newCCNL) > 0 ? `livello_${newCCNL}` : 'livello'

    delete lookupCache.value[oldCacheKey]
    delete lookupCache.value[newCacheKey]
  }
  syncLookupDataToDipendente()
}, { deep: false })

watch(() => addressData.value, () => {
  syncLookupDataToDipendente()
}, { deep: true })

watch(() => dipendente.value, async () => {
  if (dipendente.value) {
    ensureBadgesInitialized()
    ensurePatsInitialized()
    ensureGruppiConfigInitialized()
    syncDipendenteToLookupData()
    await loadAndCacheLookupData()
  }
}, { deep: true, immediate: false })

// Watcher per auto-compilare data assunzione convenzionale
watch(() => dipendente.value?.datiAzi.dataAssunz, (newDataAssunz) => {
  if (dipendente.value && newDataAssunz && !dipendente.value.datiAzi.dataAssunzioneConvenzionale) {
    dipendente.value.datiAzi.dataAssunzioneConvenzionale = newDataAssunz
  }
}, { immediate: false })

// Watcher per ricaricare i dati quando cambia l'ID nell'URL (navigazione Previous/Next)
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId && isEditMode.value) {
    loadDipendente()
  }
}, { immediate: false })

onMounted(async () => {
  try {
    allGruppiConfig.value = await gruppiConfigService.getAll()
  } catch (error) {
    console.error('Errore nel caricamento gruppi configurazione:', error)
  }

  try {
    allPAT.value = await patService.getPat()
  } catch (error) {
    console.error('Errore nel caricamento P.A.T.:', error)
  }

  if (isEditMode.value) {
    loadDipendente()
  } else {
    const duplicateId = route.query.duplicate
    if (duplicateId && typeof duplicateId === 'string') {
      await loadDipendenteForDuplication(duplicateId)
    } else {
      await initializeEmptyDipendente()
    }
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
</style>
