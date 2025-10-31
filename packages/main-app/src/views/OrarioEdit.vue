<template>
  <EditViewLayout>
    <template #header>
      <PageHeader
        :title="isEditMode ? `Modifica ${orarioForm.descrizione} (${orarioForm.codOra})` : 'Nuovo Orario'"
        :breadcrumbItems="[
          { label: 'Home', to: '/app' },
          { label: 'Orari', to: '/app/orario' },
          { label: isEditMode ? 'Modifica' : 'Nuovo' }
        ]"
      >
        <template #backButton>
          <button
            class="btn btn-ghost btn-circle btn-xs"
            @click="goBack"
            :disabled="saving"
            title="Indietro"
          >
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
        entity-name="Orario"
        :is-edit-mode="isEditMode"
        :saving="saving"
        :is-form-valid="isFormValid"
        :show-duplicate="true"
        :show-delete="isEditMode"
        :show-reset="true"
        :show-navigation="isEditMode"
        :navigation-config="orarioNavigationConfig"
        @save="handleSave"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
        @reset="handleReset"
      />
    </template>

    <template #content>
      <!-- Loading indicator -->
      <LoadingIndicator :loading="loading" message="Caricamento dati Orario..." />

      <!-- Form Container -->
      <form v-if="!loading" @submit.prevent="handleSave" class="space-y-6">

        <!-- Dati Principali -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title mb-6 dark:text-gray-100">Dati Principali</h2>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <!-- Codice Orario -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Codice Orario *</span>
                </label>
                <input
                  v-model.number="orarioForm.codOra"
                  type="number"
                  :placeholder="isEditMode ? '' : 'Inserisci codice orario'"
                  class="input input-bordered w-full"
                  :disabled="saving || isEditMode"
                  required
                  min="0"
                />
              </div>

              <!-- Descrizione -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Descrizione *</span>
                </label>
                <input
                  v-model="orarioForm.descrizione"
                  type="text"
                  placeholder="Inserisci descrizione"
                  class="input input-bordered w-full"
                  :disabled="saving"
                  maxlength="100"
                  required
                />
              </div>

              <!-- Abbreviazione -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Abbreviazione</span>
                </label>
                <input
                  v-model="orarioForm.abbreviazione"
                  type="text"
                  placeholder="Inserisci abbreviazione"
                  class="input input-bordered w-full font-mono"
                  :disabled="saving"
                  maxlength="10"
                />
              </div>

              <!-- Codice Gruppo -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Gruppo</span>
                </label>
                <select
                  v-model.number="orarioForm.dettaglioOrario.codGruppo"
                  class="select select-bordered w-full"
                  :disabled="saving"
                >
                  <option :value="0">0 - Gruppo Standard</option>
                  <option :value="1">1 - Gruppo A</option>
                  <option :value="2">2 - Gruppo B</option>
                  <option :value="3">3 - Gruppo C</option>
                </select>
              </div>
            </div>

            <div class="mt-4 text-base-content/70">
              * Campi obbligatori
            </div>
          </div>
        </div>

        <!-- Tabs per Orario Generale e Fasce Orarie -->
        <div class="card bg-base-100 shadow-sm">
          <div class="border-b border-base-300">
            <nav class="flex space-x-8 px-6" aria-label="Tabs">
              <button
                v-for="tab in orarioTabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                :class="[
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium focus:outline-none transition-colors',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-content/30'
                ]"
                type="button"
              >
                <FaIcon v-if="tab.icon" :icon="tab.icon" class="mr-2" />
                {{ tab.title }}
              </button>
            </nav>
          </div>

          <div class="card-body">
            <!-- Tab: Tipo Orario -->
            <div v-if="activeTab === 'tipoOrario'" class="space-y-8">
              <div>
                <h4 class="font-semibold dark:text-gray-100 mb-4">Orario</h4>
                <div class="grid grid-cols-1 gap-6">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Tipo Orario</span>
                      </label>
                      <select
                        v-model="orarioForm.dettaglioOrario.orarioGen.tipoOrario"
                        class="select select-bordered w-full"
                        :disabled="saving"
                      >
                        <option value="">Seleziona...</option>
                        <option value="1">1 - Rigido</option>
                        <option value="2">2 - Flessibile</option>
                        <option value="3">3 - Flessibile senza eccedenza</option>
                        <option value="4">4 - Libero</option>
                      </select>
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Tipo di Calcolo</span>
                      </label>
                      <select
                        v-model="orarioForm.dettaglioOrario.orarioGen.tipoNotte"
                        class="select select-bordered w-full"
                        :disabled="saving"
                      >
                        <option value="">Seleziona...</option>
                        <option value="1">1 - Giorno Iniziale</option>
                        <option value="2">2 - Giorno Finale</option>
                        <option value="3">3 - Cavaliere</option>
                      </select>
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Notturno</span>
                      </label>
                      <label class="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          class="checkbox checkbox-primary"
                          :checked="orarioForm.dettaglioOrario.orarioGen.notturno === 'S'"
                          @change="(e) => orarioForm.dettaglioOrario.orarioGen.notturno = (e.target as HTMLInputElement).checked ? 'S' : 'N'"
                          :disabled="saving"
                        />
                      </label>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Ore per Giorno</span>
                      </label>
                      <input
                        v-model="orarioForm.dettaglioOrario.orarioGen.oreXGg"
                        type="text"
                        placeholder="HH:MM"
                        class="input input-bordered w-full"
                        :disabled="saving"
                        @blur="(e) => handleTimeBlurForField('oreXGg', (e.target as HTMLInputElement).value)"
                      />
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Ore per Assenza</span>
                      </label>
                      <input
                        v-model="orarioForm.dettaglioOrario.orarioGen.oreXAss"
                        type="text"
                        placeholder="HH:MM"
                        class="input input-bordered w-full"
                        :disabled="saving"
                        @blur="(e) => handleTimeBlurForField('oreXAss', (e.target as HTMLInputElement).value)"
                      />
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Ore per Riposo</span>
                      </label>
                      <input
                        v-model="orarioForm.dettaglioOrario.orarioGen.oreXRiposo"
                        type="text"
                        placeholder="HH:MM"
                        class="input input-bordered w-full"
                        :disabled="saving"
                        @blur="(e) => handleTimeBlurForField('oreXRiposo', (e.target as HTMLInputElement).value)"
                      />
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Ore CCNL</span>
                      </label>
                      <input
                        v-model="orarioForm.dettaglioOrario.orarioGen.oreCcnl"
                        type="text"
                        placeholder="HH:MM"
                        class="input input-bordered w-full"
                        :disabled="saving"
                        @blur="(e) => handleTimeBlurForField('oreCcnl', (e.target as HTMLInputElement).value)"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Ore in eccesso</span>
                      </label>
                      <GenericLookupInput
                        v-model="codCauFlexPosLookup"
                        :config="causaleLookupConfig"
                        :disabled="saving"
                        @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codCauFlexPos = Number(value.codice) || 0"
                      />
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Ore in difetto</span>
                      </label>
                      <GenericLookupInput
                        v-model="codCauFlexNegLookup"
                        :config="causaleLookupConfig"
                        :disabled="saving"
                        @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codCauFlexNeg = Number(value.codice) || 0"
                      />
                    </div>

                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Lavoro ordinario</span>
                      </label>
                      <GenericLookupInput
                        v-model="codCauLavOrdLookup"
                        :config="causaleLookupConfig"
                        :disabled="saving"
                        @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codCauLavOrd = Number(value.codice) || 0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Arrotondamento -->
              <div class="mt-8">
                <h4 class="font-semibold dark:text-gray-100 mb-4">Arrotondamento</h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Tipo Arrotondamento -->
                  <div class="form-control mb-4">
                    <label class="label">
                      <span class="label-text font-medium">Tipo Arrotondamento</span>
                    </label>
                    <select
                      v-model="orarioForm.dettaglioOrario.orarioGen.tipoArroto"
                      class="select select-bordered w-full"
                      :disabled="saving"
                    >
                      <option value="">Seleziona...</option>
                      <option value="0">0 - Nessuno</option>
                      <option value="1">1 - Per Eccesso</option>
                      <option value="2">2 - Per Difetto</option>
                      <option value="3">3 - Misto</option>
                    </select>
                  </div>

                  <!-- Radio buttons per timbrature -->
                  <div class="form-control mb-6">
                    <label class="label">
                      <span class="label-text font-medium">Timbrature</span>
                    </label>
                    <div class="flex flex-col md:flex-row gap-2 md:gap-10">
                      <label class="label cursor-pointer justify-start gap-2">
                        <input
                          type="radio"
                          name="timbrature"
                          class="radio radio-primary"
                          :checked="timbratureType === 'primaUltima'"
                          @change="handleTimbratureChange('primaUltima')"
                          :disabled="saving"
                        />
                        <span class="label-text">Prima e Ultima Timbratura</span>
                      </label>
                      <label class="label cursor-pointer justify-start gap-2">
                        <input
                          type="radio"
                          name="timbrature"
                          class="radio radio-primary"
                          :checked="timbratureType === 'intermedia'"
                          @change="handleTimbratureChange('intermedia')"
                          :disabled="saving"
                        />
                        <span class="label-text">Timbratura Intermedia</span>
                      </label>
                      <label class="label cursor-pointer justify-start gap-2">
                        <input
                          type="radio"
                          name="timbrature"
                          class="radio radio-primary"
                          :checked="timbratureType === 'tutte'"
                          @change="handleTimbratureChange('tutte')"
                          :disabled="saving"
                        />
                        <span class="label-text">Tutte le Timbrature</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Entrata -->
                  <div class="bg-base-200 p-4 rounded-lg">
                    <h5 class="font-semibold mb-4">Entrata</h5>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">Tipo Arrotondamento Entrata</span>
                        </label>
                        <select
                          v-model="orarioForm.dettaglioOrario.orarioGen.tipoArrEnt"
                          class="select select-bordered w-full"
                          :disabled="saving"
                        >
                          <option value="">Seleziona...</option>
                          <option value="1">1 - Nessuno</option>
                          <option value="2">2 - Per Fascia</option>
                          <option value="3">3 - Per Timbratura</option>
                        </select>
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">Arrotondamento Entrata</span>
                        </label>
                        <input
                          v-model="orarioForm.dettaglioOrario.orarioGen.arrEntrata"
                          type="text"
                          placeholder="HH:MM"
                          class="input input-bordered w-full"
                          :disabled="saving"
                          @blur="(e) => handleTimeBlurForField('arrEntrata', (e.target as HTMLInputElement).value)"
                        />
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">Fine Diff. Entrata</span>
                        </label>
                        <input
                          v-model="orarioForm.dettaglioOrario.orarioGen.finDifEnt"
                          type="text"
                          placeholder="HH:MM"
                          class="input input-bordered w-full"
                          :disabled="saving"
                          @blur="(e) => handleTimeBlurForField('finDifEnt', (e.target as HTMLInputElement).value)"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Uscita -->
                  <div class="bg-base-200 p-4 rounded-lg">
                    <h5 class="font-semibold mb-4">Uscita</h5>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">Tipo Arrotondamento Uscita</span>
                        </label>
                        <select
                          v-model="orarioForm.dettaglioOrario.orarioGen.tipoArrUsc"
                          class="select select-bordered w-full"
                          :disabled="saving"
                        >
                          <option value="">Seleziona...</option>
                          <option value="1">1 - Nessuno</option>
                          <option value="2">2 - Per Fascia</option>
                          <option value="3">3 - Per Timbratura</option>
                        </select>
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">Arrotondamento Uscita</span>
                        </label>
                        <input
                          v-model="orarioForm.dettaglioOrario.orarioGen.arrUscita"
                          type="text"
                          placeholder="HH:MM"
                          class="input input-bordered w-full"
                          :disabled="saving"
                          @blur="(e) => handleTimeBlurForField('arrUscita', (e.target as HTMLInputElement).value)"
                        />
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">Fine Diff. Uscita</span>
                        </label>
                        <input
                          v-model="orarioForm.dettaglioOrario.orarioGen.finDifUsc"
                          type="text"
                          placeholder="HH:MM"
                          class="input input-bordered w-full"
                          :disabled="saving"
                          @blur="(e) => handleTimeBlurForField('finDifUsc', (e.target as HTMLInputElement).value)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mezza Giornata -->
              <div class="mt-8">
                <h4 class="font-semibold dark:text-gray-100 mb-4">Mezza Giornata</h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Mattina -->
                  <div class="bg-base-200 p-4 rounded-lg">
                    <h5 class="font-semibold mb-4">Mattina</h5>
                    <div class="space-y-4">
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control">
                          <label class="label">
                            <span class="label-text font-medium">Dalle</span>
                          </label>
                          <input
                            v-model="orarioForm.dettaglioOrario.orarioGen.mattDalle"
                            type="text"
                            placeholder="HH:MM"
                            class="input input-bordered w-full"
                            :disabled="saving"
                            @blur="(e) => handleTimeBlurForField('mattDalle', (e.target as HTMLInputElement).value)"
                            @input="calculateMattDurata"
                          />
                        </div>

                        <div class="form-control">
                          <label class="label">
                            <span class="label-text font-medium">Alle</span>
                          </label>
                          <input
                            v-model="orarioForm.dettaglioOrario.orarioGen.mattAlle"
                            type="text"
                            placeholder="HH:MM"
                            class="input input-bordered w-full"
                            :disabled="saving"
                            @blur="(e) => handleTimeBlurForField('mattAlle', (e.target as HTMLInputElement).value)"
                            @input="calculateMattDurata"
                          />
                        </div>

                        <div class="form-control">
                          <label class="label">
                            <span class="label-text font-medium">Durata (calcolata)</span>
                          </label>
                          <input
                            :value="formatTimeFromNumber(orarioForm.dettaglioOrario.orarioGen.mattDurata)"
                            type="text"
                            placeholder="HH:MM"
                            class="input input-bordered w-full bg-base-300"
                            disabled
                            readonly
                          />
                        </div>
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">Orario Mattino</span>
                        </label>
                        <GenericLookupInput
                          v-model="mattCodOraLookup"
                          :config="orarioLookupConfig"
                          :disabled="saving"
                          @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.mattCodOra = Number(value.codice) || 0"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Pomeriggio -->
                  <div class="bg-base-200 p-4 rounded-lg">
                    <h5 class="font-semibold mb-4">Pomeriggio</h5>
                    <div class="space-y-4">
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control">
                          <label class="label">
                            <span class="label-text font-medium">Dalle</span>
                          </label>
                          <input
                            v-model="orarioForm.dettaglioOrario.orarioGen.pomDalle"
                            type="text"
                            placeholder="HH:MM"
                            class="input input-bordered w-full"
                            :disabled="saving"
                            @blur="(e) => handleTimeBlurForField('pomDalle', (e.target as HTMLInputElement).value)"
                            @input="calculatePomDurata"
                          />
                        </div>

                        <div class="form-control">
                          <label class="label">
                            <span class="label-text font-medium">Alle</span>
                          </label>
                          <input
                            v-model="orarioForm.dettaglioOrario.orarioGen.pomAlle"
                            type="text"
                            placeholder="HH:MM"
                            class="input input-bordered w-full"
                            :disabled="saving"
                            @blur="(e) => handleTimeBlurForField('pomAlle', (e.target as HTMLInputElement).value)"
                            @input="calculatePomDurata"
                          />
                        </div>

                        <div class="form-control">
                          <label class="label">
                            <span class="label-text font-medium">Durata (calcolata)</span>
                          </label>
                          <input
                            :value="formatTimeFromNumber(orarioForm.dettaglioOrario.orarioGen.pomDurata)"
                            type="text"
                            placeholder="HH:MM"
                            class="input input-bordered w-full bg-base-300"
                            disabled
                            readonly
                          />
                        </div>
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium">Orario Pomeriggio</span>
                        </label>
                        <GenericLookupInput
                          v-model="pomCodOraLookup"
                          :config="orarioLookupConfig"
                          :disabled="saving"
                          @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.pomCodOra = Number(value.codice) || 0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Cambio Turno -->
            <div v-if="activeTab === 'cambioTurno'" class="space-y-8">
              <!-- Sezione Codici Orari -->
              <div>
                <h4 class="font-semibold dark:text-gray-100 mb-4">Codici Orari</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Orario Festivo</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOraFestLookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOraFest = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Orario Semifestivo</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOraSemiLookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOraSemi = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Orario Postfestivo</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOraPostLookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOraPost = Number(value.codice) || 0"
                    />
                  </div>
                </div>
              </div>

              <!-- Sezione Giorni della Settimana -->
              <div class="mt-8">
                <h4 class="font-semibold dark:text-gray-100 mb-4">Giorni della Settimana</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Lunedì</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOra1Lookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOra1 = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Martedì</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOra2Lookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOra2 = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Mercoledì</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOra3Lookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOra3 = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Giovedì</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOra4Lookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOra4 = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Venerdì</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOra5Lookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOra5 = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Sabato</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOra6Lookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOra6 = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Domenica</span>
                    </label>
                    <GenericLookupInput
                      v-model="codOra7Lookup"
                      :config="orarioLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codOra7 = Number(value.codice) || 0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Rol/Compensazioni -->
            <div v-if="activeTab === 'compensazioni'" class="space-y-8">
              <!-- Sezione Compensazioni -->
              <div>
                <h4 class="font-semibold dark:text-gray-100 mb-4">Compensazioni</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Gruppo Assenza</span>
                    </label>
                    <GenericLookupInput
                      v-model="codGrCauAssLookup"
                      :config="causaliLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codGrCauAss = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Gruppo Straordinari</span>
                    </label>
                    <GenericLookupInput
                      v-model="codGrCauStrLookup"
                      :config="causaliLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codGrCauStr = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Assenza Recuperata</span>
                    </label>
                    <GenericLookupInput
                      v-model="codCauRecAssLookup"
                      :config="causaliLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codCauRecAss = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Recupero Assenze</span>
                    </label>
                    <GenericLookupInput
                      v-model="codCauAssRecLookup"
                      :config="causaliLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codCauAssRec = Number(value.codice) || 0"
                    />
                  </div>
                </div>
              </div>

              <!-- Sezione ROL -->
              <div class="mt-8">
                <h4 class="font-semibold dark:text-gray-100 mb-4">ROL</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="form-control">
                    <GenericLookupInput
                      v-model="codRolLookup"
                      :config="causaleLookupConfig"
                      :disabled="saving"
                      @update:modelValue="(value) => orarioForm.dettaglioOrario.orarioGen.codRol = Number(value.codice) || 0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Valore ROL</span>
                    </label>
                    <input
                      v-model="orarioForm.dettaglioOrario.orarioGen.valoreRol"
                      type="text"
                      placeholder="HH:MM"
                      class="input input-bordered w-full"
                      :disabled="saving"
                      @blur="(e) => handleTimeBlurForField('valoreRol', (e.target as HTMLInputElement).value)"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Min. Ore Odinarie</span>
                    </label>
                    <input
                      v-model="orarioForm.dettaglioOrario.orarioGen.minOrd"
                      type="text"
                      placeholder="HH:MM"
                      class="input input-bordered w-full"
                      :disabled="saving"
                      @blur="(e) => handleTimeBlurForField('minOrd', (e.target as HTMLInputElement).value)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Fasce Orarie -->
            <div v-if="activeTab === 'fasceOrarie'" class="space-y-6">
              <EditableDataGrid
                v-model="orarioForm.dettaglioOrario.fasceOrarie"
                :columns="fasceOrarieColumns"
                title="Fasce Orarie"
                addButtonLabel="Aggiungi Fascia"
                :disabled="saving"
                :emptyRowTemplate="createEmptyFascia"
              />
            </div>
          </div>
        </div>

      </form>
    </template>
  </EditViewLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import EditViewLayout from '@/components/EditViewLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import EditableDataGrid from '@/components/EditableDataGrid.vue'
