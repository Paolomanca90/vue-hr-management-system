export interface ApiMenuItem {
  id: number
  nome: string
  icona: string
  path?: string
  parametri?: string
  ordine: number
  soloApi: boolean
  parent_Id?: number
  figli: ApiMenuItem[] | []
}

export interface MenuResponse {
  success: boolean
  data: ApiMenuItem[]
  message?: string
}

class MenuService {
  private baseUrl = 'https://localhost:7255'

  async getMenuVisibili(): Promise<ApiMenuItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/Menu/visibili`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          // 'Authorization': `Bearer ${token}`
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result) {
        throw new Error('Errore nel caricamento del menu')
      }

      return result
    } catch (error) {
      console.error('Errore nel caricamento dei menu:', error)
      throw error
    }
  }

  // Converte gli item API nel formato interno del menu store
  convertApiMenuToMenuItem(apiItems: ApiMenuItem[]): MenuItem[] {
    // Raggruppa gli item per parent_id
    const itemsMap = new Map<number, ApiMenuItem>()
    const rootItems: ApiMenuItem[] = []
    const childrenMap = new Map<number, ApiMenuItem[]>()

    // Primo giro: organizza gli items
    apiItems
      .sort((a, b) => a.ordine - b.ordine)
      .forEach((item) => {
        itemsMap.set(item.id, item)

        if (!item.parent_Id) {
          rootItems.push(item)
        } else {
          if (!childrenMap.has(item.parent_Id)) {
            childrenMap.set(item.parent_Id, [])
          }
          childrenMap.get(item.parent_Id)!.push(item)
        }
      })

    // Secondo giro: costruisce la struttura ad albero
    const buildMenuItem = (apiItem: ApiMenuItem): MenuItem => {
      const children = childrenMap.get(apiItem.id)

      return {
        id: apiItem.id,
        icon: apiItem.icona,
        label: apiItem.nome,
        route: apiItem.path,
        expanded: false,
        children: children?.length ? children.map(buildMenuItem) : [],
      }
    }

    return rootItems.map(buildMenuItem)
  }
}

export const menuService = new MenuService()

// Interfaccia per compatibilità con il menu store esistente
export interface MenuItem {
  id: number
  icon: string
  label: string
  route?: string
  children: MenuItem[] | []
  expanded?: boolean
}
