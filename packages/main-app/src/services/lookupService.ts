import { createCrudMethods } from './baseService'
import { getApiConfig } from '@/config/api'

export interface LookupRequest {
  tipo: string
  chiavi: Record<string, string>
}

export interface ComuneResponse {
  CODICE: string
  COMUNE: string
  PROVINCIA: string
  CAP: string | null
}

export interface Comune {
  codiceBelfiore: string
  nome: string
  cap: string
  provincia: string
}

class LookupService {
  private config = getApiConfig()
  private baseService = createCrudMethods({
    list: this.config.endpoints.lookup
  })

  async getComuni(searchFilter?: string): Promise<Comune[]> {
    const request: LookupRequest = {
      tipo: 'comune',
      chiavi: searchFilter ? { CODICE: `${searchFilter}%` } : {}
    }

    try {
      const response = await this.baseService.customRequest<ComuneResponse[]>({
        method: 'POST',
        customEndpoint: this.config.endpoints.lookupList,
        body: request
      })

      return response.map(item => ({
        codiceBelfiore: item.CODICE,
        nome: item.COMUNE,
        cap: item.CAP || '',
        provincia: item.PROVINCIA
      }))
    } catch (error) {
      console.error('Error fetching comuni:', error)
      throw error
    }
  }

  async getComuneByCode(codice: string): Promise<Comune | null> {
    const request: LookupRequest = {
      tipo: 'comune',
      chiavi: { CODICE: codice }
    }

    try {
      const response = await this.baseService.customRequest<ComuneResponse[]>({
        method: 'POST',
        customEndpoint: this.config.endpoints.lookup,
        body: request
      })

      if (response.length === 0) return null

      const item = response[0]
      return {
        codiceBelfiore: item.CODICE,
        nome: item.COMUNE,
        cap: item.CAP || '',
        provincia: item.PROVINCIA
      }
    } catch (error) {
      console.error('Error fetching comune by code:', error)
      return null
    }
  }

  async searchComuni(searchTerm: string): Promise<Comune[]> {
    if (!searchTerm.trim()) {
      return this.getComuni()
    }

    // Se è un codice belfiore (massimo 4 caratteri alfanumerici)
    if (searchTerm.length <= 4 && /^[A-Z0-9]+$/i.test(searchTerm)) {
      return this.getComuni(searchTerm.toUpperCase())
    }

    // Altrimenti cerca per nome comune
    const allComuni = await this.getComuni()
    const searchLower = searchTerm.toLowerCase()

    return allComuni.filter(comune =>
      comune.nome.toLowerCase().includes(searchLower)
    )
  }
}

export const lookupService = new LookupService()