import type { GridColumn } from '@/components/EditableDataGrid.vue'
import GenericLookupInput from '@/components/GenericLookupInput.vue'
import { orariService, type OrarioList, type OrarioDettaglio } from '@/services/orariService'
import { useCrudView } from '@/composables/useCrudView'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useFormDirtyState } from '@/composables/useFormDirtyState'
import FormStatusIndicator from '@/components/FormStatusIndicator.vue'
import { causaleLookupConfig, causaliLookupConfig, tolleranzaLookupConfig, orarioLookupConfig } from '@/config/lookupConfigs'
import { lookupService } from '@/services/lookupService'

const route = useRoute()
const router = useRouter()

const {
  errorMessage,
  successMessage,
  clearMessages
} = useCrudView<OrarioList>(orariService, {
  entityName: 'Orario',
  idField: 'codOra',
  listRoute: '/app/orario',
  editRoute: '/app/orario',
  newRoute: '/app/orario/new'
})

useMessageAlerts(errorMessage, successMessage)

// State per il form
const orarioForm = ref<OrarioDettaglio>({
  codOra: 0,
  descrizione: '',
  abbreviazione: '',
  dettaglioOrario: {
    codGruppo: 0,
    orarioGen: {
      codOra: 0,
      codGruppo: 0,
      codRol: 0,
      valoreRol: 0,
      minOrd: 0,
      codGrCauAss: 0,
      codGrCauStr: 0,
      codCauRecAss: 0,
      codCauAssRec: 0,
      codCambio: 0,
      codOraFest: 0,
      codOraSemi: 0,
      codOraPost: 0,
      codOra1: 0,
      codOra2: 0,
      codOra3: 0,
      codOra4: 0,
      codOra5: 0,
      codOra6: 0,
      codOra7: 0,
      tipoOrario: '',
      oreXGg: 0,
      oreXAss: 0,
      oreXRiposo: 0,
      codCauFlexPos: 0,
      codCauFlexNeg: 0,
      codCauLavOrd: 0,
      oreCcnl: 0,
      percMaggD: 0,
      notturno: '',
      tipoNotte: '',
      tipoArroto: '',
      arrPrimaUlt: '',
      arrTimInt: '',
      tipoArrEnt: '',
      arrEntrata: 0,
      finDifEnt: 0,
      tipoArrUsc: '',
      arrUscita: 0,
      finDifUsc: 0,
      mattDalle: 0,
      mattAlle: 0,
      mattDurata: 0,
      pomDalle: 0,
      pomAlle: 0,
      pomDurata: 0,
      mattCodOra: 0,
      pomCodOra: 0
    },
    fasceOrarie: []
  }
})

