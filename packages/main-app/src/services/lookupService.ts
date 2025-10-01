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
  CODGRCAU: string
  DESCRIZIONE: string
}

export interface GruppoCausale {
  codice: string
  descrizione: string
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
    const filter = searchFilter ? { CODICE: `${searchFilter}%` } : undefined
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
      return this.getComuni('A')
    }

    const trimmed = searchTerm.trim().toUpperCase()

    const response = await this.getList<ComuneResponse>('comune', {
      COMUNE: `%${trimmed}%`
    })

    return response.map(item => ({
      codiceBelfiore: item.CODICE,
      nome: item.COMUNE,
      cap: item.CAP || '',
      provincia: item.PROVINCIA
    }))
  }

  async getGruppiCausali(): Promise<GruppoCausale[]> {
    const response = await this.getList<GruppoCausaleResponse>('gruppocausale')

    return response.map(item => ({
      codice: String(item.CODGRCAU),
      descrizione: item.DESCRIZIONE
    }))
  }

  async getGruppoCausaleByCode(codice: string): Promise<GruppoCausale | null> {
    const response = await this.getListByCode<GruppoCausaleResponse>('gruppocausale', codice)

    if (!response) return null

    return {
      codice: String(response.CODGRCAU),
      descrizione: response.DESCRIZIONE
    }
  }
}

export const lookupService = new LookupService()
