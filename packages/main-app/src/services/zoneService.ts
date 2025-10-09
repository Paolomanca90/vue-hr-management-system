import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Terminale {
  codter: string
  descrizione: string
  tmrtp: string
  tmmensa: string
  tmcommesse: string
  codtermalt: string
}

export interface ZonaList extends CrudEntity {
  codZona: number
  descrizione: string
}

export interface ZonaDettaglio extends CrudEntity {
  codZona: number
  descrizione: string
  listaTerminali: Terminale[]
  totTerm: number
}

const config = getApiConfig()

class ZoneService extends GenericCrudService<ZonaList> {
  constructor() {
    super({
      list: config.endpoints.zone,
      create: config.endpoints.zone,
      update: config.endpoints.zone,
      delete: config.endpoints.zone
    })
  }

  override async getAll(): Promise<ZonaList[]> {
    return await super.getAll()
  }

  async getDettaglioZona(codZona: number): Promise<ZonaDettaglio> {
    return this.executeRequest<ZonaDettaglio>({
      method: 'GET',
      customEndpoint: `${config.endpoints.getDettZona}/${codZona}`
    })
  }

  async createZona(zona: ZonaDettaglio): Promise<ZonaDettaglio> {
    return this.create(zona as Partial<ZonaList>) as Promise<ZonaDettaglio>
  }

  async updateZona(zona: ZonaDettaglio): Promise<ZonaDettaglio> {
    return this.update(zona as ZonaList) as Promise<ZonaDettaglio>
  }

  async deleteZona(codZona: number): Promise<boolean> {
    return this.delete(codZona)
  }
}

export const zoneService = new ZoneService()
