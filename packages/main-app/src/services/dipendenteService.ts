import { getApiConfig } from '@/config/api'

export interface CampoDipendente {
  tabella: string
  campo: string
  tipologia: string
  dimensione: number
}

class DipendenteService {
  private config = getApiConfig()

  async getCampiDipendente(): Promise<CampoDipendente[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.getCampiDipendente}`, {
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

  async getValoriCampo(tabella: string, campo: string): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        tabella,
        campo
      })

      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.getValoriCampo}?${params}`, {
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

export const dipendenteService = new DipendenteService()