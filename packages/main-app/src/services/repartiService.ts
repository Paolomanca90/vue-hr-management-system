import { getApiConfig } from '@/config/api'
import { CompositeKeyCrudService, type CompositeKeyEntity } from './compositeKeyCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

// Interfacce per il server (senza ID composito)
interface RepartoServer extends CrudEntity {
  codAzi: number
  codReparto: string
  descriz: string
}

// Interfacce per il frontend (con ID composito)
export interface Reparto extends CompositeKeyEntity {
  codAzi: number
  codReparto: string
  descriz: string
}

const config = getApiConfig()

class RepartiService extends CompositeKeyCrudService<RepartoServer, Reparto> {
  constructor() {
    super({
      list: config.endpoints.reparti,
      create: config.endpoints.reparti,
      update: config.endpoints.reparti,
    })
  }

  protected generateCompositeId(entity: RepartoServer): string {
    return `${entity.codAzi}-${entity.codReparto}`
  }

  protected parseCompositeId(id: string): string[] {
    return id.split('-')
  }

  protected clientToServer(entity: Reparto): RepartoServer {
    return {
      codAzi: entity.codAzi,
      codReparto: entity.codReparto,
      descriz: entity.descriz
    }
  }

  protected serverToClient(entity: RepartoServer): Reparto {
    return {
      ...entity,
      id: this.generateCompositeId(entity)
    }
  }

  async getReparti(): Promise<Reparto[]> {
    return this.getAll()
  }

  async getReparto(id: string): Promise<Reparto> {
    return this.getById(id)
  }

  async getRepartoByCompositeKey(codAzi: number, codReparto: string): Promise<Reparto> {
    return this.getReparto(`${codAzi}-${codReparto}`)
  }

  async addReparto(reparto: Reparto): Promise<Reparto> {
    return this.create(reparto)
  }

  async editReparto(reparto: Reparto): Promise<Reparto> {
    return this.update(reparto)
  }

  async deleteRepartoByCompositeKey(codAzi: number, codReparto: string): Promise<boolean> {
    return this.delete(`${codAzi}-${codReparto}`)
  }
}

export const repartiService = new RepartiService()