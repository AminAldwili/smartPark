<script setup>
import { computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import ThemeToggle from "./components/ThemeToggle.vue";
import LanguageToggle from "./components/LanguageToggle.vue";
import GlobalTooltip from "./components/GlobalTooltip.vue";
import ToastContainer from "./components/ToastContainer.vue";

const store = useStore();
const { t } = useI18n();

const isAdmin = computed(() => store.getters["auth/isUserAdmin"]);
const firebaseError = computed(() => store.getters.hasFirebaseError);
const currentLocale = computed(() => store.getters.currentLocale);

onMounted(() => {
  store.dispatch("initTheme");
  applyLocale(currentLocale.value);
});

/**
 * Meta theme-color for browser UI (address bar, task switcher).
 */
const DARK_COLOR = "#0f1419";
const LIGHT_COLOR = "#f1f5f9";

watch(
  () => store.state.theme,
  (theme) => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = theme === "dark" ? DARK_COLOR : LIGHT_COLOR;
    }
  },
  { immediate: true },
);

function applyLocale(locale) {
  document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", locale === "ar" ? "ar" : "en");
}

watch(
  () => store.state.locale,
  (locale) => {
    applyLocale(locale);
    document.title = t("meta.title");
  },
  { immediate: true },
);
</script>

<template>
  <div id="app-shell" :class="store.state.theme">
    <div class="app-background"></div>
    <header class="topbar">
      <div class="brand-block">
        <div class="brand-sign">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-kicker">{{ $t('brand.kicker') }}</span>
          <h1>{{ $t('brand.title') }}</h1>
        </div>
      </div>
      <nav class="nav-links" :aria-label="$t('nav.mainAria')">
        <router-link to="/">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
          {{ $t('nav.home') }}
        </router-link>
        <router-link to="/about">
          {{ $t('nav.about') }}
        </router-link>
        <router-link v-if="isAdmin" to="/dashboard">
          {{ $t('nav.dashboard') }}
        </router-link>
        <router-link to="/account">
          {{ $t('nav.account') }}
        </router-link>
        <LanguageToggle />
        <ThemeToggle />
      </nav>
      <div v-if="firebaseError" class="firebase-banner" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ $t('firebase.banner') }}</span>
      </div>
    </header>
    <main class="page-content">
      <router-view />
    </main>
    <GlobalTooltip />
    <ToastContainer />
  </div>
</template>

