// Variabile per memorizzare la base URL caricata da config.json
let configBaseUrl: string = ''

// Funzione per caricare la configurazione dal file config.json
export const loadRuntimeConfig = async (): Promise<void> => {
  try {
    const response = await fetch('/config.json')
    if (response.ok) {
      const config = await response.json()
      if (config.apiBaseUrl) {
        configBaseUrl = config.apiBaseUrl
      }
    }
  } catch (error) {
    console.warn('Impossibile caricare config.json, verrà usato il valore di default', error)
  }
}

export const API_CONFIG = {
  // URL base dell'API
  baseUrl: configBaseUrl || import.meta.env.VITE_API_BASE_URL || 'https://localhost:7255',

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
    menuGruppiUtente: '/api/gruppiutente/menuGruppiUtente',
    aggiornaAbilitazioniGruppiUtente: '/api/gruppiutente/aggiornaAbilitazioniGruppiUtente', //POST
    gruppiUtente: '/api/gruppiutente', //GET,POST,PUT
    deleteGruppiUtente: '/api/gruppiutente/by-key?codice=', //DELETE

    // Setting
    lingue: '/api/settings/lingue',
    impostazioniInternazionali: '/api/settings/impostazioniInternazionali',

    // Accessi
    accessi: '/api/accessi', //GET,POST,PUT
    accessiSelect: '/api/accessi/select',
    deleteAccessi: '/api/accessi/by-key?codice=', //DELETE

    // Filtri
    filtri: '/api/filtri', //GET,POST,PUT
    filtriSelect: '/api/filtri/select',
    deleteFiltri: '/api/filtri/by-key?codice=', //DELETE

    // Gruppi Config
    gruppiConfig: '/api/gruppiconfig', //GET,POST,PUT
    deleteGruppiConfig: '/api/gruppiconfig/', //DELETE

    // Aziende
    aziende: '/api/azienda', //GET,POST,PUT

    // Sedi
    sedi: '/api/sede', //GET,POST,PUT

    // Filiali
    filiali: '/api/filiale', //GET,POST,PUT

    // Centri di Costo
    centriCosto: '/api/ccosto', //GET,POST,PUT,DELETE

    // Reparti
    reparti: '/api/reparto', //GET,POST,PUT,DELETE

    // PAT (Posizioni Assicurative Territoriali)
    pat: '/api/pat', //GET,POST,PUT,DELETE

    // Posizioni INPS
    posizioneInps: '/api/posizioneinps', //GET,POST,PUT,DELETE

    // Terminali Config
    terminaliConfig: '/api/terminaliconfig', //GET,POST,PUT
    deleteTerminaliConfig: '/api/terminaliconfig/by-key?codter=', //DELETE

    // Festività
    festi: '/api/festi', //GET,POST,PUT
    getFestiAnno: '/api/festi/getfestianno', //GET
    deleteFesti: '/api/festi/', //DELETE

    // Zone
    zone: '/api/zone', //GET,POST,PUT,DELETE
    getDettZona: '/api/zone/getdettzona', //GET

    // Festività CCNL
    festiCcnl: '/api/festiccnl', //GET,POST,PUT,DELETE
    festiCcnlDettaglio: '/api/festiccnl/getdettaglio', //GET

    // Gruppi Causali
    gruppiCausali: '/api/grpcausali', //GET,POST,PUT
    deleteGruppoCausale: '/api/grpcausali', //DELETE
    getDettaglioGruppoCausale: '/api/grpcausali/getdett', //GET

    // Tolleranze
    tolleranze: '/api/tolleranze', //GET,POST,PUT
    deleteTolleranza: '/api/tolleranze/by-key?codtoll=', //DELETE

    // Dipendente
    getCampiDipendente: '/api/dipendente/GetCampiDipendente',
    getValoriCampo: '/api/dipendente/GetValoriCampo',
    getListaDipendenti: '/api/dipendente/GetListaDipendenti', //POST
    getDettaglioDipendente: '/api/dipendente/GetDettaglioDipendente', //POST
    createDipendente: '/api/dipendente/CreateDipendente', //POST
    updateDipendente: '/api/dipendente/UpdateDipendente', //PUT
    deleteDipendente: '/api/dipendente/DeleteDipendente', //DELETE
    decodeCodiceFiscale: '/api/utility/decodecodfisc',

    // Lookup
    lookup: '/api/Lookup/get', //POST
    lookupList: '/api/Lookup/getList', //POST
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
  return API_CONFIG
}
