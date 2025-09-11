import BaseService, { type BaseEntity } from './baseService'
import { type CrudEntity, type CrudService } from '@/composables/useCrudView'

export interface GenericCrudEndpoints {
  list: string
  create?: string
  update?: string
  delete?: string
}

export class GenericCrudService<T extends BaseEntity & CrudEntity> extends BaseService<T> implements CrudService<T> {
  [key: string]: unknown

  constructor(endpoints: GenericCrudEndpoints) {
    super({
      list: endpoints.list,
      create: endpoints.create,
      update: endpoints.update,
      delete: endpoints.delete
    })
  }

  async deleteWithBody(body: Record<string, unknown>): Promise<boolean> {
    const endpoints = this.endpoints
    await this.executeRequest({
      method: 'DELETE',
      customEndpoint: endpoints.delete || endpoints.list,
      body
    })
    return true
  }
}

export function createGenericCrudService<T extends BaseEntity & CrudEntity>(endpoints: GenericCrudEndpoints) {
  return new GenericCrudService<T>(endpoints)
}