const originalData = ref<OrarioDettaglio | null>(null)

const loading = ref(false)
const saving = ref(false)
const activeTab = ref('tipoOrario')

// Precarica dati per lookup
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const causaliData = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tolleranzeData = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gruppiCausaliData = ref<any[]>([])

// Ref per i lookup di Orario Mattino/Pomeriggio
const mattCodOraLookup = ref({ codice: '', descrizione: '' })
const pomCodOraLookup = ref({ codice: '', descrizione: '' })

// Ref per i lookup di Cambio Turno - Codici Orari
const codOraFestLookup = ref({ codice: '', descrizione: '' })
const codOraSemiLookup = ref({ codice: '', descrizione: '' })
const codOraPostLookup = ref({ codice: '', descrizione: '' })

// Ref per i lookup di Cambio Turno - Giorni della Settimana
const codOra1Lookup = ref({ codice: '', descrizione: '' }) // Lunedì
const codOra2Lookup = ref({ codice: '', descrizione: '' }) // Martedì
const codOra3Lookup = ref({ codice: '', descrizione: '' }) // Mercoledì
const codOra4Lookup = ref({ codice: '', descrizione: '' }) // Giovedì
const codOra5Lookup = ref({ codice: '', descrizione: '' }) // Venerdì
const codOra6Lookup = ref({ codice: '', descrizione: '' }) // Sabato
const codOra7Lookup = ref({ codice: '', descrizione: '' }) // Domenica

