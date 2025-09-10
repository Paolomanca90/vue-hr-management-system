import { getApiConfig } from '@/config/api'
import { createCrudMethods } from './baseService'

export interface CampoDipendente {
  tabella: string
  campo: string
  tipologia: string
  dimensione: number
}

class DipendenteService {
  private config = getApiConfig()
  private campiCrud = createCrudMethods<CampoDipendente>({
    list: this.config.endpoints.getCampiDipendente
  })

  async getCampiDipendente(): Promise<CampoDipendente[]> {
    return this.campiCrud.getAll()
  }

  async getValoriCampo(tabella: string, campo: string): Promise<string[]> {
    return this.campiCrud.customRequest<string[]>({
      method: 'GET',
      customEndpoint: this.config.endpoints.getValoriCampo,
      params: { tabella, campo }
    })
  }
}

export const dipendenteService = new DipendenteService()
