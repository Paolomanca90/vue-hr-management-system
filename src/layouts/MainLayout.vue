<template>
  <div class="drawer lg:drawer-open min-h-screen bg-base-200">
    <input id="drawer-toggle" type="checkbox" class="drawer-toggle" v-model="sidenavOpened" />

    <!-- Sidebar -->
    <div class="drawer-side">
      <label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside
        class="min-h-full bg-base-100 dark:bg-base-300 flex flex-col"
        :class="{
          'w-80': sidenavOpened && authStore.isCompanyUser,
          'w-64': sidenavOpened && !authStore.isCompanyUser,
          'w-[5rem]': !sidenavOpened,
        }"
      >
        <!-- Header della sidebar -->
        <div class="p-4 border-b border-base-300">
          <div class="flex items-center mb-4">
            <div class="mr-3">
              <img src="@/assets/Inaz-icona.png" alt="icona-inaz" class="w-8 h-8 mx-2" />
            </div>
            <div v-if="sidenavOpened" class="text-base-content">
              <h2 class="text-lg font-bold">HR System</h2>
              <p class="text-base-content/70 text-sm">
                {{ authStore.isCompanyUser ? 'Gestione Aziendale' : 'Portale Dipendente' }}
              </p>
            </div>
          </div>

          <!-- Info utente -->
          <div v-if="authStore.currentUser && sidenavOpened" class="bg-base-200 rounded-lg p-3">
            <div class="flex items-center">
              <div class="avatar placeholder mr-3">
                <div class="bg-primary text-primary-content rounded-full w-8">
                  <i class="fas fa-user"></i>
                </div>
              </div>
              <div class="text-base-content flex-1 min-w-0">
                <div class="font-medium truncate">{{ authStore.currentUser.username }}</div>
                <div class="text-base-content/70 text-sm truncate">
                  {{ authStore.currentUser.company }}
                </div>
                <div class="text-xs text-primary capitalize">{{ authStore.currentUser.role }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu di navigazione -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden">
          <!-- Menu esteso quando la sidebar è aperta -->
          <ul class="menu p-2 space-y-1" v-if="sidenavOpened">
            <li v-for="item in menuStore.menuItems" :key="item.id">
              <!-- Menu item con figli (espandibile) -->
              <div v-if="menuStore.hasChildren(item)" class="w-full p-0">
                <details :open="item.expanded">
                  <summary
                    class="flex items-center cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-all duration-200 w-full"
                    @click.prevent="menuStore.toggleMenuItem(item.id)"
                    :class="{ 'text-primary': isMenuItemActive(item) }"
                  >
                    <i :class="item.icon + ' text-sm mr-3'"></i>
                    <span class="font-medium flex-1">{{ item.label }}</span>
                    <span v-if="item.badge" class="badge badge-primary badge-sm">{{
                      item.badge
                    }}</span>
                  </summary>

                  <ul class="ml-6 mt-2 space-y-1">
                    <li v-for="child in item.children" :key="child.id">
                      <!-- Menu child con figli (espandibile) -->
                      <div v-if="menuStore.hasChildren(child)" class="w-full p-0">
                        <details :open="child.expanded">
                          <summary
                            class="flex items-center cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-all duration-200 text-sm w-full"
                            @click.prevent="menuStore.toggleMenuItem(child.id)"
                            :class="{ 'text-primary': isMenuItemActive(child) }"
                          >
                            <i :class="child.icon + ' text-sm mr-3'"></i>
                            <span class="font-medium flex-1">{{ child.label }}</span>
                            <span v-if="child.badge" class="badge badge-primary badge-sm">{{
                              child.badge
                            }}</span>
                          </summary>

                          <ul class="ml-6 mt-2 space-y-1">
                            <li v-for="subchild in child.children" :key="subchild.id">
                              <!-- Menu subchild con figli (espandibile) -->
                              <div v-if="menuStore.hasChildren(subchild)" class="w-full p-0">
                                <details :open="subchild.expanded">
                                  <summary
                                    class="flex items-center cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-all duration-200 text-sm w-full"
                                    @click.prevent="menuStore.toggleMenuItem(subchild.id)"
                                    :class="{ 'text-primary': isMenuItemActive(subchild) }"
                                  >
                                    <i :class="subchild.icon + ' text-sm mr-3'"></i>
                                    <span class="font-medium flex-1">{{ subchild.label }}</span>
                                    <span
                                      v-if="subchild.badge"
                                      class="badge badge-primary badge-sm"
                                      >{{ subchild.badge }}</span
                                    >
                                  </summary>

                                  <ul class="ml-6 mt-2 space-y-1">
                                    <li
                                      v-for="subsubchild in subchild.children"
                                      :key="subsubchild.id"
                                    >
                                      <RouterLink
                                        v-if="subsubchild.route"
                                        :to="subsubchild.route"
                                        class="flex items-center p-2 rounded-lg hover:bg-base-200 transition-all duration-200 text-sm w-full"
                                        :class="{
                                          'text-primary bg-blue-100': isActive(subsubchild.route),
                                        }"
                                      >
                                        <i :class="subsubchild.icon + ' text-sm mr-3 w-4'"></i>
                                        <span>{{ subsubchild.label }}</span>
                                        <span
                                          v-if="subsubchild.badge"
                                          class="badge badge-primary badge-xs ml-auto"
                                          >{{ subsubchild.badge }}</span
                                        >
                                      </RouterLink>
                                    </li>
                                  </ul>
                                </details>
                              </div>

                              <!-- Menu subchild semplice (senza figli) -->
                              <RouterLink
                                v-else-if="subchild.route"
                                :to="subchild.route"
                                class="flex items-center p-2 rounded-lg hover:bg-base-200 transition-all duration-200 text-sm w-full"
                                :class="{ 'text-primary bg-blue-100': isActive(subchild.route) }"
                              >
                                <i :class="subchild.icon + ' text-sm mr-3 w-4'"></i>
                                <span>{{ subchild.label }}</span>
                                <span
                                  v-if="subchild.badge"
                                  class="badge badge-primary badge-xs ml-auto"
                                  >{{ subchild.badge }}</span
                                >
                              </RouterLink>
                            </li>
                          </ul>
                        </details>
                      </div>

                      <!-- Menu child semplice (senza figli) -->
                      <RouterLink
                        v-else-if="child.route"
                        :to="child.route"
                        class="flex items-center p-2 rounded-lg hover:bg-base-200 transition-all duration-200 text-sm"
                        :class="{ 'text-primary bg-blue-100': isActive(child.route) }"
                      >
                        <i :class="child.icon + ' text-sm mr-3 w-4'"></i>
                        <span>{{ child.label }}</span>
                        <span v-if="child.badge" class="badge badge-primary badge-xs ml-auto">{{
                          child.badge
                        }}</span>
                      </RouterLink>
                    </li>
                  </ul>
                </details>
              </div>

              <!-- Menu item semplice (senza figli) -->
              <RouterLink
                v-else-if="item.route"
                :to="item.route"
                class="flex items-center p-2 rounded-lg hover:bg-base-200 transition-all duration-200 w-full"
                :class="{ 'text-primary bg-blue-100': isActive(item.route) }"
              >
                <i :class="item.icon + ' text-sm mr-3'"></i>
                <span class="font-medium">{{ item.label }}</span>
                <span v-if="item.badge" class="badge badge-primary badge-sm ml-auto">{{
                  item.badge
                }}</span>
              </RouterLink>
            </li>
          </ul>

          <!-- Menu compatto quando la sidebar è chiusa -->
          <div class="flex flex-col items-center space-y-2 p-2" v-if="!sidenavOpened">
            <div
              v-for="item in menuStore.getMainMenuItems"
              :key="item.id"
              class="w-full flex justify-center"
            >
              <RouterLink
                v-if="item.route"
                :to="item.route"
                class="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-base-200 transition-all duration-200"
                :class="{ 'text-primary bg-blue-100': isActive(item.route) }"
              >
                <i :class="item.icon + ' text-lg'"></i>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Footer della sidebar -->
        <div class="p-4 border-t border-base-300 space-y-2" v-if="sidenavOpened">
          <!-- Toggle Dark Mode -->
          <div
            class="flex items-center justify-center w-full btn btn-ghost btn-sm"
            @click="toggleTheme"
          >
            <label class="swap swap-rotate">
              <input type="checkbox" :checked="themeStore.isDarkMode" />
              <i :class="themeStore.themeIcon + ' swap-on text-lg'"></i>
              <i :class="themeStore.themeIcon + ' swap-off text-lg'"></i>
            </label>
            <span class="ml-2">{{ themeStore.themeLabel }}</span>
          </div>

          <button class="btn btn-error btn-sm w-full text-white" @click="authStore.logout">
            <i class="fas fa-sign-out-alt mr-2"></i>
            <span>Logout</span>
          </button>
        </div>

        <!-- Footer compatto -->
        <div
          class="flex flex-col items-center space-y-2 p-2 border-t border-base-300"
          v-if="!sidenavOpened"
        >
          <div>
            <label class="swap swap-rotate btn btn-ghost btn-sm w-12 h-12 btn-circle">
              <input type="checkbox" :checked="themeStore.isDarkMode" @change="toggleTheme" />
              <i :class="themeStore.themeIcon + ' swap-on text-lg'"></i>
              <i :class="themeStore.themeIcon + ' swap-off text-lg'"></i>
            </label>
          </div>

          <div>
            <button
              class="btn btn-error btn-sm w-12 h-12 btn-circle text-white"
              @click="authStore.logout"
            >
              <i class="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Contenuto principale -->
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="navbar bg-base-100 shadow-sm border-b border-base-300">
        <div class="flex-none lg:hidden">
          <label for="drawer-toggle" class="btn btn-square btn-ghost">
            <i class="fas fa-bars text-lg"></i>
          </label>
        </div>

        <div class="flex-none hidden lg:block">
          <button class="btn btn-square btn-ghost" @click="toggleSidenav">
            <i class="fas fa-bars text-lg"></i>
          </button>
        </div>

        <div class="flex-1">
          <span class="text-xl font-semibold ml-2">
            HR Management System
            <span class="text-sm text-base-content/60 ml-2">
              - {{ authStore.isCompanyUser ? 'Pannello Aziendale' : 'Portale Dipendente' }}
            </span>
          </span>
        </div>

        <div class="flex-none">
          <!-- Notifiche -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <div class="indicator">
                <i class="fas fa-bell text-lg"></i>
                <span class="badge badge-sm badge-primary indicator-item">3</span>
              </div>
            </div>
            <div
              tabindex="0"
              class="dropdown-content card card-compact w-64 p-2 shadow bg-base-100 z-[1]"
            >
              <div class="card-body">
                <h3 class="card-title">Notifiche</h3>
                <div class="space-y-2">
                  <div class="text-sm">Nuovo dipendente aggiunto</div>
                  <div class="text-sm">Ferie da approvare</div>
                  <div class="text-sm">Report mensile pronto</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Menu utente -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="avatar placeholder">
                <div class="bg-primary text-primary-content rounded-full w-10">
                  <i class="fas fa-user"></i>
                </div>
              </div>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[1]"
            >
              <li class="menu-title">
                <span>{{ authStore.currentUser?.username }}</span>
                <span class="text-xs">{{ authStore.currentUser?.company }}</span>
                <span class="text-xs text-primary capitalize">{{
                  authStore.currentUser?.role
                }}</span>
              </li>
              <li>
                <a><i class="fas fa-user mr-2"></i> Profilo</a>
              </li>
              <li>
                <a><i class="fas fa-cog mr-2"></i> Impostazioni</a>
              </li>
              <li class="divider"></li>
              <li>
                <a @click="authStore.logout" class="text-error"
                  ><i class="fas fa-sign-out-alt mr-2"></i> Logout</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Area del contenuto -->
      <main class="flex-1 p-6 bg-base-200">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useMenuStore } from '@/stores/menu'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const menuStore = useMenuStore()
