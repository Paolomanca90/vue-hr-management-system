import { getApiConfig } from '@/config/api'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  messaggioDiErrore: string
}

export interface GetDominiRequest {
  username: string
}

export interface DominioItem {
  id: number
  dominio: string
  dbconn: string
}

export interface GetDominiResponse {
  listaDomini: DominioItem[]
  messaggioDiErrore: string
}

export interface SetDominioRequest {
  nomeDominio: string
  username: string
}

export interface SetDominioResponse {
  token: string
  messaggioDiErrore: string
}

class AuthService {
  private config = getApiConfig() // Ottiene la configurazione corretta

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: LoginResponse = await response.json()
      return result
    } catch (error) {
      throw new Error('Errore di connessione al server:' + error)
    }
  }

  async getDomini(request: GetDominiRequest): Promise<GetDominiResponse> {
    try {
      // Recupera il token dalla sessione o dallo storage
      const token = sessionStorage.getItem('temp_token') || localStorage.getItem('auth_token')

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }

      // Aggiunge il token se disponibile
      if (token) {
        headers['Authorization'] = token
      }

      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.getDomini}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: GetDominiResponse = await response.json()
      return result
    } catch (error) {
      throw new Error('Errore di connessione al server:' + error)
    }
  }

  async setDominio(request: SetDominioRequest): Promise<SetDominioResponse> {
    try {
      // Recupera il token dalla sessione
      const token = sessionStorage.getItem('temp_token') || localStorage.getItem('auth_token')

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }

      // Aggiunge il token se disponibile
      if (token) {
        headers['Authorization'] = token
      }

      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.setDominio}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: SetDominioResponse = await response.json()
      return result
    } catch (error) {
      console.error('Errore nel set dominio:', error)
      throw new Error('Errore di connessione al server')
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.logout}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })

      if (!response.ok) {
        console.warn('Errore nel logout dal server, procedendo comunque')
      }
    } catch (error) {
      console.error('Errore nel logout:', error)
    } finally {
      // Pulisce sempre i token locali
      sessionStorage.removeItem('temp_token')
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('openiddict_token')
    }
  }

  async getEncryptString(input: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}${this.config.endpoints.getEncryptString}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(input),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.text()
      return result
    } catch (error) {
      console.error('Errore nella crittografia:', error)
      throw new Error('Errore di connessione al server')
    }
  }
}

export const authService = new AuthService()
