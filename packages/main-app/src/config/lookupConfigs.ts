import { formatCap, type Comune } from '@/services/lookupService'
import type { LookupInputConfig } from '@/components/GenericLookupInput.vue'

// Configurazione per Comuni (AddressInput)
export const comuniLookupConfig: LookupInputConfig = {
  lookupType: 'comune',
  autoCompleteField: 'codiceBelfiore',
  keyField: 'CODICE',
  fields: [
    {
      key: 'indirizzo',
      label: 'Indirizzo',
      editable: true,
      colSpan: 10
    },
    {
      key: 'civico',
      label: 'Civico',
      editable: true,
      colSpan: 2
    },
    {
      key: 'codiceBelfiore',
      label: 'Codice Belfiore',
      editable: true,
      placeholder: 'Es. F205',
      colSpan: 2
    },
    {
      key: 'comune',
      label: 'Comune',
      editable: false,
      hasLookup: true,
      colSpan: 10
    },
    {
      key: 'cap',
      label: 'CAP',
      editable: true,
      type: 'text',
      colSpan: 6
    },
    {
      key: 'provincia',
      label: 'Provincia',
      editable: false,
      colSpan: 6
    }
  ],
  modalConfig: {
    title: 'Seleziona Comune',
    searchPlaceholder: 'Cerca per nome comune o codice belfiore...',
    columns: [
      { key: 'CODICE', label: 'Codice Belfiore', primary: true },
      { key: 'COMUNE', label: 'Nome Comune' },
      { key: 'CAP', label: 'CAP', formatter: (value) => formatCap(String(value)) },
      { key: 'PROVINCIA', label: 'Provincia' }
    ],
    searchFields: ['CODICE', 'COMUNE', 'PROVINCIA'],
    keyField: 'CODICE',
    loadingMessage: 'Caricamento comuni...'
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapper: (item: any): Partial<Comune> => ({
    codiceBelfiore: item.CODICE,
    nome: item.COMUNE,
    cap: formatCap(item.CAP),
    provincia: item.PROVINCIA
  })
}

// Configurazione per Gruppi Causali
export const gruppiCausaliLookupConfig: LookupInputConfig = {
  lookupType: 'gruppocausale',
  autoCompleteField: 'codice',
  keyField: 'CODGRCAU',
  fields: [
    {
      key: 'codice',
      label: 'Codice',
      editable: true,
      colSpan: 2
    },
    {
      key: 'codiceGruppo',
      label: 'Descrizione',
      editable: false,
      hasLookup: true,
      colSpan: 6
    },
    {
      key: 'abbreviazione',
      label: 'Abbreviazione',
      editable: true,
      colSpan: 4
    }
  ],
  modalConfig: {
    title: 'Seleziona Gruppo Causale',
    searchPlaceholder: 'Cerca per codice, codice gruppo o abbreviazione...',
    columns: [
      { key: 'CODGRCAU', label: 'Codice', primary: true },
      { key: 'DESCRIZIONE', label: 'Descrizione' }
    ],
    searchFields: ['CODGRCAU', 'DESCRIZIONE'],
    keyField: 'CODGRCAU',
    loadingMessage: 'Caricamento gruppi causali...'
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapper: (item: any) => ({
    codice: item.CODGRCAU || '',
    codiceGruppo: item.DESCRIZIONE || ''
  })
}

// Configurazioni per modali di filtro (FilterComponent)
export const filterModalConfigs = {
  sede: {
    title: 'Seleziona Sede',
    searchPlaceholder: 'Cerca sede...',
    columns: [
      { key: 'codSedeAz', label: 'Codice', primary: true },
      { key: 'descriz', label: 'Descrizione' }
    ],
    searchFields: ['codSedeAz', 'descriz'],
    keyField: 'codSedeAz',
    loadingMessage: 'Caricamento sedi...'
  },
  filiale: {
    title: 'Seleziona Filiale',
    searchPlaceholder: 'Cerca filiale...',
    columns: [
      { key: 'codCant', label: 'Codice', primary: true },
      { key: 'descriz', label: 'Descrizione' }
    ],
    searchFields: ['codCant', 'descriz'],
    keyField: 'codCant',
    loadingMessage: 'Caricamento filiali...'
  },
  reparto: {
    title: 'Seleziona Reparto',
    searchPlaceholder: 'Cerca reparto...',
    columns: [
      { key: 'codReparto', label: 'Codice', primary: true },
      { key: 'descriz', label: 'Descrizione' }
    ],
    searchFields: ['codReparto', 'descriz'],
    keyField: 'codReparto',
    loadingMessage: 'Caricamento reparti...'
  },
  centroCosto: {
    title: 'Seleziona Centro di Costo',
    searchPlaceholder: 'Cerca centro di costo...',
    columns: [
      { key: 'codCenco', label: 'Codice', primary: true },
      { key: 'descriz', label: 'Descrizione' }
    ],
    searchFields: ['codCenco', 'descriz'],
    keyField: 'codCenco',
    loadingMessage: 'Caricamento centri costo...'
  }
}

// Funzione helper per creare configurazioni personalizzate
export function createLookupConfig(
  lookupType: string,
  config: Partial<LookupInputConfig>
): LookupInputConfig {
  return {
    lookupType,
    autoCompleteField: config.autoCompleteField || 'codice',
    fields: config.fields || [],
    modalConfig: {
      title: config.modalConfig?.title || `Seleziona ${lookupType}`,
      searchPlaceholder: config.modalConfig?.searchPlaceholder || `Cerca ${lookupType}...`,
      columns: config.modalConfig?.columns || [],
      searchFields: config.modalConfig?.searchFields || ['CODICE'],
      keyField: config.modalConfig?.keyField || 'CODICE',
      loadingMessage: config.modalConfig?.loadingMessage || `Caricamento ${lookupType}...`
    },
    keyField: config.keyField,
    mapper: config.mapper
  }
}