// Ref per i lookup di Rol/Compensazioni - Compensazioni (gruppo causale)
const codGrCauAssLookup = ref({ codice: '', descrizione: '' })
const codGrCauStrLookup = ref({ codice: '', descrizione: '' })
const codCauRecAssLookup = ref({ codice: '', descrizione: '' })
const codCauAssRecLookup = ref({ codice: '', descrizione: '' })

// Ref per i lookup di Rol/Compensazioni - ROL (causale)
const codRolLookup = ref({ codice: '', descrizione: '' })

// Ref per i lookup di Tipo Orario - Causali flessibilità
const codCauFlexPosLookup = ref({ codice: '', descrizione: '' })
const codCauFlexNegLookup = ref({ codice: '', descrizione: '' })
const codCauLavOrdLookup = ref({ codice: '', descrizione: '' })

const loadLookupData = async () => {
  try {
    const [causali, tolleranze, gruppiCausali] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lookupService.getList<any>('causale'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lookupService.getList<any>('tolleranza'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lookupService.getList<any>('gruppocausale')
    ])
    causaliData.value = causali
    tolleranzeData.value = tolleranze
    gruppiCausaliData.value = gruppiCausali
  } catch (error) {
    console.error('Errore caricamento lookup data:', error)
  }
}

const { isDirty, touchedFields, updateOriginalData } = useFormDirtyState(orarioForm, originalData, {
  confirmMessage: 'Ci sono modifiche non salvate all\'Orario. Sei sicuro di voler lasciare questa pagina?'
})

