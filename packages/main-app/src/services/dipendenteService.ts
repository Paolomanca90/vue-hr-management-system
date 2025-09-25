import { getApiConfig } from '@/config/api'
import { createCrudMethods } from './baseService'

export interface CampoDipendente {
  tabella: string
  campo: string
  tipologia: string
  dimensione: number
}

export interface FiltriDipendente {
  codAzi: number
  codSedeAz?: number
  codCant?: number
  codCenco?: string
  codReparto?: string
  codFiltro?: string
  codDip?: number
  cognome?: string
  nome?: string
}

export interface Dipendente {
  id: string
  codAzi: number
  codDip: number
  cognome: string
  nome: string
}

export interface Badge {
  codDip: number
  codAzi: number
  codBadge: number
  dal: string
  al: string
}

export interface PAT {
  codDip: number
  codAzi: number
  codPat: number
  dal: string
  al: string
}

export interface DatiAziendali {
  codDip: number
  codAzi: number
  codSedeAz: number
  codCant: number
  codCenco: string
  codReparto: string
  posinps: number
  codicePat: number
  codQualif: string
  codLivello: string
  codCCNL: number
  dataAssunz: string
  dataAssunzioneConvenzionale: string
  dataCessazione: string
  percenpt: number
  tipoRappor: string
  listaBadge: Badge[]
  listaPAT: PAT[]
}

export interface DatiPersonali {
  codDip: number
  codAzi: number
  codFis: string
  dataNas: string
  sesso: string
  comNas: string
  proNas: string
  viaRes: string
  numRes: string
  comRes: string
  codComRes: string
  capRes: number
  proRes: string
  telefono: string
  statoCivi: string
  militare: string
  mail: string
  note: string
}

export interface CodiciUtente {
  codUtente1: string
  codUtente2: string
  codUtente3: string
  codUtente4: string
  codUtente5: string
  codUtente6: string
  codUtente7: string
  codUtente8: string
  codUtente9: string
  codUtente10: string
}

export interface Familiare {
  codAzi: number
  codDip: number
  codice: number
  codFisc: string
  cognome: string
  nome: string
}

export interface DettaglioDipendente {
  codDip: number
  codAzi: number
  matricola: string
  cognome: string
  nome: string
  datiAzi: DatiAziendali
  datiPers: DatiPersonali
  codUte: CodiciUtente
  familiari: Familiare[]
}

export interface CodiceFiscaleDecoded {
  value: string
  dataNascita: string
  sesso: string
  codiceComune: string
  nomeComune: string
  provincia: string
  cap: string
}

export interface GetDettaglioDipendenteRequest {
  codAzi: number
  codDip: number
}

class DipendenteService {
  private config = getApiConfig()
  private campiCrud = createCrudMethods<CampoDipendente>({
    list: this.config.endpoints.getCampiDipendente
  })

  async getCampiDipendente(): Promise<CampoDipendente[]> {
    return this.campiCrud.getAll()
  }

  async getValoriCampo(tabella: string, campo: string): Promise<string[]> {
    return this.campiCrud.customRequest<string[]>({
      method: 'GET',
      customEndpoint: this.config.endpoints.getValoriCampo,
      params: { tabella, campo }
    })
  }

  async getListaDipendenti(filtri: FiltriDipendente): Promise<Dipendente[]> {
    return this.campiCrud.customRequest<Dipendente[]>({
      method: 'POST',
      customEndpoint: this.config.endpoints.getListaDipendenti,
      body: filtri
    })
  }

  async getDettaglioDipendente(request: GetDettaglioDipendenteRequest): Promise<DettaglioDipendente> {
    return this.campiCrud.customRequest<DettaglioDipendente>({
      method: 'POST',
      customEndpoint: this.config.endpoints.getDettaglioDipendente,
      params: {
        codAzi: request.codAzi,
        codDip: request.codDip
      }
    })
  }

  async decodeCodiceFiscale(codiceFiscale: string): Promise<CodiceFiscaleDecoded> {
    return this.campiCrud.customRequest<CodiceFiscaleDecoded>({
      method: 'GET',
      customEndpoint: `${this.config.endpoints.decodeCodiceFiscale}/${encodeURIComponent(codiceFiscale)}`
    })
  }

  async createDipendente(dipendente: DettaglioDipendente): Promise<void> {
    return this.campiCrud.customRequest<void>({
      method: 'POST',
      customEndpoint: this.config.endpoints.createDipendente,
      body: dipendente
    })
  }

  async updateDipendente(dipendente: DettaglioDipendente): Promise<void> {
    return this.campiCrud.customRequest<void>({
      method: 'PUT',
      customEndpoint: this.config.endpoints.updateDipendente,
      body: dipendente
    })
  }

  async deleteDipendente(codAzi: number, codDip: number): Promise<void> {
    return this.campiCrud.customRequest<void>({
      method: 'DELETE',
      customEndpoint: this.config.endpoints.deleteDipendente,
      params: { codAzi, codDip }
    })
  }
}

export const dipendenteService = new DipendenteService()
