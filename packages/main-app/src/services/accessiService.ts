import { getApiConfig } from '@/config/api'
import { createCrudMethods } from './baseService'

export interface Accesso {
    codice: string,
    descrizione: string,
    formula: string
}

class AccessiService {
  private config = getApiConfig()
  private crud = createCrudMethods<Accesso>({
    list: this.config.endpoints.accessi,
    create: this.config.endpoints.accessi,
    update: this.config.endpoints.accessi,
    delete: this.config.endpoints.deleteAccessi
  })

  async getTabAccessi(): Promise<Accesso[]> {
    return this.crud.getAll()
  }

  async addAccesso(accesso: Accesso): Promise<Accesso> {
    return this.crud.create(accesso)
  }

  async editAccesso(accesso: Accesso): Promise<Accesso> {
    return this.crud.update(accesso)
  }

  async deleteAccesso(codice: string): Promise<boolean> {
    return this.crud.delete(codice)
  }
}

export const accessiService = new AccessiService()