// Tabs configuration
const orarioTabs = [
  { key: 'tipoOrario', title: 'Tipo Orario', icon: 'clock' },
  { key: 'compensazioni', title: 'Rol/Compensazioni', icon: 'calendar-check' },
  { key: 'cambioTurno', title: 'Cambio Turno', icon: 'exchange-alt' },
  { key: 'fasceOrarie', title: 'Fasce Orarie', icon: 'list' }
]

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')

const isFormValid = computed(() => {
  return orarioForm.value.codOra > 0 &&
         orarioForm.value.descrizione.trim() !== ''
})

// Navigation configuration
const orarioNavigationConfig = {
  fetchAll: () => orariService.getAll(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEntityId: (entity: any) => String(entity.codOra),
  basePath: '/app/orario',
  entityType: 'orario',
  defaultSortField: 'codOra',
  defaultSortOrder: 1
}

// Configurazione colonne per Fasce Orarie con lookup
const fasceOrarieColumns = computed<GridColumn[]>(() => {
  const causaliArray = causaliData.value || []
  const tolleranzeArray = tolleranzeData.value || []

  return [
    {
      field: 'dalle',
      header: 'Dalle',
      type: 'time',
      width: '100px'
    },
    {
      field: 'alle',
      header: 'Alle',
      type: 'time',
      width: '100px'
    },
    {
      field: 'aut',
      header: 'Aut',
      type: 'text',
      width: '80px'
    },
    {
      field: 'codCau1',
      header: 'Causale 1',
      type: 'lookup',
      width: '150px',
      lookupConfig: causaleLookupConfig,
      lookupData: causaliArray
    },
    {
      field: 'codCau2',
      header: 'Causale 2',
      type: 'lookup',
      width: '150px',
      lookupConfig: causaleLookupConfig,
      lookupData: causaliArray
    },
    {
      field: 'codToll',
      header: 'Tolleranza',
      type: 'lookup',
      width: '150px',
      lookupConfig: tolleranzaLookupConfig,
      lookupData: tolleranzeArray
    },
    {
      field: 'nMax',
      header: 'N. Max',
      type: 'number',
      width: '100px'
    },
    {
      field: 'maxPausa',
      header: 'Max Pausa',
      type: 'number',
      width: '120px'
    },
    {
      field: 'codCauPausa',
      header: 'Causale Pausa',
      type: 'lookup',
      width: '150px',
      lookupConfig: causaleLookupConfig,
      lookupData: causaliArray
    },
    {
      field: 'minPresObbl',
      header: 'Min Pres. Obbl.',
      type: 'number',
      width: '150px'
    }
  ]
})

// Funzione per creare una fascia oraria vuota
const createEmptyFascia = () => {
  return {
    codOra: orarioForm.value.codOra,
    codGruppo: orarioForm.value.dettaglioOrario.codGruppo,
    progressivo: 0,
    dalle: '',
    alle: '',
    aut: '',
    codCau1: { codice: '', descrizione: '' },
    codCau2: { codice: '', descrizione: '' },
    codToll: { codice: '', descrizione: '' },
    nMax: 0,
    maxPausa: 0,
    codCauPausa: { codice: '', descrizione: '' },
    minPresObbl: 0
  }
}

// Helper functions per conversione tempo
const timeToMinutes = (time: string | number): number => {
  if (!time) return 0

  // Se è già un numero, ritorna direttamente
  if (typeof time === 'number') return time

  const timeStr = String(time).trim()
  if (!timeStr) return 0

  // Se contiene ':', è nel formato HH:MM
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(part => parseInt(part) || 0)
    return hours * 60 + minutes
  }

  // Altrimenti applica logica intelligente
  const numStr = timeStr.replace(/[^0-9]/g, '')
  if (!numStr) return 0

  const num = parseInt(numStr)

  // Se il numero è tra 0 e 23, è un'ora (es: 12 -> 12:00 -> 720)
  if (num >= 0 && num <= 23) {
    return num * 60
  }

  // Se il numero è tra 100 e 2359, è nel formato HHMM (es: 745 -> 7:45 -> 465)
  if (num >= 100 && num <= 2359) {
    const hours = Math.floor(num / 100)
    const minutes = num % 100
    if (minutes < 60) {
      return hours * 60 + minutes
    }
  }

  // Altrimenti considera come minuti
  return num
}

