import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Tolleranza extends CrudEntity {
  codtoll: number,
  descrizione: string,
  minentrprima?: number,
  minentrdopo?: number,
  minrit?: number,
  codcaurit?: number,
  obbligoent?: string,
  minuscprima?: number,
  minuscdopo?: number,
  minant?: number,
  codcauant?: number,
  obbligousc?: string
}

const config = getApiConfig()

class TolleranzeService extends GenericCrudService<Tolleranza> {
  constructor() {
    super({
      list: config.endpoints.tolleranze,
      create: config.endpoints.tolleranze,
      update: config.endpoints.tolleranze,
      delete: config.endpoints.deleteTolleranza
    })
  }

  async getTolleranze(): Promise<Tolleranza[]> {
    return this.getAll()
  }

  async addTolleranza(tolleranza: Tolleranza): Promise<Tolleranza> {
    return this.create(tolleranza)
  }

  async editTolleranza(tolleranza: Tolleranza): Promise<Tolleranza> {
    return this.update(tolleranza)
  }

  async deleteTolleranza(codtoll: string): Promise<boolean> {
    return this.delete(codtoll)
  }
}

export const tolleranzeService = new TolleranzeService()
