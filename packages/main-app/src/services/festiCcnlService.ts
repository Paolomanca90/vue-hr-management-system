import { getApiConfig } from '@/config/api'
import { CompositeKeyCrudService, type CompositeKeyEntity } from './compositeKeyCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface FestivitaCcnl {
  data: string // ISO datetime string
  descriz: string
  tipoFesta: number
  codCauLav: number
  codCauRip: number
}

export interface FestiCcnlList extends CompositeKeyEntity {
  anno: number
  descriz: string
  codCCNL: number
  provincia: string
}

export interface FestiCcnlDettaglio extends CompositeKeyEntity {
  anno: number
  codCCNL: number
  provincia: string
  festivita: FestivitaCcnl[]
}

// Interfacce per il server (senza id)
interface FestiCcnlListServer extends CrudEntity {
  anno: number
  descriz: string
  codCCNL: number
  provincia: string
}

interface FestiCcnlDettaglioServer extends CrudEntity {
  anno: number
  codCCNL: number
  provincia: string
  festivita: FestivitaCcnl[]
}

export interface FestiCcnlDettaglioResponse {
  codCCNL: number
  setCCNL: number
  speCCNL: number
  anno: number
  provincia: string
  listaGiorniFest: FestivitaCcnl[]
}

export interface FestiCcnlDettaglioParams {
  periodoDal: string // ISO datetime string
  periodoAl: string // ISO datetime string
  iContratto: number
  sProv: string
}

const config = getApiConfig()

class FestiCcnlService extends CompositeKeyCrudService<FestiCcnlListServer, FestiCcnlList> {
  constructor() {
    super({
      list: config.endpoints.festiCcnl,
      create: config.endpoints.festiCcnl,
      update: config.endpoints.festiCcnl
    })
  }

  protected generateCompositeId(entity: FestiCcnlListServer | FestiCcnlDettaglioServer): string {
    return `${entity.anno}-${entity.codCCNL}-${entity.provincia}`
  }

  protected parseCompositeId(id: string): string[] {
    return id.split('-')
  }

  protected clientToServer(entity: FestiCcnlList): FestiCcnlListServer {
    return {
      anno: entity.anno,
      codCCNL: entity.codCCNL,
      provincia: entity.provincia,
      descriz: entity.descriz
    }
  }

  protected serverToClient(entity: FestiCcnlListServer): FestiCcnlList {
    return {
      ...entity,
      id: this.generateCompositeId(entity)
    }
  }

  override async getAll(): Promise<FestiCcnlList[]> {
    const festiCcnl = await super.getAll()
    // Ordina per anno decrescente e poi per contratto
    return festiCcnl.sort((a, b) => {
      if (b.anno !== a.anno) return b.anno - a.anno
      return a.codCCNL - b.codCCNL
    })
  }

  async getDettaglio(params: FestiCcnlDettaglioParams): Promise<FestiCcnlDettaglioResponse[]> {
    return this.serverService.executeRequest<FestiCcnlDettaglioResponse[]>({
      method: 'GET',
      params: {
        PeriodoDal: params.periodoDal,
        PeriodoAl: params.periodoAl,
        iContratto: params.iContratto,
        sProv: params.sProv
      },
      customEndpoint: config.endpoints.festiCcnlDettaglio
    })
  }

  async createFestiCcnl(festiCcnl: FestiCcnlDettaglioServer): Promise<FestiCcnlDettaglio> {
    const result = await this.serverService.executeRequest<FestiCcnlDettaglioServer>({
      method: 'POST',
      body: festiCcnl,
      customEndpoint: config.endpoints.festiCcnl
    })
    return {
      ...result,
      id: this.generateCompositeId(result)
    }
  }

  async updateFestiCcnl(festiCcnl: FestiCcnlDettaglioServer): Promise<FestiCcnlDettaglio> {
    const result = await this.serverService.executeRequest<FestiCcnlDettaglioServer>({
      method: 'PUT',
      body: festiCcnl,
      customEndpoint: config.endpoints.festiCcnl
    })
    return {
      ...result,
      id: this.generateCompositeId(result)
    }
  }

  async deleteFestiCcnl(anno: number, contratto: number, provincia: string): Promise<boolean> {
    return this.serverService.executeRequest<boolean>({
      method: 'DELETE',
      params: {
        iAnno: anno,
        iContratto: contratto,
        sProv: provincia
      },
      customEndpoint: config.endpoints.festiCcnl
    })
  }
}

export const festiCcnlService = new FestiCcnlService()
