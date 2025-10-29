<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-base-content">Report</h1>
            <p class="text-base-content/70 mt-1">Analisi e statistiche del personale</p>
          </div>
          <div class="flex items-center space-x-3">
            <button class="btn btn-primary">
              <i class="fas fa-download mr-2"></i>
              Esporta Report
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards dei report -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="report in reportTypes"
        :key="report.title"
        class="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-200"
      >
        <div class="card-body text-center">
          <div
            :class="`bg-${report.color}-100 dark:bg-${report.color}-900/20 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center`"
          >
            <i :class="`${report.icon} text-${report.color}-600 text-2xl`"></i>
          </div>
          <h3 class="text-lg font-semibold text-base-content mb-2">{{ report.title }}</h3>
          <p class="text-base-content/70  mb-4">{{ report.description }}</p>
          <button
            :class="`btn btn-outline btn-${report.color}`"
            @click="generateReport(report.type)"
          >
            Genera Report
          </button>
        </div>
      </div>
    </div>

    <!-- Sezione in costruzione -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body text-center py-12">
        <div
          class="bg-base-200 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center"
        >
          <i class="fas fa-chart-bar text-base-content/40 text-4xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-base-content mb-2">Sezione in Sviluppo</h3>
        <p class="text-base-content/70 mb-6">
          I report dettagliati saranno disponibili nella prossima versione
        </p>
        <div class="alert alert-info max-w-md mx-auto">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4 class="font-semibold mb-2">Prossime Funzionalità:</h4>
            <ul class=" space-y-1 text-left">
              <li>• Grafici interattivi con Chart.js</li>
              <li>• Esportazione in PDF e Excel</li>
              <li>• Report personalizzabili</li>
              <li>• Analisi predittive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const reportTypes = ref([
  {
    title: 'Report Dipendenti',
    description: 'Statistiche complete sui dipendenti',
    icon: 'fas fa-users',
    color: 'blue',
    type: 'employees',
  },
  {
    title: 'Report Presenze',
    description: 'Analisi delle presenze mensili',
    icon: 'fas fa-calendar-check',
    color: 'green',
    type: 'attendance',
  },
  {
    title: 'Report Stipendi',
    description: 'Riepilogo costi del personale',
    icon: 'fas fa-euro-sign',
    color: 'yellow',
    type: 'payroll',
  },
])

const generateReport = (type: string) => {
  console.log('Generating report:', type)
}
</script>
