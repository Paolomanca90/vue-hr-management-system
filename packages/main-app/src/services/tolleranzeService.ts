import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Tolleranza extends CrudEntity {
  codtoll: number
  descrizione: string
}

export interface TolleranzaDettaglio extends CrudEntity {
  codtoll: number
  descrizione: string
  minentrprima: number
  minentrdopo: number
  minrit: number
  codcaurit: number
  obbligoent: string
  minuscprima: number
  minuscdopo: number
  minant: number
  codcauant: number
  obbligousc: string
}

const config = getApiConfig()

class TolleranzeService extends GenericCrudService<Tolleranza> {
  constructor() {
    super({
      list: config.endpoints.tolleranze,
      create: config.endpoints.tolleranze,
      update: config.endpoints.tolleranze,
      delete: config.endpoints.tolleranze
    })
  }

  override async getAll(): Promise<Tolleranza[]> {
    return await super.getAll()
  }

  async getDettaglioTolleranza(codToll: number): Promise<TolleranzaDettaglio> {
    return this.executeRequest<TolleranzaDettaglio>({
      method: 'GET',
      customEndpoint: `${config.endpoints.getDettaglioTolleranza}/${codToll}`
    })
  }

  async createTolleranza(tolleranza: TolleranzaDettaglio): Promise<TolleranzaDettaglio> {
    return this.create(tolleranza as Partial<Tolleranza>) as Promise<TolleranzaDettaglio>
  }

  async updateTolleranza(tolleranza: TolleranzaDettaglio): Promise<TolleranzaDettaglio> {
    return this.update(tolleranza as Tolleranza) as Promise<TolleranzaDettaglio>
  }

  async deleteTolleranza(codToll: number): Promise<boolean> {
    return this.delete(codToll)
  }
}

export const tolleranzeService = new TolleranzeService()
