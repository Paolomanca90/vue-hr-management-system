import { getApiConfig } from '@/config/api'
import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

export interface OrarioList extends CrudEntity {
  codOra: number
  descrizione: string
  abbreviazione: string
}

export interface FasciaOraria {
  codOra: number
  codGruppo: number
  progressivo: number
  dalle: number
  alle: number
  aut: string
  codCau1: number
  codCau2: number
  codToll: number
  nMax: number
  maxPausa: number
  codCauPausa: number
  minPresObbl: number
}

export interface OrarioGen {
  codOra: number
  codGruppo: number
  codRol: number
  valoreRol: number
  minOrd: number
  codGrCauAss: number
  codGrCauStr: number
  codCauRecAss: number
  codCauAssRec: number
  codCambio: number
  codOraFest: number
  codOraSemi: number
  codOraPost: number
  codOra1: number
  codOra2: number
  codOra3: number
  codOra4: number
  codOra5: number
  codOra6: number
  codOra7: number
  tipoOrario: string
  oreXGg: number
  oreXAss: number
  oreXRiposo: number
  codCauFlexPos: number
  codCauFlexNeg: number
  codCauLavOrd: number
  oreCcnl: number
  percMaggD: number
  notturno: string
  tipoNotte: string
  tipoArroto: string
  arrPrimaUlt: string
  arrTimInt: string
  tipoArrEnt: string
  arrEntrata: number
  finDifEnt: number
  tipoArrUsc: string
  arrUscita: number
  finDifUsc: number
  mattDalle: number
  mattAlle: number
  mattDurata: number
  pomDalle: number
  pomAlle: number
  pomDurata: number
  mattCodOra: number
  pomCodOra: number
}

export interface DettaglioOrario {
  codGruppo: number
  orarioGen: OrarioGen
  fasceOrarie: FasciaOraria[]
}

export interface OrarioDettaglio extends CrudEntity {
  codOra: number
  descrizione: string
  abbreviazione: string
  dettaglioOrario: DettaglioOrario
}

const config = getApiConfig()

class OrariService extends GenericCrudService<OrarioList> {
  constructor() {
    super({
      list: config.endpoints.orari,
      create: config.endpoints.orari,
      update: config.endpoints.orari,
      delete: config.endpoints.deleteOrario
    })
  }

  override async getAll(): Promise<OrarioList[]> {
    // La risposta è un oggetto con chiavi dinamiche, lo convertiamo in array
    const response = await this.executeRequest<Record<string, OrarioList>>({
      method: 'GET',
      customEndpoint: config.endpoints.orari
    })

    // Converte l'oggetto in array
    return Object.values(response)
  }

  async getDettaglioOrario(codOra: number): Promise<OrarioDettaglio> {
    return this.executeRequest<OrarioDettaglio>({
      method: 'GET',
      customEndpoint: `${config.endpoints.getDettaglioOrario}/${codOra}`
    })
  }

  async createOrario(orario: OrarioDettaglio): Promise<OrarioDettaglio> {
    return this.create(orario as Partial<OrarioList>) as Promise<OrarioDettaglio>
  }

  async updateOrario(orario: OrarioDettaglio): Promise<OrarioDettaglio> {
    return this.update(orario as OrarioList) as Promise<OrarioDettaglio>
  }

  async deleteOrario(codOra: number, codGruppo: number): Promise<boolean> {
    return this.executeRequest<boolean>({
      method: 'DELETE',
      customEndpoint: `${config.endpoints.deleteOrario}/${codOra}/${codGruppo}`
    })
  }
}

export const orariService = new OrariService()
