import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Reparto extends CrudEntity {
  codAzi: number
  codReparto: string
  descriz: string
}

const config = getApiConfig()

class RepartiService extends GenericCrudService<Reparto> {
  constructor() {
    super({
      list: config.endpoints.reparti,
      create: config.endpoints.reparti,
      update: config.endpoints.reparti,
    })
  }

  async getReparti(): Promise<Reparto[]> {
    return this.getAll()
  }

  async getReparto(codAzi: number, codReparto: string): Promise<Reparto> {
    return this.executeRequest<Reparto>({
      method: 'GET',
      customEndpoint: `${config.endpoints.reparti}/${codAzi}/${codReparto}`
    })
  }

  async addReparto(reparto: Reparto): Promise<Reparto> {
    return this.create(reparto)
  }

  async editReparto(reparto: Reparto): Promise<Reparto> {
    return this.update(reparto)
  }

  async deleteReparto(codAzi: number, codReparto: string): Promise<boolean> {
    return this.executeRequest<boolean>({
      method: 'DELETE',
      customEndpoint: `${config.endpoints.reparti}/${codAzi}/${codReparto}`
    })
  }
}

export const repartiService = new RepartiService()