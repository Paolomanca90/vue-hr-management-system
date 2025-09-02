import { getApiConfig } from '@/config/api'

export interface GruppoUtente {
  codice: string
  descrizione: string
}

export interface GetGruppiUtenteResponse {
  listaGruppi?: GruppoUtente[]
  messaggioDiErrore?: string
}

class GruppiUtenteService {
  private config = getApiConfig()

  async getGruppiUtente(): Promise<GetGruppiUtenteResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.gruppiUtente}`, {
        method: 'GET',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return {
        listaGruppi: await response.json(),
        messaggioDiErrore: undefined,
      }

    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }

  async newGruppoUtente(gruppo: GruppoUtente): Promise<GruppoUtente> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.gruppiUtente}`, {
        method: 'POST',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        },
        body: JSON.stringify(gruppo)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()

    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }

  async editGruppoUtente(gruppo: GruppoUtente): Promise<GruppoUtente> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.gruppiUtente}`, {
        method: 'PUT',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        },
        body: JSON.stringify(gruppo)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()

    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }

  async deleteGruppoUtente(codice: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.deleteGruppiUtente}`, {
        method: 'DELETE',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        },
        body: JSON.stringify({ codice })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return true

    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }
}

export const gruppiUtenteService = new GruppiUtenteService()
