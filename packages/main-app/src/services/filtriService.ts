import { getApiConfig } from '@/config/api'

export interface Filtro {
    codice: string,
    descrizione: string,
    formula: string
}

class FiltriService {
  private config = getApiConfig()

  async getTabFiltri(): Promise<Filtro[]> {
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

  async addFiltro(filtro:Filtro): Promise<Filtro> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.accessi}`, {
        method: 'POST',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        },
        body: JSON.stringify(filtro)
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

  async editFiltro(filtro:Filtro): Promise<Filtro> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.accessi}`, {
        method: 'PUT',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        },
        body: JSON.stringify(filtro)
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

  async deleteFiltro(codice: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.deleteAccessi}?codice=${encodeURIComponent(codice)}`, {
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

export const filtriService = new FiltriService()
