<template>
  <div class="data-table-wrapper" :class="{ 'filters-collapsed': filtersCollapsed }">

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
      columnResizeMode="expand"
      stripedRows
      showGridlines
      :tableStyle="computedTableStyle"
      :autoLayout="false"
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
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-4 lg:p-2">
          <div class="flex flex-col lg:flex-row lg:items-center gap-2 text-[oklch(var(--bc))]">
            <!-- Column Toggle -->
            <div v-if="showColumnToggle" class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="max-md:block max-md:w-full btn btn-ghost max-md:p-[0.5em] btn-sm ">
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
                      <span class="label-text  whitespace-nowrap">{{ col.header || col.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Export Dropdown -->
            <div v-if="showExport" class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="max-md:block max-md:w-full max-md:p-[0.5em] btn btn-ghost btn-sm ">
                <FaIcon icon="download" class="mr-1" />
                Esporta
              </div>
              <ul tabindex="0"  class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-60 z-[100]">
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
        :showFilterOperator="!filtersCollapsed"
        :showFilterMenu="!filtersCollapsed && getFilterType(column) !== 'select'"
        :showClearButton="!filtersCollapsed"
        :showApplyButton="false"
        :showFilterMatchModes="!filtersCollapsed"
        :filterField="column.filterField || column.field || column.key"
        :filterMatchMode="column.filterMatchMode || 'contains'"
        :dataType="column.dataType || 'text'"
      >
        <template #filter="{ filterModel, filterCallback }" v-if="!filtersCollapsed && getFilterType(column) === 'text'">
          <PInputText
            v-if="filterModel"
            v-model="filterModel.value"
            type="text"
            :placeholder="`Cerca per ${(column.header || column.label).toLowerCase()}`"
            @input="filterCallback()"
            style="width: 100%"
          />
        </template>

        <template #filter="{ filterModel, filterCallback }" v-else-if="!filtersCollapsed && getFilterType(column) === 'select'">
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

        <template #filter="{ filterModel, filterCallback }" v-else-if="!filtersCollapsed && getFilterType(column) === 'multiselect'">
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

        <template #filter="{ filterModel, filterCallback }" v-else-if="!filtersCollapsed && getFilterType(column) === 'boolean'">
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

      <!-- Actions Column - SEMPRE DOPO e SEMPRE FROZEN A DESTRA -->
      <PColumn
        :exportable="false"
        frozen
        alignFrozen="right"
        :style="getActionColumnStyle()"
      >
        <template #header>
          <button
            v-if="showColumnFilters"
            @click="filtersCollapsed = !filtersCollapsed"
            class="btn btn-ghost btn-xs"
            :title="filtersCollapsed ? 'Mostra filtri colonne' : 'Nascondi filtri colonne'"
          >
            <FaIcon :icon="filtersCollapsed ? 'chevron-down' : 'chevron-up'" />
          </button>
        </template>
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
          <p class="text-gray-400 ">
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
  showActions: {
    type: Boolean,
    default: true
  },
  editAction: {
    type: Function,
    default: null
  },
  duplicateAction: {
    type: Function,
    default: null
  },
  deleteAction: {
    type: Function,
    default: null
  },
  editTooltip: {
    type: String,
    default: 'Modifica'
  },
  duplicateTooltip: {
    type: String,
    default: 'Duplica'
  },
  deleteTooltip: {
    type: String,
    default: 'Elimina'
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
const filtersCollapsed = ref(false)

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
  // Larghezza 100% per occupare tutto lo spazio disponibile
  return `width: 100%; table-layout: auto;`
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
  if (column.style) return column.style
  return ''
}

const getActionColumnStyle = () => {
  return `width: 1px !important; white-space: nowrap !important; min-width: auto !important; max-width: none !important;`
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
.filters-collapsed :deep(.p-datatable .p-datatable-thead > tr:nth-child(2)) {
  display: none !important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td),
:deep(.p-datatable .p-datatable-header-cell),
:deep(.p-inputtext),
:deep(.p-datatable-filter-constraint) {
  padding: 0.3rem 1rem !important;
  font-size: 12px !important;
}

:deep(.p-button-icon-only.p-button-rounded) {
  height: 1.8rem !important;
  width: 1.8rem !important;
}

:deep(.p-datatable-header) {
  border: none !important;
  padding: 0 !important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  overflow: visible;
  position: relative;
}
</style>