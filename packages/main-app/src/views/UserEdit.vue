<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header con breadcrumb -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div>
            <!-- Breadcrumb -->
            <div class="breadcrumbs text-sm mb-2">
              <ul>
                <li>
                  <RouterLink to="/app/users" class="link link-hover">
                    <FaIcon icon="users" class="mr-1" />
                    Gestione Utenti
                  </RouterLink>
                </li>
                <li>
                  <span class="text-base-content/70">
                    {{ isEditMode ? 'Modifica Utente' : 'Nuovo Utente' }}
                  </span>
                </li>
              </ul>
            </div>

            <h1 class="text-3xl font-bold text-base-content">
              {{ isEditMode ? 'Modifica Utente' : 'Nuovo Utente' }}
            </h1>
            <p class="text-base-content/70 mt-1">
              {{ isEditMode ? `Modifica i dati dell'utente: ${userForm.nome}` : 'Inserisci i dati del nuovo utente' }}
            </p>
          </div>

          <div class="flex items-center space-x-3">
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
            <div v-if="isEditMode" class="flex items-center space-x-2">
              <!-- <button
                type="button"
                class="btn btn-info btn-sm"
                @click="showUserPreview"
                :disabled="saving"
              >
                <FaIcon icon="eye" class="mr-1"/>
                Visualizza
              </button> -->
              <!-- <button
                type="button"
                class="btn btn-warning btn-sm"
                @click="togglePasswordSection"
              >
                <FaIcon icon="key" class="mr-1"/>
                Cambio
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
              </button> -->
            </div>
          </div>

          <div class="grid grid-cols-1 gap-1">
            <!-- Prima colonna -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Nome -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Nome *</span>
                </label>
                <input
                  type="text"
                  v-model="userForm.nome"
                  :readonly="isEditMode"
                  :class="{
                    'input-error': submitted && !userForm.nome,
                    'input-disabled bg-base-200': isEditMode
                  }"
                  class="input input-bordered w-full"
                  placeholder="Inserisci nome utente"
                  required
                  autocomplete="username"
                />
                <div v-if="submitted && !userForm.nome" class="label">
                  <span class="label-text-alt text-error">Nome richiesto</span>
                </div>
              </div>

              <!-- Nome Completo -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Nome Completo *</span>
                </label>
                <input
                  type="text"
                  v-model="userForm.nomeCompleto"
                  :class="{ 'input-error': submitted && !userForm.nomeCompleto }"
                  class="input input-bordered w-full"
                  placeholder="Inserisci nome completo"
                  required
                />
                <div v-if="submitted && !userForm.nomeCompleto" class="label">
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

            <!-- Seconda colonna -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Accesso -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Accesso *</span>
                </label>
                <select
                  v-model="userForm.accesso"
                  :class="{ 'select-error': submitted && !userForm.accesso }"
                  class="select select-bordered w-full"
                  required
                >
                  <option value="">Nessuno</option>
                  <option
                    v-for="accesso in accessoOptions"
                    :key="accesso.value"
                    :value="accesso.value"
                  >
                    {{ accesso.label }}
                  </option>
                </select>
                <div v-if="submitted && !userForm.accesso" class="label">
                  <span class="label-text-alt text-error">Accesso richiesto</span>
                </div>
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

              <!-- Gruppo Utenti -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Gruppo Utenti</span>
                </label>
                <select
                  v-model="userForm.codgruppo"
                  class="select select-bordered w-full"
                >
                  <option value="">Nessuno</option>
                  <option
                    v-for="gruppo in availableGroups"
                    :key="gruppo.value"
                    :value="gruppo.value"
                  >
                    {{ gruppo.label }}
                  </option>
                </select>
              </div>

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

            <!-- Terza colonna -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Lingua -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Lingua</span>
                </label>
                <select
                  v-model="userForm.lingua"
                  class="select select-bordered w-full"
                >
                  <option value="">Nessuno</option>
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <!-- Impostazioni Internazionali -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Impost. Internaz.</span>
                </label>
                <select
                  v-model="userForm.impostazioniInternazionali"
                  class="select select-bordered w-full"
                >
                  <option value="">Nessuno</option>
                  <option value="it_IT">Italia (it_IT)</option>
                  <option value="en_US">United States (en_US)</option>
                  <option value="en_GB">United Kingdom (en_GB)</option>
                  <option value="de_DE">Deutschland (de_DE)</option>
                  <option value="fr_FR">France (fr_FR)</option>
                  <option value="es_ES">España (es_ES)</option>
                </select>
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">
                  {{ isEditMode ? 'Nuova Password' : 'Password' }} *
                </span>
              </label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="userForm.password"
                  :class="{ 'input-error': submitted && showPasswordSection && !userForm.password }"
                  class="input input-bordered w-full pr-12"
                  placeholder="Inserisci password"
                  :required="!isEditMode || showPasswordSection"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/60"
                  @click="togglePasswordVisibility"
                >
                  <FaIcon :icon="showPassword ? 'eye-slash' : 'eye'"/>
                </button>
              </div>
              <div v-if="submitted && showPasswordSection && !userForm.password" class="label">
                <span class="label-text-alt text-error">Password richiesta</span>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Conferma Password *</span>
              </label>
              <div class="relative">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="userForm.confirmPassword"
                  :class="{
                    'input-error': submitted && showPasswordSection && (!userForm.confirmPassword || userForm.password !== userForm.confirmPassword)
                  }"
                  class="input input-bordered w-full pr-12"
                  placeholder="Conferma password"
                  :required="!isEditMode || showPasswordSection"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/60"
                  @click="toggleConfirmPasswordVisibility"
                >
                  <FaIcon :icon="showConfirmPassword ? 'eye-slash' : 'eye'"/>
                </button>
              </div>
              <div v-if="submitted && showPasswordSection && !userForm.confirmPassword" class="label">
                <span class="label-text-alt text-error">Conferma password richiesta</span>
              </div>
              <div v-if="submitted && showPasswordSection && userForm.confirmPassword && userForm.password !== userForm.confirmPassword" class="label">
                <span class="label-text-alt text-error">Le password non corrispondono</span>
              </div>
            </div>
          </div>

          <div v-if="userForm.password && (!isEditMode || showPasswordSection)" class="mt-4">
            <div class="text-sm font-medium text-base-content mb-2">Sicurezza Password:</div>
            <div class="flex items-center space-x-2">
              <div
                class="h-2 flex-1 rounded-full"
                :class="getPasswordStrengthColor()"
              ></div>
              <span class="text-xs" :class="getPasswordStrengthTextColor()">
                {{ getPasswordStrengthText() }}
              </span>
            </div>
            <div class="text-xs text-base-content/60 mt-2">
              <ul class="list-disc list-inside space-y-1">
                <li :class="userForm.password.length >= 8 ? 'text-success' : 'text-error'">
                  Almeno 8 caratteri
                </li>
                <li :class="/[A-Z]/.test(userForm.password) ? 'text-success' : 'text-error'">
                  Almeno una lettera maiuscola
                </li>
                <li :class="/[0-9]/.test(userForm.password) ? 'text-success' : 'text-error'">
                  Almeno un numero
                </li>
                <li :class="/[^A-Za-z0-9]/.test(userForm.password) ? 'text-success' : 'text-error'">
                  Almeno un carattere speciale
                </li>
              </ul>
            </div>
          </div>
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

          <div class="space-y-6">
            <div class="form-control">
              <label class="label cursor-pointer justify-start">
                <input
                  type="checkbox"
                  v-model="userForm.utenteAbilitatoAnalytics"
                  class="checkbox checkbox-success mr-4"
                />
                <div>
                  <span class="label-text font-medium">Utente abilitato all'uso di Analytics</span>
                  <p class="text-xs text-base-content/60">
                    Consenti a questo utente di accedere alle funzionalità di Analytics
                  </p>
                </div>
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start">
                <input
                  type="checkbox"
                  v-model="userForm.abilitaAutenticazioneIntegrata"
                  class="checkbox checkbox-warning mr-4"
                />
                <div>
                  <span class="label-text font-medium">Abilita autenticazione integrata</span>
                  <p class="text-xs text-base-content/60">
                    Utilizza l'autenticazione integrata di Windows/Active Directory
                  </p>
                </div>
              </label>
            </div>

            <div v-if="userForm.abilitaAutenticazioneIntegrata" class="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Login autenticazione integrata</span>
                </label>
                <input
                  type="text"
                  v-model="userForm.loginAutenticazioneIntegrata"
                  class="input input-bordered w-full"
                  placeholder="username@domain"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Dominio autenticazione integrata</span>
                </label>
                <input
                  type="text"
                  v-model="userForm.dominioAutenticazioneIntegrata"
                  class="input input-bordered w-full"
                  placeholder="DOMAIN"
                />
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Sezione Abilitazioni Menu/Tabelle -->
      <div v-if="authStore.isCompanyUser" class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-2 mr-3">
                <FaIcon icon="table" class="text-purple-600 text-lg" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content">Abilitazioni Menu e Tabelle</h3>
                <p class="text-sm text-base-content/70">Configura i permessi specifici per ogni sezione</p>
              </div>
            </div>

            <!-- Azioni rapide -->
            <div class="flex items-center space-x-2">
              <button
                type="button"
                class="btn btn-sm btn-success btn-outline"
                @click="selectAllPermissions"
              >
                <FaIcon icon="check-circle" class="mr-1"/>
                Seleziona Tutto
              </button>
              <button
                type="button"
                class="btn btn-sm btn-error btn-outline"
                @click="deselectAllPermissions"
              >
                <FaIcon icon="times-circle" class="mr-1"/>
                Deseleziona Tutto
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
                  class="input input-bordered input-sm w-full max-w-xs pr-10"
                />
                <FaIcon
                  icon="search"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Tabella permessi -->
          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr class="bg-base-200">
                  <th class="w-2/3">
                    <div class="flex items-center">
                      <FaIcon icon="list" class="mr-2 text-sm"/>
                      Tabella / Funzionalità
                    </div>
                  </th>
                  <th class="text-center w-20">
                    <div class="flex items-center justify-center">
                      <FaIcon icon="eye" class="mr-1 text-sm"/>
                      Accesso
                      <input
                        type="checkbox"
                        class="checkbox checkbox-sm ml-2"
                        :checked="isAllAccessSelected"
                        @change="toggleAllAccess"
                        title="Seleziona/Deseleziona tutti gli accessi"
                      />
                    </div>
                  </th>
                  <th class="text-center w-20">
                    <div class="flex items-center justify-center">
                      <FaIcon icon="edit" class="mr-1 text-sm"/>
                      Modifica
                      <input
                        type="checkbox"
                        class="checkbox checkbox-sm ml-2"
                        :checked="isAllModifySelected"
                        @change="toggleAllModify"
                        title="Seleziona/Deseleziona tutte le modifiche"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="category in filteredPermissionCategories" :key="category.name">
                  <!-- Categoria principale -->
                  <tr class="bg-base-100 border-b-2">
                    <td colspan="3" class="font-semibold text-primary py-3">
                      <div class="flex items-center">
                        <button
                          type="button"
                          @click="toggleCategory(category.name)"
                          class="btn btn-ghost btn-xs mr-2"
                        >
                          <FaIcon
                            :icon="category.expanded ? 'chevron-down' : 'chevron-right'"
                            class="text-xs"
                          />
                        </button>
                        <FaIcon :icon="category.icon" class="mr-2"/>
                        {{ category.label }}
                        <span class="badge badge-sm badge-primary ml-2">
                          {{ category.items.length }}
                        </span>
                      </div>
                    </td>
                  </tr>

                  <!-- Items della categoria (visibili solo se espansa) -->
                  <template v-if="category.expanded">
                    <tr
                      v-for="item in category.items"
                      :key="item.id"
                      class="hover:bg-base-50"
                    >
                      <td class="pl-8">
                        <div class="flex items-center">
                          <FaIcon :icon="item.icon" class="mr-2 text-sm text-base-content/60"/>
                          <div>
                            <div class="font-medium">{{ item.name }}</div>
                            <div v-if="item.description" class="text-xs text-base-content/60">
                              {{ item.description }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="text-center">
                        <input
                          type="checkbox"
                          v-model="userPermissions[item.id].access"
                          class="checkbox checkbox-success"
                          @change="onPermissionChange(item.id, 'access')"
                        />
                      </td>
                      <td class="text-center">
                        <input
                          type="checkbox"
                          v-model="userPermissions[item.id].modify"
                          :disabled="!userPermissions[item.id].access"
                          class="checkbox checkbox-warning"
                          @change="onPermissionChange(item.id, 'modify')"
                        />
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Riepilogo permessi -->
          <div class="mt-4 p-3 bg-base-200 rounded-lg">
            <div class="text-sm font-medium mb-2">Riepilogo Permessi:</div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div class="flex items-center">
                <span class="w-3 h-3 bg-success rounded-full mr-2"></span>
                Accessi: {{ totalAccessPermissions }}
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 bg-warning rounded-full mr-2"></span>
                Modifiche: {{ totalModifyPermissions }}
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 bg-info rounded-full mr-2"></span>
                Totale Voci: {{ totalPermissionItems }}
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 bg-primary rounded-full mr-2"></span>
                Categorie: {{ permissionCategories.length }}
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

          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                v-model="userForm.email"
                class="input input-bordered w-full"
                placeholder="email@example.com"
                autocomplete="email"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Note</span>
              </label>
              <textarea
                v-model="userForm.note"
                class="textarea textarea-bordered h-24"
                placeholder="Note aggiuntive sull'utente..."
              ></textarea>
            </div>

            <div v-if="isEditMode" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Data Creazione</span>
                </label>
                <input
                  type="text"
                  :value="formatDate(userForm.createdAt)"
                  readonly
                  class="input input-bordered bg-base-200"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Ultima Modifica</span>
                </label>
                <input
                  type="text"
                  :value="formatDate(userForm.updatedAt)"
                  readonly
                  class="input input-bordered bg-base-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Azioni -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div class="text-sm text-base-content/60">
              * Campi obbligatori
            </div>

            <div class="flex items-center space-x-3">
              <button
                type="button"
                class="btn btn-ghost"
                @click="resetForm"
                :disabled="saving"
              >
                <FaIcon icon="undo" class="mr-2"/>
                Reset
              </button>

              <button
                type="button"
                class="btn btn-outline"
                @click="goBack"
                :disabled="saving"
              >
                <FaIcon icon="times" class="mr-2"/>
                Annulla
              </button>

              <button
                type="submit"
                class="btn btn-primary"
                :class="{ 'loading': saving }"
                :disabled="saving"
              >
                <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                <FaIcon v-if="!saving" icon="save" class="mr-2"/>
                <span v-if="saving">
                  {{ isEditMode ? 'Aggiornamento...' : 'Creazione...' }}
                </span>
                <span v-if="!saving">
                  {{ isEditMode ? 'Aggiorna Utente' : 'Crea Utente' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import type { User } from '@/services/userService'

// Interfaccia per il form dell'utente (aggiornata con i nuovi campi)
interface UserForm {
  nome: string
  nomeCompleto: string
  disabilitaDopo: number
  noteAccesso: string
  cambioPasswordOgni: number
  monitorarePassword: boolean
  accesso: string
  lingua: string
  famigliaUtenti: string
  impostazioniInternazionali: string
  codgruppo: string
  codaccesso: string
  tipoUtente: string
  controlloPeriodi: boolean
  mesiPrecedenti: number
  dalGiorno: string
  utenteAbilitatoAnalytics: boolean
  abilitaAutenticazioneIntegrata: boolean
  loginAutenticazioneIntegrata: string
  dominioAutenticazioneIntegrata: string
  password: string
  confirmPassword: string
  email: string
  note: string
  accountEnabled: boolean
  forcePasswordChange: boolean
  adminAccess: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

// Interfaccia per i permessi (invariata)
interface PermissionItem {
  id: string
  name: string
  description?: string
  icon: string
}

interface PermissionCategory {
  name: string
  label: string
  icon: string
  expanded: boolean
  items: PermissionItem[]
}

interface UserPermission {
  access: boolean
  modify: boolean
}

interface UserPermissions {
  [key: string]: UserPermission
}

// Interfaccia per le opzioni dei dropdown
interface SelectOption {
  label: string
  value: string
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State reattivo (aggiornato con i nuovi campi)
const userForm = ref<UserForm>({
  nome: '',
  nomeCompleto: '',
  disabilitaDopo: 0,
  noteAccesso: '',
  cambioPasswordOgni: 0,
  monitorarePassword: false,
  accesso: '',
  lingua: '',
  famigliaUtenti: '',
  impostazioniInternazionali: '',
  codgruppo: '',
  codaccesso: '',
  tipoUtente: '',
  controlloPeriodi: false,
  mesiPrecedenti: 0,
  dalGiorno: '',
  utenteAbilitatoAnalytics: false,
  abilitaAutenticazioneIntegrata: false,
  loginAutenticazioneIntegrata: '',
  dominioAutenticazioneIntegrata: '',
  password: '',
  confirmPassword: '',
  email: '',
  note: '',
  accountEnabled: true,
  forcePasswordChange: false,
  adminAccess: false,
  createdAt: null,
  updatedAt: null
})

const loading = ref(false)
const saving = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showPasswordSection = ref(false)

// Gestione permessi
const permissionSearchQuery = ref('')
const userPermissions = ref<UserPermissions>({})

// Definizione delle categorie di permessi (basate sull'immagine)
const permissionCategories = ref<PermissionCategory[]>([
  {
    name: 'anagrafiche',
    label: 'Anagrafiche',
    icon: 'users',
    expanded: true,
    items: [
      { id: 'causali', name: 'Causali', icon: 'list' },
      { id: 'profili_orari', name: 'Profili Orari', icon: 'clock' },
      { id: 'tolleranze', name: 'Tolleranze', icon: 'balance-scale' },
      { id: 'festivita', name: 'Festività', icon: 'calendar' },
      { id: 'rotazione_turno', name: 'Rotazione Turno', icon: 'sync' },
      { id: 'cambio_turno', name: 'Cambio Turno', icon: 'exchange-alt' },
      { id: 'correlazione_voci', name: 'Correlazione Voci', icon: 'link' },
      { id: 'terminali_timbratura', name: 'Terminali di timbratura', icon: 'desktop' },
      { id: 'zone_timbratura', name: 'Zone di timbratura', icon: 'map-marker-alt' },
      { id: 'causali_terminale', name: 'Causali da terminale', icon: 'terminal' },
      { id: 'raggruppamento_causali', name: 'Raggruppamento Causali', icon: 'layer-group' },
      { id: 'raggruppamento_orari', name: 'Raggruppamento Orari', icon: 'layer-group' }
    ]
  },
  {
    name: 'importazioni_esportazioni',
    label: 'Importazioni / Esportazioni',
    icon: 'exchange-alt',
    expanded: false,
    items: [
      { id: 'import_dati', name: 'Importazioni Dati', icon: 'upload' },
      { id: 'export_dati', name: 'Esportazioni Dati', icon: 'download' },
      { id: 'elaborazioni', name: 'Elaborazioni', icon: 'cogs' }
    ]
  },
  {
    name: 'statistiche',
    label: 'Statistiche',
    icon: 'chart-bar',
    expanded: false,
    items: [
      { id: 'statistiche_presenze', name: 'Statistiche Presenze', icon: 'chart-line' },
      { id: 'eventi', name: 'Eventi', icon: 'calendar-alt' },
      { id: 'tipo_evento', name: 'Tipo Evento', icon: 'tags' },
      { id: 'configurazione_terminali', name: 'Configurazione Terminali', icon: 'cog' },
      { id: 'configurazione_banca_ore', name: 'Configurazione Banca Ore', icon: 'bank' },
      { id: 'badge_jolly', name: 'Badge Jolly', icon: 'id-card' },
      { id: 'festivita_dipendente', name: 'Festività Dipendente', icon: 'user-calendar' },
      { id: 'processi_elaborazione', name: 'Processi di Elaborazione', icon: 'process' },
      { id: 'aggregazione_eventi', name: 'Aggregazione Eventi', icon: 'compress' },
      { id: 'tipo_giustifica_parentale', name: 'Tipo Giustifica Parentale', icon: 'baby' }
    ]
  },
  {
    name: 'utilita',
    label: 'Utilità',
    icon: 'tools',
    expanded: false,
    items: [
      { id: 'gestione_personalizzazioni', name: 'Gestione Personalizzazioni', icon: 'palette' },
      { id: 'mensa', name: 'Mensa', icon: 'utensils' },
      { id: 'commesse', name: 'Commesse', icon: 'briefcase' },
      { id: 'gestione_ticket', name: 'Gestione Ticket', icon: 'ticket-alt' }
    ]
  }
])

// Opzioni per i dropdown (aggiornate)
const availableGroups = ref<SelectOption[]>([
  { label: 'Amministratori', value: 'ADMIN' },
  { label: 'Responsabili HR', value: 'HR_MANAGER' },
  { label: 'Dipendenti', value: 'EMPLOYEE' },
  { label: 'Consulenti', value: 'CONSULTANT' },
  { label: 'Visitatori', value: 'GUEST' }
])

const accessoOptions = ref<SelectOption[]>([
  { label: 'Accesso Completo', value: 'FULL' },
  { label: 'Accesso Limitato', value: 'LIMITED' },
  { label: 'Solo Lettura', value: 'READ_ONLY' },
  { label: 'Nessun Accesso', value: 'NONE' }
])

const famigliaUtentiOptions = ref<SelectOption[]>([
  { label: 'Famiglia Standard', value: 'STANDARD' },
  { label: 'Famiglia Avanzata', value: 'ADVANCED' },
  { label: 'Famiglia Premium', value: 'PREMIUM' }
])

const availableAccessCodes = ref<SelectOption[]>([
  { label: 'Attivo', value: 'ACTIVE' },
  { label: 'Disabilitato', value: 'DISABLED' },
  { label: 'Sospeso', value: 'SUSPENDED' },
  { label: 'Scaduto', value: 'EXPIRED' }
])

// Computed
const isEditMode = computed(() => route.params.id !== 'new')
const userId = computed(() => route.params.id as string)

// Computed per i permessi (invariati)
const filteredPermissionCategories = computed(() => {
  if (!permissionSearchQuery.value) {
    return permissionCategories.value
  }

  const query = permissionSearchQuery.value.toLowerCase()
  return permissionCategories.value.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  })).filter(category => category.items.length > 0)
})

const totalPermissionItems = computed(() => {
  return permissionCategories.value.reduce((total, category) => total + category.items.length, 0)
})

const totalAccessPermissions = computed(() => {
  return Object.values(userPermissions.value).filter(perm => perm.access).length
})

const totalModifyPermissions = computed(() => {
  return Object.values(userPermissions.value).filter(perm => perm.modify).length
})

const isAllAccessSelected = computed(() => {
  const allItems = permissionCategories.value.flatMap(cat => cat.items)
  return allItems.length > 0 && allItems.every(item => userPermissions.value[item.id]?.access)
})

const isAllModifySelected = computed(() => {
  const allItems = permissionCategories.value.flatMap(cat => cat.items)
  return allItems.length > 0 && allItems.every(item => userPermissions.value[item.id]?.modify)
})

// Metodi per gestione password (invariati)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const togglePasswordSection = () => {
  showPasswordSection.value = !showPasswordSection.value
  if (!showPasswordSection.value) {
    userForm.value.password = ''
    userForm.value.confirmPassword = ''
  }
}

// Validazione sicurezza password (invariata)
const getPasswordStrength = () => {
  const password = userForm.value.password
  let score = 0

  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  return score
}

const getPasswordStrengthColor = () => {
  const strength = getPasswordStrength()
  if (strength <= 2) return 'bg-error'
  if (strength <= 3) return 'bg-warning'
  return 'bg-success'
}

const getPasswordStrengthTextColor = () => {
  const strength = getPasswordStrength()
  if (strength <= 2) return 'text-error'
  if (strength <= 3) return 'text-warning'
  return 'text-success'
}

const getPasswordStrengthText = () => {
  const strength = getPasswordStrength()
  if (strength <= 2) return 'Debole'
  if (strength <= 3) return 'Media'
  return 'Forte'
}

// Metodi utilità
const formatDate = (date: Date | null) => {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const goBack = () => {
  router.push('/app/users')
}

// Nuovi metodi per i pulsanti della sezione informazioni base
const showUserPreview = () => {
  console.log('Visualizza anteprima utente:', userForm.value.nome)
  // Implementa la logica per mostrare l'anteprima utente
}

const disableUser = () => {
  if (confirm('Sei sicuro di voler disabilitare questo utente?')) {
    userForm.value.accountEnabled = false
    userForm.value.accesso = 'NONE'
    successMessage.value = 'Utente disabilitato con successo'
  }
}

const showNotesAccess = () => {
  console.log('Mostra note accesso per utente:', userForm.value.nome)
  // Implementa la logica per mostrare le note di accesso
}

const resetForm = () => {
  if (isEditMode.value) {
    loadUserData()
  } else {
    userForm.value = {
      nome: '',
      nomeCompleto: '',
      disabilitaDopo: 0,
      noteAccesso: '',
      cambioPasswordOgni: 0,
      monitorarePassword: false,
      accesso: '',
      lingua: 'it',
      famigliaUtenti: '',
      impostazioniInternazionali: 'it_IT',
      codgruppo: '',
      codaccesso: '',
      tipoUtente: '',
      controlloPeriodi: false,
      mesiPrecedenti: 0,
      dalGiorno: '',
      utenteAbilitatoAnalytics: false,
      abilitaAutenticazioneIntegrata: false,
      loginAutenticazioneIntegrata: '',
      dominioAutenticazioneIntegrata: '',
      password: '',
      confirmPassword: '',
      email: '',
      note: '',
      accountEnabled: true,
      forcePasswordChange: false,
      adminAccess: false,
      createdAt: null,
      updatedAt: null
    }
    // Reset permessi
    initializePermissions()
  }
  submitted.value = false
  errorMessage.value = ''
  successMessage.value = ''
}

// Metodi per gestione permessi (invariati)
const initializePermissions = () => {
  const permissions: UserPermissions = {}
  permissionCategories.value.forEach(category => {
    category.items.forEach(item => {
      permissions[item.id] = {
        access: false,
        modify: false
      }
    })
  })
  userPermissions.value = permissions
}

const toggleCategory = (categoryName: string) => {
  const category = permissionCategories.value.find(cat => cat.name === categoryName)
  if (category) {
    category.expanded = !category.expanded
  }
}

const selectAllPermissions = () => {
  Object.keys(userPermissions.value).forEach(key => {
    userPermissions.value[key].access = true
    userPermissions.value[key].modify = true
  })
}

const deselectAllPermissions = () => {
  Object.keys(userPermissions.value).forEach(key => {
    userPermissions.value[key].access = false
    userPermissions.value[key].modify = false
  })
}

const toggleAllAccess = (event: Event) => {
  const target = event.target as HTMLInputElement
  const checked = target.checked

  Object.keys(userPermissions.value).forEach(key => {
    userPermissions.value[key].access = checked
    if (!checked) {
      userPermissions.value[key].modify = false
    }
  })
}

const toggleAllModify = (event: Event) => {
  const target = event.target as HTMLInputElement
  const checked = target.checked

  Object.keys(userPermissions.value).forEach(key => {
    if (userPermissions.value[key].access) {
      userPermissions.value[key].modify = checked
    }
  })
}

const onPermissionChange = (itemId: string, type: 'access' | 'modify') => {
  if (type === 'access' && !userPermissions.value[itemId].access) {
    userPermissions.value[itemId].modify = false
  } else if (type === 'modify' && userPermissions.value[itemId].modify) {
    userPermissions.value[itemId].access = true
  }
}

// Caricamento dati utente (aggiornato con i nuovi campi)
const loadUserData = async () => {
  if (!isEditMode.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mockUser = {
      nome: userId.value,
      nomeCompleto: `${userId.value} - Utente Test`,
      disabilitaDopo: 6,
      noteAccesso: 'Note di accesso per utente test',
      cambioPasswordOgni: 3,
      monitorarePassword: true,
      accesso: 'FULL',
      lingua: 'it',
      famigliaUtenti: 'STANDARD',
      impostazioniInternazionali: 'it_IT',
      codgruppo: 'ADMIN',
      codaccesso: 'ACTIVE',
      tipoUtente: 'EMPLOYEE',
      controlloPeriodi: true,
      mesiPrecedenti: 12,
      dalGiorno: '2024-01-01',
      utenteAbilitatoAnalytics: true,
      abilitaAutenticazioneIntegrata: true,
      loginAutenticazioneIntegrata: `${userId.value}@company.local`,
      dominioAutenticazioneIntegrata: 'COMPANY',
      password: '',
      confirmPassword: '',
      email: `${userId.value}@company.com`,
      note: 'Utente di esempio caricato dal sistema',
      accountEnabled: true,
      forcePasswordChange: false,
      adminAccess: false,
      createdAt: new Date('2023-01-15T10:30:00'),
      updatedAt: new Date('2024-12-15T14:20:00')
    }

    userForm.value = { ...mockUser }
    loadUserPermissions()
  } catch (error) {
    errorMessage.value = 'Errore nel caricamento dei dati utente'
    console.error('Errore caricamento utente:', error)
  } finally {
    loading.value = false
  }
}

// Caricamento permessi utente (invariato)
const loadUserPermissions = () => {
  const mockPermissions: UserPermissions = {}

  permissionCategories.value.forEach(category => {
    category.items.forEach(item => {
      mockPermissions[item.id] = {
        access: Math.random() > 0.5,
        modify: Math.random() > 0.7
      }
    })
  })

  if (mockPermissions['causali']) {
    mockPermissions['causali'] = { access: true, modify: true }
  }
  if (mockPermissions['profili_orari']) {
    mockPermissions['profili_orari'] = { access: true, modify: false }
  }

  userPermissions.value = mockPermissions
}

// Validazione form (aggiornata con i nuovi campi)
const validateForm = () => {
  const errors = []

  if (!userForm.value.nome.trim()) {
    errors.push('Nome richiesto')
  }

  if (!userForm.value.nomeCompleto.trim()) {
    errors.push('Nome completo richiesto')
  }

  if (!userForm.value.accesso) {
    errors.push('Accesso richiesto')
  }

  if (!isEditMode.value || showPasswordSection.value) {
    if (!userForm.value.password) {
      errors.push('Password richiesta')
    } else {
      if (userForm.value.password.length < 8) {
        errors.push('Password deve essere di almeno 8 caratteri')
      }

      if (userForm.value.password !== userForm.value.confirmPassword) {
        errors.push('Le password non corrispondono')
      }
    }
  }

  if (userForm.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.value.email)) {
    errors.push('Email non valida')
  }

  if (userForm.value.disabilitaDopo < 0) {
    errors.push('I mesi per disabilitazione non possono essere negativi')
  }

  if (userForm.value.cambioPasswordOgni < 0) {
    errors.push('I mesi per cambio password non possono essere negativi')
  }

  if (userForm.value.mesiPrecedenti < 0) {
    errors.push('I mesi precedenti non possono essere negativi')
  }

  return errors
}

// Gestione submit (invariata)
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
    await new Promise(resolve => setTimeout(resolve, 2000))

    const userData = {
      ...userForm.value,
      permissions: userPermissions.value
    }

    if (isEditMode.value) {
      console.log('Aggiornamento utente:', userData)
      successMessage.value = 'Utente aggiornato con successo'
    } else {
      console.log('Creazione nuovo utente:', userData)
      successMessage.value = 'Nuovo utente creato con successo'
    }

    console.log('Permessi utente:', {
      totalAccess: totalAccessPermissions.value,
      totalModify: totalModifyPermissions.value,
      permissions: userPermissions.value
    })

    setTimeout(() => {
      router.push('/app/users')
    }, 1500)

  } catch (error) {
    errorMessage.value = 'Errore nel salvataggio dei dati'
    console.error('Errore salvataggio:', error)
  } finally {
    saving.value = false
  }
}

