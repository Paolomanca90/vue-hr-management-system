import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  position: string
  department: string
  hireDate: Date
  salary: number
  status: 'active' | 'inactive' | 'on-leave'
}

export interface DashboardStats {
  totalEmployees: number
  presentToday: number
  pendingLeaves: number
  monthlyBudget: number
}

export const useDataStore = defineStore('data', () => {
  const employees = ref<Employee[]>([
    {
      id: 1,
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@company.com',
      position: 'Sviluppatore Senior',
      department: 'IT',
      hireDate: new Date('2020-03-15'),
      salary: 45000,
      status: 'active'
    },
    {
      id: 2,
      firstName: 'Giulia',
      lastName: 'Bianchi',
      email: 'giulia.bianchi@company.com',
      position: 'Marketing Manager',
      department: 'Marketing',
      hireDate: new Date('2019-07-20'),
      salary: 42000,
      status: 'active'
    },
    {
      id: 3,
      firstName: 'Luca',
      lastName: 'Verdi',
      email: 'luca.verdi@company.com',
      position: 'Contabile',
      department: 'Amministrazione',
      hireDate: new Date('2021-01-10'),
      salary: 35000,
      status: 'on-leave'
    },
    {
      id: 4,
      firstName: 'Sara',
      lastName: 'Neri',
      email: 'sara.neri@company.com',
      position: 'HR Specialist',
      department: 'Risorse Umane',
      hireDate: new Date('2018-11-05'),
      salary: 38000,
      status: 'active'
    },
    {
      id: 5,
      firstName: 'Alessandro',
      lastName: 'Blu',
      email: 'alessandro.blu@company.com',
      position: 'Grafico',
      department: 'Design',
      hireDate: new Date('2022-09-12'),
      salary: 32000,
      status: 'active'
    },
    {
      id: 6,
      firstName: 'Francesca',
      lastName: 'Gialli',
      email: 'francesca.gialli@company.com',
      position: 'Project Manager',
      department: 'IT',
      hireDate: new Date('2020-05-03'),
      salary: 48000,
      status: 'inactive'
    }
  ])

  const departments = ref<string[]>([
    'IT', 'Marketing', 'Amministrazione', 'Risorse Umane', 'Design'
  ])

  const loading = ref(false)

  // Actions
  const getEmployees = async (): Promise<Employee[]> => {
    loading.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    loading.value = false
    return [...employees.value]
  }

  const getDashboardStats = async (): Promise<DashboardStats> => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    loading.value = false
    
    return {
      totalEmployees: employees.value.length,
      presentToday: employees.value.filter(emp => emp.status === 'active').length,
      pendingLeaves: employees.value.filter(emp => emp.status === 'on-leave').length,
      monthlyBudget: employees.value.reduce((total, emp) => total + emp.salary, 0)
    }
  }

  const deleteEmployee = async (id: number): Promise<boolean> => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = employees.value.findIndex(emp => emp.id === id)
    if (index !== -1) {
      employees.value.splice(index, 1)
      loading.value = false
      return true
    }
    loading.value = false
    return false
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value)
  }

  return {
    employees,
    departments,
    loading,
    getEmployees,
    getDashboardStats,
    deleteEmployee,
    formatCurrency
  }
})