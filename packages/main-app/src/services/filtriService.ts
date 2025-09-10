import { getApiConfig } from '@/config/api'
import { createCrudMethods } from './baseService'

export interface Filtro {
    codice: string,
    descrizione: string,
    formula: string
}

class FiltriService {
  private config = getApiConfig()
  private crud = createCrudMethods<Filtro>({
    list: this.config.endpoints.filtri,
    create: this.config.endpoints.filtri,
    update: this.config.endpoints.filtri,
    delete: this.config.endpoints.deleteFiltri
  })

  async getTabFiltri(): Promise<Filtro[]> {
    return this.crud.getAll()
  }

  async addFiltro(filtro: Filtro): Promise<Filtro> {
    return this.crud.create(filtro)
  }

  async editFiltro(filtro: Filtro): Promise<Filtro> {
    return this.crud.update(filtro)
  }

  async deleteFiltro(codice: string): Promise<boolean> {
    return this.crud.delete(codice)
  }
}

export const filtriService = new FiltriService()
