import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Filtro extends CrudEntity {
    codice: string,
    descrizione: string,
    formula: string
}

const config = getApiConfig()

class FiltriService extends GenericCrudService<Filtro> {
  constructor() {
    super({
      list: config.endpoints.filtri,
      create: config.endpoints.filtri,
      update: config.endpoints.filtri,
      delete: config.endpoints.deleteFiltri
    })
  }

  async getTabFiltri(): Promise<Filtro[]> {
    return this.getAll()
  }

  async addFiltro(filtro: Filtro): Promise<Filtro> {
    return this.create(filtro)
  }

  async editFiltro(filtro: Filtro): Promise<Filtro> {
    return this.update(filtro)
  }

  async deleteFiltro(codice: string): Promise<boolean> {
    return this.delete(codice)
  }
}

export const filtriService = new FiltriService()
