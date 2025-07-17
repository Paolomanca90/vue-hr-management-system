import { ref, type Ref } from 'vue'
import axios, { type AxiosResponse } from 'axios'

interface ApiState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
}

export function useApi<T>() {
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
    } catch (err: any) {
      error.value = err.message || 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute
  }
}