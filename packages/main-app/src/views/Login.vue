<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div class="card bg-base-100 shadow-2xl">
        <div class="card-body">
          <div class="text-center mb-6">
            <div class="flex justify-center mb-4">
              <div class="w-3/4 mx-auto">
                <img
                  src="https://www.inaz.it/wp-content/uploads/2021/08/logo-inaz.jpg"
                  alt="logo-inaz"
                />
              </div>
            </div>
            <h1 class="text-2xl font-bold text-base-content mb-2">Presenze In Web</h1>
            <p class="text-base-content/70">Accedi al tuo account aziendale</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Username -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Username</span>
              </label>
              <div class="relative">
                <input
                  type="text"
                  v-model="credentials.username"
                  placeholder="Inserisci username"
                  class="input input-bordered w-full pr-12"
                  :class="{ 'input-error': submitted && !credentials.username }"
                  required
                  autocomplete="username"
                />
                <FaIcon icon="user"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40"
                />
              </div>
              <div v-if="submitted && !credentials.username" class="label">
                <span class="label-text-alt text-error">Username richiesto</span>
              </div>
            </div>

            <!-- Password -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Password</span>
              </label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="credentials.password"
                  placeholder="Inserisci password"
                  class="input input-bordered w-full pr-12"
                  :class="{ 'input-error': submitted && !credentials.password }"
                  required
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/60"
                  @click="togglePasswordVisibility"
                >
                  <FaIcon :icon="showPassword ? 'eye-slash' : 'eye'"/>
                </button>
              </div>
              <div v-if="submitted && !credentials.password" class="label">
                <span class="label-text-alt text-error">Password richiesta</span>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start">
                <input
                  type="checkbox"
                  class="checkbox checkbox-primary mr-3"
                  v-model="rememberMe"
                />
                <span class="label-text">Ricordami</span>
              </label>
            </div>

            <!-- Error -->
            <div v-if="error" class="alert alert-error">
              <FaIcon icon="exclamation-triangle"/>
              <span>{{ error }}</span>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="authStore.loading || !credentials.username || !credentials.password"
              class="btn btn-primary w-full"
              :class="{ loading: authStore.loading }"
            >
              <span v-if="authStore.loading" class="loading loading-spinner loading-sm"></span>
              <span v-if="authStore.loading">Accesso in corso...</span>
              <span v-if="!authStore.loading">Accedi</span>
            </button>
          </form>

          <div class="divider text-base-content/50">Sistema HR</div>

          <div class="text-center space-y-2">
            <p class="text-sm text-base-content/60">Sistema di gestione delle risorse umane</p>

            <!-- Link Password Dimenticata -->
            <div class="text-center">
              <a href="#" class="link link-primary text-sm" @click.prevent="handleForgotPassword">
                Password dimenticata?
              </a>
            </div>

            <!-- Info Supporto Tecnico -->
            <div class="text-xs text-base-content/50 mt-4">
              <p>Per supporto tecnico contattare:</p>
              <p>
                <FaIcon icon="envelope" class="mr-1"/>
                <a href="mailto:support@inaz.it" class="link">support@inaz.it</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/stores/auth'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const credentials = ref<LoginCredentials>({
  username: '',
  password: '',
})

const submitted = ref(false)
const error = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

onMounted(() => {
  // Se l'utente è già autenticato, va alla dashboard
  if (authStore.isAuthenticated) {
    router.push('/app/dashboard')
    return
  }

  // Carica credenziali salvate se "Ricordami" era attivo
  const savedUsername = localStorage.getItem('rememberedUsername')
  if (savedUsername) {
    credentials.value.username = savedUsername
    rememberMe.value = true
  }
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleForgotPassword = () => {
  alert(
    "Funzionalità di reset password non ancora implementata. Contattare l'amministratore di sistema.",
  )
}

const handleLogin = async () => {
  submitted.value = true
  error.value = ''

  if (!credentials.value.username || !credentials.value.password) {
    return
  }

  try {
    const result = await authStore.login(credentials.value)

    if (result.success) {
      // Salva username se "Ricordami" è attivo
      if (rememberMe.value) {
        localStorage.setItem('rememberedUsername', credentials.value.username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }

      if (result.needsDomainSelection) {
        // Reindirizza alla pagina di selezione dominio
        router.push('/domain')
      } else {
        // Login completato, va alla dashboard
        const returnUrl = (route.query.returnUrl as string) || '/app/dashboard'
        router.push(returnUrl)
      }
    } else {
      error.value = result.error || 'Errore durante il login'

      // Reset password in caso di errore
      credentials.value.password = ''
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    error.value = err.message || 'Errore di connessione al server'
    credentials.value.password = ''
  }
}
</script>

<style scoped>
.login-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

button[type='button']:focus {
  outline: none;
}

.form-control input:focus {
  outline: 2px solid #3b82f6; /* Tailwind blue-500 */
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
