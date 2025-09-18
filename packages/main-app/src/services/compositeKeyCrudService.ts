import { GenericCrudService } from './genericCrudService'
import { type CrudEntity } from '@/composables/useCrudView'

// Interfaccia base per entità con chiave composita
export interface CompositeKeyEntity extends CrudEntity {
  id: string // ID composito generato automaticamente
}

// Classe astratta per servizi con chiavi composite
export abstract class CompositeKeyCrudService<
  TServer extends CrudEntity,
  TClient extends CompositeKeyEntity
> {
  // Index signature per compatibilità con CrudService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  protected serverService: GenericCrudService<TServer>
  protected endpointsConfig: { list: string; create: string; update: string }

  constructor(endpoints: { list: string; create: string; update: string }) {
    this.serverService = new GenericCrudService<TServer>(endpoints)
    this.endpointsConfig = endpoints
  }

  // Metodo astratto per generare l'ID composito
  protected abstract generateCompositeId(entity: TServer): string

  // Metodo astratto per estrarre i parametri dall'ID composito
  protected abstract parseCompositeId(id: string): string[]

  // Metodo astratto per convertire da client a server
  protected abstract clientToServer(entity: TClient): TServer

  // Metodo astratto per convertire da server a client
  protected abstract serverToClient(entity: TServer): TClient

  // Metodi per compatibilità con useCrudView
  async getAll(): Promise<TClient[]> {
    const entities = await this.serverService.getAll()
    return entities.map(entity => this.serverToClient(entity))
  }

  async create(entity: TClient): Promise<TClient> {
    const serverEntity = this.clientToServer(entity)
    const result = await this.serverService.create(serverEntity)
    return this.serverToClient(result)
  }

  async update(entity: TClient): Promise<TClient> {
    const serverEntity = this.clientToServer(entity)
    const result = await this.serverService.update(serverEntity)
    return this.serverToClient(result)
  }

  async delete(id: string): Promise<boolean> {
    const params = this.parseCompositeId(id)
    return this.serverService.executeRequest<boolean>({
      method: 'DELETE',
      customEndpoint: `${this.endpointsConfig.update}/${params.join('/')}`
    })
  }

  // Metodo per ottenere una singola entità usando l'ID composito
  async getById(id: string): Promise<TClient> {
    const params = this.parseCompositeId(id)
    const entity = await this.serverService.executeRequest<TServer>({
      method: 'GET',
      customEndpoint: `${this.endpointsConfig.list}/${params.join('/')}`
    })
    return this.serverToClient(entity)
  }
}