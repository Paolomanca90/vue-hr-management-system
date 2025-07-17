import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const THEME_KEY = 'hr-app-theme'
  const currentTheme = ref<Theme>('auto')

  const isDarkMode = computed(() => {
    switch (currentTheme.value) {
      case 'dark':
        return true
      case 'light':
        return false
      case 'auto':
      default:
        return typeof window !== 'undefined' 
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false
    }
  })

  const themeIcon = computed(() => {
    switch (currentTheme.value) {
      case 'light':
        return 'fas fa-sun'
      case 'dark':
        return 'fas fa-moon'
      case 'auto':
      default:
        return 'fas fa-adjust'
    }
  })

  const themeLabel = computed(() => {
    switch (currentTheme.value) {
      case 'light':
        return 'Modalità Chiara'
      case 'dark':
        return 'Modalità Scura'
      case 'auto':
      default:
        return 'Automatica'
    }
  })

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem(THEME_KEY, theme)
    applyTheme()
  }

  const toggleTheme = () => {
    let newTheme: Theme
    switch (currentTheme.value) {
      case 'light':
        newTheme = 'dark'
        break
      case 'dark':
        newTheme = 'auto'
        break
      case 'auto':
      default:
        newTheme = 'light'
        break
    }
    setTheme(newTheme)
  }

  const applyTheme = () => {
    if (typeof document === 'undefined') return

    const isDark = isDarkMode.value
    
    // Apply DaisyUI theme
    const daisyTheme = isDark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', daisyTheme)
    
    // Apply dark class for Tailwind CSS
    document.documentElement.classList.toggle('dark', isDark)
    
    // Update color-scheme for better accessibility
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  }

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme
    const theme = savedTheme || 'auto'
    currentTheme.value = theme
    applyTheme()

    // Setup media query listener
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        if (currentTheme.value === 'auto') {
          applyTheme()
        }
      })
    }
  }

  const animateThemeChange = () => {
    if (typeof document === 'undefined') return
    
    document.documentElement.style.transition = 'color-scheme 0.3s ease, background-color 0.3s ease'
    
    setTimeout(() => {
      document.documentElement.style.transition = ''
    }, 300)
  }

  return {
    currentTheme,
    isDarkMode,
    themeIcon,
    themeLabel,
    setTheme,
    toggleTheme,
    initializeTheme,
    animateThemeChange
  }
})