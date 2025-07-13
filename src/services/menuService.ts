import { getApiConfig } from '@/config/api'

export interface ApiMenuItem {
  id: number
  nome: string
  icona?: string
  path?: string
  parametri?: string
  ordine: number
  soloApi: string
  parent_Id?: number
  figli: ApiMenuItem[]
}

export interface MenuResponse {
  success: boolean
  data: ApiMenuItem[]
  message?: string
}

class MenuService {
  private config = getApiConfig() // Ottiene la configurazione corretta

  async getMenuVisibili(): Promise<ApiMenuItem[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.menuVisibili}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
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

  // Funzione per ottenere un'icona di default basata sul nome
  private getDefaultIcon(nome: string): string {
    const lowerName = nome.toLowerCase()

    // Mappatura delle icone basata sul nome
    if (lowerName.includes('anagrafic') || lowerName.includes('azienda')) {
      return 'fas fa-building'
    } else if (lowerName.includes('dipendenti')) {
      return 'fas fa-users'
    } else if (lowerName.includes('tabelle')) {
      return 'fas fa-table'
    } else if (lowerName.includes('processi')) {
      return 'fas fa-cogs'
    } else if (lowerName.includes('assunzione')) {
      return 'fas fa-user-plus'
    } else if (lowerName.includes('cessazione')) {
      return 'fas fa-user-minus'
    } else if (lowerName.includes('personalizzazion')) {
      return 'fas fa-palette'
    } else if (lowerName.includes('funzion')) {
      return 'fas fa-tools'
    } else if (lowerName.includes('configurazion')) {
      return 'fas fa-cog'
    } else if (lowerName.includes('calcolo')) {
      return 'fas fa-calculator'
    } else if (lowerName.includes('orari')) {
      return 'fas fa-clock'
    } else if (lowerName.includes('parametr')) {
      return 'fas fa-sliders-h'
    } else if (lowerName.includes('trasferimento') || lowerName.includes('paghe')) {
      return 'fas fa-money-bill-wave'
    } else {
      return 'fas fa-folder' // Icona di default
    }
  }

  // Converte gli item API nel formato interno del menu store
  convertApiMenuToMenuItem(apiItems: ApiMenuItem[]): MenuItem[] {
    if (!apiItems || apiItems.length === 0) {
      return []
    }

    // Funzione ricorsiva per convertire un singolo item API
    const buildMenuItem = (apiItem: ApiMenuItem): MenuItem => {
      // Converte ricorsivamente i figli (se presenti)
      const children: MenuItem[] = []
      if (apiItem.figli && apiItem.figli.length > 0) {
        // Ordina i figli per ordine
        const sortedChildren = apiItem.figli.sort((a, b) => a.ordine - b.ordine)

        // Converte ricorsivamente ogni figlio
        for (const child of sortedChildren) {
          children.push(buildMenuItem(child))
        }
      }

      const menuItem: MenuItem = {
        id: apiItem.id,
        icon: apiItem.icona || this.getDefaultIcon(apiItem.nome),
        label: apiItem.nome,
        route: apiItem.path && apiItem.path.trim() !== '' ? apiItem.path : undefined,
        expanded: false,
        children: children,
      }

      return menuItem
    }

    // Ordina gli item di primo livello per ordine
    const sortedItems = apiItems.sort((a, b) => a.ordine - b.ordine)

    // Converte ogni item di primo livello
    const result = sortedItems.map(buildMenuItem)

    return result
  }
}

export const menuService = new MenuService()

// Interfaccia per compatibilità con il menu store esistente
export interface MenuItem {
  id: number
  icon: string
  label: string
  route?: string
  children: MenuItem[]
  expanded?: boolean
}
