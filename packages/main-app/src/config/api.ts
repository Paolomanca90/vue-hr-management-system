export const API_CONFIG = {
  // URL base dell'API
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7255',

  // Endpoints
  endpoints: {
    // Login
    login: '/api/Login/login', //POST
    getDomini: '/api/Login/getdomini',
    setDominio: '/api/Login/setdominio', //POST
    logout: '/api/Login/logout',

    // Menu
    menuVisibili: '/api/Menu/visibili',
    menuUtente: '/api/Menu/menuUtente?usernameUtente=',
    apiDisponibili: 'api/Menu/ApiDisponibili',
    updateMenuAbilitazioni: '/api/Menu/UpdateMenuAbilitazioni?usernameUtente=', //POST
    aggiornaPreferito: '/api/Menu/AggiornaPreferito', // POST

    //Profile
    users: '/api/users', //GET,POST,PUT
    deleteUser: '/api/users/by-key?username=', //DELETE

    // Gruppi Utente
    menuGruppiUtente: '/api/gruppiutente/menuXGruppiUtente',
    aggiornaAbilitazioniGruppiUtente: '/api/gruppiutente/aggiornaAbilitazioniGruppiUtente', //POST
    gruppiUtente: '/api/gruppiutente', //GET,POST,PUT
    deleteGruppiUtente: '/api/gruppiutente/by-key', //DELETE

    // Setting
    lingue: '/api/settings/lingue',
    impostazioniInternazionali: '/api/settings/impostazioniInternazionali',

    // Accessi
    accessi: '/api/accessi', //GET,POST,PUT
    accessiSelect: '/api/accessi/select',
    deleteAccessi: '/api/accessi/by-key', //DELETE

    // Filtri
    filtri: '/api/filtri', //GET,POST,PUT
    filtriSelect: '/api/filtri/select',
    deleteFiltri: '/api/filtri/by-key' //DELETE
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