<style lang="scss">
:root {
  color-scheme: dark;

  /* ========================================
     Design Tokens - Colors (Refined Blue Theme)
     ======================================== */
  --asphalt-dark: #0f1419;
  --asphalt-base: #1a1f26;
  --asphalt-light: #242b35;
  --asphalt-lighter: #2d3640;

  --road-white: #e8ecf0;
  --road-yellow: #0ea5e9;

  --spot-free: #10b981;
  --spot-occupied: #ef4444;
  --spot-reserved: #f97316;
  --spot-maintenance: #6b7280;
  --spot-free-bg: rgba(16, 185, 129, 0.12);
  --spot-occupied-bg: rgba(239, 68, 68, 0.12);
  --spot-reserved-bg: rgba(249, 115, 22, 0.12);
  --spot-maintenance-bg: rgba(107, 114, 128, 0.12);

  --accent-primary: #0ea5e9;
  --accent-secondary: #06b6d4;
  --accent-dark: #0284c7;
  --accent-light: #38bdf8;
  --accent-glow: rgba(14, 165, 233, 0.2);
  --accent-teal: #22d3ee;

  --accent-gold: #f59e0b;
  --accent-gold-light: #fbbf24;
  --accent-gold-dark: #d97706;
  --accent-gold-glow: rgba(245, 158, 11, 0.3);

  --glass-bg: rgba(26, 31, 38, 0.92);
  --glass-border: rgba(255, 255, 255, 0.06);

  --text-primary: #e8ecf0;
  --text-secondary: rgba(232, 236, 240, 0.6);
  --text-tertiary: rgba(232, 236, 240, 0.4);
  --focus-ring: rgba(14, 165, 233, 0.5);
  --aisle-dark: #0f1419;
  --aisle-border: rgba(14, 165, 233, 0.2);
  --aisle-line: rgba(14, 165, 233, 0.25);

  /* ========================================
     Shadow System
     ======================================== */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 12px 48px rgba(0, 0, 0, 0.35);
  --shadow-glow: 0 4px 20px rgba(14, 165, 233, 0.25);
  --shadow-glow-lg: 0 8px 40px rgba(14, 165, 233, 0.35);
  --spot-active-glow: 0 0 20px rgba(14, 165, 233, 0.6), 0 0 40px rgba(14, 165, 233, 0.3);

  /* ========================================
     Status Colors
     ======================================== */
  --status-success: #10b981;
  --status-error: #ef4444;
  --text-on-dark: #fff;
  --text-on-light: #000;

  /* ========================================
     Backdrop Blur
     ======================================== */
  --blur-sm: blur(8px);
  --blur-md: blur(20px);
  --blur-lg: blur(40px);

  /* ========================================
     Animation System
     ======================================== */
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;

  /* ========================================
     Fluid Design System - Spacing
     ======================================== */
  --space-2xs: clamp(2px, 0.5vw, 6px);
  --space-xs: clamp(4px, 1vw, 10px);
  --space-sm: clamp(6px, 1.5vw, 14px);
  --space-md: clamp(10px, 2.5vw, 20px);
  --space-lg: clamp(14px, 4vw, 28px);
  --space-xl: clamp(20px, 5vw, 40px);
  --space-2xl: clamp(24px, 6vw, 48px);

  /* ========================================
     Fluid Design System - Typography
     ======================================== */
  --text-2xs: clamp(0.55rem, 1.3vw, 0.65rem);
  --text-xs: clamp(0.65rem, 1.5vw, 0.78rem);
  --text-sm: clamp(0.75rem, 2vw, 0.9rem);
  --text-base: clamp(0.85rem, 2.2vw, 1rem);
  --text-md: clamp(0.95rem, 2.5vw, 1.15rem);
  --text-lg: clamp(1.1rem, 3vw, 1.4rem);
  --text-xl: clamp(1.3rem, 4vw, 2.2rem);
  --text-2xl: clamp(1.5rem, 5vw, 2.5rem);

  /* ========================================
     Fluid Design System - Sizing
     ======================================== */
  --icon-xs: clamp(16px, 4vw, 22px);
  --icon-sm: clamp(20px, 5vw, 28px);
  --icon-md: clamp(28px, 7vw, 40px);
  --icon-lg: clamp(38px, 9vw, 52px);
  --icon-xl: clamp(48px, 11vw, 64px);

  /* ========================================
     Fluid Design System - Border Radius
     ======================================== */
  --radius-sm: clamp(6px, 1.5vw, 10px);
  --radius-md: clamp(10px, 2.5vw, 16px);
  --radius-lg: clamp(14px, 3.5vw, 20px);
  --radius-xl: clamp(18px, 4.5vw, 28px);

  /* ========================================
     Safe Area Support
     ======================================== */
  --safe-top: max(clamp(10px, 3vw, 20px), env(safe-area-inset-top));
  --safe-bottom: max(clamp(10px, 3vw, 20px), env(safe-area-inset-bottom));
  --safe-left: max(clamp(10px, 3vw, 20px), env(safe-area-inset-left));
  --safe-right: max(clamp(10px, 3vw, 20px), env(safe-area-inset-right));
  --safe-inline: max(
    clamp(10px, 3vw, 20px),
    env(safe-area-inset-left),
    env(safe-area-inset-right)
  );
}

:root.light {
  color-scheme: light;

  --asphalt-dark: #f1f5f9;
  --asphalt-base: #ffffff;
  --asphalt-light: #e2e8f0;
  --asphalt-lighter: #cbd5e1;

  --road-white: #0f172a;
  --road-yellow: #0369a1;

  --spot-free: #059669;
  --spot-occupied: #dc2626;
  --spot-reserved: #ea580c;
  --spot-maintenance: #4b5563;
  --spot-free-bg: rgba(5, 150, 105, 0.1);
  --spot-occupied-bg: rgba(220, 38, 38, 0.1);
  --spot-reserved-bg: rgba(234, 88, 12, 0.1);
  --spot-maintenance-bg: rgba(75, 85, 99, 0.1);

  --accent-primary: #0284c7;
  --accent-secondary: #0891b2;
  --accent-dark: #0369a1;
  --accent-light: #38bdf8;
  --accent-glow: rgba(2, 132, 199, 0.15);
  --accent-teal: #06b6d4;

  --accent-gold: #d97706;
  --accent-gold-light: #f59e0b;
  --accent-gold-dark: #b45309;
  --accent-gold-glow: rgba(217, 119, 6, 0.2);

  --glass-bg: rgba(255, 255, 255, 0.95);
  --glass-border: rgba(0, 0, 0, 0.08);

  --text-primary: #0f172a;
  --text-secondary: rgba(15, 23, 42, 0.6);
  --text-tertiary: rgba(15, 23, 42, 0.4);
  --focus-ring: rgba(2, 132, 199, 0.4);
  --aisle-dark: #cbd5e1;
  --aisle-border: rgba(2, 132, 199, 0.25);
  --aisle-line: rgba(2, 132, 199, 0.3);

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 12px 48px rgba(0, 0, 0, 0.12);
  --shadow-glow: 0 4px 20px rgba(2, 132, 199, 0.15);
  --shadow-glow-lg: 0 8px 40px rgba(2, 132, 199, 0.2);
  --spot-active-glow: 0 0 20px rgba(2, 132, 199, 0.5), 0 0 40px rgba(2, 132, 199, 0.25);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

body {
  margin: 0;
  direction: rtl;
  min-width: clamp(280px, 85vw, 100%);
  font-family: "Tajawal", "Inter", "Segoe UI", sans-serif;
  font-weight: 400;
  background: var(--asphalt-dark);
  color: var(--road-white);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  overflow-x: hidden;
}

html[lang="en"] body {
  font-family: "Inter", "Segoe UI", sans-serif;
}

html[lang="ar"] body {
  font-family: "Tajawal", "Segoe UI", sans-serif;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 80px,
      rgba(0, 0, 0, 0.015) 80px,
      rgba(0, 0, 0, 0.015) 81px
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 80px,
      rgba(0, 0, 0, 0.015) 80px,
      rgba(0, 0, 0, 0.015) 81px
    );
  pointer-events: none;
  z-index: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

#app-shell {
  position: relative;
  min-height: 100vh;
  padding: var(--safe-top) var(--safe-inline) var(--safe-bottom);
}

