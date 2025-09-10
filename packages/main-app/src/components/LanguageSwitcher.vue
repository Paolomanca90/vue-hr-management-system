<template>
  <div class="language-switcher">
    <!-- Versione dropdown per desktop -->
    <div v-if="!compact" class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-2">
        <span class="text-lg">{{ currentLanguage?.flag }}</span>
        <span class="hidden sm:inline">{{ currentLanguage?.name }}</span>
        <i class="fas fa-chevron-down text-xs"></i>
      </div>
      <ul
        tabindex="0"
        class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[1]"
      >
        <li class="menu-title">
          <span>{{ t('common.selectLanguage', 'Seleziona lingua') }}</span>
        </li>
        <li
          v-for="locale in availableLocales"
          :key="locale.code"
          @click="changeLanguage(locale.code as 'it' | 'en')"
        >
          <a :class="{ active: currentLocale === locale.code }">
            <span class="text-lg">{{ locale.flag }}</span>
            <span>{{ locale.name }}</span>
            <i v-if="currentLocale === locale.code" class="fas fa-check text-success text-sm ml-auto"></i>
          </a>
        </li>
      </ul>
    </div>

    <!-- Versione compatta per sidebar -->
    <div v-else class="compact-switcher">
      <button
        class="btn btn-ghost btn-sm w-full justify-start gap-2"
        @click="toggleLanguage"
        :title="nextLanguage?.name"
      >
        <span class="text-lg">{{ currentLanguage?.flag }}</span>
        <span v-if="showLabel">{{ currentLanguage?.name }}</span>
        <i class="fas fa-globe text-xs ml-auto"></i>
      </button>
    </div>

    <!-- Versione icona semplice -->
    <div v-if="iconOnly" class="icon-switcher">
      <div class="tooltip tooltip-bottom" :data-tip="currentLanguage?.name">
        <button
          class="btn btn-ghost btn-circle btn-sm"
          @click="toggleLanguage"
        >
          <span class="text-lg">{{ currentLanguage?.flag }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18nApp } from '@/composables/useI18nApp'

interface Props {
  compact?: boolean
  iconOnly?: boolean
  showLabel?: boolean
}

withDefaults(defineProps<Props>(), {
  compact: false,
  iconOnly: false,
  showLabel: true
})

// Usa il composable personalizzato che funziona nei componenti
const {
  t,
  currentLocale,
  currentLanguage,
  availableLocales,
  changeLanguage,
  toggleLanguage
} = useI18nApp()

const nextLanguage = computed(() => {
  const current = currentLocale.value
  return availableLocales.find(lang => lang.code !== current)
})
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
}

.compact-switcher .btn {
  text-align: left;
}

.icon-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Transizioni smooth */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: scale(1.05);
}

/* Stili per il menu dropdown */
.dropdown-content {
  border: 1px solid oklch(var(--bc) / 0.2);
  min-width: 180px;
}

.dropdown-content li a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
}

.dropdown-content li a:hover {
  background-color: oklch(var(--b2));
}

.dropdown-content li a.active {
  background-color: oklch(var(--p) / 0.1);
  color: oklch(var(--p));
  font-weight: 500;
}

.menu-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  color: oklch(var(--bc) / 0.6);
  padding: 0.5rem 1rem;
}
</style>
