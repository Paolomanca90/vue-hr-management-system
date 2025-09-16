import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface CentroCosto extends CrudEntity {
  codAzi: number
  codCenCo: string
  descriz: string
}

const config = getApiConfig()

class CentriCostoService extends GenericCrudService<CentroCosto> {
  constructor() {
    super({
      list: config.endpoints.centriCosto,
      create: config.endpoints.centriCosto,
      update: config.endpoints.centriCosto,
    })
  }

  async getCentriCosto(): Promise<CentroCosto[]> {
    return this.getAll()
  }

  async getCentroCosto(codAzi: number, codCenCo: string): Promise<CentroCosto> {
    return this.executeRequest<CentroCosto>({
      method: 'GET',
      customEndpoint: `${config.endpoints.centriCosto}/${codAzi}/${codCenCo}`
    })
  }

  async addCentroCosto(centroCosto: CentroCosto): Promise<CentroCosto> {
    return this.create(centroCosto)
  }

  async editCentroCosto(centroCosto: CentroCosto): Promise<CentroCosto> {
    return this.update(centroCosto)
  }

  async deleteCentroCosto(codAzi: number, codCenCo: string): Promise<boolean> {
    return this.executeRequest<boolean>({
      method: 'DELETE',
      customEndpoint: `${config.endpoints.centriCosto}/${codAzi}/${codCenCo}`
    })
  }
}

export const centriCostoService = new CentriCostoService()
