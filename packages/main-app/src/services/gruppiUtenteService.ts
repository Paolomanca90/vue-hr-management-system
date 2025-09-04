import { getApiConfig } from '@/config/api'
import type { ApiMenuItem, ApiMenuUtenteItem } from './menuService'

export interface GruppoUtente {
  codice: string
  descrizione: string
}

export interface GetGruppiUtenteResponse {
  listaGruppi?: GruppoUtente[]
  messaggioDiErrore?: string
}

export interface ApiMenuGruppoItem extends ApiMenuUtenteItem {
  codgruppo?: string
}

export interface AggiornamentoAbilitazioniGruppo {
  id: number
  nome: string
  ordine: number
  parenT_ID?: number
  modificabile?: string
  icona?: string
  path?: string
  codgruppo: string
  modifica: string
  visualizza: string
  figli: AggiornamentoAbilitazioniGruppo[]
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

  async getMenuGruppoUtente(codgruppo: string): Promise<ApiMenuGruppoItem[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.menuGruppiUtente}?codgruppo=${encodeURIComponent(codgruppo)}`, {
        method: 'GET',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result) {
        throw new Error('Errore nel caricamento dei menu del gruppo')
      }

      return result
    } catch (error) {
      console.error('Errore nel caricamento dei menu del gruppo:', error)
      throw error
    }
  }

  async aggiornaAbilitazioniGruppoUtente(
    abilitazioni: AggiornamentoAbilitazioniGruppo[],
    codgruppo: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.aggiornaAbilitazioniGruppiUtente}?codgruppo=${encodeURIComponent(codgruppo)}`, {
        method: 'POST',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        },
        body: JSON.stringify(abilitazioni)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle abilitazioni del gruppo:', error)
      throw error
    }
  }

  preparePermissionsForGroupSave(
    permissions: Record<string, { visualizza: boolean; modifica: boolean; parent_id?: number }>,
    menuData: ApiMenuGruppoItem[],
    codgruppo: string
  ): AggiornamentoAbilitazioniGruppo[] {

    const flatList: { id: number; modifica: string; visualizza: string }[] = []
    const addedIds = new Set<number>()

    Object.keys(permissions).forEach(itemId => {
      const permission = permissions[itemId]
      const id = Number(itemId)

      if (permission.visualizza === true) {
        // Aggiunge l'item corrente solo se non è già stato aggiunto
        if (!addedIds.has(id)) {
          flatList.push({
            id: id,
            modifica: permission.modifica ? 'S' : 'N',
            visualizza: 'S'
          })
          addedIds.add(id)
        }

        // Aggiunge i parent solo se non sono già stati aggiunti
        let currentParentId = permission.parent_id
        while (currentParentId && currentParentId > 0 && !addedIds.has(currentParentId)) {
          flatList.push({
            id: currentParentId,
            modifica: 'N', // Parent hanno sempre modifica = N
            visualizza: 'S' // Parent hanno sempre visualizza = S
          })
          addedIds.add(currentParentId)

          // Va al parent del parent
          const parentPermission = permissions[currentParentId]
          currentParentId = parentPermission?.parent_id
        }
      }
    })

    // Converte la lista piatta nell'albero ricorsivo richiesto dall'API
    return this.buildTreeFromFlatList(flatList, menuData, codgruppo)
  }

  private buildTreeFromFlatList(
    flatList: { id: number; modifica: string; visualizza: string }[],
    menuData: ApiMenuGruppoItem[],
    codgruppo: string
  ): AggiornamentoAbilitazioniGruppo[] {

    // Crea una mappa per accesso rapido ai permessi
    const permissionsMap = new Map<number, { modifica: string; visualizza: string }>()
    flatList.forEach(item => {
      permissionsMap.set(item.id, { modifica: item.modifica, visualizza: item.visualizza })
    })

    // Funzione ricorsiva per costruire l'albero
    const buildRecursive = (items: ApiMenuGruppoItem[]): AggiornamentoAbilitazioniGruppo[] => {
      const result: AggiornamentoAbilitazioniGruppo[] = []

      items.forEach(item => {
        // Include questo item solo se è nella lista dei permessi
        if (permissionsMap.has(item.id)) {
          const permission = permissionsMap.get(item.id)!

          // Costruisce ricorsivamente i figli
          const childrenTree = item.figli ? buildRecursive(item.figli) : []

          const treeItem: AggiornamentoAbilitazioniGruppo = {
            id: item.id,
            nome: item.nome,
            ordine: item.ordine,
            parenT_ID: item.parenT_ID,
            modificabile: item.modificabile,
            icona: item.icona,
            path: item.path,
            codgruppo: codgruppo,
            modifica: permission.modifica,
            visualizza: permission.visualizza,
            figli: childrenTree
          }

          result.push(treeItem)
        }
      })

      return result
    }

    return buildRecursive(menuData)
  }

  initializePermissionsFromGroupData(menuData: ApiMenuGruppoItem[]): Record<string, { visualizza: boolean; modifica: boolean; parent_id?: number }> {
    const permissions: Record<string, { visualizza: boolean; modifica: boolean; parent_id?: number }> = {}

    const processItems = (items: ApiMenuGruppoItem[]) => {
      items.forEach(item => {
        permissions[item.id] = {
          visualizza: item.visualizza === 'S',
          modifica: item.modifica === 'S',
          parent_id: item.parenT_ID
        }

        if (item.figli && item.figli.length > 0) {
          processItems(item.figli)
        }
      })
    }

    processItems(menuData)
    return permissions
  }

  convertMenuToGroupMenu(menuData: ApiMenuItem[], codgruppo: string): ApiMenuGruppoItem[] {
    const convertItem = (item: ApiMenuItem): ApiMenuGruppoItem => ({
      id: item.id,
      nome: item.nome,
      ordine: item.ordine,
      parenT_ID: item.parent_Id,
      modificabile: item.modificabile,
      icona: item.icona,
      path: item.path,
      codgruppo,
      preferito: 'N', // Default per nuovi gruppi
      visualizza: 'N', // Default per nuovi gruppi
      modifica: 'N',   // Default per nuovi gruppi
      figli: item.figli ? item.figli.map(convertItem) : []
    })

    return menuData.map(convertItem)
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
