import { getApiConfig } from '@/config/api'

export interface Accessi {
    codice: string,
    descrizione: string,
    formula: string
}

class AccessiService {
  private config = getApiConfig()

  async getTabAccessi(): Promise<Accessi[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.accessi}`, {
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

export const accessiService = new AccessiService()
