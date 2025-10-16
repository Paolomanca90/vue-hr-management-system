export interface SortSettings {
  sortField: string
  sortOrder: number
}

export interface SortableEntity {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export function useTableSort(entityType: string) {
  const STORAGE_KEY = `${entityType}SortSettings`

  const saveSortSettings = (sortField: string, sortOrder: number): void => {
    const settings: SortSettings = {
      sortField,
      sortOrder
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }

  const getSortSettings = (): SortSettings | null => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) return null

    try {
      return JSON.parse(saved) as SortSettings
    } catch (e) {
      console.error(`Error parsing sort settings for ${entityType}:`, e)
      return null
    }
  }

  const clearSortSettings = (): void => {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const createSortFunction = (
    defaultSortField: string = 'id',
    defaultSortOrder: number = 1
  ) => {
    return (a: SortableEntity, b: SortableEntity): number => {
      const savedSettings = getSortSettings()
      const sortField = savedSettings?.sortField || defaultSortField
      const sortOrder = savedSettings?.sortOrder || defaultSortOrder

      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortOrder
      if (bValue == null) return -sortOrder

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 1 ? aValue - bValue : bValue - aValue
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const diff = aValue.getTime() - bValue.getTime()
        return sortOrder === 1 ? diff : -diff
      }

      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      const comparison = aStr.localeCompare(bStr, 'it', { numeric: true })
      return sortOrder === 1 ? comparison : -comparison
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSortEvent = (event: any): void => {
    if (event.sortField && event.sortOrder !== undefined) {
      saveSortSettings(event.sortField, event.sortOrder)
    }
  }

  return {
    saveSortSettings,
    getSortSettings,
    clearSortSettings,
    createSortFunction,
    handleSortEvent
  }
}
