export const API_CONFIG = {
  // URL base dell'API
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7255',

  // Endpoints
  endpoints: {
    login: '/api/Login/login',
    getDomini: '/api/Login/getdomini',
    setDominio: '/api/Login/setdominio',
    logout: '/api/Login/logout',
    getEncryptString: '/api/Login/getencryptstring',
    menuVisibili: '/api/Menu/visibili',
  },

  // Headers di default
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },

  // Timeout per le richieste (in millisecondi)
  timeout: import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT, 10) : 5000,

  // Configurazione per il retry delle richieste
  retry: {
    attempts: import.meta.env.VITE_API_RETRY_ATTEMPTS
      ? parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS, 10)
      : 3,
    delay: 1000,
  },
}

// Configurazione per i diversi ambienti
export const getApiConfig = () => {
  const env = import.meta.env.MODE

  switch (env) {
    case 'development':
      return {
        ...API_CONFIG,
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7255',
      }
    case 'production':
      return {
        ...API_CONFIG,
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://production-url.com',
      }
    case 'staging':
      return {
        ...API_CONFIG,
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://staging-url.com',
      }
    default:
      return API_CONFIG
  }
}
