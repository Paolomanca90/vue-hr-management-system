<template>
  <div class="data-table-wrapper">

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
      filterDisplay="row"
      :stateStorage="stateStorage"
      :stateKey="stateKey"
      columnResizeMode="fit"
      stripedRows
      showGridlines
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
      ref="dataTable"
    >
      <template #header>
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4">
          <div class="flex items-center gap-3 flex-1">
            <!-- Clear -->
            <button
              v-if="showClearFilters"
              @click="clearAllFilters"
              class="btn btn-ghost btn-sm"
              :disabled="!hasActiveFilters"
            >
              <FaIcon icon="times" class="mr-1" />
              Pulisci Filtri
            </button>
            
            <!-- Search -->
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
              <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
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

      <!-- Actions Column - SEMPRE PRIMA e SEMPRE FROZEN -->
      <PColumn 
        v-if="slots.actions" 
        header="Azioni" 
        :exportable="false" 
        frozen 
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
        :showFilterMenu="true"
        :showFilterOperator="true"
        :showClearButton="true"
        :showApplyButton="false"
        :showFilterMatchModes="true"
        :filterField="column.filterField || column.field || column.key"
        :filterMatchMode="column.filterMatchMode || 'contains'"
        :dataType="column.dataType || 'text'"
      >
        <template #filter="{ filterModel, filterCallback }" v-if="getFilterType(column) === 'text'">
          <PInputText 
            v-model="filterModel.value" 
            type="text" 
            :placeholder="`Cerca per ${(column.header || column.label).toLowerCase()}`"
            @input="filterCallback()"
            style="width: 100%"
          />
        </template>

        <template #filter="{ filterModel, filterCallback }" v-else-if="getFilterType(column) === 'select'">
          <PSelect 
            v-model="filterModel.value" 
            :options="column.filterOptions || []"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleziona"
            :showClear="true"
            @change="filterCallback()"
            style="width: 100%"
          />
        </template>

        <template #filter="{ filterModel, filterCallback }" v-else-if="getFilterType(column) === 'multiselect'">
          <PMultiSelect 
            v-model="filterModel.value" 
            :options="column.filterOptions || []"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleziona"
            :maxSelectedLabels="1"
            @change="filterCallback()"
            style="width: 100%"
          />
        </template>

        <template #filter="{ filterModel, filterCallback }" v-else-if="getFilterType(column) === 'boolean'">
          <PCheckbox 
            v-model="filterModel.value" 
            :indeterminate="filterModel.value === null"
            binary
            @change="filterCallback()"
          />
        </template>

        <!-- Custom column -->
        <template #body="slotProps" v-if="slots[`column-${column.field || column.key}`]">
          <slot 
            :name="`column-${column.field || column.key}`" 
            :data="slotProps.data"
            :value="getColumnValue(slotProps.data, column.field || column.key)"
            :index="slotProps.index"
          ></slot>
        </template>
        
        <!-- Default column -->
        <template #body="slotProps" v-else>
          {{ getColumnValue(slotProps.data, column.field || column.key) }}
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
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

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
    default: 'row',
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

const dataTable = ref()
const globalSearchValue = ref('')
const slots = useSlots()

const internalFilters = ref({
  global: { value: null, matchMode: 'contains' }
})

const toggleableColumns = ref(
  props.columns.map(col => ({
    ...col,
    visible: col.visible !== false
  }))
)

watch(() => props.columns, (newColumns) => {
  toggleableColumns.value = newColumns.map(col => ({
    ...col,
    visible: col.visible !== false
  }))
}, { deep: true })

watch(() => props.filters, (newFilters) => {
  internalFilters.value = { ...internalFilters.value, ...newFilters }
}, { deep: true, immediate: true })

watch(globalSearchValue, (newValue) => {
  internalFilters.value.global.value = newValue
})

watch(() => props.data, () => {
}, { deep: true })

const visibleColumns = computed(() => {
  return toggleableColumns.value.filter(col => col.visible)
})

watch(visibleColumns, () => {
}, { deep: true })

const hasActiveFilters = computed(() => {
  return globalSearchValue.value || 
         Object.keys(internalFilters.value).some(key => {
           if (key === 'global') return false
           return internalFilters.value[key]?.value != null && internalFilters.value[key]?.value !== ''
         })
})

const computedTableStyle = computed(() => {
  return `min-width: 100%; width: 100%;`
})

// Methods
const getColumnValue = (data, field) => {
  if (!field) return ''
  
  return field.split('.').reduce((obj, key) => {
    return obj?.[key]
  }, data) || ''
}

const getFilterType = (column) => {
  if (column.filterType) return column.filterType
  if (column.dataType === 'boolean') return 'boolean'
  if (column.filterOptions) return 'select'
  if (column.multiSelectFilter) return 'multiselect'
  return 'text'
}

const getColumnStyle = (column) => {
  return column.style || ''
}