.app-background {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse at 20% 0%,
      rgba(14, 165, 233, 0.08),
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(6, 182, 212, 0.05),
      transparent 50%
    ),
    var(--asphalt-dark);
  pointer-events: none;
  z-index: 0;
}

:root.light .app-background {
  background:
    radial-gradient(
      ellipse at 0% 0%,
      rgba(56, 189, 248, 0.15),
      transparent 50%
    ),
    radial-gradient(
      ellipse at 100% 100%,
      rgba(14, 165, 233, 0.08),
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 20%,
      rgba(203, 213, 225, 0.3),
      transparent 45%
    ),
    var(--asphalt-dark);
}

.topbar,
.page-content {
  position: relative;
  z-index: 1;
}

.topbar {
  max-width: 1400px;
  margin: 0 auto var(--space-lg);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-lg);
}

:root.light .topbar {
  box-shadow:
    var(--shadow-lg),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.brand-sign {
  width: var(--icon-lg);
  height: var(--icon-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    var(--accent-primary),
    var(--accent-dark)
  );
  border-radius: var(--radius-md);
  box-shadow:
    var(--shadow-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  color: #fff;
}

.brand-sign svg {
  width: 55%;
  height: 55%;
}

:root.light .brand-sign {
  background: linear-gradient(
    145deg,
    var(--accent-primary),
    var(--accent-light)
  );
  box-shadow:
    var(--shadow-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
}

.brand-kicker {
  font-size: var(--text-xs);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent-primary);
  font-weight: 700;
}

.brand-block h1 {
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  font-weight: 700;
  color: var(--text-primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.nav-links a {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  transition: all var(--duration-normal) var(--ease-out);
}

.nav-links a svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
  flex-shrink: 0;
}

.nav-links a:hover {
  color: var(--text-primary);
  background: rgba(14, 165, 233, 0.1);
  border-color: var(--aisle-border);
  transform: translateY(-2px);
}

.nav-links a:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

:root.light .nav-links a {
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.03);
}

:root.light .nav-links a:hover {
  color: var(--accent-primary);
  background: rgba(14, 165, 233, 0.08);
  border-color: rgba(14, 165, 233, 0.25);
}

:root.light .nav-links a.router-link-exact-active {
  color: var(--text-on-dark);
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-light)
  );
  border-color: transparent;
  box-shadow: var(--shadow-glow);
}

.nav-links a.router-link-exact-active {
  color: var(--text-on-dark);
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-dark)
  );
  border-color: transparent;
  box-shadow: var(--shadow-glow);
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
}

.firebase-banner {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: var(--status-error);
  font-size: var(--text-sm);
  font-weight: 500;
}

.firebase-banner svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .topbar {
    flex-wrap: wrap;
    gap: clamp(12px, 2vw, 16px);
  }
}

@media (max-width: 480px) {
  .topbar {
    flex-direction: column;
    gap: clamp(10px, 2vw, 14px);
  }

  .brand-block {
    width: 100%;
    justify-content: center;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
    gap: clamp(4px, 1.5vw, 8px);
  }

  .nav-links a {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 360px) {
  .brand-block {
    flex-direction: column;
    gap: clamp(8px, 2vw, 12px);
  }
}
</style>
