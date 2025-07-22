import { getApiConfig } from '@/config/api'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token?: string
  messaggioDiErrore?: string
}

export interface GetDominiRequest {
  username: string
}

export interface DominioItem {
  id?: number
  dominio: string
  dbconn?: string
}

export interface GetDominiResponse {
  listaDomini?: DominioItem[]
  domains?: string[]
  messaggioDiErrore?: string
}

export interface SetDominioRequest {
  username: string
  dominio: string
}

export interface SetDominioResponse {
  token?: string
  messaggioDiErrore?: string
}

class AuthService {
  private config = getApiConfig()

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.login}`, {
        method: 'POST',
        headers: this.config.defaultHeaders,
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        // Se la risposta non è ok, prova a leggere il messaggio di errore
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const token = await response.text()

      if (!token || token.trim() === '') {
        throw new Error('Token non ricevuto dal server')
      }

      return {
        token: token,
        messaggioDiErrore: undefined,
      }
    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }

  async getDomini(request: GetDominiRequest): Promise<GetDominiResponse> {
    try {
      // Recupera il token dalla sessione
      const token = sessionStorage.getItem('temp_token')

      const headers: Record<string, string> = this.config.defaultHeaders

      // Aggiunge il token se disponibile
      if (token) {
        headers['Authorization'] = token
      }

      const url = new URL(`${this.config.baseUrl}${this.config.endpoints.getDomini}`)
      url.searchParams.append('username', request.username)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const domains = (await response.json()) as string[]

      if (!domains || domains.length === 0) {
        throw new Error('Nessun dominio trovato per questo utente')
      }

      // Converte il nuovo formato in quello atteso dal frontend
      const domainItems: DominioItem[] = domains.map((domain, index) => ({
        id: index + 1, // Genera un ID fittizio
        dominio: domain,
        dbconn: undefined,
      }))

      return {
        listaDomini: domainItems,
        domains: domains,
        messaggioDiErrore: undefined,
      }
    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }

  async setDominio(request: SetDominioRequest): Promise<SetDominioResponse> {
    try {
      // Recupera il token dalla sessione
      const token = sessionStorage.getItem('temp_token')

      const headers: Record<string, string> = this.config.defaultHeaders

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
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const jwtToken = await response.text()
      localStorage.setItem('auth_token', jwtToken)

      if (!jwtToken || jwtToken.trim() === '') {
        throw new Error('Token non ricevuto dal server')
      }

      return {
        token: jwtToken,
        messaggioDiErrore: undefined,
      }
    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.logout}`, {
        method: 'GET',
        headers: this.config.defaultHeaders,
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
}

export const authService = new AuthService()
