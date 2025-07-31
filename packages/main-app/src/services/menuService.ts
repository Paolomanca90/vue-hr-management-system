import { getApiConfig } from '@/config/api'

export interface ApiMenuItem {
  id: number
  nome: string
  icona?: string
  path?: string
  parametri?: string
  ordine: number
  soloApi: string
  modificabile: string
  parent_Id?: number
  figli: ApiMenuItem[]
}

export interface ApiMenuUtenteItem {
  id: number,
  nome: string,
  ordine: number,
  parenT_ID?: number,
  modificabile?: string,
  icona?: string,
  path?: string,
  visualizza: string,
  modifica: string,
  figli: ApiMenuUtenteItem[]
}

export interface AbilitazioneMenuUtente
{
    username: string,
    menU_ID: number,
    modifica: string | null
}

export interface MenuResponse {
  success: boolean
  data: ApiMenuItem[]
  message?: string
}

export interface MenuUtenteResponse {
  success: boolean
  data: ApiMenuUtenteItem[]
  message?: string
}

class MenuService {
  private config = getApiConfig() // Ottiene la configurazione corretta

  async getMenuVisibili(): Promise<ApiMenuItem[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.menuVisibili}`, {
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
        throw new Error('Errore nel caricamento del menu')
      }

      return result
    } catch (error) {
      console.error('Errore nel caricamento dei menu:', error)
      throw error
    }
  }

  async getMenuUtente(username:string): Promise<ApiMenuUtenteItem[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.menuUtente}${username}`, {
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
        throw new Error('Errore nel caricamento del menu')
      }

      return result
    } catch (error) {
      console.error('Errore nel caricamento dei menu:', error)
      throw error
    }
  }

  async updateMenuUtente(listaAbilitazioni:AbilitazioneMenuUtente[], username:string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.updateMenuAbilitazioni}${username}`, {
        method: 'POST',
        headers: {
          ...this.config.defaultHeaders,
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        },
        body: JSON.stringify(listaAbilitazioni)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Errore nel caricamento dei menu:', error)
      throw error
    }
  }

  // Funzione per ottenere un'icona Font Awesome di default basata sul nome
  private getDefaultIcon(nome: string): string {
    const lowerName = nome.toLowerCase()

    // Mappatura delle icone basata sul nome - ora ritorna solo il nome dell'icona per Font Awesome
    if (lowerName.includes('anagrafic') || lowerName.includes('azienda')) {
      return 'building'
    } else if (lowerName.includes('dipendenti') || lowerName.includes('utenti')) {
      return 'users'
    } else if (lowerName.includes('tabelle') || lowerName.includes('dati')) {
      return 'table'
    } else if (lowerName.includes('processi') || lowerName.includes('elaborazioni')) {
      return 'cogs'
    } else if (lowerName.includes('assunzione') || lowerName.includes('nuovo')) {
      return 'user-plus'
    } else if (lowerName.includes('cessazione') || lowerName.includes('rimozione')) {
      return 'user-minus'
    } else if (lowerName.includes('personalizzazion') || lowerName.includes('tema')) {
      return 'palette'
    } else if (lowerName.includes('funzion') || lowerName.includes('strumenti')) {
      return 'tools'
    } else if (lowerName.includes('configurazion') || lowerName.includes('impostazion')) {
      return 'cog'
    } else if (lowerName.includes('calcolo') || lowerName.includes('matematica')) {
      return 'calculator'
    } else if (lowerName.includes('orari') || lowerName.includes('tempo')) {
      return 'clock'
    } else if (lowerName.includes('parametr') || lowerName.includes('controlli')) {
      return 'sliders-h'
    } else if (lowerName.includes('trasferimento') || lowerName.includes('paghe') || lowerName.includes('stipendi')) {
      return 'money-bill-wave'
    } else if (lowerName.includes('dashboard') || lowerName.includes('principale')) {
      return 'tachometer-alt'
    } else if (lowerName.includes('report') || lowerName.includes('statistiche')) {
      return 'chart-bar'
    } else if (lowerName.includes('archiv') || lowerName.includes('storico')) {
      return 'archive'
    } else if (lowerName.includes('stampe') || lowerName.includes('print')) {
      return 'print'
    } else if (lowerName.includes('esportazion') || lowerName.includes('export')) {
      return 'download'
    } else if (lowerName.includes('importazion') || lowerName.includes('import')) {
      return 'upload'
    } else if (lowerName.includes('utilità') || lowerName.includes('utility')) {
      return 'wrench'
    } else if (lowerName.includes('presenze') || lowerName.includes('rilevazione')) {
      return 'clock'
    } else if (lowerName.includes('mensa') || lowerName.includes('ticket')) {
      return 'utensils'
    } else if (lowerName.includes('commesse') || lowerName.includes('progetti')) {
      return 'briefcase'
    } else if (lowerName.includes('opzioni') || lowerName.includes('settings')) {
      return 'cog'
    } else if (lowerName.includes('calendario') || lowerName.includes('calendar')) {
      return 'calendar'
    } else if (lowerName.includes('email') || lowerName.includes('mail')) {
      return 'envelope'
    } else if (lowerName.includes('profilo') || lowerName.includes('account')) {
      return 'user-circle'
    } else if (lowerName.includes('sicurezza') || lowerName.includes('security')) {
      return 'shield-alt'
    } else if (lowerName.includes('notifiche') || lowerName.includes('notification')) {
      return 'bell'
    } else if (lowerName.includes('help') || lowerName.includes('aiuto')) {
      return 'question-circle'
    } else if (lowerName.includes('file') || lowerName.includes('documento')) {
      return 'file-alt'
    } else if (lowerName.includes('cartella') || lowerName.includes('directory')) {
      return 'folder'
    } else {
      return 'folder' // Icona di default
    }
  }

  // Converte un'icona CSS in formato Font Awesome (se necessario)
  private convertCssIconToFontAwesome(iconClass?: string): string {
    if (!iconClass) return this.getDefaultIcon('default')

    // Se l'icona è già in formato CSS (fas fa-xxxx), estrae solo il nome
    if (iconClass.includes('fa-')) {
      const iconName = iconClass
        .replace(/^(fas|far|fab|fa)\s+fa-/, '') // Rimuove prefissi
        .replace(/^fa-/, '') // Rimuove fa- se rimasto
        .trim()

      return iconName || 'folder'
    }

    // Se è solo il nome dell'icona, lo restituisce così com'è
    return iconClass
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

      // Gestisce l'icona: prima prova a convertire quella esistente, poi usa il default
      let iconName: string
      if (apiItem.icona && apiItem.icona.trim() !== '') {
        iconName = this.convertCssIconToFontAwesome(apiItem.icona)
      } else {
        iconName = this.getDefaultIcon(apiItem.nome)
      }

      const menuItem: MenuItem = {
        id: apiItem.id,
        icon: iconName,
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
