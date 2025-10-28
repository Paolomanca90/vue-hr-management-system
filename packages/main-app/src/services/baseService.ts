/* eslint-disable @typescript-eslint/no-explicit-any */
import { getApiConfig } from '@/config/api'

export interface BaseEntity {
  [key: string]: any
}

export interface CrudEndpoints {
  list: string
  create?: string
  update?: string
  delete?: string
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  params?: Record<string, string | number | boolean>
  customEndpoint?: string
}

class BaseService<T extends BaseEntity> {
  protected get config() {
    return getApiConfig()
  }

  constructor(protected endpoints: CrudEndpoints) {}

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const baseUrl = `${this.config.baseUrl}${endpoint}`

    if (!params) return baseUrl

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })

    return `${baseUrl}?${searchParams.toString()}`
  }

  private getHeaders(): Record<string, string> {
    return {
      ...this.config.defaultHeaders,
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    }
  }

  private async handleResponse<R>(response: Response): Promise<R> {
    if (!response.ok) {
      try {
        const errorData = await response.json()
        throw new Error(`${errorData.errors || errorData.message || `HTTP error! status: ${response.status}`}`)
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : `HTTP error! status: ${response.status}`)
      }
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return await response.text() as unknown as R
  }

  async executeRequest<R = T>(config: RequestConfig): Promise<R> {
    try {
      const endpoint = config.customEndpoint || this.endpoints.list
      const url = this.buildUrl(endpoint, config.params)

      const fetchConfig: RequestInit = {
        method: config.method,
        headers: this.getHeaders(),
      }

      if (config.body && (config.method === 'POST' || config.method === 'PUT')) {
        fetchConfig.body = JSON.stringify(config.body)
      }

      const response = await fetch(url, fetchConfig)
      return await this.handleResponse<R>(response)

    } catch (error: any) {
      throw new Error(`${error.message}`)
    }
  }

  async getAll(params?: Record<string, string | number | boolean>): Promise<T[]> {
    return this.executeRequest<T[]>({
      method: 'GET',
      params
    })
  }

  async getById(id: string | number, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.executeRequest<T>({
      method: 'GET',
      customEndpoint: `${this.endpoints.list}/${id}`,
      params
    })
  }

  async create(entity: Partial<T>): Promise<T> {
    const endpoint = this.endpoints.create || this.endpoints.list
    return this.executeRequest<T>({
      method: 'POST',
      customEndpoint: endpoint,
      body: entity
    })
  }

  async update(entity: T): Promise<T> {
    const endpoint = this.endpoints.update || this.endpoints.list
    return this.executeRequest<T>({
      method: 'PUT',
      customEndpoint: endpoint,
      body: entity
    })
  }

  async delete(id: string | number): Promise<boolean> {
    const endpoint = this.endpoints.delete ? `${this.endpoints.delete}${id}` : `${this.endpoints.list}/${id}`
    await this.executeRequest<void>({
      method: 'DELETE',
      customEndpoint: endpoint
    })
    return true
  }

  async deleteWithBody(body: any): Promise<boolean> {
    const endpoint = this.endpoints.delete || this.endpoints.list
    await this.executeRequest<void>({
      method: 'DELETE',
      customEndpoint: endpoint,
      body
    })
    return true
  }

  async customRequest<R = any>(config: RequestConfig): Promise<R> {
    return this.executeRequest<R>(config)
  }
}

export function createCrudMethods<T extends BaseEntity>(endpoints: CrudEndpoints) {
  const baseService = new BaseService<T>(endpoints)

  return {
    getAll: (params?: Record<string, string | number | boolean>) => baseService.getAll(params),
    getById: (id: string | number, params?: Record<string, string | number | boolean>) => baseService.getById(id, params),
    create: (entity: Partial<T>) => baseService.create(entity),
    update: (entity: T) => baseService.update(entity),
    delete: (id: string | number) => baseService.delete(id),
    deleteWithBody: (body: any) => baseService.deleteWithBody(body),
    customRequest: <R = any>(config: RequestConfig) => baseService.customRequest<R>(config)
  }
}

export default BaseService
