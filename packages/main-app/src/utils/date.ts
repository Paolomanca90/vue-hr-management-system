export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days)
}

export const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export const getEndOfWeek = (date: Date): Date => {
  const result = getStartOfWeek(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Ora'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minuto${minutes > 1 ? 'i' : ''} fa`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ora${hours > 1 ? 'e' : ''} fa`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} giorno${days > 1 ? 'i' : ''} fa`
  } else {
    return new Intl.DateTimeFormat('it-IT').format(date)
  }
}
