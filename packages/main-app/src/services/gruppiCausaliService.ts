import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Causale {
  codCau: number
  descrizione: string
  abbreviazione: string
}

export interface CausaleConSegno {
  causale: Causale
  segno: string
}

export interface GruppoCausaleList extends CrudEntity {
  codGrCau: number
  descrizione: string
}

export interface GruppoCausaleDettaglio extends CrudEntity {
  codGrCau: number
  descrizione: string
  listaCausali: CausaleConSegno[]
  totCau: number
}

const config = getApiConfig()

class GruppiCausaliService extends GenericCrudService<GruppoCausaleList> {
  constructor() {
    super({
      list: config.endpoints.gruppiCausali,
      create: config.endpoints.gruppiCausali,
      update: config.endpoints.gruppiCausali,
      delete: config.endpoints.deleteGruppoCausale
    })
  }

  override async getAll(): Promise<GruppoCausaleList[]> {
    return await super.getAll()
  }

  async getDettaglioGruppoCausale(codGrCau: number): Promise<GruppoCausaleDettaglio> {
    return this.executeRequest<GruppoCausaleDettaglio>({
      method: 'GET',
      customEndpoint: `${config.endpoints.getDettaglioGruppoCausale}/${codGrCau}`
    })
  }

  async createGruppoCausale(gruppoCausale: GruppoCausaleDettaglio): Promise<GruppoCausaleDettaglio> {
    return this.create(gruppoCausale as Partial<GruppoCausaleList>) as Promise<GruppoCausaleDettaglio>
  }

  async updateGruppoCausale(gruppoCausale: GruppoCausaleDettaglio): Promise<GruppoCausaleDettaglio> {
    return this.update(gruppoCausale as GruppoCausaleList) as Promise<GruppoCausaleDettaglio>
  }

  async deleteGruppoCausale(codGrCau: number): Promise<boolean> {
    return this.executeRequest<boolean>({
      method: 'DELETE',
      customEndpoint: `${config.endpoints.deleteGruppoCausale}?codGrCau=${codGrCau}`
    })
  }
}

export const gruppiCausaliService = new GruppiCausaliService()
