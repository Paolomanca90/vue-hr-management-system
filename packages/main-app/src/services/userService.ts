import { getApiConfig } from '@/config/api'

export interface User {
  username: string;
  nomecompleto: string;
  codgruppo: string;
  codaccesso: string;
}

export interface GetUsersResponse {
  listaUtenti?: User[]
  messaggioDiErrore?: string
}

class UserService {
  private config = getApiConfig()

  async getUsers(): Promise<GetUsersResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.users}`, {
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

      return {
        listaUtenti: await response.json(),
        messaggioDiErrore: undefined,
      }

    } catch (error) {
      throw new Error('Errore di connessione al server: ' + error)
    }
  }
}

export const userService = new UserService()
