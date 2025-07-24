<template>
  <div class="data-table-wrapper">
    <!-- Toolbar -->
    <div v-if="showToolbar" class="data-table-toolbar mb-4 p-4 bg-base-100 rounded-lg shadow-sm border">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Left side - Search and filters -->
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
          <!-- Global Search -->
          <div v-if="showGlobalSearch" class="relative flex-1 max-w-md">
            <div class="relative">
              <input
                type="text"
                v-model="globalSearchValue"
                :placeholder="searchPlaceholder"
                class="input input-bordered input-sm w-full pl-10"
              />
              <FaIcon 
                icon="search" 
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" 
              />
            </div>
          </div>

          <!-- Clear Filters Button -->
          <button
            v-if="showClearFilters"
            @click="clearAllFilters"
            class="btn btn-ghost btn-sm"
            :disabled="!hasActiveFilters"
          >
            <FaIcon icon="times" class="mr-1" />
            Pulisci Filtri
          </button>
        </div>

        <!-- Right side - Actions -->
        <div class="flex gap-2">
          <!-- Column Toggle -->
          <div v-if="showColumnToggle" class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
              <FaIcon icon="columns" class="mr-1" />
              Colonne
            </div>
            <div tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
              <div class="menu-title">
                <span>Mostra/Nascondi Colonne</span>
              </div>
              <div class="max-h-64 overflow-y-auto">
                <div
                  v-for="col in toggleableColumns"
                  :key="col.field || col.key"
                  class="form-control"
                >
                  <label class="label cursor-pointer justify-start py-1">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm mr-2"
                      v-model="col.visible"
                    />
                    <span class="label-text text-sm">{{ col.header || col.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Export Dropdown -->
          <div v-if="showExport" class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-primary btn-sm">
              <FaIcon icon="download" class="mr-1" />
              Esporta
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
              <li><a @click="exportToCSV"><FaIcon icon="file-csv" class="mr-2" />CSV</a></li>
              <li><a @click="exportToExcel"><FaIcon icon="file-excel" class="mr-2" />Excel</a></li>
              <li><a @click="exportToPDF"><FaIcon icon="file-pdf" class="mr-2" />PDF</a></li>
            </ul>
          </div>

          <!-- Custom toolbar slot -->
          <slot name="toolbar"></slot>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <PDataTable 
      :value="data" 
      :loading="loading"
      :paginator="paginator"
      :rows="rows"
      :rowsPerPageOptions="rowsPerPageOptions"
      :sortField="sortField"
      :sortOrder="sortOrder"
      v-model:filters="internalFilters"
      :globalFilterFields="globalFilterFields"
      :selection="selection"
      :selectionMode="selectionMode"
      :dataKey="dataKey"
      :scrollable="scrollable"
      :scrollHeight="scrollHeight"
      :virtualScrollerOptions = "virtualScrollerOptions"
      :resizableColumns="resizableColumns"
      :reorderableColumns="reorderableColumns"
      :exportFilename="exportFilename"
      :filterDisplay="filterDisplay"
      :stateStorage="stateStorage"
      :stateKey="stateKey"
      :tableStyle="computedTableStyle"
      :autoLayout="false"
      :columnResizeMode="columnResizeMode"
      v-bind="$attrs"
      @row-select="$emit('row-select', $event)"
      @row-unselect="$emit('row-unselect', $event)"
      @selection-change="$emit('selection-change', $event)"
      @sort="$emit('sort', $event)"
      @page="$emit('page', $event)"
      @filter="$emit('filter', $event)"
      @column-resize-end="onColumnResize"
      ref="dataTable"
    >
      <!-- Header with Global Search and Toolbar Integration -->
      <template #header>
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4">
          <!-- Left side - Search -->
          <div class="flex items-center gap-3 flex-1">
            <!-- Clear Filters Button -->
            <button
              v-if="showClearFilters"
              @click="clearAllFilters"
              class="btn btn-ghost btn-sm"
              :disabled="!hasActiveFilters"
            >
              <FaIcon icon="times" class="mr-1" />
              Pulisci Filtri
            </button>
            
            <div v-if="showGlobalSearch" class="relative flex-1 max-w-md">
              <input
                type="text"
                v-model="globalSearchValue"
                :placeholder="searchPlaceholder"
                class="input input-bordered input-sm pl-10 w-full"
              />
              <FaIcon 
                icon="search" 
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" 
              />
            </div>
          </div>

          <!-- Right side - Actions -->
          <div class="flex items-center gap-2">
            <!-- Column Toggle -->
            <div v-if="showColumnToggle" class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
                <FaIcon icon="columns" class="mr-1" />
                Colonne
              </div>
              <div tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 z-[100]">
                <div class="menu-title">
                  <span>Mostra/Nascondi Colonne</span>
                </div>
                <div class="max-h-64 overflow-y-auto">
                  <div
                    v-for="col in toggleableColumns"
                    :key="col.field || col.key"
                    class="form-control"
                  >
                    <label class="label cursor-pointer justify-start py-1">
                      <input
                        type="checkbox"
                        class="checkbox checkbox-sm mr-2"
                        v-model="col.visible"
                      />
                      <span class="label-text text-sm whitespace-nowrap">{{ col.header || col.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Export Dropdown -->
            <div v-if="showExport" class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-primary btn-sm">
                <FaIcon icon="download" class="mr-1" />
                Esporta
              </div>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[100]">
                <li><a @click="exportToCSV"><FaIcon icon="file-csv" class="mr-2" />CSV</a></li>
                <li><a @click="exportToExcel"><FaIcon icon="file-excel" class="mr-2" />Excel</a></li>
                <li><a @click="exportToPDF"><FaIcon icon="file-pdf" class="mr-2" />PDF</a></li>
              </ul>
            </div>

            <!-- Custom toolbar slot -->
            <slot name="toolbar"></slot>
          </div>
        </div>
      </template>

      <!-- Dynamic Columns -->
      <PColumn 
        v-for="column in visibleColumns" 
        :key="column.field || column.key"
        :field="column.field || column.key"
        :header="column.header || column.label"
        :sortable="column.sortable || false"
        :style="getColumnStyle(column)"
        :class="column.class"
        :frozen="column.frozen"
        :alignFrozen="column.alignFrozen"
        :exportable="column.exportable !== false"
        :showFilterMenu="column.showFilterMenu !== false && showColumnFilters"
        :showFilterOperator="column.showFilterOperator !== false"
        :showClearButton="column.showClearButton !== false"
        :showApplyButton="column.showApplyButton !== false"
        :showFilterMatchModes="column.showFilterMatchModes !== false"
        :filterField="column.filterField || column.field || column.key"
        :filterMatchMode="column.filterMatchMode || 'contains'"
        :filterMenuStyle="column.filterMenuStyle"
      >
        <!-- Custom filter template -->
        <template #filter="{ filterModel }" v-if="getFilterType(column) === 'text'">
          <input 
            v-model="filterModel.value" 
            type="text" 
            :placeholder="`Cerca per ${(column.header || column.label).toLowerCase()}`"
            class="input input-xs input-bordered w-full"
          />
        </template>

        <template #filter="{ filterModel }" v-else-if="getFilterType(column) === 'select'">
          <select 
            v-model="filterModel.value" 
            class="select select-xs select-bordered w-full"
          >
            <option value="">Tutti</option>
            <option
              v-for="option in column.filterOptions || []"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </template>

        <!-- Custom column slot -->
        <template #body="slotProps" v-if="slots[`column-${column.field || column.key}`]">
          <slot 
            :name="`column-${column.field || column.key}`" 
            :data="slotProps.data"
            :value="getColumnValue(slotProps.data, column.field || column.key)"
            :index="slotProps.index"
          ></slot>
        </template>
        
        <!-- Default column content -->
        <template #body="slotProps" v-else>
          {{ getColumnValue(slotProps.data, column.field || column.key) }}
        </template>
      </PColumn>

      <!-- Actions Column -->
      <PColumn 
        v-if="slots.actions" 
        header="Azioni" 
        :exportable="false" 
        frozen 
        alignFrozen="right"
        :style="getActionColumnStyle()"
      >
        <template #body="slotProps">
          <slot 
            name="actions" 
            :data="slotProps.data"
            :index="slotProps.index"
          ></slot>
        </template>
      </PColumn>

      <template #footer v-if="slots.footer">
        <slot name="footer"></slot>
      </template>

      <template #empty v-if="slots.empty">
        <slot name="empty"></slot>
      </template>
      
      <template #empty v-else>
        <div class="text-center py-8">
          <FaIcon icon="inbox" class="text-4xl text-gray-400 mb-3"/>
          <p class="text-gray-500 text-lg mb-2">Nessun dato disponibile</p>
          <p class="text-gray-400 text-sm">
            {{ hasActiveFilters ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono elementi da visualizzare' }}
          </p>
        </div>
      </template>
    </PDataTable>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, useSlots } from 'vue'
import { FaIcon } from '..'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  paginator: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 10
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 25, 50]
  },
  sortField: {
    type: String,
    default: null
  },
  sortOrder: {
    type: Number,
    default: 1
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  globalFilterFields: {
    type: Array,
    default: () => []
  },
  selection: {
    type: [Object, Array],
    default: null
  },
  selectionMode: {
    type: String,
    default: null,
    validator: (value) => [null, 'single', 'multiple'].includes(value)
  },
  dataKey: {
    type: String,
    default: 'id'
  },
  scrollable: {
    type: Boolean,
    default: false
  },
  scrollHeight: {
    type: String,
    default: '400px'
  },
  resizableColumns: {
    type: Boolean,
    default: true
  },
  reorderableColumns: {
    type: Boolean,
    default: false
  },
  columnResizeMode: {
    type: String,
    default: 'expand',
    validator: (value) => ['fit', 'expand'].includes(value)
  },
  // Enhanced features props
  showToolbar: {
    type: Boolean,
    default: false
  },
  showGlobalSearch: {
    type: Boolean,
    default: true
  },
  showColumnFilters: {
    type: Boolean,
    default: true
  },
  showExport: {
    type: Boolean,
    default: true
  },
  showColumnToggle: {
    type: Boolean,
    default: true
  },
  showClearFilters: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Cerca...'
  },
  exportFilename: {
    type: String,
    default: 'data'
  },
  filterDisplay: {
    type: String,
    default: 'menu',
    validator: (value) => ['row', 'menu'].includes(value)
  },
  stateStorage: {
    type: String,
    default: 'session',
    validator: (value) => ['local', 'session', null].includes(value)
  },
  stateKey: {
    type: String,
    default: 'dt-state-demo'
  },
  // Auto column sizing props
  autoColumnSizing: {
    type: Boolean,
    default: true
  },
  minTableWidth: {
    type: String,
    default: '50rem'
  },
  actionColumnWidth: {
    type: String,
    default: '120px'
  },
  virtualScrollerOptions: {
    type: Object,
    default: () => ({})
  },
})

const emit = defineEmits([
  'row-select',
  'row-unselect', 
  'selection-change',
  'sort',
  'page',
  'filter'
])

// Refs
const dataTable = ref()
const globalSearchValue = ref('')
const slots = useSlots()

// Initialize filters with global filter
const internalFilters = ref({
  global: { value: null, matchMode: 'contains' }
})

// Initialize toggleable columns with visibility
const toggleableColumns = ref(
  props.columns.map(col => ({
    ...col,
    visible: col.visible !== false
  }))
)

// Watch for columns prop changes
watch(() => props.columns, (newColumns) => {
  toggleableColumns.value = newColumns.map(col => ({
    ...col,
    visible: col.visible !== false
  }))
  nextTick(() => {
    if (props.autoColumnSizing) {
      calculateColumnWidths()
    }
  })
}, { deep: true })

// Watch for external filters changes
watch(() => props.filters, (newFilters) => {
  internalFilters.value = { ...internalFilters.value, ...newFilters }
}, { deep: true, immediate: true })

// Watch global search
watch(globalSearchValue, (newValue) => {
  internalFilters.value.global.value = newValue
})

// Watch for data changes to recalculate widths
watch(() => props.data, () => {
  nextTick(() => {
    if (props.autoColumnSizing) {
      calculateColumnWidths()
    }
  })
}, { deep: true })

// Computed
const visibleColumns = computed(() => {
  return toggleableColumns.value.filter(col => col.visible)
})

// Watch visible columns changes
watch(visibleColumns, () => {
  nextTick(() => {
    if (props.autoColumnSizing) {
      calculateColumnWidths()
    }
  })
}, { deep: true })

const hasActiveFilters = computed(() => {
  return globalSearchValue.value || 
         Object.keys(internalFilters.value).some(key => {
           if (key === 'global') return false
           return internalFilters.value[key]?.value != null && internalFilters.value[key]?.value !== ''
         })
})

const computedTableStyle = computed(() => {
  return `min-width: ${props.minTableWidth}; table-layout: fixed; width: 100%;`
})

// Auto Column Sizing Logic
const calculateColumnWidths = () => {
  if (!props.autoColumnSizing) return
  
  nextTick(() => {
    const tableElement = dataTable.value?.$el?.querySelector('.p-datatable-table')
    if (!tableElement) return

    const visibleCols = visibleColumns.value
    const hasActions = !!slots.actions
    
    // Get container width - usa il wrapper della tabella
    const wrapper = tableElement.closest('.data-table-wrapper') || tableElement.closest('.p-datatable-wrapper')
    const containerWidth = wrapper?.clientWidth || 1200
    
    // Calcola la larghezza disponibile per le colonne di contenuto
    const actionWidth = hasActions ? parseInt(props.actionColumnWidth) : 0
    const scrollbarWidth = 17 // Larghezza approssimativa scrollbar
    const paddingAndBorders = 20 // Padding e bordi vari
    const availableWidth = containerWidth - actionWidth - scrollbarWidth - paddingAndBorders
    
    // Calculate optimal widths based on content and priorities
    const columnWidths = calculateOptimalWidths(visibleCols, availableWidth)
    
    // Apply widths
    applyColumnWidths(columnWidths, hasActions)
  })
}

const calculateOptimalWidths = (columns, availableWidth) => {
  const minWidths = {
    short: 80,    // Per badge, codici, etc.
    medium: 120,  // Per username, ID
    long: 180,    // Per nomi, descrizioni brevi
    xlarge: 250   // Per descrizioni lunghe
  }

  // Prima passa: calcola le percentuali ideali per ogni colonna
  const columnConfigs = columns.map((col, index) => {
    const field = col.field || col.key
    let percentage, minWidth
    
    // Se la colonna ha una larghezza specificata, convertila in percentuale
    if (col.width) {
      if (col.width.includes('%')) {
        percentage = parseFloat(col.width) / 100
      } else {
        percentage = parseFloat(col.width) / availableWidth
      }
      minWidth = col.minWidth ? parseFloat(col.minWidth) : minWidths.medium
      return { index, percentage, minWidth, field }
    }

    // Determina percentuale in base al tipo di campo
    if (field?.includes('id') || field?.includes('code') || field?.includes('cod')) {
      percentage = 0.10 // 10%
      minWidth = minWidths.short
    } else if (field?.includes('username') || field?.includes('email')) {
      percentage = 0.20 // 20%
      minWidth = minWidths.medium
    } else if (field?.includes('name') || field?.includes('nome') || field?.includes('title') || field?.includes('titolo')) {
      percentage = 0.30 // 30%
      minWidth = minWidths.long
    } else if (field?.includes('description') || field?.includes('descrizione') || field?.includes('note')) {
      percentage = 0.35 // 35%
      minWidth = minWidths.xlarge
    } else if (col.filterType === 'select' && col.filterOptions?.length <= 5) {
      percentage = 0.12 // 12%
      minWidth = minWidths.short
    } else {
      // Default: distribuzione equa
      percentage = 1 / columns.length
      minWidth = minWidths.medium
    }

    return { index, percentage, minWidth, field }
  })

  // Seconda passa: normalizza le percentuali per occupare il 100%
  const totalPercentage = columnConfigs.reduce((sum, config) => sum + config.percentage, 0)
  const normalizedConfigs = columnConfigs.map(config => ({
    ...config,
    percentage: config.percentage / totalPercentage
  }))

  // Terza passa: calcola le larghezze finali assicurandosi che rispettino i minimi
  const finalWidths = normalizedConfigs.map(config => {
    const calculatedWidth = availableWidth * config.percentage
    const finalWidth = Math.max(calculatedWidth, config.minWidth)
    
    return {
      index: config.index,
      width: `${(finalWidth / availableWidth * 100).toFixed(2)}%`,
      minWidth: `${config.minWidth}px`,
      field: config.field
    }
  })

  return finalWidths
}

const applyColumnWidths = (columnWidths, hasActions) => {
  // Applica le larghezze percentuali alle colonne
  columnWidths.forEach(({ index, width, minWidth }) => {
    // Applica agli elementi col per la struttura della tabella
    const colElement = dataTable.value?.$el?.querySelector(`.p-datatable-table col:nth-child(${index + 1})`)
    if (colElement) {
      colElement.style.width = width
      colElement.style.minWidth = minWidth
    }

    // Applica agli header per controllo aggiuntivo
    const headerElement = dataTable.value?.$el?.querySelector(`.p-datatable-thead > tr > th:nth-child(${index + 1})`)
    if (headerElement) {
      headerElement.style.width = width
      headerElement.style.minWidth = minWidth
      headerElement.style.maxWidth = 'none' // Rimuovi max-width per permettere l'espansione
    }
  })

  // Gestisci colonna azioni se presente (sempre con larghezza fissa)
  if (hasActions) {
    const actionColIndex = columnWidths.length + 1
    const actionWidth = props.actionColumnWidth
    
    const actionColElement = dataTable.value?.$el?.querySelector(`.p-datatable-table col:nth-child(${actionColIndex})`)
    if (actionColElement) {
      actionColElement.style.width = actionWidth
      actionColElement.style.minWidth = actionWidth
      actionColElement.style.maxWidth = actionWidth
    }

    const actionHeaderElement = dataTable.value?.$el?.querySelector(`.p-datatable-thead > tr > th:nth-child(${actionColIndex})`)
    if (actionHeaderElement) {
      actionHeaderElement.style.width = actionWidth
      actionHeaderElement.style.minWidth = actionWidth
      actionHeaderElement.style.maxWidth = actionWidth
    }
  }

  // Forza la tabella a utilizzare tutto lo spazio disponibile
  const tableElement = dataTable.value?.$el?.querySelector('.p-datatable-table')
  if (tableElement) {
    tableElement.style.width = '100%'
    tableElement.style.tableLayout = 'fixed'
  }
}

// Methods
const getColumnValue = (data, field) => {
  if (!field) return ''
  
  return field.split('.').reduce((obj, key) => {
    return obj?.[key]
  }, data) || ''
}

const getFilterType = (column) => {
  if (column.filterType) return column.filterType
  if (column.filterOptions) return 'select'
  if (column.multiSelectFilter) return 'multiselect'
  return 'text'
}

const getColumnStyle = (column) => {
  if (!props.autoColumnSizing) {
    return column.style || ''
  }
  
  // Gli stili verranno applicati dinamicamente
  return column.style || ''
}

const getActionColumnStyle = () => {
  if (!props.autoColumnSizing) {
    return `width: ${props.actionColumnWidth}; min-width: ${props.actionColumnWidth};`
  }
  
  return `width: ${props.actionColumnWidth}; min-width: ${props.actionColumnWidth}; max-width: ${props.actionColumnWidth};`
}

const onColumnResize = (event) => {
  // Gestisci resize manuale delle colonne
  if (props.autoColumnSizing) {
    // Potresti voler disabilitare temporaneamente auto-sizing
    // o aggiornare le larghezze calcolate
  }
}

const clearAllFilters = () => {
  globalSearchValue.value = ''
  internalFilters.value = {
    global: { value: null, matchMode: 'contains' }
  }
  
  if (dataTable.value) {
    dataTable.value.clearFilters()
  }
}

// Initialize filters for all columns
const initializeFilters = () => {
  const filters = {
    global: { value: null, matchMode: 'contains' }
  }
  
  toggleableColumns.value.forEach(col => {
    const field = col.filterField || col.field || col.key
    if (field && !filters[field]) {
      filters[field] = { value: null, matchMode: col.filterMatchMode || 'contains' }
    }
  })
  
  internalFilters.value = filters
}

// Export functions
const exportToCSV = () => {
  if (dataTable.value) {
    dataTable.value.exportCSV()
  }
}

const exportToExcel = () => {
  const exportData = getExportData()
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${props.exportFilename}.xlsx`)
}

const exportToPDF = () => {
  const doc = new jsPDF()
  const exportData = getExportData()
  
  const headers = visibleColumns.value
    .filter(col => col.exportable !== false)
    .map(col => col.header || col.label)
  
  const rows = exportData.map(row => 
    visibleColumns.value
      .filter(col => col.exportable !== false)
      .map(col => getColumnValue(row, col.field || col.key))
  )

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] }
  })

  doc.save(`${props.exportFilename}.pdf`)
}

const getExportData = () => {
  if (hasActiveFilters.value && dataTable.value) {
    return dataTable.value.processedData || props.data
  }
  return props.data
}

// Resize observer per responsive design
let resizeObserver
const setupResizeObserver = () => {
  if (typeof ResizeObserver !== 'undefined' && props.autoColumnSizing) {
    resizeObserver = new ResizeObserver(() => {
      calculateColumnWidths()
    })
    
    const container = dataTable.value?.$el?.closest('.data-table-wrapper')
    if (container) {
      resizeObserver.observe(container)
    }
  }
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initializeFilters()
    if (props.autoColumnSizing) {
      calculateColumnWidths()
      setupResizeObserver()
    }
  })
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// Initialize filters on data changes
watch(() => props.data, () => {
  nextTick(() => {
    initializeFilters()
  })
}, { immediate: true })

// Initialize columns filters
watch(() => toggleableColumns.value, () => {
  nextTick(() => {
    initializeFilters()
  })
}, { deep: true })
</script>

<style scoped>
.data-table-wrapper {
  width: 100%;
  position: relative; /* Importante per il posizionamento dei tooltip */
  overflow: visible; /* Permette ai tooltip di essere visibili fuori dal container */
}

/* Enhanced PrimeVue override styles for auto column sizing */
:deep(.p-datatable) {
  font-size: 0.875rem;
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
}

:deep(.p-datatable .p-datatable-table) {
  table-layout: fixed;
  width: 100% !important;
  min-width: 100%;
}

:deep(.p-datatable .p-datatable-wrapper) {
  width: 100%;
  overflow-x: auto;
}

:deep(.p-datatable .p-datatable-header) {
  background: var(--surface-0);
  border: 1px solid var(--surface-200);
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: var(--surface-100);
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 1px solid var(--surface-200);
  white-space: nowrap;
  overflow: visible; /* Cambiato da hidden a visible per i tooltip */
  text-overflow: ellipsis;
  position: relative;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem;
  border-bottom: 1px solid var(--surface-200);
  white-space: nowrap;
  overflow: visible; /* Cambiato da hidden a visible per i tooltip */
  text-overflow: ellipsis;
  position: relative; /* Necessario per il posizionamento dei tooltip */
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  position: static; /* Cambiato da relative per permettere ai tooltip di uscire */
}

:deep(.p-datatable .p-datatable-tbody) {
  overflow: visible; /* Permette ai tooltip di essere visibili */
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: var(--surface-50);
}

/* Resizable columns styling */
:deep(.p-datatable .p-resizable-column .p-column-resizer) {
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
  width: 2px;
  height: 100%;
  padding: 0;
  cursor: col-resize;
  border: 1px solid transparent;
}

:deep(.p-datatable .p-resizable-column .p-column-resizer:hover) {
  border-color: var(--primary-color);
}

/* Column filter styling */
:deep(.p-column-filter-menu) {
  min-width: 12rem;
}

:deep(.p-column-filter-menu .p-column-filter-menu-button) {
  margin-left: 0.5rem;
}

/* Input styling */
:deep(.p-inputtext) {
  border-radius: 0.375rem;
  border: 1px solid var(--surface-300);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-inputtext:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

:deep(.p-select) {
  border-radius: 0.375rem;
  border: 1px solid var(--surface-300);
  min-height: 2.5rem;
}

:deep(.p-multiselect) {
  border-radius: 0.375rem;
  border: 1px solid var(--surface-300);
  min-height: 2.5rem;
}

/* Auto column sizing specific styles */
:deep(.p-datatable-wrapper) {
  overflow-x: auto;
  overflow-y: visible; /* Cambiato per permettere ai tooltip di essere visibili verticalmente */
  position: relative;
}

:deep(.p-datatable) {
  position: relative;
  overflow: visible; /* Permette ai tooltip di essere visibili */
}

:deep(.p-datatable .p-datatable-table colgroup col) {
  transition: width 0.2s ease;
}

/* Frozen columns styling */
:deep(.p-datatable .p-frozen-column) {
  position: sticky;
  background: inherit;
  z-index: 1;
}

:deep(.p-datatable .p-frozen-column-left) {
  left: 0;
}

:deep(.p-datatable .p-frozen-column-right) {
  right: 0;
}

/* Toolbar styling */
.data-table-toolbar {
  border: 1px solid oklch(var(--bc) / 0.2);
}

/* Responsive improvements */
@media (max-width: 1200px) {
  :deep(.p-datatable .p-datatable-thead > tr > th),
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .data-table-toolbar {
    padding: 1rem;
  }
  
  .data-table-toolbar .flex {
    gap: 0.75rem;
  }
  
  /* Stack columns vertically on very small screens */
  :deep(.p-datatable .p-datatable-thead > tr > th),
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    white-space: normal;
    word-wrap: break-word;
    min-width: 100px;
  }
}

@media (max-width: 640px) {
  /* On mobile, make text wrap and reduce padding further */
  :deep(.p-datatable .p-datatable-thead > tr > th),
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.375rem;
    font-size: 0.75rem;
  }
}

/* Dropdown improvements */
.dropdown-content {
  border: 1px solid oklch(var(--bc) / 0.2);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.menu-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: oklch(var(--bc) / 0.6);
  padding: 0.5rem 1rem;
  border-bottom: 1px solid oklch(var(--bc) / 0.1);
  margin-bottom: 0.5em;
}

/* Loading state */
:deep(.p-datatable .p-datatable-loading-overlay) {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Selection styling */
:deep(.p-datatable .p-datatable-tbody > tr.p-highlight) {
  background-color: var(--primary-50);
  color: var(--primary-700);
}

:deep(.p-datatable .p-datatable-tbody > tr.p-highlight:hover) {
  background-color: var(--primary-100);
}

/* Empty state styling */
:deep(.p-datatable .p-datatable-emptymessage) {
  padding: 2rem;
  text-align: center;
}

/* Scrollbar styling for better UX */
:deep(.p-datatable-wrapper)::-webkit-scrollbar {
  height: 8px;
}

:deep(.p-datatable-wrapper)::-webkit-scrollbar-track {
  background: var(--surface-100);
  border-radius: 4px;
}

:deep(.p-datatable-wrapper)::-webkit-scrollbar-thumb {
  background: var(--surface-300);
  border-radius: 4px;
}

:deep(.p-datatable-wrapper)::-webkit-scrollbar-thumb:hover {
  background: var(--surface-400);
}

/* Animation for column width changes */
@keyframes columnResize {
  from {
    opacity: 0.8;
  }
  to {
    opacity: 1;
  }
}

:deep(.p-datatable .p-datatable-table.column-resizing) {
  animation: columnResize 0.2s ease;
}

/* Utility classes for column content types */
:deep(.column-numeric) {
  text-align: right;
}

:deep(.column-center) {
  text-align: center;
}

:deep(.column-badge) {
  text-align: center;
}

:deep(.column-actions) {
  text-align: center;
  white-space: nowrap;
}

/* Print styles */
@media print {
  .data-table-toolbar {
    display: none;
  }
  
  :deep(.p-datatable) {
    font-size: 10px;
  }
  
  :deep(.p-datatable .p-datatable-thead > tr > th),
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.25rem;
    border: 1px solid #000;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: transparent;
  }
}
</style>