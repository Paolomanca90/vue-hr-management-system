import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface FasciaCambioOrario {
  codCambio: number
  codOra: number
  progressivo: number
  dalle1: number
  alle1: number
  peso1: number
  dalle2: number
  alle2: number
  peso2: number
  dalle3: number
  alle3: number
  peso3: number
  dalle4: number
  alle4: number
  peso4: number
}

export interface TimbraturaCambioOrario {
  codCambio: number
  codOra: number
  progressivo: number
  entrataDalle: number
  entrataAlle: number
  uscitaDalle: number
  uscitaAlle: number
}

export interface CambioOrario {
  codCambio: number
  descrizione: string
  tipoCambio: string
  listaFasce: FasciaCambioOrario[]
  listaTimbrature: TimbraturaCambioOrario[]
  totCoFasce: number
  totCoTimbr: number
}

export interface CambioOrarioListItem extends CrudEntity {
  codCambio: number
  descrizione: string
  tipoCambio: string
  totCoFasce: number
  totCoTimbr: number
}

const config = getApiConfig()

class CambioOrarioService extends GenericCrudService<CambioOrarioListItem> {
  constructor() {
    super({
      list: config.endpoints.cambiOrario,
      delete: config.endpoints.cambiOrario
    })
  }

  async getCambiOrario(): Promise<CambioOrarioListItem[]> {
    return this.getAll()
  }

  async getDettaglio(codCmb: number): Promise<CambioOrario> {
    return this.executeRequest<CambioOrario>({
      method: 'GET',
      customEndpoint: `${config.endpoints.getCambioOrarioDettaglio}/${codCmb}`
    })
  }

  async delete(id: string): Promise<boolean> {
    return this.executeRequest<boolean>({
      method: 'DELETE',
      customEndpoint: config.endpoints.cambiOrario,
      params: { codCmb: parseInt(id) }
    }).then(() => true)
  }

  async createCambioOrario(cambioOrario: CambioOrario): Promise<CambioOrario> {
    return this.executeRequest<CambioOrario>({
      method: 'POST',
      customEndpoint: config.endpoints.cambiOrario,
      body: cambioOrario
    })
  }

  async updateCambioOrario(cambioOrario: CambioOrario): Promise<CambioOrario> {
    return this.executeRequest<CambioOrario>({
      method: 'PUT',
      customEndpoint: config.endpoints.cambiOrario,
      body: cambioOrario
    })
  }
}

export const cambioOrarioService = new CambioOrarioService()
