import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

// Import della localizzazione italiana
const italianLocale = {
  startsWith: 'Inizia con',
  contains: 'Contiene',
  notContains: 'Non contiene',
  endsWith: 'Finisce con',
  equals: 'Uguale',
  notEquals: 'Non uguale',
  noFilter: 'Nessun filtro',
  filter: 'Filtro',
  lt: 'Minore di',
  lte: 'Minore o uguale a',
  gt: 'Maggiore di',
  gte: 'Maggiore o uguale a',
  dateIs: 'Data è',
  dateIsNot: 'Data non è',
  dateBefore: 'Data prima di',
  dateAfter: 'Data dopo di',
  custom: 'Personalizzato',
  clear: 'Pulisci',
  apply: 'Applica',
  matchAll: 'Corrisponde a tutti',
  matchAny: 'Corrisponde a qualsiasi',
  addRule: 'Aggiungi regola',
  removeRule: 'Rimuovi regola',
  accept: 'Sì',
  reject: 'No',
  choose: 'Scegli',
  upload: 'Carica',
  cancel: 'Annulla',
  completed: 'Completato',
  pending: 'In attesa',
  dayNames: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
  dayNamesMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
  monthNames: [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ],
  monthNamesShort: [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
  ],
  chooseYear: 'Scegli anno',
  chooseMonth: 'Scegli mese',
  chooseDate: 'Scegli data',
  prevDecade: 'Decennio precedente',
  nextDecade: 'Prossimo decennio',
  prevYear: 'Anno precedente',
  nextYear: 'Prossimo anno',
  prevMonth: 'Mese precedente',
  nextMonth: 'Prossimo mese',
  prevHour: 'Ora precedente',
  nextHour: 'Prossima ora',
  prevMinute: 'Minuto precedente',
  nextMinute: 'Prossimo minuto',
  prevSecond: 'Secondo precedente',
  nextSecond: 'Prossimo secondo',
  am: 'am',
  pm: 'pm',
  today: 'Oggi',
  weekHeader: 'Sm',
  firstDayOfWeek: 1,
  showMonthAfterYear: false,
  dateFormat: 'dd/mm/yy',
  weak: 'Debole',
  medium: 'Medio',
  strong: 'Forte',
  passwordPrompt: 'Inserisci una password',
  emptyFilterMessage: 'Nessun risultato trovato',
  searchMessage: '{0} risultati disponibili',
  selectionMessage: '{0} elementi selezionati',
  emptySelectionMessage: 'Nessun elemento selezionato',
  emptySearchMessage: 'Nessun risultato trovato',
  emptyMessage: 'Nessuna opzione disponibile',
  aria: {
    trueLabel: 'Vero',
    falseLabel: 'Falso',
    nullLabel: 'Non selezionato',
    star: '1 stella',
    stars: '{star} stelle',
    selectAll: 'Tutti gli elementi selezionati',
    unselectAll: 'Tutti gli elementi deselezionati',
    close: 'Chiudi',
    previous: 'Precedente',
    next: 'Successivo',
    navigation: 'Navigazione',
    scrollTop: 'Scorri in alto',
    moveTop: 'Sposta in alto',
    moveUp: 'Sposta su',
    moveDown: 'Sposta giù',
    moveBottom: 'Sposta in basso',
    moveToTarget: 'Sposta al target',
    moveToSource: 'Sposta alla sorgente',
    moveAllToTarget: 'Sposta tutto al target',
    moveAllToSource: 'Sposta tutto alla sorgente',
    pageLabel: 'Pagina {page}',
    firstPageLabel: 'Prima pagina',
    lastPageLabel: 'Ultima pagina',
    nextPageLabel: 'Pagina successiva',
    prevPageLabel: 'Pagina precedente',
    rowsPerPageLabel: 'Righe per pagina',
    previousPageLabel: 'Pagina precedente',
    jumpToPageDropdownLabel: 'Vai al menu a tendina della pagina',
    jumpToPageInputLabel: 'Vai all\'input della pagina',
    selectRow: 'Riga selezionata',
    unselectRow: 'Riga deselezionata',
    expandRow: 'Riga espansa',
    collapseRow: 'Riga compressa',
    showFilterMenu: 'Mostra menu filtro',
    hideFilterMenu: 'Nascondi menu filtro',
    filterOperator: 'Operatore di filtro',
    filterConstraint: 'Vincolo di filtro',
    editRow: 'Modifica riga',
    saveEdit: 'Salva modifica',
    cancelEdit: 'Annulla modifica',
    listView: 'Vista elenco',
    gridView: 'Vista griglia',
    slide: 'Diapositiva',
    slideNumber: '{slideNumber}',
    zoomImage: 'Ingrandisci immagine',
    zoomIn: 'Ingrandisci',
    zoomOut: 'Riduci',
    rotateRight: 'Ruota a destra',
    rotateLeft: 'Ruota a sinistra',
    listLabel: 'Lista opzioni'
  }
}

// Preset personalizzato basato su Aura
const HRPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    }
  }
})

