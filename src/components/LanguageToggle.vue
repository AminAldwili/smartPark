<template>
  <button
    class="lang-toggle"
    :aria-label="$t('lang.toggleAria')"
    @click="toggleLocale"
  >
    <span class="lang-label">{{ currentLocale === "ar" ? "EN" : "AR" }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const currentLocale = computed(() => store.getters.currentLocale);

function toggleLocale() {
  const next = currentLocale.value === "ar" ? "en" : "ar";
  store.dispatch("setLocale", next);
}
</script>

<style scoped>
.lang-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.lang-toggle:hover {
  color: var(--text-primary);
  background: rgba(14, 165, 233, 0.1);
  border-color: var(--aisle-border);
  transform: translateY(-2px);
}

.lang-toggle:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

:root.light .lang-toggle {
  background: rgba(0, 0, 0, 0.03);
}

:root.light .lang-toggle:hover {
  color: var(--accent-primary);
  background: rgba(14, 165, 233, 0.08);
  border-color: rgba(14, 165, 233, 0.25);
}
</style>
