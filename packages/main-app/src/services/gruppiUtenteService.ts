import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import type { ApiMenuItem, ApiMenuUtenteItem } from './menuService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface GruppoUtente extends CrudEntity {
  codice: string
  descrizione: string
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

class GruppiUtenteService extends GenericCrudService<GruppoUtente> {
  constructor() {
    super({
      list: getApiConfig().endpoints.gruppiUtente,
      create: getApiConfig().endpoints.gruppiUtente,
      update: getApiConfig().endpoints.gruppiUtente,
      delete: getApiConfig().endpoints.deleteGruppiUtente
    })
  }

  async getMenuGruppoUtente(codgruppo: string): Promise<ApiMenuGruppoItem[]> {
    return await this.executeRequest({
      method: 'GET',
      customEndpoint: this.config.endpoints.menuGruppiUtente,
      params: { codgruppo }
    })
  }

  async aggiornaAbilitazioniGruppoUtente(
    abilitazioni: AggiornamentoAbilitazioniGruppo[],
    codgruppo: string
  ): Promise<boolean> {
    await this.executeRequest({
      method: 'POST',
      customEndpoint: this.config.endpoints.aggiornaAbilitazioniGruppiUtente,
      params: { codgruppo },
      body: abilitazioni
    })
    return true
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

  async getGruppiUtente(): Promise<GruppoUtente[]> {
    return this.getAll()
  }

  async newGruppoUtente(gruppo: GruppoUtente): Promise<GruppoUtente> {
    return this.create(gruppo)
  }

  async editGruppoUtente(gruppo: GruppoUtente): Promise<GruppoUtente> {
    return this.update(gruppo)
  }

  async deleteGruppoUtente(codice: string): Promise<boolean> {
    return this.deleteWithBody({ codice })
  }

  async deleteWithBody(body: Record<string, unknown>): Promise<boolean> {
    return super.deleteWithBody(body)
  }
}

export const gruppiUtenteService = new GruppiUtenteService()
