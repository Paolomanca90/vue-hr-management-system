export interface FilterSettings {
  [field: string]: {
    value: unknown
    matchMode: string
  }
}

export interface FilterableEntity {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export function useTableFilter(entityType: string) {
  const STORAGE_KEY = `${entityType}FilterSettings`

  const saveFilterSettings = (filters: FilterSettings): void => {
    const filtersToSave: FilterSettings = {}
    Object.entries(filters).forEach(([key, filter]) => {
      if (key !== 'global' && filter.value != null && filter.value !== '') {
        filtersToSave[key] = filter
      }
    })

    if (Object.keys(filtersToSave).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtersToSave))
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  const getFilterSettings = (): FilterSettings | null => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) return null

    try {
      return JSON.parse(saved) as FilterSettings
    } catch (e) {
      console.error(`Error parsing filter settings for ${entityType}:`, e)
      return null
    }
  }

  const clearFilterSettings = (): void => {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const applyFilters = (data: FilterableEntity[], filters: FilterSettings): FilterableEntity[] => {
    if (!filters || Object.keys(filters).length === 0) {
      return data
    }

    return data.filter(item => {
      return Object.entries(filters).every(([field, filter]) => {
        if (filter.value == null || filter.value === '') return true

        const itemValue = item[field]
        const filterValue = filter.value

        if (itemValue == null) return false

        const itemStr = String(itemValue).toLowerCase()
        const filterStr = String(filterValue).toLowerCase()

        switch (filter.matchMode) {
          case 'startsWith':
            return itemStr.startsWith(filterStr)
          case 'contains':
            return itemStr.includes(filterStr)
          case 'notContains':
          case 'doesNotContain':
            return !itemStr.includes(filterStr)
          case 'endsWith':
            return itemStr.endsWith(filterStr)
          case 'equals':
            return itemStr === filterStr
          case 'notEquals':
            return itemStr !== filterStr
          case 'lt':
            return Number(itemValue) < Number(filterValue)
          case 'lte':
            return Number(itemValue) <= Number(filterValue)
          case 'gt':
            return Number(itemValue) > Number(filterValue)
          case 'gte':
            return Number(itemValue) >= Number(filterValue)
          case 'in':
            if (Array.isArray(filterValue)) {
              return filterValue.some(v => String(v).toLowerCase() === itemStr)
            }
            return false
          default:
            return itemStr.includes(filterStr)
        }
      })
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterEvent = (event: any): void => {
    if (event.filters) {
      saveFilterSettings(event.filters)
    }
  }

  return {
    saveFilterSettings,
    getFilterSettings,
    clearFilterSettings,
    applyFilters,
    handleFilterEvent
  }
}
