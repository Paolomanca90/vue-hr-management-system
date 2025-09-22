import { CompositeKeyCrudService, type CompositeKeyEntity } from './compositeKeyCrudService'
import { getApiConfig } from '../config/api'
import type { CrudEntity } from '@/composables/useCrudView'

// Interfaccia per i dati del server
interface PosizioneInpsServer extends CrudEntity {
  codAzi: number
  posInps: number
  matrInps: string
}

// Interfaccia per l'uso client-side
export interface PosizioneInps extends CompositeKeyEntity {
  codAzi: number
  posInps: number
  matrInps: string
}

const config = getApiConfig()

class PosizioneInpsService extends CompositeKeyCrudService<PosizioneInpsServer, PosizioneInps> {
  constructor() {
    super({
      list: config.endpoints.posizioneInps,
      create: config.endpoints.posizioneInps,
      update: config.endpoints.posizioneInps,
    })
  }

  protected generateCompositeId(entity: PosizioneInpsServer): string {
    return `${entity.codAzi}-${entity.posInps}`
  }

  protected parseCompositeId(id: string): string[] {
    return id.split('-')
  }

  protected clientToServer(entity: PosizioneInps): PosizioneInpsServer {
    return {
      codAzi: entity.codAzi,
      posInps: entity.posInps,
      matrInps: entity.matrInps
    }
  }

  protected serverToClient(entity: PosizioneInpsServer): PosizioneInps {
    return {
      ...entity,
      id: this.generateCompositeId(entity)
    }
  }

  // Get all posizioni INPS
  async getPosizioniInps(): Promise<PosizioneInps[]> {
    return this.getAll()
  }

  // Metodi specifici per Posizioni INPS
  async getPosizioneInpsById(id: string): Promise<PosizioneInps> {
    const [codAzi, posInps] = this.parseCompositeId(id)
    const posizioneInps = await this.serverService.executeRequest<PosizioneInpsServer>({
      method: 'GET',
      customEndpoint: `${config.endpoints.posizioneInps}/${codAzi}/${posInps}`
    })
    return {
      ...posizioneInps,
      id: this.generateCompositeId(posizioneInps)
    }
  }

  async getPosizioneInpsByCompositeKey(codAzi: string, posInps: string): Promise<PosizioneInps> {
    const posizioneInps = await this.serverService.executeRequest<PosizioneInpsServer>({
      method: 'GET',
      customEndpoint: `${config.endpoints.posizioneInps}/${codAzi}/${posInps}`
    })
    return {
      ...posizioneInps,
      id: this.generateCompositeId(posizioneInps)
    }
  }

  async addPosizioneInps(posizioneInps: PosizioneInps): Promise<PosizioneInps> {
    return this.create(posizioneInps)
  }

  async editPosizioneInps(posizioneInps: PosizioneInps): Promise<PosizioneInps> {
    return this.update(posizioneInps)
  }

  async deletePosizioneInps(id: string): Promise<boolean> {
    return this.delete(id)
  }
}

export const posizioneInpsService = new PosizioneInpsService()