// Import dei componenti PrimeVue più usati
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Card from 'primevue/card'
import Panel from 'primevue/panel'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import ProgressBar from 'primevue/progressbar'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Chip from 'primevue/chip'
import OverlayPanel from 'primevue/overlaypanel'
import Drawer from 'primevue/drawer'
import Paginator from 'primevue/paginator'
import Toolbar from 'primevue/toolbar'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Message from 'primevue/message'
import InlineMessage from 'primevue/inlinemessage'
import Skeleton from 'primevue/skeleton'
import ProgressSpinner from 'primevue/progressspinner'
import FileUpload from 'primevue/fileupload'
import Rating from 'primevue/rating'
import Slider from 'primevue/slider'
import ToggleButton from 'primevue/togglebutton'
import ToggleSwitch from 'primevue/toggleswitch'
import Breadcrumb from 'primevue/breadcrumb'
import Steps from 'primevue/steps'
import Timeline from 'primevue/timeline'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Fieldset from 'primevue/fieldset'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'

// Services
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'

// Directives
import Tooltip from 'primevue/tooltip'
import Ripple from 'primevue/ripple'
import StyleClass from 'primevue/styleclass'
import FocusTrap from 'primevue/focustrap'

export const installPrimeVue = (app: App) => {
  // Configura PrimeVue con il nuovo tema e localizzazione italiana
  app.use(PrimeVue, {
    theme: {
      preset: HRPreset,
      options: {
        prefix: 'p',
        darkModeSelector: 'system',
        cssLayer: false
      }
    },
    locale: italianLocale // Configurazione locale italiana
  })

  // Installa servizi
  app.use(ToastService)
  app.use(ConfirmationService)
  app.use(DialogService)

  // Installa direttive
  app.directive('tooltip', Tooltip)
  app.directive('ripple', Ripple)
  app.directive('styleclass', StyleClass)
  app.directive('focustrap', FocusTrap)

  // Registra componenti globalmente
  app.component('PButton', Button)
  app.component('PInputText', InputText)
  app.component('PPassword', Password)
  app.component('PSelect', Select)
  app.component('PMultiSelect', MultiSelect)
  app.component('PDataTable', DataTable)
  app.component('PColumn', Column)
  app.component('PDialog', Dialog)
  app.component('PToast', Toast)
  app.component('PConfirmDialog', ConfirmDialog)
  app.component('PCard', Card)
  app.component('PPanel', Panel)
  app.component('PMenu', Menu)
  app.component('PMenubar', Menubar)
  app.component('PTabView', TabView)
  app.component('PTabPanel', TabPanel)
  app.component('PDatePicker', DatePicker)
  app.component('PCheckbox', Checkbox)
  app.component('PRadioButton', RadioButton)
  app.component('PTextarea', Textarea)
  app.component('PProgressBar', ProgressBar)
  app.component('PBadge', Badge)
  app.component('PTag', Tag)
  app.component('PAvatar', Avatar)
  app.component('PChip', Chip)
  app.component('POverlayPanel', OverlayPanel)
  app.component('PDrawer', Drawer)
  app.component('PPaginator', Paginator)
  app.component('PToolbar', Toolbar)
  app.component('PSplitter', Splitter)
  app.component('PSplitterPanel', SplitterPanel)
  app.component('PMessage', Message)
  app.component('PInlineMessage', InlineMessage)
  app.component('PSkeleton', Skeleton)
  app.component('PProgressSpinner', ProgressSpinner)
  app.component('PFileUpload', FileUpload)
  app.component('PRating', Rating)
  app.component('PSlider', Slider)
  app.component('PToggleButton', ToggleButton)
  app.component('PToggleSwitch', ToggleSwitch)
  app.component('PBreadcrumb', Breadcrumb)
  app.component('PSteps', Steps)
  app.component('PTimeline', Timeline)
  app.component('PAccordion', Accordion)
  app.component('PAccordionPanel', AccordionPanel)
  app.component('PAccordionHeader', AccordionHeader)
  app.component('PAccordionContent', AccordionContent)
  app.component('PFieldset', Fieldset)
  app.component('PTabs', Tabs)
  app.component('PTabList', TabList)
  app.component('PTab', Tab)
  app.component('PTabPanels', TabPanels)
}

// Esporta i componenti per uso diretto
export {
  Button,
  InputText,
  Password,
  Select,
  MultiSelect,
  DataTable,
  Column,
  Dialog,
  Toast,
  ConfirmDialog,
  Card,
  Panel,
  Menu,
  Menubar,
  TabView,
  TabPanel,
  DatePicker,
  Checkbox,
  RadioButton,
  Textarea,
  ProgressBar,
  Badge,
  Tag,
  Avatar,
  Chip,
  OverlayPanel,
  Drawer,
  Paginator,
  Toolbar,
  Splitter,
  SplitterPanel,
  Message,
  InlineMessage,
  Skeleton,
  ProgressSpinner,
  FileUpload,
  Rating,
  Slider,
  ToggleButton,
  ToggleSwitch,
  Breadcrumb,
  Steps,
  Timeline,
  Accordion,
  AccordionPanel,
  AccordionHeader,
  AccordionContent,
  Fieldset,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  ToastService,
  ConfirmationService,
  DialogService,
  HRPreset,
  italianLocale
}