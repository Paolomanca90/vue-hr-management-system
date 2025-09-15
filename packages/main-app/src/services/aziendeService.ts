import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Azienda extends CrudEntity {
    codAzi: number,
    ragSoc: string,
}

export interface AziendaDettaglio extends CrudEntity {
  codAzi: number,
  ragSoc: string,
  sigla: string,
  indirSede: string,
  numSede: string,
  capSede: number,
  comuSede: string,
  provSede: string,
  codFisc: string,
  codGrCau1: number,
  abbreviazione1: string,
  codGrCau2: number,
  abbreviazione2: string,
  codGrCau3: number,
  abbreviazione3: string,
  codGrCau4: number,
  abbreviazione4: string
}

const config = getApiConfig()

class AziendeService extends GenericCrudService<Azienda> {
  constructor() {
    super({
      list: config.endpoints.aziende,
      create: config.endpoints.aziende,
      update: config.endpoints.aziende,
    })
  }

  async getAziende(): Promise<Azienda[]> {
    return this.getAll()
  }

  async getAzienda(codice: string): Promise<AziendaDettaglio> {
    return this.executeRequest<AziendaDettaglio>({
      method: 'GET',
      customEndpoint: `${config.endpoints.aziende}/${codice}`
    })
  }

  async addAzienda(azienda: AziendaDettaglio): Promise<Azienda> {
    return this.create(azienda)
  }

  async editAzienda(azienda: AziendaDettaglio): Promise<Azienda> {
    return this.update(azienda)
  }

  async deleteAzienda(codice: string): Promise<boolean> {
    return this.delete(codice)
  }
}

export const aziendeService = new AziendeService()
