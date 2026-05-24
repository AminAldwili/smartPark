<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const isDark = computed(() => store.getters.isDark);
const themeMode = computed(() => store.getters.themeMode);
const isSystem = computed(() => themeMode.value === "system");

function toggleTheme() {
  store.dispatch("toggleTheme");
}
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="
      isSystem
        ? $t('theme.auto')
        : isDark
          ? $t('theme.dark')
          : $t('theme.light')
    "
    @click="toggleTheme"
  >
    <!-- System / Auto -->
    <svg
      v-if="isSystem"
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
    <!-- Dark -->
    <svg
      v-else-if="isDark"
      class="icon moon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    <!-- Light -->
    <svg
      v-else
      class="icon sun"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(36px, 5vw, 44px);
  height: clamp(36px, 5vw, 44px);
  padding: 0;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  cursor: pointer;
  transition:
    background var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.theme-toggle:hover {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  transform: scale(1.05);
  box-shadow: var(--shadow-glow);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.theme-toggle:active {
  transform: scale(0.95);
}

.icon {
  width: 50%;
  height: 50%;
  transition:
    transform var(--duration-normal) var(--ease-spring),
    opacity var(--duration-normal) var(--ease-out);
}

.theme-toggle:hover .icon {
  transform: rotate(15deg);
}

.sun {
  color: var(--accent-primary);
}

.moon {
  color: var(--accent-primary);
}
</style>
