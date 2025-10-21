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

// Configurazione per Gruppi Causali (senza abbreviazione)
export const causaliLookupConfig: LookupInputConfig = {
  lookupType: 'gruppocausale',
  autoCompleteField: 'codice',
  keyField: 'CODGRCAU',
  fields: [
    {
      key: 'codice',
      label: 'Codice',
      editable: true,
      colSpan: 3
    },
    {
      key: 'descrizione',
      label: 'Descrizione',
      editable: false,
      hasLookup: true,
      colSpan: 9
    }
  ],
  modalConfig: {
    title: 'Seleziona Gruppo Causale',
    searchPlaceholder: 'Cerca per codice o descrizione...',
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
    descrizione: item.DESCRIZIONE || ''
  })
}

// Configurazione per Causali singole
export const causaleLookupConfig: LookupInputConfig = {
  lookupType: 'causale',
  autoCompleteField: 'codice',
  keyField: 'CODCAU',
  fields: [
    {
      key: 'codice',
      label: 'Codice',
      editable: true,
      colSpan: 3
    },
    {
      key: 'descrizione',
      label: 'Descrizione',
      editable: false,
      hasLookup: true,
      colSpan: 9
    }
  ],
  modalConfig: {
    title: 'Seleziona Causale',
    searchPlaceholder: 'Cerca per codice o descrizione...',
    columns: [
      { key: 'CODCAU', label: 'Codice', primary: true },
      { key: 'DESCRIZIONE', label: 'Descrizione' }
    ],
    searchFields: ['CODCAU', 'DESCRIZIONE'],
    keyField: 'CODCAU',
    loadingMessage: 'Caricamento causali...'
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapper: (item: any) => ({
    codice: String(item.CODCAU || ''),
    descrizione: item.DESCRIZIONE || ''
  })
}

// Configurazione per P.A.T.
export const patLookupConfig: LookupInputConfig = {
  lookupType: 'pat',
  autoCompleteField: 'codice',
  keyField: 'codicePat',
  fields: [
    {
      key: 'codice',
      label: 'Codice',
      editable: true,
      colSpan: 3
    },
    {
      key: 'descrizione',
      label: 'Descrizione',
      editable: false,
      hasLookup: true,
      colSpan: 9
    }
  ],
  modalConfig: {
    title: 'Seleziona P.A.T.',
    searchPlaceholder: 'Cerca per codice o descrizione...',
    columns: [
      { key: 'codicePat', label: 'Codice', primary: true },
      { key: 'pat', label: 'Descrizione' }
    ],
    searchFields: ['codicePat', 'pat'],
    keyField: 'codicePat',
    loadingMessage: 'Caricamento P.A.T....'
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapper: (item: any) => ({
    codice: item.codicePat || '',
    descrizione: item.pat || ''
  })
}

// Configurazione per Gruppi Configurazione
export const gruppiConfigLookupConfig: LookupInputConfig = {
  lookupType: 'gruppiconfig',
  autoCompleteField: 'codice',
  keyField: 'codgruppo',
  fields: [
    {
      key: 'codice',
      label: 'Codice',
      editable: true,
      colSpan: 3
    },
    {
      key: 'descrizione',
      label: 'Descrizione',
      editable: false,
      hasLookup: true,
      colSpan: 9
    }
  ],
  modalConfig: {
    title: 'Seleziona Gruppo Configurazione',
    searchPlaceholder: 'Cerca per codice o descrizione...',
    columns: [
      { key: 'codgruppo', label: 'Codice', primary: true },
      { key: 'descrizione', label: 'Descrizione' }
    ],
    searchFields: ['codgruppo', 'descrizione'],
    keyField: 'codgruppo',
    loadingMessage: 'Caricamento gruppi configurazione...'
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapper: (item: any) => ({
    codice: item.codgruppo || '',
    descrizione: item.descrizione || ''
  })
}

// Configurazione per Province
export const provinciaLookupConfig: LookupInputConfig = {
  lookupType: 'provincia',
  autoCompleteField: 'codice',
  keyField: 'PROVINCIA',
  fields: [
    {
      key: 'codice',
      label: 'Sigla Prov.',
      editable: true,
      colSpan: 3
    },
    {
      key: 'descrizione',
      label: 'Nome',
      editable: false,
      hasLookup: true,
      colSpan: 9
    }
  ],
  modalConfig: {
    title: 'Seleziona Provincia',
    searchPlaceholder: 'Cerca per sigla o nome...',
    columns: [
      { key: 'PROVINCIA', label: 'Sigla', primary: true },
      { key: 'DESCRIZ', label: 'Nome' },
      { key: 'REGIONE', label: 'Regione' }
    ],
    searchFields: ['PROVINCIA', 'DESCRIZ', 'REGIONE'],
    keyField: 'PROVINCIA',
    loadingMessage: 'Caricamento province...'
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapper: (item: any) => ({
    codice: item.PROVINCIA || '',
    descrizione: item.DESCRIZ || ''
  })
}

// Configurazione per Contratti CCNL
export const contrattoLookupConfig: LookupInputConfig = {
  lookupType: 'contratto',
  autoCompleteField: 'codice',
  keyField: 'CODCCNL',
  fields: [
    {
      key: 'codice',
      label: 'Codice CCNL',
      editable: true,
      colSpan: 3
    },
    {
      key: 'descrizione',
      label: 'Descrizione',
      editable: false,
      hasLookup: true,
      colSpan: 9
    }
  ],
  modalConfig: {
    title: 'Seleziona Contratto CCNL',
    searchPlaceholder: 'Cerca per codice o descrizione...',
    columns: [
      { key: 'CODCCNL', label: 'Codice', primary: true },
      { key: 'DESCRIZ', label: 'Descrizione' }
    ],
    searchFields: ['CODCCNL', 'DESCRIZ'],
    keyField: 'CODCCNL',
    loadingMessage: 'Caricamento contratti...'
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapper: (item: any) => ({
    codice: item.CODCCNL || '',
    descrizione: item.DESCRIZ || ''
  })
}

// Configurazione per Orari
export const orarioLookupConfig: LookupInputConfig = {
  lookupType: 'orario',
  autoCompleteField: 'codice',
  keyField: 'CODORA',
  fields: [
    {
      key: 'codice',
      label: 'Codice',
      editable: true,
      colSpan: 3
    },
    {
      key: 'descrizione',
      label: 'Descrizione',
      editable: false,
      hasLookup: true,
      colSpan: 9
    }
  ],
  modalConfig: {
    title: 'Seleziona Orario',
    searchPlaceholder: 'Cerca per codice o descrizione...',
    columns: [
      { key: 'CODORA', label: 'Codice', primary: true },
      { key: 'DESCRIZIONE', label: 'Descrizione' }
    ],
    searchFields: ['CODORA', 'DESCRIZIONE'],
    keyField: 'CODORA',
    loadingMessage: 'Caricamento orari...'
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapper: (item: any) => ({
    codice: String(item.CODORA || ''),
    descrizione: item.DESCRIZIONE || ''
  })
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
