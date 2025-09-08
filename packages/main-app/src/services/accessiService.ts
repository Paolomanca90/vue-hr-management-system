import { getApiConfig } from '@/config/api'

export interface Accesso {
    codice: string,
    descrizione: string,
    formula: string
}

class AccessiService {
  private config = getApiConfig()

  async getTabAccessi(): Promise<Accesso[]> {
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

  async addAccesso(accesso:Accesso): Promise<Accesso> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.accessi}`, {
        method: 'POST',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        },
        body: JSON.stringify(accesso)
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

  async editAccesso(accesso:Accesso): Promise<Accesso> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.accessi}`, {
        method: 'PUT',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        },
        body: JSON.stringify(accesso)
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

  async deleteAccesso(codice: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.deleteAccessi}${codice}`, {
        method: 'DELETE',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        }
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

export const accessiService = new AccessiService()
