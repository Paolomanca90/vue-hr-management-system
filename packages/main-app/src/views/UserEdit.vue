<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header con breadcrumb -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex flex-col-reverse lg:flex-row lg:items-center lg:justify-between gap-3">
          <div class="max-md:block">
            <h1 class="text-3xl font-bold text-base-content">
              {{ isEditMode ? 'Modifica Utente' : 'Nuovo Utente' }}
            </h1>
            <p class="text-base-content/70 mt-1">
              {{ isEditMode ? `Modifica i dati dell'utente: ${userForm.username}` : 'Inserisci i dati del nuovo utente' }}
            </p>
          </div>

          <div>
            <button
              class="btn btn-ghost btn-sm"
              @click="goBack"
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
      <span class="ml-3">Caricamento dati utente...</span>
    </div>

    <!-- Messaggio di errore globale -->
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
              <!-- Navigazione utenti (solo in modalità modifica) -->
              <div v-if="isEditMode" class="flex items-center max-md:justify-center space-x-2">
                <button
                  type="button"
                  class="btn btn-primary btn-outline btn-sm"
                  @click="navigateToPreviousUser"
                  :disabled="saving || !hasPreviousUser"
                  title="Utente precedente"
                >
                  <FaIcon icon="chevron-left" />
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-outline btn-sm"
                  @click="navigateToNextUser"
                  :disabled="saving || !hasNextUser"
                  title="Utente successivo"
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
                  {{ isEditMode ? 'Salva' : 'Crea Utente' }}
                </span>
              </button>

              <button
                v-if="isEditMode"
                type="button"
                class="btn btn-primary btn-outline btn-sm"
                @click="duplicateCurrentUser"
                :disabled="saving"
              >
                <FaIcon icon="copy" class="mr-2"/>
                Duplica
              </button>

              <button
                v-if="isEditMode"
                type="button"
                class="btn btn-error btn-outline btn-sm"
                @click="deleteCurrentUser"
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
                <FaIcon icon="user" class="text-primary text-lg" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content">Informazioni Base</h3>
                <p class="text-sm text-base-content/70">Dati principali e configurazione dell'utente</p>
              </div>
            </div>

            <!-- Pulsanti azioni rapide (se in modalità modifica) -->
            <!-- <div v-if="isEditMode" class="flex items-center space-x-2">
              <button
                type="button"
                class="btn btn-info btn-sm"
                @click="showUserPreview"
                :disabled="saving"
              >
                <FaIcon icon="eye" class="mr-1"/>
                Visualizza
              </button>
              <button
                type="button"
                class="btn btn-warning btn-sm"
                @click="togglePasswordSection"
              >
                <FaIcon icon="key" class="mr-1"/>
                Cambio Password
              </button>
              <button
                type="button"
                class="btn btn-error btn-sm"
                @click="disableUser"
                :disabled="saving"
              >
                <FaIcon icon="ban" class="mr-1"/>
                Disabilita Utente
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                @click="showNotesAccess"
              >
                <FaIcon icon="sticky-note" class="mr-1"/>
                Note Accesso
              </button>
            </div> -->
          </div>

          <div class="grid grid-cols-1 gap-2">
            <!-- Prima riga -->
            <div class="grid lg:grid-cols-2 gap-4">
              <!-- Username -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Username *</span>
                </label>
                <input
                  type="text"
                  v-model="userForm.username"
                  :class="{
                    'input-error': submitted && !userForm.username
                  }"
                  class="input input-bordered w-full"
                  placeholder="Inserisci username"
                  required
                  autocomplete="username"
                  :disabled="isEditMode"
                />
                <div v-if="submitted && !userForm.username" class="label">
                  <span class="label-text-alt text-error">Username richiesto</span>
                </div>
              </div>

              <!-- Nome Completo -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Nome Completo *</span>
                </label>
                <input
                  type="text"
                  v-model="userForm.nomecompleto"
                  :class="{ 'input-error': submitted && !userForm.nomecompleto }"
                  class="input input-bordered w-full"
                  placeholder="Inserisci nome completo"
                  required
                />
                <div v-if="submitted && !userForm.nomecompleto" class="label">
                  <span class="label-text-alt text-error">Nome completo richiesto</span>
                </div>
              </div>

              <!-- <div class="col-span-2 grid grid-cols-3 gap-4"> -->
                  <!-- Disabilita dopo -->
                  <!-- <div class="form-control">
                      <div class="flex items-center space-x-2">
                        <label class="label">
                          <span class="label-text font-medium">Disabilita dopo</span>
                        </label>
                        <input
                            type="number"
                            v-model.number="userForm.disabilitaDopo"
                            class="input input-bordered w-20"
                            min="0"
                            max="99"
                        />
                        <span class="text-sm text-base-content/60">Mesi di mancato utilizzo</span>
                    </div>
                  </div>
     -->
                  <!-- Cambio Password ogni -->
                  <!-- <div class="form-control">
                      <div class="flex items-center space-x-2">
                        <label class="label">
                            <span class="label-text font-medium">Cambio Password ogni</span>
                        </label>
                        <input
                            type="number"
                            v-model.number="userForm.cambioPasswordOgni"
                            class="input input-bordered w-20"
                            min="0"
                            max="99"
                        />
                        <span class="text-sm text-base-content/60">Mesi</span>
                    </div>
                  </div> -->

                  <!-- Monitorare -->
                  <!-- <div class="form-control justify-center">
                    <div class="flex items-center">
                        <label class="label justify-start cursor-pointer space-x-2">
                            <span class="label-text font-medium">Monitorare</span>
                            <input
                              type="checkbox"
                              v-model="userForm.monitorarePassword"
                              class="checkbox checkbox-sm"
                            />
                        </label>
                    </div>
                  </div>
              </div> -->
            </div>

            <!-- Seconda riga -->
            <div class="grid lg:grid-cols-2 gap-4">
              <!-- Gruppo Utenti -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Gruppo Utenti</span>
                </label>
                <select
                  v-model="userForm.codgruppo"
                  class="select select-bordered w-full"
                >
                  <option value="">Seleziona gruppo</option>
                  <option
                    v-for="gruppo in availableGroups"
                    :key="gruppo.value"
                    :value="gruppo.value"
                  >
                    {{ gruppo.label }}
                  </option>
                </select>
              </div>

              <!-- Codice Accesso -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Codice Accesso</span>
                </label>
                <select
                  v-model="userForm.codaccesso"
                  class="select select-bordered w-full"
                >
                  <option value="">Seleziona codice accesso</option>
                  <option
                    v-for="accesso in availableAccessCodes"
                    :key="accesso.value"
                    :value="accesso.value"
                  >
                    {{ accesso.label }}
                  </option>
                </select>
              </div>

              <!-- Famiglia Utenti -->
              <!-- <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Famiglia Utenti</span>
                </label>
                <select
                  v-model="userForm.famigliaUtenti"
                  class="select select-bordered w-full"
                >
                  <option value="">Nessuno</option>
                  <option
                    v-for="famiglia in famigliaUtentiOptions"
                    :key="famiglia.value"
                    :value="famiglia.value"
                  >
                    {{ famiglia.label }}
                  </option>
                </select>
              </div> -->

              <!-- Controllo Periodi -->
              <!-- <div class="form-control">
                <label class="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    v-model="userForm.controlloPeriodi"
                    class="checkbox mr-3"
                  />
                  <span class="label-text font-medium">Controllo Periodi</span>
                </label> -->

                <!-- Campi dipendenti dal controllo periodi -->
                <!-- <div v-if="userForm.controlloPeriodi" class="mt-3 space-y-3 ml-6">
                  <div class="flex items-center space-x-3">
                    <label class="text-sm font-medium w-24">Mesi Precedenti</label>
                    <input
                      type="number"
                      v-model.number="userForm.mesiPrecedenti"
                      class="input input-bordered input-sm w-20"
                      min="0"
                      max="99"
                    />
                  </div>
                  <div class="flex items-center space-x-3">
                    <label class="text-sm font-medium w-24">Dal Giorno</label>
                    <input
                      type="date"
                      v-model="userForm.dalGiorno"
                      class="input input-bordered input-sm"
                    />
                  </div>
                </div>
              </div> -->
            </div>

            <!-- Terza riga -->
            <div class="grid lg:grid-cols-2 gap-4">
              <!-- Lingua -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Lingua *</span>
                </label>
                <select
                  v-model="userForm.iD_LINGUA"
                  class="select select-bordered w-full"
                  :class="{ 'input-error': submitted && !userForm.iD_LINGUA }"
                  required
                >
                  <option value="">Seleziona lingua</option>
                  <option
                    v-for="gruppo in availableLingue"
                    :key="gruppo.value"
                    :value="gruppo.value"
                  >
                    {{ gruppo.label }}
                  </option>
                </select>
                <div v-if="submitted && !userForm.iD_LINGUA" class="label">
                  <span class="label-text-alt text-error">Lingua richiesta</span>
                </div>
              </div>

              <!-- Impostazioni Internazionali -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Impost. Internazionale *</span>
                </label>
                <select
                  v-model="userForm.iD_INTER"
                  class="select select-bordered w-full"
                  :class="{ 'input-error': submitted && !userForm.iD_INTER }"
                  required
                >
                  <option value="">Seleziona impost. internazionale</option>
                  <option
                    v-for="gruppo in availableImpostazioniInternazionali"
                    :key="gruppo.value"
                    :value="gruppo.value"
                  >
                    {{ gruppo.label }}
                  </option>
                </select>
                <div v-if="submitted && !userForm.iD_INTER" class="label">
                  <span class="label-text-alt text-error">Impost. Internazionale richiesta</span>
                </div>
              </div>

              <!-- Tipo Utente -->
              <!-- <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Tipo Utente</span>
                </label>
                <select
                  v-model="userForm.tipoUtente"
                  class="select select-bordered w-full"
                >
                  <option value="">Nessuno</option>
                  <option value="ADMIN">Amministratore</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EMPLOYEE">Dipendente</option>
                  <option value="CONSULTANT">Consulente</option>
                  <option value="GUEST">Ospite</option>
                </select>
              </div> -->
            </div>
          </div>
          <div class="text-sm text-base-content/60 mt-4">
            * Campi obbligatori
          </div>
        </div>
      </div>

      <!-- Sezione Password (solo per nuovo utente o reset) -->
      <!-- <div v-if="!isEditMode || showPasswordSection" class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-2 mr-3">
                <FaIcon icon="key" class="text-yellow-600 text-lg" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content">
                  {{ isEditMode ? 'Reset Password' : 'Impostazioni Password' }}
                </h3>
                <p class="text-sm text-base-content/70">
                  {{ isEditMode ? 'Modifica la password dell\'utente' : 'Imposta la password iniziale' }}
                </p>
              </div>
            </div>

            <div v-if="isEditMode">
              <button
                type="button"
                class="btn btn-warning btn-sm"
                @click="togglePasswordSection"
              >
                <FaIcon :icon="showPasswordSection ? 'eye-slash' : 'key'" class="mr-2"/>
                {{ showPasswordSection ? 'Annulla Reset' : 'Reset Password' }}
              </button>
            </div>
          </div>

          Password form sections would go here...
        </div>
      </div> -->

      <!-- Sezione Analytics -->
      <!-- <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center mb-4">
            <div class="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-2 mr-3">
              <FaIcon icon="chart-line" class="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-base-content">Sezione Analytics</h3>
              <p class="text-sm text-base-content/70">Configurazione Analytics e Autenticazione Integrata</p>
            </div>
          </div>

          Analytics controls would go here...
        </div>
      </div> -->

      <!-- Sezione Abilitazioni Menu/Tabelle -->
      <div v-if="authStore.isCompanyUser" class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex flex-col lg:flex-row items-center justify-between mb-4 gap-3">
            <div class="flex w-full items-center">
              <div class="p-2 mr-3">
                <FaIcon icon="table" class="text-lg" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content">Abilitazioni Menu e Tabelle</h3>
                <p class="text-sm text-base-content/70">Configura i permessi specifici per ogni sezione</p>
              </div>
            </div>

            <!-- Azioni rapide -->
            <div class="w-full flex flex-col lg:flex-row lg:items-center lg:justify-end gap-2">
              <button
                type="button"
                class="max-md:block max-md:w-full btn btn-sm btn-ghost"
                @click="selectAllPermissions"
              >
                <FaIcon icon="check-circle" class="mr-1"/>
                Seleziona Tutto
              </button>
              <button
                type="button"
                class="max-md:block max-md:w-full btn btn-sm btn-ghost"
                @click="deselectAllPermissions"
              >
                <FaIcon icon="times-circle" class="mr-1"/>
                Deseleziona Tutto
              </button>
              <button
                type="button"
                class="max-md:block max-md:w-full btn btn-sm btn-ghost"
                @click="refreshPermissions"
                :disabled="loadingPermissions"
              >
                <FaIcon icon="refresh" class="mr-1"/>
                Ricarica
              </button>
            </div>
          </div>

          <!-- Filtro ricerca -->
          <div class="mb-4">
            <div class="form-control">
              <div class="relative">
                <input
                  type="text"
                  v-model="permissionSearchQuery"
                  placeholder="Cerca tabelle o funzionalità..."
                  class="input input-bordered input-sm w-full pr-10"
                />
                <FaIcon
                  icon="search"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Loading permessi -->
          <div v-if="loadingPermissions" class="flex justify-center items-center py-8">
            <span class="loading loading-spinner loading-md"></span>
            <span class="ml-3 text-sm">Caricamento permessi...</span>
          </div>

          <!-- Errore permessi -->
          <div v-else-if="permissionsError" class="alert alert-warning">
            <FaIcon icon="exclamation-triangle" />
            <div>
              <div class="font-bold">Errore nel caricamento dei permessi</div>
              <div class="text-sm">{{ permissionsError }}</div>
              <button class="btn btn-xs btn-ghost mt-1" @click="refreshPermissions">
                Riprova
              </button>
            </div>
          </div>

          <!-- Struttura ad albero orizzontale -->
          <div v-else class="grid grid-cols-12 gap-4 h-96">

            <!-- Colonna 1: Categorie principali -->
            <div class="col-span-12 lg:col-span-3 border border-base-300 rounded-lg p-2 overflow-y-auto">
              <div class="text-sm font-semibold mb-2 text-base-content/70 flex items-center justify-between">
                <span>Categorie</span>
                <span v-if="permissionSearchQuery" class="badge badge-primary badge-xs">
                  {{ filteredPermissionCategories.length }}
                </span>
              </div>

              <!-- Messaggio quando la ricerca non trova risultati -->
              <div v-if="permissionSearchQuery && filteredPermissionCategories.length === 0"
                  class="text-center py-4 text-base-content/60">
                <FaIcon icon="search" class="text-lg mb-2" />
                <div class="text-xs">Nessun risultato trovato</div>
              </div>

              <div v-else class="space-y-1">
                <div
                  v-for="category in filteredPermissionCategories"
                  :key="category.id"
                  class="p-2 rounded cursor-pointer transition-colors hover:bg-base-200"
                  :class="{ 'bg-primary/10 text-primary': selectedCategoryId === category.id }"
                  @click="selectCategory(category)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1 min-w-0">
                      <FaIcon :icon="category.icona || 'folder'" class="mr-2 text-sm flex-shrink-0" />
                      <span
                        class="text-sm font-medium truncate"
                        v-html="highlightSearchTerm(category.nome, permissionSearchQuery)"
                      ></span>
                    </div>
                    <div class="flex items-center space-x-1 ml-2">
                      <span class="badge badge-xs">{{ category.figli?.length || 0 }}</span>
                      <FaIcon
                        v-if="permissionSearchQuery && hasMatchingChildren(category, permissionSearchQuery)"
                        icon="search"
                        class="text-primary text-xs"
                        title="Contiene risultati di ricerca"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Colonna 2: Sottocategorie (se presenti) -->
            <div
              v-if="selectedCategory && (selectedCategory.figli?.length > 0 || permissionSearchQuery)"
              class="col-span-12 lg:col-span-3 border border-base-300 rounded-lg p-2 overflow-y-auto"
            >
              <div class="text-sm font-semibold mb-2 text-base-content/70 flex items-center justify-between">
                <span>Sottocategorie di {{ selectedCategory.nome }}</span>
                <span v-if="permissionSearchQuery" class="badge badge-primary badge-xs">
                  {{ filteredSubcategories.length }}
                </span>
              </div>

              <!-- Messaggio per sottocategorie filtrate -->
              <div v-if="permissionSearchQuery && filteredSubcategories.length === 0"
                  class="text-center py-4 text-base-content/60">
                <div class="text-xs">Nessun risultato in questa sezione</div>
              </div>

              <div v-else class="space-y-1">
                <div
                  v-for="subcategory in filteredSubcategories"
                  :key="subcategory.id"
                  class="p-2 rounded cursor-pointer transition-colors hover:bg-base-200"
                  :class="{ 'bg-primary/10 text-primary': selectedSubcategoryId === subcategory.id }"
                  @click="selectSubcategory(subcategory)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1 min-w-0">
                      <FaIcon :icon="subcategory.icona || 'folder'" class="mr-2 text-sm flex-shrink-0" />
                      <span
                        class="text-sm font-medium truncate"
                        v-html="highlightSearchTerm(subcategory.nome, permissionSearchQuery)"
                      ></span>
                    </div>
                    <div class="flex items-center space-x-1 ml-2">
                      <span class="badge badge-xs">{{ subcategory.figli?.length || 0 }}</span>
                      <FaIcon
                        v-if="permissionSearchQuery && hasMatchingChildren(subcategory, permissionSearchQuery)"
                        icon="search"
                        class="text-primary text-xs"
                        title="Contiene risultati di ricerca"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Colonna 3: Terzo livello (se presenti) -->
            <div
              v-if="selectedSubcategory && (selectedSubcategory.figli?.length > 0 || permissionSearchQuery)"
              class="col-span-12 lg:col-span-3 border border-base-300 rounded-lg p-2 overflow-y-auto"
            >
              <div class="text-sm font-semibold mb-2 text-base-content/70 flex items-center justify-between">
                <span>Sottosezioni di {{ selectedSubcategory.nome }}</span>
                <span v-if="permissionSearchQuery" class="badge badge-primary badge-xs">
                  {{ filteredSubSubcategories.length }}
                </span>
              </div>

              <!-- Messaggio per sotto-sottocategorie filtrate -->
              <div v-if="permissionSearchQuery && filteredSubSubcategories.length === 0"
                  class="text-center py-4 text-base-content/60">
                <div class="text-xs">Nessun risultato in questa sezione</div>
              </div>

              <div v-else class="space-y-1">
                <div
                  v-for="subsubcategory in filteredSubSubcategories"
                  :key="subsubcategory.id"
                  class="p-2 rounded cursor-pointer transition-colors hover:bg-base-200"
                  :class="{ 'bg-primary/10 text-primary': selectedSubSubcategoryId === subsubcategory.id }"
                  @click="selectSubSubcategory(subsubcategory)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1 min-w-0">
                      <FaIcon :icon="subsubcategory.icona || 'folder'" class="mr-2 text-sm flex-shrink-0" />
                      <span
                        class="text-sm font-medium truncate"
                        v-html="highlightSearchTerm(subsubcategory.nome, permissionSearchQuery)"
                      ></span>
                    </div>
                    <div class="flex items-center space-x-1 ml-2">
                      <span class="badge badge-xs">{{ subsubcategory.figli?.length || 0 }}</span>
                      <FaIcon
                        v-if="permissionSearchQuery && hasMatchingChildren(subsubcategory, permissionSearchQuery)"
                        icon="search"
                        class="text-primary text-xs"
                        title="Contiene risultati di ricerca"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Colonna 4: Permessi finali -->
            <div class="col-span-12 lg:col-span-3 border border-base-300 rounded-lg p-2 overflow-y-auto">
              <div class="text-sm font-semibold mb-2 text-base-content/70 flex items-center justify-between">
                <span>Permessi</span>
                <div class="flex items-center space-x-2">
                  <span v-if="permissionSearchQuery" class="badge badge-primary badge-xs">
                    {{ currentPermissionItems.length }}
                  </span>
                  <div class="flex items-center space-x-1 text-xs">
                    <span>Vis.</span>
                    <span>Mod.</span>
                  </div>
                </div>
              </div>

              <div v-if="currentPermissionItems.length === 0" class="text-center py-8 text-base-content/60">
                <FaIcon icon="info-circle" class="text-2xl mb-2" />
                <div class="text-sm">
                  {{ permissionSearchQuery ? 'Nessun permesso trovato' : 'Seleziona una categoria per vedere i permessi' }}
                </div>
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="item in currentPermissionItems"
                  :key="item.id"
                  class="p-2 border border-base-200 rounded text-sm transition-colors hover:bg-base-50"
                  :class="{ 'ring-2 ring-primary/20': permissionSearchQuery && item.nome.toLowerCase().includes(permissionSearchQuery.toLowerCase()) }"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1 min-w-0">
                      <FaIcon :icon="item.icona || 'file'" class="mr-2 text-xs flex-shrink-0" />
                      <span
                        class="font-medium truncate"
                        v-html="highlightSearchTerm(item.nome, permissionSearchQuery)"
                      ></span>
                    </div>
                    <div class="flex items-center space-x-2 ml-2">
                      <!-- Visualizza -->
                      <input
                        type="checkbox"
                        v-model="userPermissions[item.id].visualizza"
                        class="checkbox checkbox-success checkbox-xs"
                        @change="onPermissionChange(item.id, 'visualizza')"
                        :title="'Visualizza ' + item.nome"
                      />
                      <!-- Modifica -->
                      <input
                        type="checkbox"
                        v-model="userPermissions[item.id].modifica"
                        :disabled="!userPermissions[item.id].visualizza"
                        class="checkbox checkbox-warning checkbox-xs"
                        @change="onPermissionChange(item.id, 'modifica')"
                        :title="'Modifica ' + item.nome"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Riepilogo permessi -->
          <div class="mt-4 p-3 bg-base-200 rounded-lg">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <div class="text-sm font-medium mb-2">Riepilogo Permessi:</div>
              <div class="flex items-center">
                <span class="w-3 h-3 bg-success rounded-full mr-2"></span>
                Visualizzazioni: {{ totalViewPermissions }}
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 bg-warning rounded-full mr-2"></span>
                Modifiche: {{ totalModifyPermissions }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sezione Note e Informazioni Aggiuntive -->
      <!-- <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center mb-4">
            <div class="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-2 mr-3">
              <FaIcon icon="sticky-note" class="text-orange-600 text-lg" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-base-content">Informazioni Aggiuntive</h3>
              <p class="text-sm text-base-content/70">Note e commenti sull'utente</p>
            </div>
          </div>

          Additional information fields would go here...
        </div>
      </div> -->
    </form>

    <!-- Modale di conferma eliminazione -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Conferma eliminazione</h3>
        <p class="mb-4">
          Sei sicuro di voler eliminare l'utente <strong>{{ userForm.username }}</strong>?
        </p>
        <p class="text-sm text-base-content/70 mb-6">
          Questa azione è irreversibile e rimuoverà tutti i dati associati all'utente.
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute} from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { menuService, type AbilitazioneMenuUtente, type ApiMenuUtenteItem } from '@/services/menuService'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import { userService, type User } from '@/services/userService'
import { settingsService } from '@/services/settingsService'
import { accessiService } from '@/services/accessiService'

