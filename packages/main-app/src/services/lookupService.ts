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

export interface GruppoCausaleResponse {
  CODICE: string
  CODICE_GRUPPO: string
  ABBR: string
}

export interface GruppoCausale {
  codice: string
  codiceGruppo: string
  abbreviazione: string
}

export const formatCap = (cap: string | null | undefined): string => {
  if (!cap) return ''

  // Converte sempre in stringa e rimuove spazi
  const capString = String(cap).trim()

  // Se la stringa è vuota, restituisce vuoto
  if (capString.length === 0) return ''

  // Se ha meno di 5 caratteri e sono tutti numeri, aggiunge zeri
  if (capString.length < 5 && /^\d+$/.test(capString)) {
    return capString.padStart(5, '0')
  }

  return capString
}

class LookupService {
  private config = getApiConfig()
  private baseService = createCrudMethods({
    list: this.config.endpoints.lookup
  })

  // Metodi generici
  async getList<T = Record<string, unknown>>(tipo: string, searchFilter?: Record<string, string>): Promise<T[]> {
    const request: LookupRequest = {
      tipo,
      chiavi: searchFilter || {}
    }

    try {
      const response = await this.baseService.customRequest<T[]>({
        method: 'POST',
        customEndpoint: this.config.endpoints.lookupList,
        body: request
      })

      return response
    } catch (error) {
      console.error(`Error fetching ${tipo}:`, error)
      throw error
    }
  }

  async getListByCode<T = Record<string, unknown>>(tipo: string, codice: string, keyField: string = 'CODICE'): Promise<T | null> {
    const request: LookupRequest = {
      tipo,
      chiavi: { [keyField]: codice }
    }

    try {
      const response = await this.baseService.customRequest<T[]>({
        method: 'POST',
        customEndpoint: this.config.endpoints.lookup,
        body: request
      })

      return response.length > 0 ? response[0] : null
    } catch (error) {
      console.error(`Error fetching ${tipo} by code:`, error)
      return null
    }
  }

  async getComuni(searchFilter?: string): Promise<Comune[]> {
    const filter = searchFilter ? { codice: `${searchFilter}%` } : undefined
    const response = await this.getList<ComuneResponse>('comune', filter)

    return response.map(item => ({
      codiceBelfiore: item.CODICE,
      nome: item.COMUNE,
      cap: item.CAP || '',
      provincia: item.PROVINCIA
    }))
  }


  async getComuneByCode(codice: string): Promise<Comune | null> {
    const response = await this.getListByCode<ComuneResponse>('comune', codice)

    if (!response) return null

    return {
      codiceBelfiore: response.CODICE,
      nome: response.COMUNE,
      cap: response.CAP || '',
      provincia: response.PROVINCIA
    }
  }

  async searchComuni(searchTerm: string): Promise<Comune[]> {
    if (!searchTerm.trim()) {
      return this.getComuni()
    }

    // Se è un codice belfiore (massimo 4 caratteri alfanumerici con almeno un numero)
    if (searchTerm.length <= 4 && /^[A-Z0-9]+$/i.test(searchTerm) && /\d/.test(searchTerm)) {
      return this.getComuni(searchTerm.toUpperCase())
    }

    // Altrimenti cerca per nome comune
    const allComuni = await this.getComuni()
    const searchLower = searchTerm.toLowerCase()

    return allComuni.filter(comune =>
      comune.nome.toLowerCase().includes(searchLower)
    )
  }

  async getGruppiCausali(): Promise<GruppoCausale[]> {
    const response = await this.getList<GruppoCausaleResponse>('gruppocausale')

    return response.map(item => ({
      codice: item.CODICE,
      codiceGruppo: item.CODICE_GRUPPO,
      abbreviazione: item.ABBR
    }))
  }

  async getGruppoCausaleByCode(codice: string): Promise<GruppoCausale | null> {
    const response = await this.getListByCode<GruppoCausaleResponse>('gruppocausale', codice)

    if (!response) return null

    return {
      codice: response.CODICE,
      codiceGruppo: response.CODICE_GRUPPO,
      abbreviazione: response.ABBR
    }
  }
}

export const lookupService = new LookupService()
