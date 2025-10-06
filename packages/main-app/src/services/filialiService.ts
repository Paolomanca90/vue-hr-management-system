import { getApiConfig } from '@/config/api'
import { CompositeKeyCrudService, type CompositeKeyEntity } from './compositeKeyCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface Filiale extends CompositeKeyEntity {
    codAzi: number,
    codCant: number,
    descriz: string,
}

export interface FilialeDettaglio extends CompositeKeyEntity {
  codAzi: number,
  codCant: number,
  descriz: string,
  indirizzo: string
  numCivico: string
  localita: string
  codComune: string | null
  cap: string
  provincia: string
  ggSanto: number | null
  mmSanto: number | null
  codCauLav: number | null
  codCauRip: number | null
}
interface FilialeServer extends CrudEntity {
    codAzi: number,
    codCant: number,
    descriz: string,
}

interface FilialeDettaglioServer extends CrudEntity {
  codAzi: number,
  codCant: number,
  descriz: string,
  indirizzo: string
  numCivico: string
  localita: string
  codComune: string | null
  cap: string
  provincia: string
  ggSanto: number | null
  mmSanto: number | null
  codCauLav: number | null
  codCauRip: number | null
}

const config = getApiConfig()

class FilialiService extends CompositeKeyCrudService<FilialeServer, Filiale> {
  constructor() {
    super({
      list: config.endpoints.filiali,
      create: config.endpoints.filiali,
      update: config.endpoints.filiali,
    })
  }
  protected generateCompositeId(entity: FilialeServer): string {
    return `${entity.codAzi}-${entity.codCant}`
  }

  protected parseCompositeId(id: string): string[] {
    return id.split('-')
  }
  protected clientToServer(entity: Filiale): FilialeServer {
    return {
      codAzi: entity.codAzi,
      codCant: entity.codCant,
      descriz: entity.descriz
    }
  }

  protected serverToClient(entity: FilialeServer): Filiale {
    return {
      ...entity,
      id: this.generateCompositeId(entity)
    }
  }

  async getFiliali(): Promise<Filiale[]> {
    return this.getAll()
  }

  async getFiliale(id: string): Promise<FilialeDettaglio> {
    const [codAzi, codCant] = this.parseCompositeId(id)
    const filiale = await this.serverService.executeRequest<FilialeDettaglioServer>({
      method: 'GET',
      customEndpoint: `${config.endpoints.filiali}/${codAzi}/${codCant}`
    })
    return {
      ...filiale,
      id: this.generateCompositeId(filiale)
    }
  }

  async getFilialeByCompositeKey(codAzi: string, codCant: string): Promise<FilialeDettaglio> {
    const filiale = await this.serverService.executeRequest<FilialeDettaglioServer>({
      method: 'GET',
      customEndpoint: `${config.endpoints.filiali}/${codAzi}/${codCant}`
    })
    return {
      ...filiale,
      id: this.generateCompositeId(filiale)
    }
  }

  async addFiliale(filiale: FilialeDettaglio): Promise<Filiale> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...filialeWithoutId } = filiale
    const result = await this.serverService.create(filialeWithoutId as FilialeDettaglioServer)
    return this.serverToClient(result)
  }

  async editFiliale(filiale: FilialeDettaglio): Promise<Filiale> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...filialeWithoutId } = filiale
    const result = await this.serverService.update(filialeWithoutId as FilialeDettaglioServer)
    return this.serverToClient(result)
  }

  async deleteFiliale(codice: string): Promise<boolean> {
    return this.delete(codice)
  }
  async deleteFilialeByCompositeKey(codAzi: string, codCant: string): Promise<boolean> {
    return this.deleteFiliale(`${codAzi}-${codCant}`)
  }
}

export const filialiService = new FilialiService()
