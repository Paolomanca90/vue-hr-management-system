import { getApiConfig } from '@/config/api'
import { CompositeKeyCrudService, type CompositeKeyEntity } from './compositeKeyCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

// Interfacce per il server (senza ID composito)
interface SedeServer extends CrudEntity {
    codAzi: number
    codSedeAz: number
    descriz: string
}

interface SedeDettaglioServer extends CrudEntity {
  codAzi: number
  codSedeAz: number
  descriz: string
  indirizzo: string
  numCivico: string
  localita: string
  codComune: string
  cap: string
  provincia: string
}

// Interfacce per il frontend (con ID composito)
export interface Sede extends CompositeKeyEntity {
    codAzi: number
    codSedeAz: number
    descriz: string
}

export interface SedeDettaglio extends CompositeKeyEntity {
  codAzi: number
  codSedeAz: number
  descriz: string
  indirizzo: string
  numCivico: string
  localita: string
  codComune: string
  cap: string
  provincia: string
}

// Interfaccia separata per le filiali che mantengono la struttura vecchia
export interface FilialeDettaglio extends CrudEntity {
  codSede: number
  ragSoc: string
  sigla: string
  indirSede: string
  numSede: string
  capSede: number
  comuSede: string
  provSede: string
  codFisc: string
}

const config = getApiConfig()

class SediService extends CompositeKeyCrudService<SedeServer, Sede> {
  constructor() {
    super({
      list: config.endpoints.sedi,
      create: config.endpoints.sedi,
      update: config.endpoints.sedi,
    })
  }

  protected generateCompositeId(entity: SedeServer): string {
    return `${entity.codAzi}-${entity.codSedeAz}`
  }

  protected parseCompositeId(id: string): string[] {
    return id.split('-')
  }

  protected clientToServer(entity: Sede): SedeServer {
    return {
      codAzi: entity.codAzi,
      codSedeAz: entity.codSedeAz,
      descriz: entity.descriz
    }
  }

  protected serverToClient(entity: SedeServer): Sede {
    return {
      ...entity,
      id: this.generateCompositeId(entity)
    }
  }

  // Metodi specifici per le sedi
  async getSedi(): Promise<Sede[]> {
    return this.getAll()
  }

  async getSede(id: string): Promise<SedeDettaglio> {
    const [codAzi, codSedeAz] = this.parseCompositeId(id)
    const sede = await this.serverService.executeRequest<SedeDettaglioServer>({
      method: 'GET',
      customEndpoint: `${config.endpoints.sedi}/${codAzi}/${codSedeAz}`
    })
    return {
      ...sede,
      id: this.generateCompositeId(sede)
    }
  }

  async getSedeByCompositeKey(codAzi: string, codSedeAz: string): Promise<SedeDettaglio> {
    const sede = await this.serverService.executeRequest<SedeDettaglioServer>({
      method: 'GET',
      customEndpoint: `${config.endpoints.sedi}/${codAzi}/${codSedeAz}`
    })
    return {
      ...sede,
      id: this.generateCompositeId(sede)
    }
  }

  async addSede(sede: SedeDettaglio): Promise<Sede> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...sedeWithoutId } = sede
    const result = await this.serverService.create(sedeWithoutId as SedeDettaglioServer)
    return this.serverToClient(result)
  }

  async editSede(sede: SedeDettaglio): Promise<Sede> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...sedeWithoutId } = sede
    const result = await this.serverService.update(sedeWithoutId as SedeDettaglioServer)
    return this.serverToClient(result)
  }

  async deleteSede(id: string): Promise<boolean> {
    return this.delete(id)
  }

  async deleteSedeByCompositeKey(codAzi: string, codSedeAz: string): Promise<boolean> {
    return this.deleteSede(`${codAzi}-${codSedeAz}`)
  }
}

export const sediService = new SediService()