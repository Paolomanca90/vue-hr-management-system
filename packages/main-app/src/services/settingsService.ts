import { getApiConfig } from '@/config/api'
import { createCrudMethods } from './baseService'

export interface Lingue {
    iD_LINGUA: number,
    codice: string,
    descrizione: string
}

export interface ImpostazioniInternazionali {
    iD_INTER: number,
    descrzione: string,
    seP_DEC: string,
    ragG_CIFRE: string,
    formatO_DATA: string,
    seP_DATA: string
}

export interface TabAccessi {
    codice: string,
    descrizione: string,
    formula: string
}

class SettingsService {
  private config = getApiConfig()
  private lingueCrud = createCrudMethods<Lingue>({
    list: this.config.endpoints.lingue
  })
  private impostazioniCrud = createCrudMethods<ImpostazioniInternazionali>({
    list: this.config.endpoints.impostazioniInternazionali
  })

  async getLingue(): Promise<Lingue[]> {
    return this.lingueCrud.getAll()
  }

  async getImpostazioniInternazionali(): Promise<ImpostazioniInternazionali[]> {
    return this.impostazioniCrud.getAll()
  }
}

export const settingsService = new SettingsService()