const getActionColumnStyle = () => {
  return `min-width: ${props.actionColumnWidth}; width: ${props.actionColumnWidth};`
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

// Export
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
  try {    
    const exportData = getExportData()
    
    if (!exportData || exportData.length === 0) {
      console.warn('Nessun dato da esportare')
      alert('Nessun dato disponibile per l\'esportazione')
      return
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Headers della tabella
    const headers = visibleColumns.value
      .filter(col => col.exportable !== false)
      .map(col => col.header || col.label)
    
    // Dati della tabella
    const rows = exportData.map(row => 
      visibleColumns.value
        .filter(col => col.exportable !== false)
        .map(col => {
          const value = getColumnValue(row, col.field || col.key)
          return value !== null && value !== undefined ? String(value) : ''
        })
    )

    // Titolo del documento
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Report Dati', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' })
    
    // Data di generazione
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const currentDate = new Date().toLocaleDateString('it-IT')
    doc.text(`Generato il: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' })

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40, right: 14, bottom: 20, left: 14 }
    })

    // Salva il file
    const filename = `${props.exportFilename || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)    
  } catch (error) {
    console.error('Errore durante l\'esportazione PDF:', error)
    alert(`Errore durante l'esportazione PDF: ${error.message}`)
  }
}

const getExportData = () => {
  if (hasActiveFilters.value && dataTable.value) {
    return dataTable.value.processedData || props.data
  }
  return props.data
}

onMounted(() => {
  nextTick(() => {
    initializeFilters()
  })
})

watch(() => props.data, () => {
  nextTick(() => {
    initializeFilters()
  })
}, { immediate: true })

watch(() => toggleableColumns.value, () => {
  nextTick(() => {
    initializeFilters()
  })
}, { deep: true })
</script>

<style scoped>
.data-table-wrapper {
  width: 100%;
  position: relative;
  overflow: visible; 
}

:deep(.p-datatable) {
  font-size: 0.875rem;
  border-radius: 0.5rem;
  overflow: visible;
  width: 100%;
}

:deep(.p-datatable .p-datatable-table) {
  width: 100% !important;
}

:deep(.p-datatable .p-datatable-wrapper) {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
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
  white-space: nowrap;
  overflow: visible;
  text-overflow: ellipsis;
  position: relative;
}

:deep(.p-datatable .p-datatable-thead > tr:first-child > th) {
  border-bottom: 1px solid var(--surface-300);
  padding-bottom: 0.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr:nth-child(2) > th) {
  padding-top: 0.5rem;
  padding-bottom: 0.75rem;
  background-color: var(--surface-50);
  border-top: 1px solid var(--surface-300);
}

:deep(.p-datatable .p-datatable-thead > tr:nth-child(2) .p-column-filter) {
  width: 100%;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem;
  white-space: nowrap;
  overflow: visible;
  text-overflow: ellipsis;
  position: relative;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  position: relative;
}

:deep(.p-datatable .p-datatable-tbody) {
  overflow: visible;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: var(--surface-50);
}

:deep(.p-datatable .p-datatable-tbody > tr > td:first-child) {
  overflow: visible !important;
  position: relative !important;
  z-index: 10 !important;
}

:deep(.p-column-filter-row .p-column-filter-element) {
  width: 100%;
}

:deep(.p-column-filter-row .input) {
  width: 100%;
  min-width: 100px;
}

:deep(.p-column-filter-row .select) {
  width: 100%;
  min-width: 120px;
}

.tooltip:before,
.tooltip:after {
  z-index: 9999 !important;
}

.tooltip:hover:before,
.tooltip:hover:after {
  z-index: 10000 !important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td:first-child .tooltip) {
  position: relative;
  z-index: 1000;
}

:deep(.p-datatable .p-datatable-tbody > tr > td:first-child .tooltip:hover) {
  z-index: 10001 !important;
}

.tooltip:hover {
  z-index: 10002 !important;
}

.tooltip[data-tip]:hover:before,
.tooltip[data-tip]:hover:after {
  z-index: 10003 !important;
}

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

:deep(.p-datatable-wrapper) {
  overflow-x: auto;
  overflow-y: visible;
  position: relative;
}

:deep(.p-datatable) {
  position: relative;
  overflow: visible;
}

:deep(.p-datatable .p-datatable-table colgroup col) {
  transition: width 0.2s ease;
}

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

.data-table-toolbar {
  border: 1px solid oklch(var(--bc) / 0.2);
}

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
  
  :deep(.p-datatable .p-datatable-thead > tr > th),
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    white-space: normal;
    word-wrap: break-word;
    min-width: 100px;
  }
}

@media (max-width: 640px) {
  :deep(.p-datatable .p-datatable-thead > tr > th),
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.375rem;
    font-size: 0.75rem;
  }
}

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

:deep(.p-datatable .p-datatable-loading-overlay) {
  background-color: rgba(255, 255, 255, 0.9);
}

:deep(.p-datatable .p-datatable-tbody > tr.p-highlight) {
  background-color: var(--primary-50);
  color: var(--primary-700);
}

:deep(.p-datatable .p-datatable-tbody > tr.p-highlight:hover) {
  background-color: var(--primary-100);
}

:deep(.p-datatable .p-datatable-emptymessage) {
  padding: 2rem;
  text-align: center;
}

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