const route = useRoute()

const sidenavOpened = ref(true)

const toggleSidenav = () => {
  sidenavOpened.value = !sidenavOpened.value
}

const toggleTheme = () => {
  themeStore.animateThemeChange()
  themeStore.toggleTheme()
}

const isActive = (routePath?: string): boolean => {
  if (!routePath) return false
  return route.path === routePath
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isMenuItemActive = (item: any): boolean => {
  if (item.route && isActive(item.route)) {
    return true
  }
  if (item.children) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return item.children.some((child: any) => isMenuItemActive(child))
  }
  return false
}

onMounted(() => {
  // Initialize any layout-specific logic
})
</script>

<style scoped>
.drawer-side aside {
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.menu :where(li:not(.menu-title) > :not(ul, details, .menu-title, .btn)),
.menu :where(li:not(.menu-title) > details > summary:not(.menu-title)) {
  display: block !important;
}

/* Miglioramenti per details/summary */
details > summary {
  list-style: none;
}

details > summary::-webkit-details-marker {
  display: none;
}

/* Animazioni */
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.drawer-side aside {
  animation: slideInLeft 0.3s ease-out;
}

.menu li {
  animation: fadeInUp 0.4s ease-out;
}

.menu li:nth-child(1) {
  animation-delay: 0.1s;
}
.menu li:nth-child(2) {
  animation-delay: 0.2s;
}
.menu li:nth-child(3) {
  animation-delay: 0.3s;
}
.menu li:nth-child(4) {
  animation-delay: 0.4s;
}
.menu li:nth-child(5) {
  animation-delay: 0.5s;
}
.menu li:nth-child(6) {
  animation-delay: 0.6s;
}
</style>
