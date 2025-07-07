<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="card bg-base-100 shadow-2xl">
        <div class="card-body">
          <div class="text-center mb-3">
            <div class="flex justify-center mb-4">
              <div class="w-3/4 mx-auto">
                <img src="https://www.inaz.it/wp-content/uploads/2021/08/logo-inaz.jpg" alt="logo-inaz">
              </div>
            </div>
            <h1 class="text-2xl font-bold text-base-content mb-2">HR Management System</h1>
            <p class="text-base-content/70">Accedi al tuo account aziendale</p>
          </div>
          
          <form @submit.prevent="handleLogin" class="space-y-3">
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
                  required>
                <i class="fas fa-user absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40"></i>
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
                  type="password"
                  v-model="credentials.password"
                  placeholder="Inserisci password"
                  class="input input-bordered w-full pr-12"
                  :class="{ 'input-error': submitted && !credentials.password }"
                  required>
                <i class="fas fa-lock absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40"></i>
              </div>
              <div v-if="submitted && !credentials.password" class="label">
                <span class="label-text-alt text-error">Password richiesta</span>
              </div>
            </div>

            <!-- Domain -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Dominio</span>
              </label>
              <div class="relative">
                <input 
                  type="text"
                  v-model="credentials.domain"
                  placeholder="Inserisci dominio azienda"
                  class="input input-bordered w-full pr-12"
                  :class="{ 'input-error': submitted && !credentials.domain }"
                  required>
                <i class="fas fa-globe absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40"></i>
              </div>
              <div v-if="submitted && !credentials.domain" class="label">
                <span class="label-text-alt text-error">Dominio richiesto</span>
              </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="alert alert-error">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ error }}</span>
            </div>

            <!-- Submit -->
            <button 
              type="submit" 
              :disabled="authStore.loading" 
              class="btn btn-primary w-full"
              :class="{ 'loading': authStore.loading }">
              <span v-if="authStore.loading" class="loading loading-spinner loading-sm"></span>
              <span v-if="authStore.loading">Accesso in corso...</span>
              <span v-if="!authStore.loading">Accedi</span>
            </button>
          </form>

          <div class="divider"></div>
          
          <!-- Demo Users -->
          <div class="space-y-3">
            <div class="text-center">
              <p class="text-sm font-medium text-base-content mb-3">Account Demo Disponibili:</p>
            </div>
            
            <div class="grid grid-cols-1 gap-2">
              <button 
                type="button" 
                class="btn btn-outline btn-sm text-left justify-start"
                @click="fillDemoCredentials('admin', 'company')">
                <i class="fas fa-crown mr-2 text-yellow-500"></i>
                <div class="text-left">
                  <div class="font-medium">Admin Aziendale</div>
                  <div class="text-xs opacity-60">admin / company</div>
                </div>
              </button>
              
              <button 
                type="button" 
                class="btn btn-outline btn-sm text-left justify-start"
                @click="fillDemoCredentials('manager', 'azienda')">
                <i class="fas fa-briefcase mr-2 text-blue-500"></i>
                <div class="text-left">
                  <div class="font-medium">Manager Aziendale</div>
                  <div class="text-xs opacity-60">manager / azienda</div>
                </div>
              </button>
              
              <button 
                type="button" 
                class="btn btn-outline btn-sm text-left justify-start"
                @click="fillDemoCredentials('employee', 'worker')">
                <i class="fas fa-hard-hat mr-2 text-purple-500"></i>
                <div class="text-left">
                  <div class="font-medium">Operaio</div>
                  <div class="text-xs opacity-60">employee / worker</div>
                </div>
              </button>
            </div>
          </div>
          
          <div class="text-center text-sm text-base-content/60 mt-4">
            <p>Sistema di gestione delle risorse umane</p>
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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const credentials = ref<LoginCredentials>({
  username: '',
  password: '',
  domain: ''
})

const submitted = ref(false)
const error = ref('')

onMounted(() => {
  // Redirect if already authenticated
  if (authStore.isAuthenticated) {
    router.push('/app/dashboard')
  }
})

const handleLogin = async () => {
  submitted.value = true
  error.value = ''

  if (!credentials.value.username || !credentials.value.password || !credentials.value.domain) {
    return
  }

  const result = await authStore.login(credentials.value)
  
  if (result.success) {
    const returnUrl = (route.query.returnUrl as string) || '/app/dashboard'
    router.push(returnUrl)
  } else {
    error.value = result.error || 'Errore durante il login'
  }
}

const fillDemoCredentials = (username: string, domain: string) => {
  credentials.value = {
    username,
    password: 'demo123',
    domain
  }
  error.value = ''
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
</style>