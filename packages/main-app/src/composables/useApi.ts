import { ref, type Ref } from 'vue'
import { type AxiosResponse } from 'axios'

export interface ApiState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: (apiCall: () => Promise<AxiosResponse<T>>) => Promise<T | null>
}

export function useApi<T>(): ApiState<T> {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (apiCall: () => Promise<AxiosResponse<T>>): Promise<T | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiCall()
      data.value = response.data
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    data: data as Ref<T | null>,
    loading,
    error,
    execute
  }
}