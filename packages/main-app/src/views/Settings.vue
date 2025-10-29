<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Sezioni delle impostazioni -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Menu laterale -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h3 class="text-lg font-semibold text-base-content mb-4">Categorie</h3>
          <ul class="menu p-0 space-y-2">
            <li>
              <a class="active">
                <i class="fas fa-building mr-3"></i>
                Azienda
              </a>
            </li>
            <li>
              <a>
                <i class="fas fa-users mr-3"></i>
                Dipendenti
              </a>
            </li>
            <li>
              <a>
                <i class="fas fa-shield-alt mr-3"></i>
                Sicurezza
              </a>
            </li>
            <li>
              <a>
                <i class="fas fa-bell mr-3"></i>
                Notifiche
              </a>
            </li>
            <li>
              <a>
                <i class="fas fa-plug mr-3"></i>
                Integrazioni
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Contenuto impostazioni -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Impostazioni Azienda -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="text-lg font-semibold text-base-content mb-4">Informazioni Azienda</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Nome Azienda</span>
                  </label>
                  <input type="text" class="input input-bordered" v-model="companySettings.name" />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Codice Fiscale</span>
                  </label>
                  <input
                    type="text"
                    class="input input-bordered"
                    v-model="companySettings.fiscalCode"
                  />
                </div>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Indirizzo</span>
                </label>
                <input type="text" class="input input-bordered" v-model="companySettings.address" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Email</span>
                  </label>
                  <input
                    type="email"
                    class="input input-bordered"
                    v-model="companySettings.email"
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Telefono</span>
                  </label>
                  <input type="tel" class="input input-bordered" v-model="companySettings.phone" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Impostazioni Sistema -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="text-lg font-semibold text-base-content mb-4">Impostazioni Sistema</h3>
            <div class="space-y-4">
              <div class="form-control">
                <label class="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    class="toggle toggle-success mr-4"
                    v-model="systemSettings.emailNotifications"
                  />
                  <div>
                    <span class="label-text font-medium">Notifiche Email</span>
                    <p class=" text-base-content/60">
                      Ricevi notifiche via email per eventi importanti
                    </p>
                  </div>
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    class="toggle toggle-warning mr-4"
                    v-model="systemSettings.autoBackup"
                  />
                  <div>
                    <span class="label-text font-medium">Backup Automatico</span>
                    <p class=" text-base-content/60">
                      Esegui backup automatico dei dati ogni settimana
                    </p>
                  </div>
                </label>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Lingua Sistema</span>
                </label>
                <select class="select select-bordered" v-model="systemSettings.language">
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sezione in costruzione -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body text-center py-12">
        <div
          class="bg-base-200 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center"
        >
          <i class="fas fa-cogs text-base-content/40 text-4xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-base-content mb-2">Impostazioni Avanzate</h3>
        <p class="text-base-content/70 mb-6">Funzionalità avanzate in fase di sviluppo</p>
        <div class="alert alert-info max-w-md mx-auto">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4 class="font-semibold mb-2">Prossime Funzionalità:</h4>
            <ul class=" space-y-1 text-left">
              <li>• Integrazione con sistemi esterni</li>
              <li>• Backup automatico dei dati</li>
              <li>• Personalizzazione temi</li>
              <li>• Configurazione avanzata permessi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const companySettings = ref({
  name: 'HR Company Srl',
  fiscalCode: '12345678901',
  address: 'Via Roma 123, Milano',
  email: 'info@hrcompany.com',
  phone: '+39 02 1234567',
})

const systemSettings = ref({
  emailNotifications: true,
  autoBackup: false,
  language: 'it',
})
</script>