// Gestione duplicazione utente (aggiornata con i nuovi campi)
const handleDuplicateMode = () => {
  const duplicateUsername = route.query.duplicate as string
  if (duplicateUsername && !isEditMode.value) {
    userForm.value = {
      nome: '',
      nomeCompleto: `Copia di ${duplicateUsername}`,
      codgruppo: 'EMPLOYEE',
      codaccesso: 'ACTIVE',
      abilitaAutenticazioneIntegrata: false,
      accesso: '',
      cambioPasswordOgni: 6,
      controlloPeriodi: false,
      disabilitaDopo: 1,
      dalGiorno: '',
      dominioAutenticazioneIntegrata: '',
      famigliaUtenti: '',
      lingua: 'it',
      mesiPrecedenti: 1,
      monitorarePassword: false,
      noteAccesso: '',
      tipoUtente: 'EMPLOYEE',
      utenteAbilitatoAnalytics: false,
      impostazioniInternazionali: 'it_IT',
      loginAutenticazioneIntegrata: '',
      password: '',
      confirmPassword: '',
      email: '',
      note: `Duplicato da utente: ${duplicateUsername}`,
      accountEnabled: true,
      forcePasswordChange: true,
      adminAccess: false,
      createdAt: null,
      updatedAt: null
    }
  }
}

