export const APP_NAME = 'HR Management System'
export const APP_VERSION = '1.0.0'

export const USER_ROLES = {
  ADMIN: 'admin',
  COMPANY: 'company', 
  EMPLOYEE: 'employee'
} as const

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on-leave'
} as const

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const

export const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  THEME: 'hr-app-theme',
  SIDEBAR_STATE: 'sidebar-state'
} as const