// Interfaccia per il form dell'utente
interface UserForm {
  username: string
  nomecompleto: string
  codgruppo: string
  codaccesso: string
  iD_LINGUA: number,
  iD_INTER: number
}

// Interfaccia per i permessi
interface UserPermission {
  visualizza: boolean
  modifica: boolean
  parent_id?: number
}

interface UserPermissions {
  [key: string]: UserPermission
}

interface SelectOption {
  label: string
  value: string | number
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form reattivo
const userForm = ref<UserForm>({
  username: '',
  nomecompleto: '',
  codgruppo: '',
  codaccesso: '',
  iD_LINGUA: 0,
  iD_INTER: 0
})

const loading = ref(false)
const saving = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Gestione eliminazione
const showDeleteModal = ref(false)
const deleting = ref(false)

// Gestione permessi
const loadingPermissions = ref(false)
const permissionsError = ref('')
const permissionSearchQuery = ref('')
const userPermissions = ref<UserPermissions>({})
const menuUtenteData = ref<ApiMenuUtenteItem[]>([])

// Navigazione ad albero
const selectedCategoryId = ref<number | null>(null)
const selectedSubcategoryId = ref<number | null>(null)
const selectedSubSubcategoryId = ref<number | null>(null)

// Opzioni per i dropdown
const availableGroups = ref<SelectOption[]>([])
const loadingGroups = ref(false)

const availableAccessCodes = ref<SelectOption[]>([])
const loadingAccessCodes = ref(false)

const availableImpostazioniInternazionali = ref<SelectOption[]>([])
const loadingImpostazioniInternazionali = ref(false)

const availableLingue = ref<SelectOption[]>([])
const loadingLingue = ref(false)

// Navigazione utenti
const previousUser = ref<{ username: string } | null>(null)
const nextUser = ref<{ username: string } | null>(null)
const allUsers = ref<{ username: string }[]>([])

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const userId = computed(() => route.params.id as string)
const hasPreviousUser = computed(() => previousUser.value !== null)
const hasNextUser = computed(() => nextUser.value !== null)

const isFormValid = computed(() => {
  return userForm.value.username.trim() !== '' &&
         userForm.value.nomecompleto.trim() !== '' &&
         userForm.value.iD_LINGUA > 0 &&
         userForm.value.iD_INTER > 0
})

// Computed per la navigazione ad albero
const filteredPermissionCategories = computed(() => {
  if (!permissionSearchQuery.value || permissionSearchQuery.value.trim() === '') {
    return menuUtenteData.value
  }

  const query = permissionSearchQuery.value.trim()
  const { matchingItems, pathsToMatches } = findMatchingItemsWithPaths(menuUtenteData.value, query)

  // Se non ci sono match, ritorna array vuoto
  if (matchingItems.length === 0) {
    return []
  }

  // Filtra l'albero mantenendo solo i percorsi che portano ai match
  return filterItemsByPaths(menuUtenteData.value, pathsToMatches)
})

const filteredSubcategories = computed(() => {
  if (!selectedCategory.value) return []

  // Se non c'è ricerca, mostra tutti i figli normalmente
  if (!permissionSearchQuery.value || permissionSearchQuery.value.trim() === '') {
    return selectedCategory.value.figli || []
  }

  // Se c'è una ricerca attiva, filtra i figli mostrando solo quelli nel percorso di ricerca
  const query = permissionSearchQuery.value.trim()
  const { pathsToMatches } = findMatchingItemsWithPaths([selectedCategory.value], query)

  if (selectedCategory.value.figli) {
    return selectedCategory.value.figli.filter(child => pathsToMatches.has(child.id))
  }

  return []
})

const filteredSubSubcategories = computed(() => {
  if (!selectedSubcategory.value) return []

  // Se non c'è ricerca, mostra tutti i figli normalmente
  if (!permissionSearchQuery.value || permissionSearchQuery.value.trim() === '') {
    return selectedSubcategory.value.figli || []
  }

  // Se c'è una ricerca attiva, filtra i figli mostrando solo quelli nel percorso di ricerca
  const query = permissionSearchQuery.value.trim()
  const { pathsToMatches } = findMatchingItemsWithPaths([selectedSubcategory.value], query)

  if (selectedSubcategory.value.figli) {
    return selectedSubcategory.value.figli.filter(child => pathsToMatches.has(child.id))
  }

  return []
})

const selectedCategory = computed(() => {
  return menuUtenteData.value.find(cat => cat.id === selectedCategoryId.value)
})

const selectedSubcategory = computed(() => {
  return selectedCategory.value?.figli?.find(sub => sub.id === selectedSubcategoryId.value)
})

const selectedSubSubcategory = computed(() => {
  return selectedSubcategory.value?.figli?.find(sub => sub.id === selectedSubSubcategoryId.value)
})

const currentPermissionItems = computed(() => {
  let items: ApiMenuUtenteItem[] = []

  // Determina quali items mostrare basandosi sulla selezione corrente
  if (selectedSubSubcategoryId.value && selectedSubSubcategory.value) {
    items = selectedSubSubcategory.value.figli || []
  } else if (selectedSubcategoryId.value && selectedSubcategory.value) {
    const hasDeepChildren = selectedSubcategory.value.figli?.some(child => child.figli?.length > 0)
    if (!hasDeepChildren) {
      items = selectedSubcategory.value.figli || []
    }
  } else if (selectedCategoryId.value && selectedCategory.value) {
    const hasSubcategories = selectedCategory.value.figli?.some(child => child.figli?.length > 0)
    if (!hasSubcategories) {
      items = selectedCategory.value.figli || []
    }
  }

  return items
})

const totalViewPermissions = computed(() => {
  return Object.values(userPermissions.value).filter(perm => perm.visualizza).length
})

const totalModifyPermissions = computed(() => {
  return Object.values(userPermissions.value).filter(perm => perm.modifica).length
})

// Metodi helper
const hasMatchingChildren = (item: ApiMenuUtenteItem, query: string): boolean => {
  if (!query || !item.figli) return false

  const lowerQuery = query.toLowerCase()

  const checkRecursively = (children: ApiMenuUtenteItem[]): boolean => {
    return children.some(child => {
      // Controlla se questo figlio matcha
      if (child.nome.toLowerCase().includes(lowerQuery)) {
        return true
      }
      // Controlla ricorsivamente nei suoi figli
      if (child.figli && child.figli.length > 0) {
        return checkRecursively(child.figli)
      }
      return false
    })
  }

  return checkRecursively(item.figli)
}

// Funzione per trovare tutti i match e i loro percorsi nella gerarchia
const findMatchingItemsWithPaths = (items: ApiMenuUtenteItem[], query: string): {
  matchingItems: ApiMenuUtenteItem[],
  pathsToMatches: Set<number>
} => {
  const lowerQuery = query.toLowerCase()
  const matchingItems: ApiMenuUtenteItem[] = []
  const pathsToMatches = new Set<number>()

  const searchRecursively = (item: ApiMenuUtenteItem, currentPath: number[]): boolean => {
    let hasMatchInSubtree = false
    const newPath = [...currentPath, item.id]

    // Controlla se questo item matcha direttamente
    const directMatch = item.nome.toLowerCase().includes(lowerQuery)

    if (directMatch) {
      matchingItems.push(item)
      // Aggiungi tutto il percorso fino a questo item
      newPath.forEach(id => pathsToMatches.add(id))
      hasMatchInSubtree = true
    }

    // Cerca ricorsivamente nei figli
    if (item.figli && item.figli.length > 0) {
      for (const child of item.figli) {
        const childHasMatch = searchRecursively(child, newPath)
        if (childHasMatch) {
          hasMatchInSubtree = true
        }
      }
    }

    // Se qualche figlio ha un match, aggiungi questo item al percorso
    if (hasMatchInSubtree && !directMatch) {
      pathsToMatches.add(item.id)
    }

    return hasMatchInSubtree
  }

  // Avvia la ricerca per ogni item di primo livello
  items.forEach(item => {
    searchRecursively(item, [])
  })

  return { matchingItems, pathsToMatches }
}

// Funzione per filtrare gli items mantenendo solo quelli nei percorsi validi
const filterItemsByPaths = (items: ApiMenuUtenteItem[], pathsToMatches: Set<number>): ApiMenuUtenteItem[] => {
  return items.filter(item => {
    if (pathsToMatches.has(item.id)) {
      // Se questo item è nel percorso, filtra anche i suoi figli
      if (item.figli && item.figli.length > 0) {
        const filteredChildren = filterItemsByPaths(item.figli, pathsToMatches)
        return {
          ...item,
          figli: filteredChildren
        } as ApiMenuUtenteItem
      }
      return true
    }
    return false
  }).map(item => {
    if (item.figli && item.figli.length > 0) {
      const filteredChildren = filterItemsByPaths(item.figli, pathsToMatches)
      return {
        ...item,
        figli: filteredChildren
      }
    }
    return item
  })
}

// Funzione per cercare e espandere immediatamente
const performSearchAndExpand = (query: string) => {
  if (!query || query.trim() === '') {
    return
  }

  const { matchingItems } = findMatchingItemsWithPaths(menuUtenteData.value, query)

  if (matchingItems.length > 0) {
    // Trova il percorso del primo match più profondo
    let deepestMatch = matchingItems[0]
    let maxDepth = 0

    // Funzione per calcolare la profondità di un item nell'albero
    const findDepth = (item: ApiMenuUtenteItem): number => {
      const searchInLevel = (items: ApiMenuUtenteItem[], depth: number): number => {
        for (const currentItem of items) {
          if (currentItem.id === item.id) {
            return depth
          }
          if (currentItem.figli && currentItem.figli.length > 0) {
            const foundDepth = searchInLevel(currentItem.figli, depth + 1)
            if (foundDepth > -1) return foundDepth
          }
        }
        return -1
      }
      return searchInLevel(menuUtenteData.value, 0)
    }

    // Trova il match più profondo
    for (const match of matchingItems) {
      const depth = findDepth(match)
      if (depth > maxDepth) {
        maxDepth = depth
        deepestMatch = match
      }
    }

    // Costruisce il percorso verso questo match
    const buildPathToItem = (targetItem: ApiMenuUtenteItem): number[] => {
      const findPath = (items: ApiMenuUtenteItem[], path: number[] = []): number[] | null => {
        for (const item of items) {
          const currentPath = [...path, item.id]

          if (item.id === targetItem.id) {
            return currentPath
          }

          if (item.figli && item.figli.length > 0) {
            const foundPath = findPath(item.figli, currentPath)
            if (foundPath) return foundPath
          }
        }
        return null
      }
      return findPath(menuUtenteData.value) || []
    }

    const pathToMatch = buildPathToItem(deepestMatch)

    // Espande il percorso
    if (pathToMatch.length > 0) {
      selectedCategoryId.value = pathToMatch[0] || null
      selectedSubcategoryId.value = pathToMatch[1] || null
      selectedSubSubcategoryId.value = pathToMatch[2] || null
    }
  }
}

// Funzione per evidenziare i termini cercati nel testo
const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm || searchTerm.trim() === '') {
    return text
  }

  const regex = new RegExp(`(${searchTerm.trim()})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary/20 text-primary rounded px-1 font-semibold">$1</mark>')
}

// Navigazione tra utenti
const navigateToPreviousUser = () => {
  if (previousUser.value) {
    router.push(`/app/users/${previousUser.value.username}/edit`)
  }
}

const navigateToNextUser = () => {
  if (nextUser.value) {
    router.push(`/app/users/${nextUser.value.username}/edit`)
  }
}

// Duplica utente corrente
const duplicateCurrentUser = () => {
  router.push({
    name: 'UserNew',
    query: {
      duplicate: userForm.value.username,
      sourceNome: userForm.value.nomecompleto,
      sourceGruppo: userForm.value.codgruppo,
      sourceAccesso: userForm.value.codaccesso,
      sourceId_Inter: userForm.value.iD_INTER,
      sourceId_Lingua: userForm.value.iD_LINGUA
    }
  })
}

// Elimina utente corrente
const deleteCurrentUser = async () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleting.value = false
}

const confirmDelete = async () => {
  try {
    deleting.value = true

    await userService.deleteUser(userForm.value.username)

    successMessage.value = 'Utente eliminato con successo'

    setTimeout(() => {
      router.push('/app/users')
    }, 1500)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nell\'eliminazione dell\'utente'
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

// Caricamento utenti adiacenti per navigazione
const loadAdjacentUsers = async () => {
  if (!isEditMode.value) return

  try {
    // Carica l'intera lista utenti se non è già stata caricata o se è vuota
    if (allUsers.value.length === 0) {
      const response = await userService.getUsers()
      if (response.listaUtenti) {
        // Ordina gli utenti alfabeticamente per username
        allUsers.value = response.listaUtenti
          .map(user => ({ username: user.username }))
          .sort((a, b) => a.username.localeCompare(b.username))
      }
    }

    // Trova l'utente corrente e determina quello precedente e successivo
    const currentUsername = userId.value
    if (!currentUsername || allUsers.value.length === 0) {
      previousUser.value = null
      nextUser.value = null
      return
    }

    const currentIndex = allUsers.value.findIndex(user => user.username === currentUsername)

    if (currentIndex === -1) {
      // Utente corrente non trovato nella lista
      previousUser.value = null
      nextUser.value = null
      return
    }

    // Imposta utente precedente
    previousUser.value = currentIndex > 0 ? allUsers.value[currentIndex - 1] : null

    // Imposta utente successivo
    nextUser.value = currentIndex < allUsers.value.length - 1 ? allUsers.value[currentIndex + 1] : null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    previousUser.value = null
    nextUser.value = null
  }
}

// Metodi per la navigazione ad albero
const selectCategory = (category: ApiMenuUtenteItem) => {
  selectedCategoryId.value = category.id
  selectedSubcategoryId.value = null
  selectedSubSubcategoryId.value = null
}

const selectSubcategory = (subcategory: ApiMenuUtenteItem) => {
  selectedSubcategoryId.value = subcategory.id
  selectedSubSubcategoryId.value = null
}

const selectSubSubcategory = (subsubcategory: ApiMenuUtenteItem) => {
  selectedSubSubcategoryId.value = subsubcategory.id
}

const loadGruppiUtente = async () => {
  loadingGroups.value = true
  try {
    const gruppi = await userService.getGruppiUtente()
    availableGroups.value = gruppi.map(gruppo => ({
      label: gruppo.codice + ' - ' + gruppo.descrizione,
      value: gruppo.codice
    }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento dei gruppi utente'
  } finally {
    loadingGroups.value = false
  }
}

const loadLingue = async () => {
  loadingLingue.value = true
  try {
    const gruppi = await settingsService.getLingue()
    availableLingue.value = gruppi.map(gruppo => ({
      label: gruppo.iD_LINGUA + ' - ' + gruppo.descrizione,
      value: gruppo.iD_LINGUA
    }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento delle lingue'
  } finally {
    loadingLingue.value = false
  }
}

const loadImpostazioniInternazionali = async () => {
  loadingImpostazioniInternazionali.value = true
  try {
    const gruppi = await settingsService.getImpostazioniInternazionali()
    availableImpostazioniInternazionali.value = gruppi.map(gruppo => ({
      label: gruppo.iD_INTER + ' - ' + gruppo.formatO_DATA,
      value: gruppo.iD_INTER
    }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento delle impostazioni internazionali'
  } finally {
    loadingImpostazioniInternazionali.value = false
  }
}

const loadTabAccessi = async () => {
  loadingAccessCodes.value = true
  try {
    const gruppi = await accessiService.getTabAccessi()
    availableAccessCodes.value = gruppi.map(gruppo => ({
      label: gruppo.codice + ' - ' + gruppo.descrizione,
      value: gruppo.codice
    }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento delle impostazioni internazionali'
  } finally {
    loadingAccessCodes.value = false
  }
}

// Caricamento dati utente
const loadUserData = async () => {
  if (!isEditMode.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    // Prima prova a cercare l'utente nella lista già caricata
    let userData = null

    // Se abbiamo già la lista utenti, cerca l'utente corrente
    if (allUsers.value.length > 0) {
      const response = await userService.getUsers()
      if (response.listaUtenti) {
        userData = response.listaUtenti.find(user => user.username === userId.value)
      }
    }

    // Se non trovato nella lista, prova con i dati del router state
    if (!userData) {
      const routerState = history.state?.userData
      if (routerState && routerState.username === userId.value) {
        userData = routerState
      }
    }

    // Se ancora non trovato, carica i dati dell'utente (fallback)
    if (!userData) {
      userData = {
        username: userId.value,
        nomecompleto: userId.value,
        codgruppo: 'GRP1',
        codaccesso: '12345',
        iD_LINGUA: 1,
        iD_INTER: 1
      }
    }

    // Imposta i dati del form assicurandoti che tutti i campi siano popolati
    userForm.value = {
      username: userData.username || '',
      nomecompleto: userData.nomecompleto || '',
      codgruppo: userData.codgruppo || '',
      codaccesso: userData.codaccesso || '',
      iD_LINGUA: Number(userData.iD_LINGUA) || 0,
      iD_INTER: Number(userData.iD_INTER) || 0
    }


    await loadUserPermissions()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento dei dati utente'
  } finally {
    loading.value = false
  }
}

const loadUserPermissions = async () => {
  if (!userForm.value.username) return

  loadingPermissions.value = true
  permissionsError.value = ''

  try {
    const menuData = await menuService.getMenuUtente(userForm.value.username)
    menuUtenteData.value = menuData

    initializePermissions(menuData)

  } catch (error) {
    permissionsError.value = 'Errore nel caricamento dei permessi: ' + error
  } finally {
    loadingPermissions.value = false
  }
}

const initializePermissions = (menuData: ApiMenuUtenteItem[]) => {
  const permissions: UserPermissions = {}

  const processItems = (items: ApiMenuUtenteItem[]) => {
    items.forEach(item => {
      // Aggiunge il permesso per questo item
      permissions[item.id] = {
        visualizza: item.visualizza === 'S',
        modifica: item.modifica === 'S',
        parent_id: item.parenT_ID
      }

      // Processa ricorsivamente i figli
      if (item.figli && item.figli.length > 0) {
        processItems(item.figli)
      }
    })
  }

  processItems(menuData)
  userPermissions.value = permissions
}

// Metodi per gestione permessi
const refreshPermissions = async () => {
  if (userForm.value.username) {
    await loadUserPermissions()
  }
}

const selectAllPermissions = () => {
  Object.keys(userPermissions.value).forEach(key => {
    userPermissions.value[key].visualizza = true
    userPermissions.value[key].modifica = true
  })
}

const deselectAllPermissions = () => {
  Object.keys(userPermissions.value).forEach(key => {
    userPermissions.value[key].visualizza = false
    userPermissions.value[key].modifica = false
  })
}

const onPermissionChange = (itemId: number, type: 'visualizza' | 'modifica') => {
  if (type === 'visualizza' && !userPermissions.value[itemId].visualizza) {
    userPermissions.value[itemId].modifica = false
  } else if (type === 'modifica' && userPermissions.value[itemId].modifica) {
    userPermissions.value[itemId].visualizza = true
  }
}

// Metodi utilità
const goBack = () => {
  router.push('/app/users')
}

const resetForm = () => {
  if (isEditMode.value) {
    userForm.value = {
      username: '',
      nomecompleto: '',
      codgruppo: '',
      codaccesso: '',
      iD_INTER: 0,
      iD_LINGUA: 0
    }

    loadUserData()
  } else {
    userForm.value = {
      username: '',
      nomecompleto: '',
      codgruppo: '',
      codaccesso: '',
      iD_INTER: 0,
      iD_LINGUA: 0
    }
    userPermissions.value = {}
    menuUtenteData.value = []
  }
  submitted.value = false
  errorMessage.value = ''
  successMessage.value = ''

  // Reset selezioni albero
  selectedCategoryId.value = null
  selectedSubcategoryId.value = null
  selectedSubSubcategoryId.value = null
}

// Validazione form
const validateForm = () => {
  const errors = []

  if (!userForm.value.username.trim()) {
    errors.push('Username richiesto')
  }

  if (!userForm.value.nomecompleto.trim()) {
    errors.push('Nome completo richiesto')
  }

  if (!userForm.value.iD_LINGUA) {
    errors.push('Lingua richiesta')
  }

  if (!userForm.value.iD_INTER) {
    errors.push('Impost. Internazionale richiesta')
  }

  return errors
}

// Preparazione dati per il salvataggio dei permessi - VERSIONE CORRETTA
const preparePermissionsForSave = (): AbilitazioneMenuUtente[] => {
  const abilitazioni: AbilitazioneMenuUtente[] = []
  const addedIds = new Set<number>() // Per evitare duplicati

  Object.keys(userPermissions.value).forEach(itemId => {
    const permission = userPermissions.value[itemId]
    const id = Number(itemId)

    if (permission.visualizza === true) {
      // Aggiunge l'item corrente solo se non è già stato aggiunto
      if (!addedIds.has(id)) {
        abilitazioni.push({
          username: userForm.value.username,
          menU_ID: id,
          modifica: permission.modifica ? 'S' : 'N'
        })
        addedIds.add(id)
      }

      // Aggiunge i parent solo se non sono già stati aggiunti
      let currentParentId = permission.parent_id
      while (currentParentId && currentParentId > 0 && !addedIds.has(currentParentId)) {
        abilitazioni.push({
          username: userForm.value.username,
          menU_ID: currentParentId,
          modifica: null
        })
        addedIds.add(currentParentId)

        // Va al parent del parent
        const parentPermission = userPermissions.value[currentParentId]
        currentParentId = parentPermission?.parent_id
      }
    }
  })

  return abilitazioni
}

// Gestione submit
const handleSubmit = async () => {
  submitted.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const validationErrors = validateForm()
  if (validationErrors.length > 0) {
    errorMessage.value = validationErrors.join(', ')
    return
  }

  saving.value = true

  try {
    const userData: User = {
      username: userForm.value.username,
      nomecompleto: userForm.value.nomecompleto,
      codgruppo: userForm.value.codgruppo,
      codaccesso: userForm.value.codaccesso,
      iD_LINGUA: userForm.value.iD_LINGUA,
      iD_INTER: userForm.value.iD_INTER
    }

    if (isEditMode.value) {
      // Modifica utente esistente
      await userService.editUser(userData)

      // Salva anche i permessi se sono stati modificati
      if (Object.keys(userPermissions.value).length > 0) {
        const abilitazioni = preparePermissionsForSave()
        await menuService.updateMenuUtente(abilitazioni, userData.username)
      }

      successMessage.value = 'Utente aggiornato con successo'
    } else {
      // Crea nuovo utente
      await userService.newUser(userData)

      // Se ci sono permessi impostati, salvali
      if (Object.keys(userPermissions.value).length > 0) {
        const abilitazioni = preparePermissionsForSave()
        await menuService.updateMenuUtente(abilitazioni, userData.username)
      }

      successMessage.value = 'Nuovo utente creato con successo'
    }

    // Nasconde il messaggio dopo 2 secondi
    setTimeout(() => {
      successMessage.value = ''
      if(!isEditMode.value)
        router.push(`/app/users/${userData.username}/edit`)
    }, 2000)

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Errore nel salvataggio dei dati'
  } finally {
    saving.value = false
  }
}

// Gestione duplicazione utente
const handleDuplicateMode = () => {
  const duplicateUsername = route.query.duplicate as string
  const sourceNome = route.query.sourceNome as string
  const sourceGruppo = route.query.sourceGruppo as string
  const sourceAccesso = route.query.sourceAccesso as string
  const sourceId_Inter = Number(route.query.sourceId_Inter)
  const sourceId_Lingua = Number(route.query.sourceId_Lingua)

  if (duplicateUsername && !isEditMode.value) {
    userForm.value = {
      username: '',
      nomecompleto: sourceNome ? `Copia di ${sourceNome}` : `Copia di ${duplicateUsername}`,
      codgruppo: sourceGruppo || '',
      codaccesso: sourceAccesso || '',
      iD_INTER: sourceId_Inter || 0,
      iD_LINGUA: sourceId_Lingua || 0
    }

    // Carica i permessi dell'utente originale per duplicarli
    if (duplicateUsername) {
      loadUserPermissionsForDuplication(duplicateUsername)
    }
  }
}

const loadUserPermissionsForDuplication = async (originalUsername: string) => {
  try {
    loadingPermissions.value = true
    const menuData = await menuService.getMenuUtente(originalUsername)
    menuUtenteData.value = menuData
    initializePermissions(menuData)
  } catch (error) {
    console.error('Errore caricamento permessi per duplicazione:', error)
    // Non è critico, continua senza permessi
  } finally {
    loadingPermissions.value = false
  }
}

// Inizializzazione
onMounted(async() => {
  await loadGruppiUtente()
  await loadLingue()
  await loadImpostazioniInternazionali()
  await loadTabAccessi()

  if (isEditMode.value) {
    loadUserData()
    await loadAdjacentUsers()
  } else {
    handleDuplicateMode()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, async () => {
  if (route.params.id) {
    // Reset dei messaggi
    errorMessage.value = ''
    successMessage.value = ''

    if (isEditMode.value) {
      await loadUserData()
      await loadAdjacentUsers()
    } else {
      resetForm()
      handleDuplicateMode()
    }
  }
}, { immediate: true })

// Watch per caricare permessi quando viene inserito username (solo in modalità creazione)
watch(() => userForm.value.username, (newUsername) => {
  if (newUsername && !isEditMode.value && newUsername.trim() !== '') {
    // In modalità creazione, carica il menu base quando viene inserito un username
    loadUserPermissions()
  }
})

// Watcher per espandere automaticamente quando si cerca
watch(permissionSearchQuery, (newQuery, oldQuery) => {
  if (newQuery && newQuery.trim() !== '') {
    nextTick(() => {
      performSearchAndExpand(newQuery.trim())
    })
  } else if (oldQuery && oldQuery.trim() !== '' && (!newQuery || newQuery.trim() === '')) {
    // Reset selezioni solo quando si pulisce completamente la ricerca
    selectedCategoryId.value = null
    selectedSubcategoryId.value = null
    selectedSubSubcategoryId.value = null
  }
})

// Clear success/error messages after timeout
watch([successMessage, errorMessage], ([success, error]) => {
  if (success) {
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }
  if (error) {
    setTimeout(() => {
      errorMessage.value = ''
    }, 8000)
  }
})
</script>

<style scoped>
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.6s ease-out;
}

.form-control input:focus,
.form-control select:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

.input-disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }

.grid.grid-cols-12 .border {
  border-color: oklch(var(--bc) / 0.2);
}

.hover\:bg-base-200:hover {
  background-color: oklch(var(--b2));
}

.bg-primary\/10 {
  background-color: rgb(var(--primary) / 0.1);
}

.text-primary {
  color: rgb(var(--primary));
}

.checkbox-xs {
  width: 1rem;
  height: 1rem;
}

.checkbox:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.checkbox:checked {
  animation: checkBounce 0.2s ease-in-out;
}

@keyframes checkBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.alert {
  animation: slideInUp 0.4s ease-out;
}

.btn.loading {
  pointer-events: none;
}

.modal {
  z-index: 1000;
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

@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }

  .flex.space-x-3 {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.badge-xs {
  font-size: 0.625rem;
  line-height: 1rem;
  padding: 0.125rem 0.25rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cursor-pointer:hover {
  transform: translateY(-1px);
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.input-error {
  border-color: rgb(var(--error));
}

.select-error {
  border-color: rgb(var(--error));
}

.input-error:focus,
.select-error:focus {
  outline-color: rgb(var(--error));
  border-color: rgb(var(--error));
}

:deep(mark) {
  background-color: rgba(var(--primary), 0.2);
  color: rgb(var(--primary));
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-weight: 600;
  font-size: inherit;
}

.search-highlight {
  animation: searchPulse 1s ease-in-out;
}

@keyframes searchPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--primary), 0.4);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(var(--primary), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--primary), 0);
  }
}

.hover\:bg-base-50:hover {
  background-color: oklch(var(--b1) / 0.5);
}

.ring-2 {
  box-shadow: 0 0 0 2px var(--tw-ring-color);
}

.ring-primary\/20 {
  --tw-ring-color: rgb(var(--primary) / 0.2);
}

.badge-primary.badge-xs {
  background-color: rgb(var(--primary));
  color: rgb(var(--primary-content));
  font-size: 0.625rem;
  line-height: 1rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  font-weight: 600;
}

.tooltip[data-tip]:before {
  z-index: 10000;
  background-color: oklch(var(--n));
  color: oklch(var(--nc));
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  max-width: 200px;
  white-space: normal;
  text-align: center;
  line-height: 1.2;
}

.grid.grid-cols-12 > div {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: oklch(var(--b2));
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: oklch(var(--bc) / 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: oklch(var(--bc) / 0.5);
}

input[type="text"]:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

@keyframes fadeInResults {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-1 > div {
  animation: fadeInResults 0.3s ease-out;
}

.bg-primary\/5 {
  background-color: rgb(var(--primary) / 0.05);
}

.border-primary\/20 {
  border-color: rgb(var(--primary) / 0.2);
}

.checkbox-xs:checked {
  background-color: currentColor;
  border-color: currentColor;
}

.checkbox-success:checked {
  background-color: rgb(var(--success));
  border-color: rgb(var(--success));
}

.checkbox-warning:checked {
  background-color: rgb(var(--warning));
  border-color: rgb(var(--warning));
}

@media (prefers-color-scheme: dark) {
  :deep(mark) {
    background-color: rgba(var(--primary), 0.3);
    color: rgb(var(--primary-content));
  }
}

.btn-outline:hover {
  color: white !important;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.form-control select:disabled,
.form-control input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: oklch(var(--b2));
}

.input-error,
.select-error {
  border-color: rgb(var(--error));
  background-color: rgb(var(--error) / 0.05);
}

.input-error:focus,
.select-error:focus {
  outline: 2px solid rgb(var(--error));
  outline-offset: 2px;
  border-color: rgb(var(--error));
}

.label-text:after {
  content: "";
}

.label-text:has(+ * [required]):after {
  content: " *";
  color: rgb(var(--error));
}

.btn.loading .loading-spinner {
  margin-right: 0.5rem;
}

.alert-success {
  border-left: 4px solid rgb(var(--success));
}

.alert-error {
  border-left: 4px solid rgb(var(--error));
}

.checkbox:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

.btn:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

.btn, .input, .select, .checkbox {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.card:hover {
  transform: translateY(-2px);
}

.alert {
  position: relative;
  overflow: hidden;
}

.alert::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.tooltip {
  --tooltip-delay: 300ms;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

*:focus {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}
</style>
