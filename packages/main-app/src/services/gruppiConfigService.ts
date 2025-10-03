import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface GruppoConfig extends CrudEntity {
    codgruppo: number,
    descrizione: string
}

const config = getApiConfig()

class GruppiConfigService extends GenericCrudService<GruppoConfig> {
  constructor() {
    super({
      list: config.endpoints.gruppiConfig,
      create: config.endpoints.gruppiConfig,
      update: config.endpoints.gruppiConfig,
      delete: config.endpoints.deleteGruppiConfig
    })
  }

  async getTabGruppiConfig(): Promise<GruppoConfig[]> {
    return this.getAll()
  }

  async addGruppoConfig(gruppo: GruppoConfig): Promise<GruppoConfig> {
    return this.create(gruppo)
  }

  async editGruppoConfig(gruppo: GruppoConfig): Promise<GruppoConfig> {
    return this.update(gruppo)
  }

  async deleteGruppoConfig(codgruppo: number): Promise<boolean> {
    return this.delete(codgruppo.toString())
  }
}

export const gruppiConfigService = new GruppiConfigService()
