<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div class="card bg-base-100 shadow-2xl">
        <div class="card-body">
          <div class="text-center mb-3">
            <div class="flex justify-center mb-4">
              <div class="w-3/4 mx-auto">
                <img
                  src="https://www.inaz.it/wp-content/uploads/2021/08/logo-inaz.jpg"
                  alt="logo-inaz"
                />
              </div>
            </div>
            <h1 class="text-2xl font-bold text-base-content mb-2">Selezione Dominio</h1>
            <p class="text-base-content/70">Seleziona il dominio per accedere</p>
          </div>

          <!-- Redirect message se non ci sono domini -->
          <div v-if="shouldRedirectToLogin" class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <div class="font-bold">Sessione non valida</div>
              <div class="text-sm">Reindirizzamento al login in corso...</div>
            </div>
          </div>

          <form v-else @submit.prevent="handleDomainSelection" class="space-y-3">
            <!-- Username (readonly) -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Username</span>
              </label>
              <div class="relative">
                <input
                  type="text"
                  :value="authStore.tempUsername"
                  readonly
                  class="input input-bordered w-full pr-12 bg-base-200"
                />
                <i
                  class="fas fa-user absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40"
                ></i>
              </div>
            </div>

            <!-- Selezione Dominio -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Dominio</span>
              </label>
              <div class="relative">
                <select
                  required
                  v-model="selectedDomain"
                  class="select select-bordered w-full pr-12"
                  :class="{ 'select-error': submitted && !selectedDomain }"
                >
                  <option value="" disabled>Seleziona dominio</option>
                  <option
                    v-for="domain in authStore.availableDomains"
                    :key="domain.id"
                    :value="domain.dominio"
                  >
                    {{ domain.dominio }}
                  </option>
                </select>
                <i
                  class="fas fa-globe absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40 pointer-events-none"
                ></i>
              </div>
              <div v-if="submitted && !selectedDomain" class="label">
                <span class="label-text-alt text-error">Dominio richiesto</span>
              </div>
            </div>

            <!-- Info Dominio-->
            <div v-if="authStore.availableDomains.length > 0" class="alert alert-info">
              <i class="fas fa-info-circle"></i>
              <div>
                <div class="font-bold">Domini Disponibili</div>
                <div class="text-sm">
                  Trovati {{ authStore.availableDomains.length }} domini per questo utente
                </div>
              </div>
            </div>

            <!-- Dettagli Dominio Selezionato -->
            <div v-if="selectedDomainDetails" class="card bg-base-200 border border-primary/20">
              <div class="card-body p-3">
                <h4 class="text-sm font-semibold text-base-content mb-2">
                  Dettagli Dominio Selezionato
                </h4>
                <div class="text-xs space-y-1">
                  <div class="flex justify-between">
                    <span class="text-base-content/70">ID:</span>
                    <span class="font-medium">{{ selectedDomainDetails.id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-base-content/70">Nome:</span>
                    <span class="font-medium">{{ selectedDomainDetails.dominio }}</span>
                  </div>
                </div>
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
              :class="{ loading: authStore.loading }"
            >
              <span v-if="authStore.loading" class="loading loading-spinner loading-sm"></span>
              <span v-if="authStore.loading">Accesso in corso...</span>
              <span v-if="!authStore.loading">Accedi</span>
            </button>

            <!-- Back to Login -->
            <button
              type="button"
              class="btn btn-ghost w-full"
              @click="backToLogin"
              :disabled="authStore.loading"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Torna al Login
            </button>
          </form>

          <div class="text-center text-sm text-base-content/60 mt-4">
            <p>Sistema di gestione delle risorse umane</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const selectedDomain = ref('')
const submitted = ref(false)
const error = ref('')

// Computed per verificare se dobbiamo reindirizzare al login
const shouldRedirectToLogin = computed(() => {
  return !authStore.tempUsername || authStore.availableDomains.length === 0
})

// Computed per mostrare i dettagli del dominio selezionato
const selectedDomainDetails = computed(() => {
  if (!selectedDomain.value) return null
  return authStore.availableDomains.find((d) => d.dominio === selectedDomain.value)
})

onMounted(() => {
  // Se l'utente è già autenticato, va alla dashboard
  if (authStore.isAuthenticated) {
    router.push('/app/dashboard')
    return
  }

  // Se non abbiamo username temporaneo o domini, torna al login
  if (shouldRedirectToLogin.value) {
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
})

const handleDomainSelection = async () => {
  submitted.value = true
  error.value = ''

  if (!selectedDomain.value) {
    return
  }

  try {
    const result = await authStore.selectDomain(selectedDomain.value)

    if (result.success) {
      const returnUrl = (route.query.returnUrl as string) || '/app/dashboard'
      router.push(returnUrl)
    } else {
      error.value = result.error || 'Errore durante la selezione del dominio'
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    error.value = err.message || 'Errore imprevisto durante la selezione del dominio'
  }
}

const backToLogin = () => {
  authStore.logout() // Pulisce i dati temporanei
  router.push('/login')
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

.select {
  appearance: none;
  background-image: none;
}
</style>
