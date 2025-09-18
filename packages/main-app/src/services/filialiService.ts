import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Filiale extends CrudEntity {
    codAzi: number,
    codCant: number,
    descriz: string,
}

export interface FilialeDettaglio extends CrudEntity {
    codAzi: number,
    codCant: number,
    descriz: string,
}

const config = getApiConfig()

class FilialiService extends GenericCrudService<Filiale> {
  constructor() {
    super({
      list: config.endpoints.filiali,
      create: config.endpoints.filiali,
      update: config.endpoints.filiali,
    })
  }

  async getFiliali(): Promise<Filiale[]> {
    return this.getAll()
  }

  async getFiliale(codice: string): Promise<FilialeDettaglio> {
    return this.executeRequest<FilialeDettaglio>({
      method: 'GET',
      customEndpoint: `${config.endpoints.sedi}/${codice}`
    })
  }

  async addFiliale(filiale: FilialeDettaglio): Promise<Filiale> {
    return this.create(filiale)
  }

  async editFiliale(filialeDettaglio: FilialeDettaglio): Promise<Filiale> {
    return this.update(filialeDettaglio)
  }

  async deleteFiliale(codice: string): Promise<boolean> {
    return this.delete(codice)
  }
}

export const filialiService = new FilialiService()
