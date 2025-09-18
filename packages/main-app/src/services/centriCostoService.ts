import { getApiConfig } from '@/config/api'
import { CompositeKeyCrudService, type CompositeKeyEntity } from './compositeKeyCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

// Interfacce per il server (senza ID composito)
interface CentroCostoServer extends CrudEntity {
  codAzi: number
  codCenCo: string
  descriz: string
}

// Interfacce per il frontend (con ID composito)
export interface CentroCosto extends CompositeKeyEntity {
  codAzi: number
  codCenCo: string
  descriz: string
}

const config = getApiConfig()

class CentriCostoService extends CompositeKeyCrudService<CentroCostoServer, CentroCosto> {
  constructor() {
    super({
      list: config.endpoints.centriCosto,
      create: config.endpoints.centriCosto,
      update: config.endpoints.centriCosto,
    })
  }

  protected generateCompositeId(entity: CentroCostoServer): string {
    return `${entity.codAzi}-${entity.codCenCo}`
  }

  protected parseCompositeId(id: string): string[] {
    return id.split('-')
  }

  protected clientToServer(entity: CentroCosto): CentroCostoServer {
    return {
      codAzi: entity.codAzi,
      codCenCo: entity.codCenCo,
      descriz: entity.descriz
    }
  }

  protected serverToClient(entity: CentroCostoServer): CentroCosto {
    return {
      ...entity,
      id: this.generateCompositeId(entity)
    }
  }

  async getCentriCosto(): Promise<CentroCosto[]> {
    return this.getAll()
  }

  async getCentroCosto(id: string): Promise<CentroCosto> {
    return this.getById(id)
  }

  async getCentroCostoByCompositeKey(codAzi: number, codCenCo: string): Promise<CentroCosto> {
    return this.getCentroCosto(`${codAzi}-${codCenCo}`)
  }

  async addCentroCosto(centroCosto: CentroCosto): Promise<CentroCosto> {
    return this.create(centroCosto)
  }

  async editCentroCosto(centroCosto: CentroCosto): Promise<CentroCosto> {
    return this.update(centroCosto)
  }

  async deleteCentroCostoByCompositeKey(codAzi: number, codCenCo: string): Promise<boolean> {
    return this.delete(`${codAzi}-${codCenCo}`)
  }
}

export const centriCostoService = new CentriCostoService()
