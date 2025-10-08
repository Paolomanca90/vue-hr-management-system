import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface TerminaleConfig extends CrudEntity {
    codter: string,
    descrizione: string,
    tmrtp?: string,
    tmmensa?: string,
    tmcommesse?: string,
    codtermalt?: string
}

const config = getApiConfig()

class TerminaleConfigService extends GenericCrudService<TerminaleConfig> {
  constructor() {
    super({
      list: config.endpoints.terminaliConfig,
      create: config.endpoints.terminaliConfig,
      update: config.endpoints.terminaliConfig,
      delete: config.endpoints.deleteTerminaliConfig
    })
  }

  async getTerminaliConfig(): Promise<TerminaleConfig[]> {
    return this.getAll()
  }

  async addTerminaleConfig(terminaleConfig: TerminaleConfig): Promise<TerminaleConfig> {
    return this.create(terminaleConfig)
  }

  async editTerminaleConfig(terminaleConfig: TerminaleConfig): Promise<TerminaleConfig> {
    return this.update(terminaleConfig)
  }

  async deleteTerminaleConfig(codter: string): Promise<boolean> {
    return this.delete(codter)
  }
}

export const terminaleConfigService = new TerminaleConfigService()
