import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Sede extends CrudEntity {
    codSede: number,
    ragSoc: string,
}

export interface SedeDettaglio extends CrudEntity {
  codSede: number,
  ragSoc: string,
  sigla: string,
  indirSede: string,
  numSede: string,
  capSede: number,
  comuSede: string,
  provSede: string,
  codFisc: string
}

const config = getApiConfig()

class SediService extends GenericCrudService<Sede> {
  constructor() {
    super({
      list: config.endpoints.sedi,
      create: config.endpoints.sedi,
      update: config.endpoints.sedi,
    })
  }

  async getSedi(): Promise<Sede[]> {
    return this.getAll()
  }

  async getSede(codice: string): Promise<SedeDettaglio> {
    return this.executeRequest<SedeDettaglio>({
      method: 'GET',
      customEndpoint: `${config.endpoints.sedi}/${codice}`
    })
  }

  async addSede(sede: SedeDettaglio): Promise<Sede> {
    return this.create(sede)
  }

  async editSede(sede: SedeDettaglio): Promise<Sede> {
    return this.update(sede)
  }

  async deleteSede(codice: string): Promise<boolean> {
    return this.delete(codice)
  }
}

export const sediService = new SediService()