import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface FestiAnno extends CrudEntity {
  anno: number
}

export interface Festivita {
  anno: number
  mese: number
  giorno: number
  tipoFesta: number
  descrizione: string
  codCauLav: number
  codCauRip: number
}

export interface FestiDettaglio extends CrudEntity {
  anno: number
  festivita: Festivita[]
}

const config = getApiConfig()

class FestiService extends GenericCrudService<FestiAnno> {
  constructor() {
    super({
      list: config.endpoints.festi,
      create: config.endpoints.festi,
      update: config.endpoints.festi,
      delete: config.endpoints.deleteFesti
    })
  }

  override async getAll(): Promise<FestiAnno[]> {
    const anni = await super.getAll()
    // Ordina per anno decrescente (più recente prima)
    return anni.sort((a, b) => b.anno - a.anno)
  }

  async getFestiAnni(): Promise<FestiAnno[]> {
    return this.getAll()
  }

  async getFestiAnno(anno: number): Promise<Festivita[]> {
    return this.executeRequest<Festivita[]>({
      method: 'GET',
      params: { iAnno: anno },
      customEndpoint: config.endpoints.getFestiAnno
    })
  }

  async createAnnoFestivita(festiDettaglio: FestiDettaglio): Promise<FestiDettaglio> {
    return this.create(festiDettaglio as Partial<FestiAnno>) as Promise<FestiDettaglio>
  }

  async updateAnnoFestivita(festiDettaglio: FestiDettaglio): Promise<FestiDettaglio> {
    return this.update(festiDettaglio as FestiAnno) as Promise<FestiDettaglio>
  }

  async deleteAnno(anno: number): Promise<boolean> {
    return this.delete(anno)
  }
}

export const festiService = new FestiService()
