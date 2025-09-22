import { getApiConfig } from '@/config/api'
import { CompositeKeyCrudService, type CompositeKeyEntity } from './compositeKeyCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

// Interfacce per il server (senza ID composito)
interface PatServer extends CrudEntity {
  codAzi: number
  codicePat: number
  pat: string
  codCont: string
}

// Interfacce per il frontend (con ID composito)
export interface Pat extends CompositeKeyEntity {
  codAzi: number
  codicePat: number
  pat: string
  codCont: string
}

const config = getApiConfig()

class PatService extends CompositeKeyCrudService<PatServer, Pat> {
  constructor() {
    super({
      list: config.endpoints.pat,
      create: config.endpoints.pat,
      update: config.endpoints.pat,
    })
  }

  protected generateCompositeId(entity: PatServer): string {
    return `${entity.codAzi}-${entity.codicePat}`
  }

  protected parseCompositeId(id: string): string[] {
    return id.split('-')
  }

  protected clientToServer(entity: Pat): PatServer {
    return {
      codAzi: entity.codAzi,
      codicePat: entity.codicePat,
      pat: entity.pat,
      codCont: entity.codCont
    }
  }

  protected serverToClient(entity: PatServer): Pat {
    return {
      ...entity,
      id: this.generateCompositeId(entity)
    }
  }

  // Metodi specifici per PAT
  async getPat(): Promise<Pat[]> {
    return this.getAll()
  }

  async getPatById(id: string): Promise<Pat> {
    const [codAzi, codicePat] = this.parseCompositeId(id)
    const pat = await this.serverService.executeRequest<PatServer>({
      method: 'GET',
      customEndpoint: `${config.endpoints.pat}/${codAzi}/${codicePat}`
    })
    return {
      ...pat,
      id: this.generateCompositeId(pat)
    }
  }

  async getPatByCompositeKey(codAzi: string, codicePat: string): Promise<Pat> {
    const pat = await this.serverService.executeRequest<PatServer>({
      method: 'GET',
      customEndpoint: `${config.endpoints.pat}/${codAzi}/${codicePat}`
    })
    return {
      ...pat,
      id: this.generateCompositeId(pat)
    }
  }

  async addPat(pat: Pat): Promise<Pat> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...patWithoutId } = pat
    const result = await this.serverService.create(patWithoutId as PatServer)
    return this.serverToClient(result)
  }

  async editPat(pat: Pat): Promise<Pat> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...patWithoutId } = pat
    const result = await this.serverService.update(patWithoutId as PatServer)
    return this.serverToClient(result)
  }

  async deletePat(id: string): Promise<boolean> {
    return this.delete(id)
  }

  async deletePatByCompositeKey(codAzi: string, codicePat: string): Promise<boolean> {
    return this.deletePat(`${codAzi}-${codicePat}`)
  }
}

export const patService = new PatService()