import { getApiConfig } from '@/config/api'

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

  async getLingue(): Promise<Lingue[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.lingue}`, {
        method: 'GET',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        }
      })

      if (!response.ok) {
        // Se la risposta non è ok, prova a leggere il messaggio di errore
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()

    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }

  async getImpostazioniInternazionali(): Promise<ImpostazioniInternazionali[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.impostazioniInternazionali}`, {
        method: 'GET',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        }
      })

      if (!response.ok) {
        // Se la risposta non è ok, prova a leggere il messaggio di errore
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()

    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }
}

export const settingsService = new SettingsService()
