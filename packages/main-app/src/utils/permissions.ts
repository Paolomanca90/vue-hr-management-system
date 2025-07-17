import type { User } from '@/stores/auth'

export const checkPermission = (user: User | null, permission: string): boolean => {
  if (!user?.permissions) return false
  return user.permissions.includes('all') || user.permissions.includes(permission)
}

export const hasRole = (user: User | null, role: string): boolean => {
  return user?.role === role
}

export const isCompanyUser = (user: User | null): boolean => {
  return hasRole(user, 'admin') || hasRole(user, 'company')
}

export const isEmployeeUser = (user: User | null): boolean => {
  return hasRole(user, 'employee')
}

export const canManageEmployees = (user: User | null): boolean => {
  return isCompanyUser(user) && checkPermission(user, 'employee_management')
}

export const canViewReports = (user: User | null): boolean => {
  return isCompanyUser(user) && checkPermission(user, 'reports')
}

export const canManagePayroll = (user: User | null): boolean => {
  return isCompanyUser(user) && checkPermission(user, 'payroll_management')
}