const minutesToTime = (minutes: number | string): string => {
  if (!minutes || minutes === 0 || minutes === '0') return ''
  const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes
  if (isNaN(mins)) return ''

  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${String(hours).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}`
}

const formatTimeFromNumber = (value: number | string): string => {
  if (!value && value !== 0) return ''
  return minutesToTime(value)
}

const handleTimeBlurForField = (fieldName: string, value: string) => {
  const orarioGen = orarioForm.value.dettaglioOrario.orarioGen as Record<string, unknown>

  if (!value || !value.trim()) {
    orarioGen[fieldName] = ''
    return
  }

  const minutes = timeToMinutes(value)
  const formattedTime = minutesToTime(minutes)
  orarioGen[fieldName] = formattedTime
}

// Calcola durata mattina
const calculateMattDurata = () => {
  const dalle = orarioForm.value.dettaglioOrario.orarioGen.mattDalle
  const alle = orarioForm.value.dettaglioOrario.orarioGen.mattAlle

  if (!dalle || !alle) {
    orarioForm.value.dettaglioOrario.orarioGen.mattDurata = 0
    return
  }

  const dalleMinutes = timeToMinutes(dalle)
  const alleMinutes = timeToMinutes(alle)

  if (alleMinutes > dalleMinutes) {
    orarioForm.value.dettaglioOrario.orarioGen.mattDurata = alleMinutes - dalleMinutes
  } else {
    orarioForm.value.dettaglioOrario.orarioGen.mattDurata = 0
  }
}

// Calcola durata pomeriggio
const calculatePomDurata = () => {
  const dalle = orarioForm.value.dettaglioOrario.orarioGen.pomDalle
  const alle = orarioForm.value.dettaglioOrario.orarioGen.pomAlle

  if (!dalle || !alle) {
    orarioForm.value.dettaglioOrario.orarioGen.pomDurata = 0
    return
  }

  const dalleMinutes = timeToMinutes(dalle)
  const alleMinutes = timeToMinutes(alle)

  if (alleMinutes > dalleMinutes) {
    orarioForm.value.dettaglioOrario.orarioGen.pomDurata = alleMinutes - dalleMinutes
  } else {
    orarioForm.value.dettaglioOrario.orarioGen.pomDurata = 0
  }
}

// Computed property per determinare il tipo di timbrature selezionato
const timbratureType = computed(() => {
  const arrPrimaUlt = orarioForm.value.dettaglioOrario.orarioGen.arrPrimaUlt
  const arrTimInt = orarioForm.value.dettaglioOrario.orarioGen.arrTimInt

  // Se entrambi sono 'S', è "tutte"
  if (arrPrimaUlt === 'S' && arrTimInt === 'S') {
    return 'tutte'
  }
  // Se solo arrPrimaUlt è 'S', è "primaUltima"
  if (arrPrimaUlt === 'S') {
    return 'primaUltima'
  }
  // Se solo arrTimInt è 'S', è "intermedia"
  if (arrTimInt === 'S') {
    return 'intermedia'
  }
  // Default
  return 'primaUltima'
})

// Handler per il cambio dei radio button delle timbrature
const handleTimbratureChange = (type: 'primaUltima' | 'intermedia' | 'tutte') => {
  const orarioGen = orarioForm.value.dettaglioOrario.orarioGen

  switch (type) {
    case 'primaUltima':
      orarioGen.arrPrimaUlt = 'S'
      orarioGen.arrTimInt = 'N'
      break
    case 'intermedia':
      orarioGen.arrPrimaUlt = 'N'
      orarioGen.arrTimInt = 'S'
      break
    case 'tutte':
      orarioGen.arrPrimaUlt = 'S'
      orarioGen.arrTimInt = 'S'
      break
  }
}

// Methods
const loadOrario = async () => {
  if (!isEditMode.value) return

  const codOra = Number(route.params.id)
  loading.value = true

  try {
    const dettaglio = await orariService.getDettaglioOrario(codOra)

    if (!dettaglio.dettaglioOrario) {
      dettaglio.dettaglioOrario = {
        codGruppo: 0,
        orarioGen: {
          codOra: 0,
          codGruppo: 0,
          codRol: 0,
          valoreRol: 0,
          minOrd: 0,
          codGrCauAss: 0,
          codGrCauStr: 0,
          codCauRecAss: 0,
          codCauAssRec: 0,
          codCambio: 0,
          codOraFest: 0,
          codOraSemi: 0,
          codOraPost: 0,
          codOra1: 0,
          codOra2: 0,
          codOra3: 0,
          codOra4: 0,
          codOra5: 0,
          codOra6: 0,
          codOra7: 0,
          tipoOrario: '',
          oreXGg: 0,
          oreXAss: 0,
          oreXRiposo: 0,
          codCauFlexPos: 0,
          codCauFlexNeg: 0,
          codCauLavOrd: 0,
          oreCcnl: 0,
          percMaggD: 0,
          notturno: '',
          tipoNotte: '',
          tipoArroto: '',
          arrPrimaUlt: '',
          arrTimInt: '',
          tipoArrEnt: '',
          arrEntrata: 0,
          finDifEnt: 0,
          tipoArrUsc: '',
          arrUscita: 0,
          finDifUsc: 0,
          mattDalle: 0,
          mattAlle: 0,
          mattDurata: 0,
          pomDalle: 0,
          pomAlle: 0,
          pomDurata: 0,
          mattCodOra: 0,
          pomCodOra: 0
        },
        fasceOrarie: []
      }
    }

    orarioForm.value = JSON.parse(JSON.stringify(dettaglio))
    updateOriginalData(orarioForm.value)

    // Carica i lookup per mattCodOra e pomCodOra
    await loadOrarioLookups()
  } catch {
    errorMessage.value = 'Errore nel caricamento dell\'orario dal backend'
  } finally {
    loading.value = false
  }
}

// Funzione per caricare i lookup degli orari (mattino/pomeriggio)
const loadOrarioLookups = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orariList = await lookupService.getList<any>('orario')

    // Popola mattCodOraLookup
    if (orarioForm.value.dettaglioOrario.orarioGen.mattCodOra) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mattOrario = orariList.find((o: any) => Number(o.CODORA) === orarioForm.value.dettaglioOrario.orarioGen.mattCodOra)
      if (mattOrario) {
        mattCodOraLookup.value = {
          codice: String(mattOrario.CODORA),
          descrizione: mattOrario.DESCRIZIONE || ''
        }
      }
    }

    // Popola pomCodOraLookup
    if (orarioForm.value.dettaglioOrario.orarioGen.pomCodOra) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pomOrario = orariList.find((o: any) => Number(o.CODORA) === orarioForm.value.dettaglioOrario.orarioGen.pomCodOra)
      if (pomOrario) {
        pomCodOraLookup.value = {
          codice: String(pomOrario.CODORA),
          descrizione: pomOrario.DESCRIZIONE || ''
        }
      }
    }

    // Popola lookup per Cambio Turno - Codici Orari
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadLookupForField = (codOra: number, lookupRef: any) => {
      if (codOra) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orario = orariList.find((o: any) => Number(o.CODORA) === codOra)
        if (orario) {
          lookupRef.value = {
            codice: String(orario.CODORA),
            descrizione: orario.DESCRIZIONE || ''
          }
        }
      }
    }

    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOraFest, codOraFestLookup)
    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOraSemi, codOraSemiLookup)
    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOraPost, codOraPostLookup)

    // Popola lookup per Cambio Turno - Giorni della Settimana
    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOra1, codOra1Lookup)
    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOra2, codOra2Lookup)
    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOra3, codOra3Lookup)
    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOra4, codOra4Lookup)
    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOra5, codOra5Lookup)
    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOra6, codOra6Lookup)
    loadLookupForField(orarioForm.value.dettaglioOrario.orarioGen.codOra7, codOra7Lookup)

    // Popola lookup per Rol/Compensazioni - Compensazioni (gruppi causali)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadGruppoCausaleForField = (codGruppo: number, lookupRef: any) => {
      if (codGruppo) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gruppoCausale = gruppiCausaliData.value.find((g: any) => Number(g.CODGRCAU) === codGruppo)
        if (gruppoCausale) {
          lookupRef.value = {
            codice: String(gruppoCausale.CODGRCAU),
            descrizione: gruppoCausale.DESCRIZIONE || ''
          }
        }
      }
    }

    loadGruppoCausaleForField(orarioForm.value.dettaglioOrario.orarioGen.codGrCauAss, codGrCauAssLookup)
    loadGruppoCausaleForField(orarioForm.value.dettaglioOrario.orarioGen.codGrCauStr, codGrCauStrLookup)
    loadGruppoCausaleForField(orarioForm.value.dettaglioOrario.orarioGen.codCauRecAss, codCauRecAssLookup)
    loadGruppoCausaleForField(orarioForm.value.dettaglioOrario.orarioGen.codCauAssRec, codCauAssRecLookup)

    // Popola lookup per Rol/Compensazioni - ROL (causale)
    if (orarioForm.value.dettaglioOrario.orarioGen.codRol) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const causale = causaliData.value.find((c: any) => Number(c.CODCAU) === orarioForm.value.dettaglioOrario.orarioGen.codRol)
      if (causale) {
        codRolLookup.value = {
          codice: String(causale.CODCAU),
          descrizione: causale.DESCRIZIONE || ''
        }
      }
    }

    // Popola lookup per Tipo Orario - Causali flessibilità
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadCausaleForField = (codCausale: number, lookupRef: any) => {
      if (codCausale) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const causale = causaliData.value.find((c: any) => Number(c.CODCAU) === codCausale)
        if (causale) {
          lookupRef.value = {
            codice: String(causale.CODCAU),
            descrizione: causale.DESCRIZIONE || ''
          }
        }
      }
    }

    loadCausaleForField(orarioForm.value.dettaglioOrario.orarioGen.codCauFlexPos, codCauFlexPosLookup)
    loadCausaleForField(orarioForm.value.dettaglioOrario.orarioGen.codCauFlexNeg, codCauFlexNegLookup)
    loadCausaleForField(orarioForm.value.dettaglioOrario.orarioGen.codCauLavOrd, codCauLavOrdLookup)
  } catch (error) {
    console.error('Errore caricamento lookup orari:', error)
  }
}

const goBack = () => {
  router.push('/app/orario')
}

const handleSave = async () => {
  if (!isFormValid.value) return

  saving.value = true
  clearMessages()

  try {
    if (isEditMode.value) {
      await orariService.updateOrario(orarioForm.value)
      updateOriginalData(orarioForm.value)
      successMessage.value = 'Orario aggiornato con successo'
    } else {
      await orariService.createOrario(orarioForm.value)
      successMessage.value = 'Nuovo Orario creato con successo'

      setTimeout(() => {
        router.push(`/app/orario/${orarioForm.value.codOra}/edit`)
      }, 1500)
    }

    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio dell\'Orario'
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  clearMessages()

  try {
    await orariService.deleteOrario(
      orarioForm.value.codOra,
      orarioForm.value.dettaglioOrario.codGruppo
    )
    successMessage.value = 'Orario eliminato con successo'

    setTimeout(() => {
      router.push('/app/orario')
    }, 1500)

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione dell\'Orario'
  }
}

const handleDuplicate = () => {
  const duplicatedOrario = JSON.parse(JSON.stringify(orarioForm.value))
  duplicatedOrario.codOra = 0

  sessionStorage.setItem('duplicatedOrario', JSON.stringify(duplicatedOrario))
  router.push('/app/orario/new')
}

const handleReset = () => {
  clearMessages()
  if (isEditMode.value) {
    loadOrario()
  } else {
    const duplicatedData = sessionStorage.getItem('duplicatedOrario')
    if (duplicatedData) {
      orarioForm.value = JSON.parse(duplicatedData)
      sessionStorage.removeItem('duplicatedOrario')
    } else {
      orarioForm.value = {
        codOra: 0,
        descrizione: '',
        abbreviazione: '',
        dettaglioOrario: {
          codGruppo: 0,
          orarioGen: {
            codOra: 0,
            codGruppo: 0,
            codRol: 0,
            valoreRol: 0,
            minOrd: 0,
            codGrCauAss: 0,
            codGrCauStr: 0,
            codCauRecAss: 0,
            codCauAssRec: 0,
            codCambio: 0,
            codOraFest: 0,
            codOraSemi: 0,
            codOraPost: 0,
            codOra1: 0,
            codOra2: 0,
            codOra3: 0,
            codOra4: 0,
            codOra5: 0,
            codOra6: 0,
            codOra7: 0,
            tipoOrario: '',
            oreXGg: 0,
            oreXAss: 0,
            oreXRiposo: 0,
            codCauFlexPos: 0,
            codCauFlexNeg: 0,
            codCauLavOrd: 0,
            oreCcnl: 0,
            percMaggD: 0,
            notturno: '',
            tipoNotte: '',
            tipoArroto: '',
            arrPrimaUlt: '',
            arrTimInt: '',
            tipoArrEnt: '',
            arrEntrata: 0,
            finDifEnt: 0,
            tipoArrUsc: '',
            arrUscita: 0,
            finDifUsc: 0,
            mattDalle: 0,
            mattAlle: 0,
            mattDurata: 0,
            pomDalle: 0,
            pomAlle: 0,
            pomDurata: 0,
            mattCodOra: 0,
            pomCodOra: 0
          },
          fasceOrarie: []
        }
      }
    }
    updateOriginalData(orarioForm.value)
  }
}

// Inizializzazione
onMounted(async () => {
  // Carica i dati per le lookup prima di tutto
  await loadLookupData()

  if (isEditMode.value) {
    await loadOrario()
  } else {
    const duplicatedData = sessionStorage.getItem('duplicatedOrario')
    if (duplicatedData) {
      orarioForm.value = JSON.parse(duplicatedData)
      sessionStorage.removeItem('duplicatedOrario')
    }
    updateOriginalData(orarioForm.value)
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    clearMessages()

    if (isEditMode.value) {
      await loadOrario()
    } else {
      handleReset()
    }
  }
}, { immediate: true })
</script>

<style scoped>
.border-primary {
  border-color: oklch(var(--p));
}

.text-primary {
  color: oklch(var(--p));
}

input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-outline:hover {
  color: white !important;
}
</style>
