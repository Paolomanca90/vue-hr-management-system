<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-base-content">Gestione Buste Paga</h1>
            <p class="text-base-content/70 mt-1">Gestisci e genera le buste paga dei dipendenti</p>
          </div>
          <div class="flex items-center space-x-3">
            <button class="btn btn-primary">
              <i class="fas fa-plus mr-2"></i>
              Nuova Busta Paga
            </button>
            <button class="btn btn-success">
              <i class="fas fa-download mr-2"></i>
              Esporta
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiche rapide -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center">
            <div class="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 mr-4">
              <i class="fas fa-euro-sign text-blue-600 text-xl"></i>
            </div>
            <div>
              <div class="text-2xl font-bold text-base-content">€125,000</div>
              <div class="text-sm text-base-content/70">Totale Mensile</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center">
            <div class="bg-green-100 dark:bg-green-900/20 rounded-lg p-3 mr-4">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div>
              <div class="text-2xl font-bold text-base-content">234</div>
              <div class="text-sm text-base-content/70">Buste Elaborate</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center">
            <div class="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-3 mr-4">
              <i class="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div>
              <div class="text-2xl font-bold text-base-content">12</div>
              <div class="text-sm text-base-content/70">In Elaborazione</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center">
            <div class="bg-red-100 dark:bg-red-900/20 rounded-lg p-3 mr-4">
              <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div>
              <div class="text-2xl font-bold text-base-content">3</div>
              <div class="text-sm text-base-content/70">Errori</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sezione in costruzione -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body text-center py-12">
        <div class="bg-base-200 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center">
          <i class="fas fa-money-check-alt text-base-content/40 text-4xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-base-content mb-2">Sistema Payroll Avanzato</h3>
        <p class="text-base-content/70 mb-6">Funzionalità complete in fase di sviluppo</p>
        <div class="alert alert-info max-w-md mx-auto">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4 class="font-semibold mb-2">Prossime Funzionalità:</h4>
            <ul class="text-sm space-y-1 text-left">
              <li>• Calcolo automatico tasse e contributi</li>
              <li>• Integrazione con sistemi bancari</li>
              <li>• Template buste paga personalizzabili</li>
              <li>• Gestione rimborsi spese</li>
              <li>• Report fiscali automatici</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>