// Inizializzazione (aggiornata)
onMounted(() => {
  initializePermissions()

  if (isEditMode.value) {
    loadUserData()
  } else {
    userForm.value.lingua = 'it'
    userForm.value.impostazioniInternazionali = 'it_IT'
    userForm.value.accountEnabled = true
    userForm.value.tipoUtente = 'EMPLOYEE'

    handleDuplicateMode()
  }
})

// Watch per cambiamenti di route
watch(() => route.params.id, () => {
  if (route.params.id) {
    resetForm()
    if (isEditMode.value) {
      loadUserData()
    } else {
      handleDuplicateMode()
    }
  }
}, { immediate: true })
</script>

<style scoped>
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.6s ease-out;
}

.form-control input:focus,
.form-control select:focus,
.form-control textarea:focus {
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
.card:nth-child(5) { animation-delay: 0.5s; }
.card:nth-child(6) { animation-delay: 0.6s; }
.card:nth-child(7) { animation-delay: 0.7s; }

/* Stili per migliorare l'accessibilità */
.form-control input[type="password"]:focus + button,
.form-control input[type="text"]:focus + button {
  color: rgb(var(--primary));
}

@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }

  .flex.space-x-3 {
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Nascondi alcuni pulsanti su mobile per risparmiare spazio */
  .btn-sm {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}

/* Loading states */
.btn.loading {
  pointer-events: none;
}

/* Permission table styles */
.table th {
  background-color: oklch(var(--b2));
  font-weight: 600;
  font-size: 0.875rem;
}

.table td {
  vertical-align: middle;
}

.table tr.hover:hover {
  background-color: oklch(var(--b2) / 0.5);
}

/* Category row styling */
.table tr.bg-base-100 {
  background-color: oklch(var(--b1)) !important;
  border-bottom: 2px solid oklch(var(--bc) / 0.1);
}

/* Checkbox states */
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

/* Search input in permissions */
.form-control .relative input:focus {
  border-color: rgb(var(--primary));
  box-shadow: 0 0 0 1px rgb(var(--primary) / 0.2);
}

.grid > div {
  padding: 0.5rem;
  background-color: oklch(var(--b1));
  border-radius: 0.375rem;
}

/* Responsive table on mobile */
@media (max-width: 768px) {
  .table {
    font-size: 0.75rem;
  }

  .table th,
  .table td {
    padding: 0.5rem 0.25rem;
  }

  .form-control input.input-sm {
    font-size: 0.75rem;
  }
}

/* Category toggle animation */
.btn-ghost {
  transition: transform 0.2s ease;
}

.btn-ghost:hover {
  transform: scale(1.05);
}

/* Stili specifici per la sezione Analytics */
.bg-blue-100 {
  background-color: #dbeafe;
}

.text-blue-600 {
  color: #2563eb;
}

.dark .bg-blue-900\/20 {
  background-color: rgba(30, 58, 138, 0.2);
}

/* Stili per la sezione Note */
.bg-orange-100 {
  background-color: #fed7aa;
}

.text-orange-600 {
  color: #ea580c;
}

.dark .bg-orange-900\/20 {
  background-color: rgba(154, 52, 18, 0.2);
}

/* Form animations */
.form-control {
  position: relative;
}

.form-control input,
.form-control select,
.form-control textarea {
  transition: all 0.2s ease;
}

.form-control input:hover,
.form-control select:hover,
.form-control textarea:hover {
  border-color: rgb(var(--primary) / 0.3);
}

/* Password strength indicator */
.h-2 {
  transition: all 0.3s ease;
}

/* Alert animations */
.alert {
  animation: slideInUp 0.4s ease-out;
}

/* Breadcrumb styling */
.breadcrumbs a:hover {
  color: rgb(var(--primary));
}

/* Stili per migliorare l'aspetto dei campi numerici piccoli */
.w-20 {
  width: 5rem;
}

/* Stili per i controlli dipendenti */
.ml-6 {
  margin-left: 1.5rem;
  border-left: 2px solid oklch(var(--bc) / 0.1);
  padding-left: 1rem;
}

/* Miglioramenti per l'accessibilità dei pulsanti azione */
.btn-sm {
  transition: all 0.2s ease;
}

.btn-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Stili per i campi readonly */
.input-disabled {
  background-color: oklch(var(--b2));
  cursor: not-allowed;
}

/* Animazioni per i toggle delle sezioni */
.checkbox {
  transition: all 0.2s ease;
}

.checkbox:hover {
  transform: scale(1.05);
}
</style>
