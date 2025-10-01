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
  codGrCau1: number | null,
  abbreviazione1: string | null,
  codGrCau2: number | null,
  abbreviazione2: string | null,
  codGrCau3: number | null,
  abbreviazione3: string | null,
  codGrCau4: number | null,
  abbreviazione4: string | null
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
