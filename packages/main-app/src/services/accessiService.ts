import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Accesso extends CrudEntity {
    codice: string,
    descrizione: string,
    formula: string
}

const config = getApiConfig()

class AccessiService extends GenericCrudService<Accesso> {
  constructor() {
    super({
      list: config.endpoints.accessi,
      create: config.endpoints.accessi,
      update: config.endpoints.accessi,
      delete: config.endpoints.deleteAccessi
    })
  }

  async getTabAccessi(): Promise<Accesso[]> {
    return this.getAll()
  }

  async addAccesso(accesso: Accesso): Promise<Accesso> {
    return this.create(accesso)
  }

  async editAccesso(accesso: Accesso): Promise<Accesso> {
    return this.update(accesso)
  }

  async deleteAccesso(codice: string): Promise<boolean> {
    return this.delete(codice)
  }
}

export const accessiService = new AccessiService()
